import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import StudentDashboard from './StudentDashboard';
import OrganizerDashboard from './OrganizerDashboard';
import AdminDashboard from './AdminDashboard';
import StudentSignup from './StudentSignup';
import OrganizerSignup from './OrganizerSignup';
import CreateEvent from './CreateEvent';
import Analytics from './Analytics';
import EventRegistration from './EventRegistration';
import ForgotPassword from './ForgotPassword';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/student-signup" element={<StudentSignup />} />
          <Route path="/organizer-signup" element={<OrganizerSignup />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/event-registration" element={<EventRegistration />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
