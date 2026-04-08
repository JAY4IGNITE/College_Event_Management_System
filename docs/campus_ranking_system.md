# Gamified Campus Ranking System: Product Plan & Implementation Blueprint

## 1. Objectives and Success Metrics
**Primary Objective:** Boost student participation and engagement in college events by introducing healthy, gamified elements and inter-departmental competition.

**Success Metrics:**
*   **Participation Rate:** Achieve a 25% increase in total recorded event attendance within the first semester.
*   **Cross-Department Engagement:** Increase the volume of students attending events outside their home department by 15%.
*   **Retention/Engagement:** Track the number of Weekly Active Users (WAUs) checking the leaderboard or interacting with their profile widget.

## 2. Stakeholders and Roles
*   **Students (Users):** Participate in events, earn points, and track personal and departmental progress.
*   **Department Admins / Faculty:** Approve event attendance, manage department-specific challenges, review department performance.
*   **System Admins / IT:** Maintain infrastructure, monitor the point ledger for anomalies, and manage the underlying rules engine.
*   **Organizing Committees:** Tag events with appropriate point-tiers depending on the event's scale or strategic importance.

## 3. Core Features & Data Model

### A. Core Features
*   **Dual Leaderboards:**
    *   *Department-wide:* Departments ranked against each other (calculated using averaged metrics).
    *   *Individual Top 100:* Global top students displayed publicly (opt-in visibility only).
*   **Privacy Controls:** Students can toggle an "Anonymous Mode". Their scores remain hidden from the individual leaderboard, but their points still contribute mathematically to their department's aggregate score.
*   **Badges/Levels:** Non-monetary status symbols displayed on profiles (e.g., "Tech Initiate", "Debate Champion", "10-Event Streak").

### B. Data Model Additions
```javascript
// User Profile Extension (MongoDB/Mongoose Example)
{
  userId: Schema.Types.ObjectId,
  departmentId: Schema.Types.ObjectId,
  totalPoints: { type: Number, default: 0 },
  badges: [{ badgeId: String, earnedAt: Date }],
  isProfilePublic: { type: Boolean, default: false } // Default Private for ethics
}

// Department Leaderboard Aggregate (Cached for performance)
{
  departmentId: Schema.Types.ObjectId,
  totalPoints: Number,
  averagePointsPerStudent: Number, // Normalised metric: Total Points / Dept Roster Size
  rank: Number,
  lastUpdated: Date
}

// Transaction Ledger (Crucial for auditing and calculating streaks)
{
  transactionId: String,
  userId: Schema.Types.ObjectId,
  eventId: Schema.Types.ObjectId,
  pointsAwarded: Number,
  reason: String, // e.g., "Attendance", "First Place Win", "Cross-Dept Bonus"
  timestamp: { type: Date, default: Date.now }
}
```

## 4. Scoring Rules and Fairness

**Point Breakdown Scheme:**
*   **Standard Attendance:** +10 pts
*   **Active Participation / Volunteering:** +25 pts
*   **Competition Placement (1st/2nd/3rd):** +100 / +75 / +50 pts
*   **Cross-Disciplinary Bonus:** +5 pts (attending an event hosted by a different department)

**Fairness & Data Integrity:**
*   **Department Normalisation:** To prevent the largest department from automatically winning, department ranks are calculated using the `averagePointsPerStudent` metric (Total points / Total students enrolled in the department).
*   **Point Caps:** Limit earning potential to a maximum of `X` points per week. This prevents excessive "grinding" and ensures students prioritize academics.
*   **Anti-Cheat Measures:** Points are strictly awarded upon verified check-in at the venue (via Admin QR scan or code entry), never simply upon "Registration". Rewriting points requires a new immutable entry in the `Transaction Ledger`.

## 5. Technical Architecture

*   **Stack:** Existing Node.js/Express backend and React frontend.
*   **Data Sources:** MongoDB for ledger and profile data. *Recommended:* Use Redis for calculating and serving real-time sorted sets (`ZREVRANGE`) for the global leaderboard, taking load off the main DB.
*   **Security Context:** 
    *   The `check-in` endpoints must be restricted to Admin JWTs or Organizer tokens.
    *   Implement strict Rate Limiting to avoid automated point injection.

### Main API Endpoints
*   `POST /api/gamification/award-points` (Admin/Scanner only)
*   `GET /api/gamification/leaderboard/departments`
*   `GET /api/gamification/leaderboard/students`
*   `GET /api/gamification/me/ledger` (Student views their point history)
*   `PUT /api/gamification/me/privacy` (Toggles leaderboard visibility)

## 6. User Flows and UX Considerations

*   **Participation Submission:** Student arrives at venue -> Organizer scans student ID QR code -> Backend verifies and logs transaction -> Push notification triggers on student's device: "🎉 +10 Points earned for Computer Science!"
*   **Dashboard View:** `StudentDashboard.jsx` includes a gamification widget displaying "Your Rank", "Upcoming Milestone/Badge", and "Department Standing". Clicking it expands into a full page view.
*   **UX Aesthetic:** Introduce highly polished, visually distinct CSS (metallic gradients for ranks, subtle confetti animations for badge unlocks). Keep the loading states smooth.

## 7. MVP Scope and Phased Roadmap

*   **Phase 1 (MVP - Foundation):**
    *   Introduce `Transaction Ledger` and `totalPoints` to the schema.
    *   Build Admin point-awarding endpoint.
    *   Build Department aggregate leaderboard visible on the frontend.
*   **Phase 2 (Personalization):**
    *   Opt-in Individual Leaderboards.
    *   Student point history ledger view.
*   **Phase 3 (Deep Verification):**
    *   Automated Badge unlocking logic.
    *   Streak detection (detecting attendance in consecutive weeks).

## 8. Deliverables & API Contracts

### API Schema Contract Example
**Request `GET /api/gamification/leaderboard/departments`**
```json
{
  "status": "success",
  "data": [
    {
      "rank": 1,
      "department": "Computer Science",
      "metricScore": 45.2,
      "totalPoints": 15450
    },
    {
      "rank": 2,
      "department": "Business Administration",
      "metricScore": 41.8,
      "totalPoints": 10200
    }
  ]
}
```

### Next Step Deliverables:
1.  **UI Wireframes:** For the `LeaderboardView.jsx` component.
2.  **Mongoose Schema Files:** Concrete implementations for the Ledger system.

## 9. Accessibility, Inclusivity, and Ethical Considerations

*   **Accessibility:** Ensure high contrast for leaderboard colours (avoid relying solely on color to denote rank). Ensure badges have ARIA labels describing the achievement.
*   **Inclusivity:** Ensure diverse types of events (virtual, academic, physical sports, arts) offer equitable point values so students with varying interests and abilities can all contribute meaningfully.
*   **Ethical Gamification:** Gamification should be fun, not coercive. Focus the primary visual real estate on the *Department's* collective progress to foster teamwork over hyper-individualistic stress. Setting the global individual leaderboard to *Private by default* protects student privacy.
