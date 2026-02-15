import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';

// Add animations and styles
const styles = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .dashboard-wrapper {
        max-width: 1400px;
        margin: 0 auto;
        padding: 40px;
        min-height: calc(100vh - 100px);
    }
    
    .events-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 24px;
    }
    
    .event-card {
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        border: 1px solid #f1f5f9;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .event-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
    }
    
    .event-image {
        position: relative;
        width: 100%;
        height: 200px;
        overflow: hidden;
        background: #f8fafc;
    }
    
    .event-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
    }
    
    .event-card:hover .event-image img {
        transform: scale(1.05);
    }
    
    .event-tag {
        position: absolute;
        top: 12px;
        right: 12px;
        padding: 6px 12px;
        border-radius: 100px;
        font-size: 11px;
        font-weight: 700;
        color: white;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .event-details {
        padding: 20px;
    }
    
    .event-title {
        font-size: 16px;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 12px;
        line-height: 1.4;
    }
    
    .event-info {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #64748b;
        margin-bottom: 8px;
    }
    
    .event-info i {
        color: #3b82f6;
        font-size: 12px;
    }
    
    .event-description {
        font-size: 13px;
        color: #64748b;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    if (!document.head.querySelector('style[data-organizer-styles]')) {
        styleSheet.setAttribute('data-organizer-styles', 'true');
        document.head.appendChild(styleSheet);
    }
}

