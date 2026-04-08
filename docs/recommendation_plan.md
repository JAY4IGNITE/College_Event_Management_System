# Smart Event Recommendation System Plan

This document outlines a practical, implementable plan for a smart event recommendation system tailored for students. It combines a robust rule-based filtering layer with lightweight Machine Learning (ML) components to deliver explainable and personalized event suggestions.

## 1. Objective and Assumptions

**Objective:**
To provide a ranked, personalized list of recommended events for each college student to increase event discovery, student engagement, and attendance.

**Assumptions & Constraints:**
*   **Target Audience:** Students.
*   **Input:** Student interests (e.g., tech, sports, culture, arts), past event participation, and academic major/year.
*   **Output:** A ranked list of 5-10 recommended events per user.
*   **Constraints:**
    *   Small-scale system (fitting within typical college population sizes of 5k-20k students).
    *   Explainable recommendations (e.g., "Recommended because you like Tech").
    *   Privacy-conscious handling of student data (no highly sensitive PII used for recommendations, just interests and behavioral data).
    *   Must integrate seamlessly with the existing Node.js/React tech stack.

## 2. Data and Features

The recommendation system will rely on two primary data entities:

**User Profile (Student):**
*   **Declared Interests:** Categories selected during onboarding (e.g., `['coding', 'sports', 'music']`).
*   **Academic Info:** Department, year of study (can act as a proxy for certain interests).
*   **Past Events Attended:** List of Event IDs the student registered for and attended.
*   **Time Availability:** (Future Enhancement) Free slots based on class schedules.

**Event Attributes:**
*   **Category/Tags:** E.g., `['tech', 'hackathon', 'beginner-friendly']`.
*   **Date/Time:** When the event occurs.
*   **Location:** Campus building or online.
*   **Popularity:** Current number of registrations / max capacity.
*   **Target Audience:** Specific years or departments.

**Computed Features (used for Ranking):**
*   **User-Interest Match:** Boolean or score based on overlap between user declared interests and event tags.
*   **Collaborative Signals:** "Students in your department also registered for this."
*   **Recency/Urgency:** Proximity of the event date (boost upcoming events).
*   **Popularity Score:** Normalised registration count.
*   **Novelty:** Recommending events outside core interests occasionally to prevent filter bubbles.

## 3. Recommendation Approach

A **Hybrid Model** is proposed, using a fast rule-based layer to generate a candidate pool, followed by a lightweight ML scorer to refine the ranking.

### Rule-Based Layer (The Prior)
This layer ensures logical, explainable recommendations and handles the "cold start" problem for new users.
*   **Filter out:** Events the user has already registered for; events that have passed.
*   **Hard Boosts:** Events directly matching the user's declared interests get a +10 to their base score.
*   **Department Rules:** If an event is hosted by the student's department, add +5.
*   **Cold Start Strategy:** If a user has no declared interests or past participation, fallback to a "Trending/Popular" list combined with "Upcoming This Week".

### Lightweight ML Layer (The Scorer - Optional for MVP)
Once a candidate pool is scored by rules, the ML model fine-tunes the ranking.
*   **Model Choice:** Logistic Regression or a very lightweight Gradient Boosted Tree (like XGBoost or LightGBM). Given the Node.js stack, a simple logistic model can even be implemented manually or via a microservice in Python (FastAPI).
*   **Training Data:** Historical participation logs. 
    *   *Positive samples:* User saw event in feed -> clicked/registered.
    *   *Negative samples:* User saw event in feed -> ignored.
*   **Features for ML:** `user_interest_overlap`, `event_popularity_rate`, `days_until_event`, `user_past_attendance_count`.
*   **Output:** A probability score (0.0 to 1.0) of explicit engagement.
*   **Final Score:** `Final_Rank = (Rule_Score * W1) + (ML_Probability * W2)`.

## 4. MVP Scope (Phased Implementation)

### Phase 1: Foundation & Rules (Current Target)
*   Update database schemas to capture user interests and event tags.
*   Create a data pipeline to track event registrations.
*   Implement the **Rule-Based Ranking Engine** in Node.js.
*   Build a UI component on the `StudentDashboard` to show "Recommended For You" top 5 limits.

### Phase 2: Behavioral Feedback Loop & Analytics
*   Implement impression tracking (did the user view the recommendation?).
*   Track click-through rates (CTR) from the recommendation widget.
*   Refine the rule weights manually based on standard analytics.

### Phase 3: Lightweight ML Integration
*   Extract logged data to train a simple ML model offline.
*   Integrate a scoring function (either a Python microservice or a JSized model file) into the ranking pipeline.
*   Combine ML scores with rule base using A/B testing to verify uplift.

## 5. System Design and Workflow

