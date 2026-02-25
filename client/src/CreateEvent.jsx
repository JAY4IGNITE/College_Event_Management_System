import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = ''; // Adjust if needed

// Add styles for Create Event page
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
    
    .dashboard-wrapper {
        max-width: 1400px;
        margin: 0 auto;
        padding: 40px;
    }
    
    .container {
        border-radius: 24px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        border: 1px solid #f1f5f9;
    }
    
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .form-group label {
        font-size: 14px;
        font-weight: 600;
        color: #334155;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 12px;
        border-radius: 10px;
        border: 2px solid var(--border);
        font-family: inherit;
        font-size: 14px;
        transition: all 0.2s;
    }
    
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: var(--info);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .btn {
        background: linear-gradient(135deg, var(--info) 0%, var(--primary) 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 700;
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
    if (!document.head.querySelector('style[data-create-event-styles]')) {
        styleSheet.setAttribute('data-create-event-styles', 'true');
        document.head.appendChild(styleSheet);
    }
}

const CreateEvent = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(() => {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    });

    useEffect(() => {
        if (!currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        rules: '',
        date: '',
        time: '',
        deadline: '',
        location: '',
        category: 'Technical',
        image: '',
        maxParticipants: '',
        price: '',
        paymentType: 'free'
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        const keyMap = {
            'eventTitle': 'title',
            'eventDescription': 'description',
            'eventRules': 'rules',
            'eventDate': 'date',
            'eventTime': 'time',
            'eventDeadline': 'deadline',
            'eventLocation': 'location',
            'eventCategory': 'category',
            'eventImage': 'image',
            'eventMaxParticipants': 'maxParticipants',
            'eventPrice': 'price',
            'paymentType': 'paymentType'
        };
        const key = keyMap[id];
        if (key) {
            setEventData(prev => ({ ...prev, [key]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            title: eventData.title,
            description: eventData.description,
            rules: eventData.rules,
            date: eventData.date,
            time: eventData.time,
            deadline: eventData.deadline,
            location: eventData.location,
            category: eventData.category,
            poster: eventData.image,
            price: parseInt(eventData.price) || 0,
            maxParticipants: eventData.maxParticipants ? parseInt(eventData.maxParticipants) : null,
            organizerId: currentUser.id
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Event Created Successfully! Pending Admin Approval. 🚀');
                navigate('/organizer-dashboard');
            } else {
                alert('Failed to create event. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Server error.');
        }
    };

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
                    <Link to="/create-event" className="active">Create Event</Link>
                </div>
                <div className="nav-actions">
                    <div className="user-profile">
                        <img
                            src={`https://ui-avatars.com/api/?name=${currentUser?.name || 'Organizer'}&background=4facfe&color=fff`}
                            alt="Profile"
                        />
                        <span style={{ fontWeight: 600, color: '#334155', marginLeft: '10px' }}>{currentUser?.name}</span>
                    </div>
                </div>
            </nav>

            <div className="dashboard-wrapper">
                <div className="page-header" style={{ marginBottom: '30px' }}>
                    <Link to="/organizer-dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
                    </Link>
                    <h1 style={{ marginTop: '16px', fontSize: '32px', fontWeight: '800' }}>Create New Event</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Fill in the details to publish a new event for students.</p>
                </div>

                <div className="container" style={{ width: '100%', maxWidth: '900px', background: 'white', padding: '40px' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Event Title</label>
                                <input type="text" id="eventTitle" placeholder="e.g. AI Innovation Hackathon 2026" required onChange={handleChange} />
                            </div>

                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Description</label>
                                <textarea
                                    id="eventDescription"
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid var(--border)', fontFamily: 'inherit', minHeight: '100px', resize: 'vertical' }}
                                    placeholder="Provide a detailed description of the event..."
                                    required
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Rules & Guidelines</label>
                                <textarea
                                    id="eventRules"
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid var(--border)', fontFamily: 'inherit', minHeight: '80px', resize: 'vertical' }}
                                    placeholder="Participation rules, eligibility, etc."
                                    required
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>Event Date</label>
                                <input
                                    type="text"
                                    id="eventDate"
                                    placeholder="DD-MM-YY"
                                    onFocus={(e) => (e.target.type = 'date')}
                                    onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                                    required
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Time</label>
                                <input type="time" id="eventTime" required onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label>Registration Deadline</label>
                                <input
                                    type="text"
                                    id="eventDeadline"
                                    placeholder="DD-MM-YY"
                                    onFocus={(e) => (e.target.type = 'date')}
                                    onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                                    required
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Venue / Location</label>
                                <input type="text" id="eventLocation" placeholder="e.g. Main Auditorium" required onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select id="eventCategory" onChange={handleChange} value={eventData.category}>
                                    <option value="Technical">Technical</option>
                                    <option value="Cultural">Cultural</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Workshop">Workshop</option>
                                    <option value="Seminar">Seminar</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Max Participants</label>
                                <input type="number" id="eventMaxParticipants" placeholder="Leave empty for unlimited" min="1" onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label>Registration Fee (₹)</label>
                                <input type="number" id="eventPrice" placeholder="0" min="0" onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label>Banner Image URL</label>
                                <input type="url" id="eventImage" placeholder="https://example.com/banner.jpg" onChange={handleChange} />
                            </div>
                        </div>

                        <div style={{ marginTop: '40px', display: 'flex', gap: '15px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                            <button type="button" className="btn" style={{ width: 'auto', padding: '12px 30px', background: '#f1f5f9', color: 'var(--text-muted)', boxShadow: 'none' }} onClick={() => navigate('/organizer-dashboard')}>Cancel</button>
                            <button type="submit" className="btn" style={{ width: 'auto', padding: '12px 40px' }}>Publish Event</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateEvent;
