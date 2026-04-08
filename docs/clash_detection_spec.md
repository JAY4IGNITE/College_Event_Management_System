# Event Clash Detection System: Specification & Implementation Plan

This document provides a comprehensive technical specification and implementation roadmap for an **Event Clash Detection System** capable of identifying overlapping schedules, handling recurrences, and intelligently suggesting alternatives.

---

## 1. Core Functionality

*   **Overlap Detection:** Confirms if two or more events occupy the same physical or virtual space (Venue) within an overlapping timeframe.
*   **Time Zone Support:** All input times are localized using standardized TZ headers (e.g., `America/New_York`), but stored rigidly in **UTC** to allow seamless cross-regional detection.
*   **Multi-day & All-Day Handling:**
    *   *Multi-day:* Stored as continuous spans spanning more than 24 hours.
    *   *All-day:* Converted programmatically to span from `00:00:00` to `23:59:59` relative to the event's localized timezone, then normalized to UTC boundaries.

---

## 2. Data Model and Inputs

A normalized NoSQL or Relational schema to manage events.

### `Event` Schema Model
```javascript
{
  eventId: String,           // Unique identifier
  title: String,             // "Annual CS Department Meeting"
  venueId: String,           // ID of the room or virtual link
  timeZone: String,          // e.g., 'Asia/Kolkata'
  startsAt: Date,            // Stored in UTC (ISO 8601)
  endsAt: Date,              // Stored in UTC (ISO 8601)
  isAllDay: Boolean,         // True ignores exact hours
  attendeeCount: Number,     // Used for priority resolution
  recurrence: {
    rule: String,            // RRULE format (e.g., 'FREQ=WEEKLY;BYDAY=MO,WE')
    until: Date,             // End of recurrence series
    exceptions: [Date]       // Array of dates where recurrence is cancelled
  }
}
```

### `Venue` Schema Model
```javascript
{
  venueId: String,
  name: String,              // "Auditorium A"
  capacity: Number,
  operatingHours: {
    start: String,           // "08:00"
    end: String              // "20:00"
  },
  blackoutDates: [Date]      // Maintenance or closed dates
}
```

---

## 3. Conflict Detection Algorithm

The mathematical rule for two events (A and B) overlapping is:
`Max(Start_A, Start_B) < Min(End_A, End_B)`

### Algorithm for Database Scale
Using brute force `O(N^2)` is impossible for large datasets. Instead:
1.  **Database Indexing:** We create a compound index on `{ venueId: 1, startsAt: 1, endsAt: 1 }`.
2.  **Range Query:** When saving a new Event `newE`, we run a fast query:
    ```sql
    SELECT * FROM Events 
    WHERE venueId = newE.venueId 
    AND startsAt < newE.endsAt 
    AND endsAt > newE.startsAt
    ```
3.  **Sweep-Line Algorithm (In-Memory Batching):** If importing a batch of 1,000 events, we sort all start and end times into a 1D timeline array, sweeping through left-to-right. We keep a counter of active events per venue. If active events > 1, we log a clash. This runs in optimal `O(N log N)`.

### Detection Output
```javascript
{
  hasClash: true,
  clashes: [
    {
      conflictingEventId: "evt_123",
      overlapDurationMinutes: 45,
      overlapStart: "2026-04-10T10:00:00Z",
      overlapEnd: "2026-04-10T10:45:00Z"
    }
  ]
}
```

---

## 4. Auto-Suggestion of Alternatives

When a clash is detected, the system generates fallback options based on two pivot strategies:
1.  **Pivot Time:** Keep the same venue, but find the next available continuous `N` duration block on the same day.
2.  **Pivot Venue:** Keep the exact time, but find a different venue with `capacity >= targetCapacity`.

**Algorithm Steps:**
1. Check `Venue.operatingHours` and `Venue.blackoutDates`. 
2. Scan the daily schedule array for free blocks corresponding to the event’s length.
3. Return the top 3 results, prioritizing lowest displacement from original requested time.

---

## 5. Operational Requirements

### API Specification
*   `POST /api/events` 
    *   *Action:* Validates input, creates event.
    *   *Behavior:* Synchronously runs detection. If clash exists, returns HTTP `409 Conflict` with a payload of `clash details` and `suggested alternatives`.
*   `GET /api/events/detect-clashes?startDate=X&endDate=Y`
    *   *Action:* Sweeps a date range for anomalies (helpful for auditing previously corrupted data).
*   `GET /api/venues/:venueId/availability?duration=60&date=YYYY-MM-DD`
    *   *Action:* Generates available slots for a given day.

### Performance & Error Handling
*   **Target Response:** Conflict detection must resolve in `< 100ms` for singular inserts.
*   **Validation Rules:** `endsAt` strictly greater than `startsAt`. Events cannot exceed a max duration constraint (e.g., 7 days) without manual override.

---

## 6. UX Considerations

*   **Presentation:**
    *   Use a Kanban or Gantt-styled view (e.g., React Big Calendar) where overlapping items render side-by-side but carry a **Red Border / Warning Icon**.
    *   During creation, present a popup: *"Auditorium A is busy. Do you want: [Slot at 3:00 PM] or [Move to Auditorium B]?"*
*   **Priority Rules:**
    *   In a strict system, the first-registered event has immutable priority.
    *   In a hierarchy system, admin overlays or "High Capacity" events take precedence, immediately alerting the overridden event owner via email.

---

## 7. Extensibility

*   **iCal/ICS Integrations:** Output the finalized schedule as an `.ics` subscription to sync natively with Google Calendar / Outlook. 
*   **Scheduling Policies:** Implement rules engines (e.g., "Student clubs can only book after 4:00 PM" or "Exams take precedence over seminars").

---

## 8. Example Scenario & Output

**The Setup:**
User requests an event `Machine Learning Workshop` in `Venue A` from `10:00 to 12:00`.
However, `Venue A` is booked for `Data Science Seminar` from `11:00 to 13:00`.

**Query sent to `POST /api/events`**
```json
{
  "title": "Machine Learning Workshop",
  "venueId": "venue_A",
  "startsAt": "2026-04-12T10:00:00Z",
  "endsAt": "2026-04-12T12:00:00Z"
}
```

**System Response (`HTTP 409 Conflict`)**
```json
{
  "status": "error",
  "message": "Clash detected at venue_A within the requested period.",
  "clashDetails": [
    {
      "eventId": "evt_999",
      "title": "Data Science Seminar",
      "overlapStart": "2026-04-12T11:00:00Z",
      "overlapEnd": "2026-04-12T12:00:00Z",
      "overlapDurationMinutes": 60
    }
  ],
  "suggestAlternatives": {
    "sameVenueDifferentTime": [
      { "startsAt": "2026-04-12T08:00:00Z", "endsAt": "2026-04-12T10:00:00Z" },
      { "startsAt": "2026-04-12T13:30:00Z", "endsAt": "2026-04-12T15:30:00Z" }
    ],
    "sameTimeDifferentVenue": [
      { "venueId": "venue_B", "venueName": "Lab 5" }
    ]
  }
}
```