**Workflow:**
1.  **Client Request:** React frontend calls `GET /api/recommendations?userId=123`.
2.  **Data Fetching:** Backend fetches User Profile, Past Registrations, and Active Events.
3.  **Filtration:** Remove registered/past events.
4.  **Rule Scoring:** Apply exact matches, tags overlap, and popularity metrics.
5.  **ML Scoring (Phase 3):** Pass candidate features to ML scorer for probability adjustment.
6.  **Sorting:** Sort descending by final combined score. Take top `N`.
7.  **Response:** Return serialized event objects to the frontend.

## 6. Deliverables

### A. Data Model Schemas (Mongoose/MongoDB Example)

```javascript
// User Schema Extensions
const userSchema = new mongoose.Schema({
  // ... existing fields (name, email, etc.)
  department: String,
  interests: [{ type: String }], // e.g., ['tech', 'music']
  pastEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
});

// Event Schema Extensions
const eventSchema = new mongoose.Schema({
  // ... existing fields (title, date, etc.)
  tags: [{ type: String }], // e.g., ['coding', 'workshop']
  hostingDepartment: String,
  currentRegistrations: { type: Number, default: 0 },
  maxCapacity: Number
});
```

### B. Code Skeleton: Rule-Based Scorer

```javascript
// recommendations.service.js

/**
 * Calculates a rule-based score for an event given a user profile.
 */
function calculateRuleScore(user, event) {
  let score = 0;

  // 1. Interest Overlap
  const commonInterests = event.tags.filter(tag => user.interests.includes(tag));
  score += commonInterests.length * 10; // +10 per matching tag

  // 2. Department Affinity
  if (user.department && event.hostingDepartment === user.department) {
    score += 5;
  }

  // 3. Popularity Boost (Max 5 points)
  if (event.maxCapacity > 0) {
    const fillRate = event.currentRegistrations / event.maxCapacity;
    score += (fillRate * 5); 
  }

  // 4. Urgency Boost (Events happening in the next 7 days)
  const daysUntilEvent = (new Date(event.date) - new Date()) / (1000 * 3600 * 24);
  if (daysUntilEvent > 0 && daysUntilEvent <= 7) {
    score += (7 - daysUntilEvent); // Closer events get a slight bump
  }

  return score;
}

/**
 * Generates the final recommendation list
 */
async function getRecommendations(userId, limit = 5) {
  const user = await User.findById(userId).populate('pastEvents');
  const activeEvents = await Event.find({ date: { $gte: new Date() } });

  const registeredEventIds = user.pastEvents.map(e => e._id.toString());

  // Filter out events the user is already registered for
  const candidateEvents = activeEvents.filter(event => 
    !registeredEventIds.includes(event._id.toString())
  );

  // Score candidate events
  const scoredEvents = candidateEvents.map(event => {
    return {
      event: event,
      score: calculateRuleScore(user, event)
    };
  });

  // Sort and take top N
  scoredEvents.sort((a, b) => b.score - a.score);
  return scoredEvents.slice(0, limit).map(item => item.event);
}
```

### C. ML Scorer Integration (Conceptual)

```javascript
// For Phase 3: Assuming we have a trained Logistic Regression model
// that takes [interestOverlapCount, isSameDepartment, fillRate, daysUntilEvent]

function getMLScore(features) {
  // Weights derived from training
  const weights = [1.5, 0.8, 2.1, -0.5]; 
  const bias = -1.2;
  
  let z = bias;
  for(let i=0; i<features.length; i++) {
     z += features[i] * weights[i];
  }
  
  // Sigmoid function to output probability (0 to 1)
  return 1 / (1 + Math.exp(-z));
}

// In the getRecommendations function:
// finalScore = (ruleScore * 0.4) + (getMLScore(features) * 100 * 0.6)
```

### D. API Endpoints

*   `GET /api/recommendations`
    *   **Auth:** Requires User Token.
    *   **Query Params:** `limit` (default 5).
    *   **Returns:** `[ { ...eventData, reason: "Matches your interest in Tech" } ]`
*   `POST /api/users/interests`
    *   **Body:** `{ interests: ['tech', 'sports'] }`
    *   **Usage:** Saves user preferences during onboarding or profile update.

### E. Evaluation Plan & Success Metrics

**Offline Evaluation (Phase 3 only):**
*   **Precision@K and Recall@K:** Evaluate how often the events a user historically attended appeared in their top K recommendations generated from past data.

**Online Evaluation (Live System):**
*   **Metric 1: Click-Through Rate (CTR)**
    *   *Measurement:* (Number of clicks on recommended events) / (Number of dashboard loads).
    *   *Target:* > 15% engagement.
*   **Metric 2: Recommendation Conversion Rate**
    *   *Measurement:* What percentage of total event registrations originated from the "Recommended For You" section versus manual browsing?
*   **Metric 3: Cold-Start Drop-off**
    *   *Measurement:* Track engagement for users with empty interest profiles. If low, tweak the popularity-fallback rules or prompt users to fill out their interests.
*   **A/B Testing:**
    *   Serve 50% users Rule-Based recommendations, 50% Hybrid (Rule+ML). Compare CTR and Conversions.