const OrganizerDashboard = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(() => {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    });
    const [stats, setStats] = useState({ totalEvents: 0, totalRegistrations: 0 });
    const [myEvents, setMyEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('home');

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'organizer') {
            navigate('/');
        } else {
            fetchDashboardData(currentUser.id);
        }
    }, [currentUser, navigate]);

    const fetchDashboardData = async (userId) => {
        try {
            const statsRes = await fetch(`${API_BASE_URL}/api/organizer/${userId}/stats`);
            const statsData = await statsRes.json();
            setStats({
                totalEvents: statsData.totalEvents || 0,
                totalRegistrations: statsData.totalRegistrations || 0
            });

            const eventsRes = await fetch(`${API_BASE_URL}/api/admin/events/all`);
            const allEvents = await eventsRes.json();
            const organizerEvents = allEvents.filter(event => event.organizerId === userId);
            setMyEvents(organizerEvents);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`, { method: 'DELETE' });
            if (res.ok) {
                setMyEvents(prev => prev.filter(e => e._id !== eventId));
                setStats(prev => ({ ...prev, totalEvents: Math.max(0, prev.totalEvents - 1) }));
            }
        } catch (error) { console.error(error); }
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/');
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDownloadReport = (eventId) => {
        if (!eventId) return;
        window.location.href = `${API_BASE_URL}/api/organizer/export/${eventId}`;
    };

    if (!currentUser) return null;

    return (
        <div style={{ paddingBottom: '50px' }}>
            {/* Dashboard Navigation */}
            <nav className="dashboard-nav" style={{ padding: '20px 40px', background: '#ffffff', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
                <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/aditya.jpg" alt="Logo" style={{ height: '36px', borderRadius: '4px', mixBlendMode: 'multiply' }} />
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', letterSpacing: '-0.3px', fontFamily: "'Outfit', sans-serif" }}>
                        Aditya University
                    </span>
                </div>
                <div className="nav-links" style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => handleTabChange('home')}
                        style={{
                            background: activeTab === 'home' ? '#EFF6FF' : 'transparent',
                            color: activeTab === 'home' ? '#2563eb' : '#64748b',
                            padding: '10px 24px',
                            borderRadius: '100px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    >
                        <i className="fa-solid fa-house" style={{ fontSize: '13px' }}></i> Home
                    </button>
                    <button
                        onClick={() => handleTabChange('events')}
                        style={{
                            background: activeTab === 'events' ? '#EFF6FF' : 'transparent',
                            color: activeTab === 'events' ? '#2563eb' : '#64748b',
                            padding: '10px 24px',
                            borderRadius: '100px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    >
                        <i className="fa-regular fa-calendar-days" style={{ fontSize: '13px' }}></i> My Events
                    </button>
                    <button
                        onClick={() => navigate('/analytics')}
                        style={{
                            background: activeTab === 'analytics' ? '#EFF6FF' : 'transparent',
                            color: activeTab === 'analytics' ? '#2563eb' : '#64748b',
                            padding: '10px 24px',
                            borderRadius: '100px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    >
                        <i className="fa-solid fa-chart-line" style={{ fontSize: '13px' }}></i> Analytics
                    </button>
                    <button
                        onClick={() => navigate('/create-event')}
                        style={{
                            background: 'transparent',
                            color: '#64748b',
                            padding: '10px 24px',
                            borderRadius: '100px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    >
                        <i className="fa-solid fa-plus" style={{ fontSize: '13px' }}></i> Create Event
                    </button>
                </div>

                <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                            className="user-profile"
                            title="Profile"
                            style={{
                                padding: '6px',
                                paddingRight: '16px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '100px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                            }}
                        >
                            <img
                                src={`https://ui-avatars.com/api/?name=${currentUser.name}&background=10b981&color=fff&size=128`}
                                alt="Avatar"
                                style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                            />
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {currentUser.name.split(' ')[0]}
                            </span>
                        </div>

                        <button
                            onClick={handleLogout}
                            title="Logout"
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                color: '#ef4444',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'none'; }}
                        >
                            <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: '16px' }}></i>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="dashboard-wrapper">
                {activeTab === 'home' && (
                    <>
                        <div className="welcome-banner" style={{
                            position: 'relative',
                            borderRadius: '24px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            overflow: 'hidden',
                            padding: '40px',
                            color: 'white',
                            boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.3)',
                            marginBottom: '40px',
                            animation: 'fadeInUp 0.5s ease-out',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.6 }}></div>
                            <div style={{ position: 'absolute', bottom: '-20%', left: '10%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.6 }}></div>

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#d1fae5', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </div>
                                <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-1px', color: 'white' }}>
                                    Welcome back, {currentUser.name.split(' ')[0]}!
                                </h1>
                                <p style={{ fontSize: '16px', color: '#d1fae5', maxWidth: '500px', lineHeight: '1.6', margin: 0 }}>
                                    You have created <span style={{ color: 'white', fontWeight: '700' }}>{stats.totalEvents} events</span> so far. Manage them below.
                                </p>
                            </div>

                            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <button
                                    onClick={() => navigate('/create-event')}
                                    style={{
                                        background: 'white',
                                        color: '#059669',
                                        border: 'none',
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                                >
                                    <i className="fa-solid fa-plus"></i> Create New Event
                                </button>
                            </div>
                        </div>

                        <div className="stats-grid" style={{ animation: 'fadeInUp 0.6s ease-out', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
                            <div className="stat-card" style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #f1f5f9' }}>
                                <div className="stat-icon" style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}><i className="fa-regular fa-calendar-check"></i></div>
                                <div className="stat-info">
                                    <div className="number" style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', lineHeight: '1' }}>{stats.totalEvents}</div>
                                    <h4 style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>My Events</h4>
                                </div>
                            </div>
                            <div className="stat-card" style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #f1f5f9' }}>
                                <div className="stat-icon" style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}><i className="fa-solid fa-users"></i></div>
                                <div className="stat-info">
                                    <div className="number" style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', lineHeight: '1' }}>{stats.totalRegistrations}</div>
                                    <h4 style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Total Registrations</h4>
                                </div>
                            </div>
                            <div className="stat-card" style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #f1f5f9' }}>
                                <div className="stat-icon" style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}><i className="fa-solid fa-star"></i></div>
                                <div className="stat-info">
                                    <div className="number" style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', lineHeight: '1' }}>4.8</div>
                                    <h4 style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Average Rating</h4>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px', alignItems: 'stretch' }}>
                            {/* Recent Events Panel */}
                            <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', animation: 'fadeInUp 0.7s ease-out', display: 'flex', flexDirection: 'column' }}>
                                <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div className="section-title" style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ width: '4px', height: '24px', background: '#3b82f6', borderRadius: '4px', display: 'block' }}></span>
                                        Organizer Event Hub
                                    </div>
                                    <button onClick={() => setActiveTab('events')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>View All Events <i className="fa-solid fa-arrow-right"></i></button>
                                </div>
                                {myEvents.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '50px 20px',
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: '#f8fafc',
                                        borderRadius: '20px',
                                        border: '2px dashed #e2e8f0',
                                        margin: '10px 0'
                                    }}>
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            background: 'white',
                                            borderRadius: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '20px',
                                            color: '#3b82f6',
                                            fontSize: '32px',
                                            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)'
                                        }}>
                                            <i className="fa-solid fa-plus-circle"></i>
                                        </div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>No Active Events Found</h3>
                                        <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '280px', margin: '0 0 24px', lineHeight: '1.6' }}>
                                            You haven't launched any campus activities yet. Start building your first student event!
                                        </p>
                                        <button
                                            onClick={() => navigate('/create-event')}
                                            style={{
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                color: 'white',
                                                border: 'none',
                                                padding: '14px 32px',
                                                borderRadius: '14px',
                                                fontWeight: '700',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                boxShadow: '0 8px 20px -6px rgba(59, 130, 246, 0.4)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 25px -6px rgba(59, 130, 246, 0.5)'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(59, 130, 246, 0.4)'; }}
                                        >
                                            <i className="fa-solid fa-plus"></i> Create New Event
                                        </button>
                                    </div>
                                ) : (
                                    <div className="events-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {myEvents.slice(0, 3).map(event => (
                                            <div className="event-card" key={event._id} style={{ borderRadius: '20px', display: 'flex', alignItems: 'center', padding: '16px', gap: '20px', background: '#f8fafc', border: '1px solid #f1f5f9', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                                                {event.poster ? (
                                                    <div style={{ width: '80px', height: '80px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                                        <img src={event.poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                ) : (
                                                    <div style={{ width: '80px', height: '80px', borderRadius: '14px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '24px', flexShrink: 0 }}>
                                                        <i className="fa-regular fa-image"></i>
                                                    </div>
                                                )}
                                                <div className="event-details" style={{ padding: '0', flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                        <span style={{ background: event.isApproved ? '#ecfdf5' : '#fff7ed', color: event.isApproved ? '#059669' : '#ea580c', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>
                                                            {event.isApproved ? 'Approved' : 'Pending'}
                                                        </span>
                                                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>• {event.category || 'General'}</span>
                                                    </div>
                                                    <div className="event-title" style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#64748b' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><i className="fa-regular fa-calendar" style={{ color: '#3b82f6' }}></i> {event.date}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><i className="fa-solid fa-location-dot" style={{ color: '#f59e0b' }}></i> {event.location || 'TBA'}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setActiveTab('events')}
                                                    style={{ background: 'white', border: '1px solid #e2e8f0', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                                                    onMouseOver={(e) => { e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.borderColor = '#3b82f6'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                                >
                                                    <i className="fa-solid fa-chevron-right"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Upcoming Deadlines Panel */}
                            <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', animation: 'fadeInUp 0.8s ease-out', display: 'flex', flexDirection: 'column' }}>
                                <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div className="section-title" style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ width: '4px', height: '24px', background: '#f59e0b', borderRadius: '4px', display: 'block' }}></span>
                                        Upcoming Deadlines
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                                    {myEvents.filter(e => e.deadline).length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '13px' }}>
                                            <i className="fa-solid fa-calendar-check" style={{ fontSize: '24px', marginBottom: '12px', opacity: 0.5, display: 'block' }}></i>
                                            No upcoming registration deadlines.
                                        </div>
                                    ) : (
                                        myEvents
                                            .filter(e => e.deadline)
                                            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                                            .slice(0, 4)
                                            .map((event) => {
                                                const deadlineDate = new Date(event.deadline);
                                                const today = new Date();
                                                const diffTime = deadlineDate - today;
                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                const isUrgent = diffDays <= 3 && diffDays >= 0;

                                                return (
                                                    <div key={event._id} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                        <div style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '10px',
                                                            background: isUrgent ? '#fee2e2' : '#f8fafc',
                                                            color: isUrgent ? '#ef4444' : '#64748b',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '10px',
                                                            fontWeight: '700',
                                                            border: `1px solid ${isUrgent ? '#fecaca' : '#e2e8f0'}`
                                                        }}>
                                                            <span>{deadlineDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                                                            <span style={{ fontSize: '14px', lineHeight: '1' }}>{deadlineDate.getDate()}</span>
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</div>
                                                            <div style={{ fontSize: '11px', color: isUrgent ? '#ef4444' : '#64748b', fontWeight: isUrgent ? '600' : '400' }}>
                                                                {diffDays < 0 ? 'Deadline passed' : diffDays === 0 ? 'Ends today!' : `Ends in ${diffDays} days`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                    )}
                                </div>
                                <button
                                    onClick={() => handleTabChange('events')}
                                    style={{
                                        marginTop: '20px',
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        padding: '10px',
                                        borderRadius: '10px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#64748b',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                    onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
                                >
                                    Manage All Events
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'events' && (
                    <div className="events-column" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                        <div className="portfolio-header" style={{
                            marginBottom: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'white',
                            padding: '24px 30px',
                            borderRadius: '24px',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '45px', height: '45px', background: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                                    <i className="fa-solid fa-briefcase" style={{ fontSize: '20px' }}></i>
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Events Management Center</h2>
                                    <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>Track, manage and analyze all your organized campus events</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/create-event')}
                                style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    fontWeight: '700',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 20px -3px rgba(59, 130, 246, 0.4)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.3)'; }}
                            >
                                <i className="fa-solid fa-plus-circle"></i> Create New Event
                            </button>
                        </div>

                        <div className="events-grid">
                            {myEvents.length === 0 ? (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.8)', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
                                    <i className="fa-regular fa-folder-open" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
                                    <h3 style={{ fontSize: '18px', color: '#64748b', marginBottom: '8px' }}>Your Portfolio is Empty</h3>
                                    <p style={{ color: '#94a3b8' }}>All your published campus events will be summarized here.</p>
                                </div>
                            ) : (
                                myEvents.map(event => (
                                    <div className="event-card" key={event._id} style={{ borderRadius: '20px', overflow: 'hidden' }}>
                                        <div className="event-image">
                                            <img
                                                src={event.poster || (
                                                    event.category === 'Technical' ? 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000' :
                                                        event.category === 'Cultural' ? 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000' :
                                                            event.category === 'Sports' ? 'https://images.unsplash.com/photo-1461896756970-d5be867d7395?q=80&w=1000' :
                                                                event.category === 'Workshops' ? 'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=1000' :
                                                                    event.category === 'Seminars' ? 'https://images.unsplash.com/photo-1475721027461-90adbe67623a?q=80&w=1000' :
                                                                        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000'
                                                )}
                                                alt={event.title}
                                            />
                                            <span className="event-tag" style={{ background: event.isApproved ? '#10b981' : '#f59e0b' }}>{event.isApproved ? 'Approved' : 'Pending'}</span>
                                        </div>
                                        <div className="event-details" style={{ padding: '24px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    <span style={{
                                                        background: event.isApproved ? '#ecfdf5' : '#fff7ed',
                                                        color: event.isApproved ? '#059669' : '#ea580c',
                                                        padding: '4px 10px',
                                                        borderRadius: '8px',
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        {event.isApproved ? 'Approved' : 'Pending Approval'}
                                                    </span>
                                                    <span style={{ background: '#f8fafc', color: '#64748b', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', border: '1px solid #e2e8f0' }}>
                                                        {event.category || 'General'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="event-title" style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' }}>{event.title}</div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                                                        <i className="fa-regular fa-calendar"></i>
                                                    </div>
                                                    {event.date}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                                                        <i className="fa-solid fa-location-dot"></i>
                                                    </div>
                                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.location || 'TBA'}</span>
                                                </div>
                                            </div>

                                            <div className="event-description" style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', height: '42px', marginBottom: '20px' }}>{event.description}</div>

                                            <div className="card-footer" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ display: 'flex', fontSize: '13px', color: '#1e293b', fontWeight: '700', alignItems: 'center', gap: '6px' }}>
                                                        <i className="fa-solid fa-users" style={{ color: '#3b82f6' }}></i>
                                                        {event.registeredCount || 0}
                                                        <span style={{ fontWeight: '500', color: '#94a3b8' }}>Registered</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => handleDownloadReport(event._id)}
                                                        title="Download Participants Report"
                                                        style={{
                                                            background: '#f0f9ff',
                                                            color: '#0369a1',
                                                            border: 'none',
                                                            padding: '10px 16px',
                                                            borderRadius: '10px',
                                                            fontSize: '13px',
                                                            fontWeight: '700',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px'
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.background = '#e0f2fe'}
                                                        onMouseOut={(e) => e.currentTarget.style.background = '#f0f9ff'}
                                                    >
                                                        <i className="fa-solid fa-file-csv"></i> Report
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEvent(event._id)}
                                                        style={{
                                                            background: '#fff1f2',
                                                            color: '#e11d48',
                                                            border: 'none',
                                                            padding: '10px 16px',
                                                            borderRadius: '10px',
                                                            fontSize: '13px',
                                                            fontWeight: '700',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px'
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.background = '#ffe4e6'}
                                                        onMouseOut={(e) => e.currentTarget.style.background = '#fff1f2'}
                                                    >
                                                        <i className="fa-regular fa-trash-can"></i> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrganizerDashboard;
