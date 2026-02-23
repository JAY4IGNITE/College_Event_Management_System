import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000'; // Adjust if needed

// Add styles for Analytics page
const styles = `
    .dashboard-body {
        background: var(--surface);
        min-height: 100vh;
    }
    
    .navbar {
        background: white;
        padding: 20px 40px;
        border-bottom: 1px solid #f1f5f9;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: 0 2px 10px rgba(0,0,0,0.02);
    }
    
    .nav-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 18px;
        font-weight: 700;
        color: var(--text-main);
    }
    
    .nav-brand img {
        height: 36px;
        border-radius: 4px;
    }
    
    .nav-links {
        display: flex;
        gap: 8px;
    }
    
    .nav-links a {
        padding: 10px 24px;
        border-radius: 100px;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
        color: var(--text-muted);
        transition: all 0.3s;
    }
    
    .nav-links a:hover {
        background: #f1f5f9;
        color: var(--primary);
    }
    
    .nav-links a.active {
        background: #EFF6FF;
        color: var(--primary);
    }
    
    .nav-actions {
        display: flex;
        align-items: center;
        gap: 24px;
    }
    
    .user-profile {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 16px 6px 6px;
        background: white;
        border: 1px solid var(--border);
        border-radius: 100px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }
    
    .user-profile img {
        width: 36px;
        height: 36px;
        border-radius: 50%;
    }
    
    .user-profile span {
        font-size: 14px;
        font-weight: 600;
        color: #334155;
    }
    
    .dashboard-wrapper {
        max-width: 1400px;
        margin: 0 auto;
        padding: 40px;
    }
    
    .welcome-section {
        margin-bottom: 40px;
    }
    
    .welcome-section h1 {
        font-size: 32px;
        font-weight: 800;
        color: var(--text-main);
        margin-bottom: 8px;
    }
    
    .welcome-section p {
        font-size: 16px;
        color: var(--text-muted);
    }
    
    .section-header {
        margin-bottom: 24px;
    }
    
    .section-header h2 {
        font-size: 20px;
        font-weight: 700;
        color: var(--text-main);
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .section-header h2::before {
        content: '';
        width: 4px;
        height: 24px;
        background: var(--info);
        border-radius: 4px;
    }
    
    .admin-table {
        width: 100%;
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        border: 1px solid #f1f5f9;
    }
    
    .admin-table thead {
        background: var(--surface);
    }
    
    .admin-table th {
        padding: 16px 20px;
        text-align: left;
        font-size: 13px;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .admin-table td {
        padding: 16px 20px;
        border-top: 1px solid #f1f5f9;
        font-size: 14px;
        color: #334155;
    }
    
    .admin-table tbody tr {
        transition: background 0.2s;
    }
    
    .admin-table tbody tr:hover {
        background: var(--surface);
    }
    
    .status-badge {
        padding: 6px 12px;
        border-radius: 100px;
        font-size: 11px;
        font-weight: 700;
        display: inline-block;
    }
    
    .status-approved {
        background: #ecfdf5;
        color: #059669;
        border: 1px solid #d1fae5;
    }
    
    .status-pending {
        background: var(--surface-glass)7ed;
        color: #ea580c;
        border: 1px solid #ffedd5;
    }
    
    .btn {
        background: linear-gradient(135deg, var(--info) 0%, var(--primary) 100%);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    
    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    if (!document.head.querySelector('style[data-analytics-styles]')) {
        styleSheet.setAttribute('data-analytics-styles', 'true');
        document.head.appendChild(styleSheet);
    }
}

const Analytics = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user || user.role !== 'organizer') {
            navigate('/');
        } else {
            setCurrentUser(user);
            fetchReports(user.id);
        }
    }, [navigate]);

    const fetchReports = async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/events/all`);
            const allEvents = await response.json();
            // Show only organizer's events
            const organizerEvents = allEvents.filter(event => event.organizerId === userId);
            setEvents(organizerEvents);
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
    };

    const handleDownloadReport = (eventId) => {
        // Redirect to the API endpoint that serves the CSV
        window.location.href = `${API_BASE_URL}/api/organizer/export/${eventId}`;
    };

    if (!currentUser) return null;

    return (
        <div className="dashboard-body">
            <nav className="navbar">
                <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/aditya.jpg" alt="Logo" style={{ height: '36px', borderRadius: '4px', mixBlendMode: 'multiply' }} />
                    <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                        Aditya University
                    </span>
                </div>
                <div className="nav-links">
                    <Link to="/organizer-dashboard">Dashboard</Link>
                    <Link to="/create-event">Create Event</Link>
                    <Link to="/analytics" className="active">Analytics</Link>
                </div>
                <div className="nav-actions">
                    <div className="user-profile">
                        <img src={`https://ui-avatars.com/api/?name=${currentUser.name}&background=10b981&color=fff`} alt="Avatar" />
                        <span>{currentUser.name}</span>
                    </div>
                </div>
            </nav>

            <div className="dashboard-wrapper">
                <div className="welcome-section">
                    <h1>Event Reporting & Analytics</h1>
                    <p>Generate and download participant reports for your hosted events.</p>
                </div>

                <div className="section-header" id="reports">
                    <h2>Participation Reports</h2>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Event Title</th>
                            <th>Date</th>
                            <th>Total Registered</th>
                            <th>Status</th>
                            <th>Report</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No events found</td></tr>
                        ) : (
                            events.map(event => (
                                <tr key={event._id}>
                                    <td>{event.title}</td>
                                    <td>{event.date}</td>
                                    <td>{event.registeredCount || 0} Students</td>
                                    <td>
                                        <span className={`status-badge ${event.isApproved ? 'status-approved' : 'status-pending'}`}>
                                            {event.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn"
                                            style={{ width: 'auto', padding: '5px 15px', marginTop: 0, fontSize: '13px' }}
                                            onClick={() => handleDownloadReport(event._id)}
                                        >
                                            Download CSV
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Analytics;
