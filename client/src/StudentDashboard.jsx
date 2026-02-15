import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000'; // Adjust if needed

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(() => {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    });
    const [events, setEvents] = useState([]);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [stats, setStats] = useState({ registeredCount: 0, attendedCount: 0, certificatesCount: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [isIdModalOpen, setIsIdModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('home');

    const [notifications] = useState([
        { id: 1, title: 'New Event Added', message: 'Tech Symposium 2024 registrations are now open!', time: '2 hours ago', icon: 'fa-bullhorn', color: '#3b82f6' },
        { id: 2, title: 'Profile Complete', message: 'Your student profile is 100% complete.', time: '1 day ago', icon: 'fa-check-circle', color: '#10b981' },
        { id: 3, title: 'Workshop Alert', message: 'AI/ML Workshop starts in 3 days.', time: '2 days ago', icon: 'fa-clock', color: '#f59e0b' }
    ]);

    // Mock certificates data (since no API endpoint exists yet)
    const certificates = [
        // Example structure for future API
        // { id: 1, eventName: 'Web Development Workshop', date: '2023-11-15', downloadUrl: '#' }
    ];

    const fetchDashboardData = async (userId) => {
        try {
            // Fetch events
            const eventsRes = await fetch(`${API_BASE_URL}/api/events?approved=true`);
            const eventsData = await eventsRes.json();
            setEvents(eventsData);

            // Fetch registrations
            const regRes = await fetch(`${API_BASE_URL}/api/students/${userId}/events`);
            const regData = await regRes.json();
            setRegisteredEvents(regData);

            // Fetch stats
            const statsRes = await fetch(`${API_BASE_URL}/api/student/${userId}/stats`);
            const statsData = await statsRes.json();
            setStats(statsData);

        } catch (error) {
            console.error('Error fetching student dashboard data:', error);
        }
    };

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'student') {
            navigate('/');
        } else {
            fetchDashboardData(currentUser.id);
        }
    }, [currentUser, navigate]);

    const handleRegister = (event) => {
        const query = new URLSearchParams({
            id: event._id,
            title: event.title,
            price: event.price,
            date: event.date,
            location: event.location
        }).toString();
        navigate(`/event-registration?${query}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/');
    };

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!currentUser) return null;

    return (
        <div style={{ paddingBottom: '50px' }}> {/* Main wrapper inheriting body gradient */}
            {/* Dashboard Navigation */}
            <nav className="dashboard-nav" style={{ padding: '20px 40px', background: '#ffffff', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
                <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/aditya.jpg" alt="Logo" style={{ height: '36px', borderRadius: '4px' }} />
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
                        <i className="fa-regular fa-calendar-days" style={{ fontSize: '13px' }}></i> Events
                    </button>
                    <button
                        onClick={() => handleTabChange('certificates')}
                        style={{
                            background: activeTab === 'certificates' ? '#EFF6FF' : 'transparent',
                            color: activeTab === 'certificates' ? '#2563eb' : '#64748b',
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
                        <i className="fa-solid fa-award" style={{ fontSize: '13px' }}></i> Certificates
                    </button>
                </div>

                <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div className="search-bar" style={{ width: '280px', height: '44px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '100px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = 'white'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '14px', color: '#94a3b8' }}></i>
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={(e) => { handleTabChange('events'); e.target.parentElement.style.borderColor = '#94a3b8'; e.target.parentElement.style.background = 'white'; e.target.parentElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
                            onBlur={(e) => { e.target.parentElement.style.borderColor = '#e2e8f0'; e.target.parentElement.style.background = '#f8fafc'; e.target.parentElement.style.boxShadow = 'none'; }}
                            style={{ fontSize: '14px', background: 'transparent', height: '100%', width: '100%', border: 'none', outline: 'none', color: '#334155' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                            className="user-profile"
                            onClick={() => setIsIdModalOpen(true)}
                            title="View ID Card"
                            style={{
                                cursor: 'pointer',
                                padding: '6px',
                                paddingRight: '16px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '100px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                            onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)'}
                        >
                            <img
                                src={`https://ui-avatars.com/api/?name=${currentUser.name}&background=6366f1&color=fff&size=128`}
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
                            background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                            overflow: 'hidden',
                            padding: '40px',
                            color: 'white',
                            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)',
                            marginBottom: '40px',
                            animation: 'fadeInUp 0.5s ease-out',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            {/* Decorative Elements */}
                            <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.6 }}></div>
                            <div style={{ position: 'absolute', bottom: '-20%', left: '10%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.6 }}></div>

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </div>
                                <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-1px', background: 'linear-gradient(to right, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    Welcome back, {currentUser.name.split(' ')[0]}!
                                </h1>
                                <p style={{ fontSize: '16px', color: '#cbd5e1', maxWidth: '500px', lineHeight: '1.6', margin: 0 }}>
                                    You have <span style={{ color: 'white', fontWeight: '700' }}>{events.length} upcoming events</span> to explore this week. Ready to boost your skills?
                                </p>

                                <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '100px', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <i className="fa-solid fa-graduation-cap" style={{ color: '#60a5fa' }}></i>
                                        <span style={{ fontSize: '13px', fontWeight: '500' }}>{currentUser.branch || 'Student'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '100px', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <i className="fa-regular fa-envelope" style={{ color: '#60a5fa' }}></i>
                                        <span style={{ fontSize: '13px', fontWeight: '500' }}>{currentUser.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <button
                                    onClick={() => setIsIdModalOpen(true)}
                                    style={{
                                        background: 'white',
                                        color: '#0f172a',
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
                                    <i className="fa-solid fa-id-card"></i> View Digital ID
                                </button>
                            </div>
                        </div>

                        <div className="stats-grid" style={{ animation: 'fadeInUp 0.6s ease-out', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
                            <div className="stat-card" style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #f1f5f9' }}>
                                <div className="stat-icon" style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}><i className="fa-regular fa-calendar-check"></i></div>
                                <div className="stat-info">
                                    <div className="number" style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', lineHeight: '1' }}>{stats.registeredCount || registeredEvents.length}</div>
                                    <h4 style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Registered Events</h4>
                                </div>
                            </div>
                            <div className="stat-card" style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #f1f5f9' }}>
                                <div className="stat-icon" style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}><i className="fa-solid fa-user-check"></i></div>
                                <div className="stat-info">
                                    <div className="number" style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', lineHeight: '1' }}>{stats.attendedCount || 0}</div>
                                    <h4 style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Events Attended</h4>
                                </div>
                            </div>
                            <div className="stat-card" style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #f1f5f9' }}>
                                <div className="stat-icon" style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}><i className="fa-solid fa-award"></i></div>
                                <div className="stat-info">
                                    <div className="number" style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', lineHeight: '1' }}>{stats.certificatesCount || 0}</div>
                                    <h4 style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Certificates Earned</h4>
                                </div>
                            </div>
                        </div>

                        {/* Recent Registrations & Notifications Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px', alignItems: 'stretch' }}>

                            {/* Recent Registrations Panel */}
                            <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', animation: 'fadeInUp 0.7s ease-out', display: 'flex', flexDirection: 'column' }}>
                                <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div className="section-title" style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ width: '4px', height: '24px', background: '#3b82f6', borderRadius: '4px', display: 'block' }}></span>
                                        My Recent Registrations
                                    </div>
                                    <button onClick={() => setActiveTab('events')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>View All <i className="fa-solid fa-arrow-right"></i></button>
                                </div>
                                {registeredEvents.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px 20px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ width: '60px', height: '60px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#cbd5e1', fontSize: '24px' }}>
                                            <i className="fa-regular fa-calendar-plus"></i>
                                        </div>
                                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>No Registrations Yet</h3>
                                        <p style={{ color: '#64748b', fontSize: '13px', maxWidth: '250px', margin: '0 0 20px' }}>Explore upcoming events and register to participate.</p>
                                        <button onClick={() => setActiveTab('events')} className="btn" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)' }}>Browse Events</button>
                                    </div>
                                ) : (
                                    <div className="events-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {registeredEvents.slice(0, 3).map(event => (
                                            <div className="event-card" key={event._id} style={{ borderRadius: '16px', display: 'flex', alignItems: 'center', padding: '14px', gap: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}
                                                onMouseOver={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                                            >
                                                <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                                                    <img
                                                        src={event.poster || (
                                                            event.category === 'Technical' ? 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=100' :
                                                                event.category === 'Cultural' ? 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=100' :
                                                                    event.category === 'Sports' ? 'https://images.unsplash.com/photo-1461896756970-d5be867d7395?q=80&w=100' :
                                                                        event.category === 'Workshops' ? 'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=100' :
                                                                            event.category === 'Seminars' ? 'https://images.unsplash.com/photo-1475721027461-90adbe67623a?q=80&w=100' :
                                                                                'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=100'
                                                        )}
                                                        alt=""
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>
                                                <div className="event-details" style={{ padding: '0', flex: 1, minWidth: 0 }}>
                                                    <div className="event-title" style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</div>
                                                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><i className="fa-regular fa-calendar" style={{ color: '#3b82f6', fontSize: '10px' }}></i> {event.date}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><i className="fa-solid fa-location-dot" style={{ color: '#f59e0b', fontSize: '10px' }}></i> {event.location || 'TBA'}</span>
                                                    </div>
                                                </div>
                                                <div style={{ background: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '700', border: '1px solid #d1fae5', whiteSpace: 'nowrap' }}>
                                                    Registered
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Notifications Panel */}
                            <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', animation: 'fadeInUp 0.8s ease-out', display: 'flex', flexDirection: 'column' }}>
                                <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div className="section-title" style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ width: '4px', height: '24px', background: '#f59e0b', borderRadius: '4px', display: 'block' }}></span>
                                        Notifications
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    {notifications.map((notif, index) => (
                                        <div key={notif.id} style={{ display: 'flex', gap: '16px', paddingBottom: index === notifications.length - 1 ? '0' : '20px', marginBottom: index === notifications.length - 1 ? '0' : '20px', borderBottom: index === notifications.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${notif.color}15`, color: notif.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>
                                                <i className={`fa-solid ${notif.icon}`}></i>
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '4px', lineHeight: '1.4' }}>{notif.title}</h4>
                                                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', lineHeight: '1.5' }}>{notif.message}</p>
                                                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500', background: '#f8fafc', padding: '2px 8px', borderRadius: '6px' }}>{notif.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button style={{ width: '100%', marginTop: 'auto', paddingTop: '20px', background: 'none', border: 'none', borderTop: '1px dashed #e2e8f0', color: '#64748b', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                    onMouseOver={(e) => { e.currentTarget.style.color = '#3b82f6'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.color = '#64748b'; }}
                                >
                                    View All Notifications <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px' }}></i>
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'events' && (
                    <div className="events-column" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                        <div className="section-header" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="section-title" style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ width: '4px', height: '24px', background: '#3b82f6', borderRadius: '4px', display: 'block' }}></span>
                                Upcoming Events
                            </div>

                            {/* Categories Filter Bar */}
                            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
                                <button
                                    onClick={() => setSearchTerm('')}
                                    style={{
                                        padding: '8px 20px',
                                        borderRadius: '100px',
                                        border: searchTerm === '' ? 'none' : '1px solid #e2e8f0',
                                        background: searchTerm === '' ? '#3b82f6' : 'white',
                                        color: searchTerm === '' ? 'white' : '#64748b',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.2s',
                                        boxShadow: searchTerm === '' ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                                    }}
                                >
                                    All Events
                                </button>
                                {['Technical', 'Cultural', 'Sports', 'Workshops', 'Seminars'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSearchTerm(cat)}
                                        style={{
                                            padding: '8px 20px',
                                            borderRadius: '100px',
                                            border: searchTerm === cat ? 'none' : '1px solid #e2e8f0',
                                            background: searchTerm === cat ? '#3b82f6' : 'white',
                                            color: searchTerm === cat ? 'white' : '#64748b',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            transition: 'all 0.2s',
                                            boxShadow: searchTerm === cat ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <i className={`fa-solid ${cat === 'Technical' ? 'fa-laptop-code' : cat === 'Cultural' ? 'fa-music' : cat === 'Sports' ? 'fa-medal' : cat === 'Workshops' ? 'fa-screwdriver-wrench' : 'fa-chalkboard-user'}`}></i>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="events-grid">
                            {filteredEvents.length === 0 ? (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.8)', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
                                    <i className="fa-regular fa-calendar-xmark" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
                                    <p style={{ color: '#64748b' }}>No events found matching "{searchTerm}".</p>
                                </div>
                            ) : (
                                filteredEvents.map(event => (
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
                                            <span className="event-tag">{event.category}</span>
                                        </div>
                                        <div className="event-details">
                                            <div className="event-title">{event.title}</div>
                                            <div className="event-info">
                                                <i className="fa-regular fa-calendar"></i> {event.date}
                                            </div>
                                            <div className="event-info">
                                                <i className="fa-solid fa-location-dot"></i> {event.location || 'TBA'}
                                            </div>
                                            <div className="event-description">{event.description}</div>

                                            <div className="card-footer">
                                                <div className={`price ${event.price === 0 ? 'free' : ''}`}>
                                                    {event.price === 0 ? 'Free' : `₹${event.price}`}
                                                </div>
                                                <button className="register-btn" onClick={() => handleRegister(event)}>
                                                    Register Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'certificates' && (
                    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                        <div className="section-header">
                            <div className="section-title">
                                <i className="fa-solid fa-award"></i> Your Certificates
                            </div>
                        </div>

                        {certificates.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.6)', borderRadius: '20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.5)' }}>
                                <div style={{ width: '100px', height: '100px', background: '#fff7ed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#ea580c', fontSize: '40px', boxShadow: '0 10px 25px rgba(234, 88, 12, 0.2)' }}>
                                    <i className="fa-solid fa-award"></i>
                                </div>
                                <h3 style={{ fontSize: '22px', marginBottom: '10px', color: '#334155', fontWeight: 'bold' }}>No Certificates Yet</h3>
                                <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '400px', margin: '0 auto' }}>
                                    Participate in events and workshops to earn verified certificates for your portfolio.
                                </p>
                                <button onClick={() => setActiveTab('events')} className="btn" style={{ width: 'auto', marginTop: '25px', padding: '12px 30px' }}>Browse Events</button>
                            </div>
                        ) : (
                            <div className="events-grid">
                                {/* Map certificates here when available */}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isIdModalOpen && (
                <div className="modal" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div className="modal-content" style={{ width: '750px', background: 'white', borderRadius: '40px', padding: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'fadeInUp 0.3s ease-out', display: 'flex' }}>

                        {/* Left Side - Profile Summary */}
                        <div style={{ width: '280px', borderRadius: '32px', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', padding: '40px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', boxShadow: '0 10px 40px -10px rgba(37, 99, 235, 0.4)' }}>
                            <div style={{ width: '110px', height: '110px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.3)', marginBottom: '20px', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
                                <img src={`https://ui-avatars.com/api/?name=${currentUser.name}&size=200&background=fff&color=1e3a8a`} alt="Profile" style={{ width: '100%', height: '100%' }} />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px', letterSpacing: '-0.5px' }}>{currentUser.name}</h2>
                            <p style={{ fontSize: '14px', opacity: 0.8, fontWeight: '500', margin: 0 }}>Student Profile</p>
                        </div>

                        {/* Right Side - Details */}
                        <div style={{ flex: 1, padding: '40px', position: 'relative' }}>
                            <button onClick={() => setIsIdModalOpen(false)} style={{ position: 'absolute', top: '25px', right: '25px', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', transition: 'all 0.2s' }}
                                onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#334155' }}
                                onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b' }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>

                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ width: '4px', height: '20px', background: '#3b82f6', borderRadius: '4px', display: 'block' }}></span>
                                Academic Details
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Student ID</label>
                                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>{currentUser.id}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Branch</label>
                                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>{currentUser.branch || 'N/A'}</div>
                                </div>
                                <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Email Address</label>
                                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>{currentUser.email}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
