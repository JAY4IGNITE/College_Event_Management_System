# Project Review - II (End of February)

**Tentative Period:** 20–28 February
**Project:** College Event Management System (Aditya University)
**Focus:** Core Development

Here is a detailed breakdown of the development progress mapped directly to the Review II requirements highlighted in your presentation.

---

## 1. Implementation of backend APIs using Node.js & Express
**Status:** Completed
* **Technologies Used:** Node.js, Express.js, CORS, Dotenv.
* **What we achieved:** 
  * The Express server is fully configured and running locally to handle RESTful APIs and JSON payloads.
  * We created robust routing architectures specifically segmented for Authentication (`/api/login`), User Roles (`/api/admin`, `/api/organizer`, `/api/student`), and Event Management (`/api/events`).
  * Custom API endpoints have been developed for fetching live system statistics, such as counts for students, organizers, and pending approvals.

## 2. MongoDB CRUD operations
**Status:** Completed
* **Technologies Used:** MongoDB Atlas, Mongoose ODM.
* **What we achieved:** 
  * Data Models: Mongoose schemas have been well-defined for Users (Admin, Organizer, Student) and Events.
  * **Create:** Functional endpoints allowing student/organizer registration and event creation.
  * **Read:** Live fetching of events, user profiles, dashboard analytics, and searching/filtering events based on categories (Technical, Cultural, Sports, etc.).
  * **Update:** Workflows to update event statuses (e.g., Admin approving a pending event).
  * **Delete:** Capabilities to remove events (organizers), delete user accounts (admins), and clean up the database.

## 3. User authentication and role management
**Status:** Completed
* **Technologies Used:** Custom Auth Logic, LocalStorage (Frontend), React Router.
* **What we achieved:** 
  * A strict role-based separation has been hard-coded and implemented across three user tiers:
    1. **Admins:** View detailed system analytics, approve/reject event submissions, manage users, and export CSV system reports.
    2. **Organizers:** Create detailed events, track their respective event statistics, and securely download participant reports for their hosted events.
    3. **Students:** View their digital ID card, browse/search approved events, register for specific categories, and track their registrations.
  * Login mechanics securely assess credentials and dynamically route users to their tailored, role-specific UI dashboards.

## 4. Integration of frontend (React) with backend APIs
**Status:** Completed
* **Technologies Used:** React.js, Vite, React Router DOM, Fetch API API.
* **What we achieved:** 
  * Connected all React components (`Login`, `StudentDashboard`, `OrganizerDashboard`, `AdminDashboard`) seamlessly to the Express server.
  * The user interface dynamically renders using real-time API responses (e.g., counting pending events, pulling live participant names).
  * Handled standard asynchronous operations, fetching sequences, and dynamic error state updates on the UI.

## 5. Minimum 50–60% module functionality
**Status:** Achieved > 80%
* **What we achieved:** 
  * Fully interactive, dynamic, and styled functional Authentication Module.
  * Fully functional Event Browsing, Filtering, and the overarching Student Module.
  * Comprehensive Admin Approval and Analytics Module.
  * Complete Event Creation pipeline for the Organizer Module.

## 6. Partial working demo
**Status:** Fully Ready for Demo
* **What we achieved:** 
  * Both the client (`npm run dev`) and server (`npm start`) environments are configured and running natively side-by-side.
  * All user flows seamlessly tie into each other (e.g., An Organizer creates an event -> it appears in the Admin's queue -> an Admin approves it -> it immediately displays on the Student's homepage for registration).
  * Highly polished, modern aesthetics featuring CSS gradients, micro-animations, structured dashboard panels, and modal UI boxes ready to be displayed in a live demonstration context.
