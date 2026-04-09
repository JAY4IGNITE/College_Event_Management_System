import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = '';

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
        background: var(--surface);
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
        color: var(--text-main);
        margin-bottom: 12px;
        line-height: 1.4;
    }
    
    .event-info {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--text-muted);
        margin-bottom: 8px;
    }
    
    .event-info i {
        color: var(--info);
        font-size: 12px;
    }
    
    .event-description {
        font-size: 13px;
        color: var(--text-muted);
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .admin-table {
        width: 100%;
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        border: 1px solid #f1f5f9;
        border-collapse: collapse;
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
    const [certificates, setCertificates] = useState([]);
    const [activeTab, setActiveTab] = useState('home');
    const [isIdModalOpen, setIsIdModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'organizer') {
            navigate('/');
        } else {
            fetchDashboardData(currentUser.id);
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        const handlePopstate = (e) => {
            e.preventDefault();
            if (activeTab === 'home') {
                if (window.confirm("Are you sure you want to log out?")) {
                    localStorage.removeItem('currentUser');
                    navigate('/', { replace: true });
                } else {
                    window.history.pushState(null, '', window.location.pathname);
                }
            } else {
                setActiveTab('home');
                window.history.pushState(null, '', window.location.pathname);
            }
        };

        window.history.pushState(null, '', window.location.pathname);
        window.addEventListener('popstate', handlePopstate);

        return () => window.removeEventListener('popstate', handlePopstate);
    }, [navigate, activeTab]);

    const fetchDashboardData = async (userId) => {
        try {
            const statsRes = await fetch(`${API_BASE_URL}/api/organizer/${userId}/stats`);
            const statsData = await statsRes.json();
            setStats({
                totalEvents: statsData.totalEvents || 0,
                totalRegistrations: statsData.totalRegistrations || 0
            });

            const eventsRes = await fetch(`${API_BASE_URL}/api/events?organizerId=${userId}`);
            const organizerEvents = await eventsRes.json();
            setMyEvents(organizerEvents);

            // Fetch Issued Certificates
            const certsRes = await fetch(`${API_BASE_URL}/api/organizers/${userId}/certificates`);
            const certsData = await certsRes.json();
            setCertificates(certsData);

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
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.removeItem('currentUser');
            navigate('/');
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDownloadReport = (eventId) => {
        if (!eventId) return;
        window.location.href = `${API_BASE_URL}/api/organizer/export/${eventId}`;
    };

    const fetchParticipants = async (eventId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/organizer/events/${eventId}/participants`);
            const data = await res.json();
            setParticipants(data);
        } catch (error) {
            console.error('Error fetching participants:', error);
        }
    };

    const handleManageParticipants = (event) => {
        setSelectedEvent(event);
        fetchParticipants(event._id);
        setSelectedParticipants([]);
        setIsParticipantsModalOpen(true);
    };

    const handleToggleParticipant = (regId) => {
        setSelectedParticipants(prev =>
            prev.includes(regId) ? prev.filter(id => id !== regId) : [...prev, regId]
        );
    };

    const handleSelectAll = () => {
        const eligible = participants.filter(p => p.status !== 'attended').map(p => p._id);
        if (selectedParticipants.length === eligible.length) {
            setSelectedParticipants([]);
        } else {
            setSelectedParticipants(eligible);
        }
    };

    const handleBulkGiveCertificate = async () => {
        if (selectedParticipants.length === 0) return;
        if (!window.confirm(`Issue certificates to ${selectedParticipants.length} selected participant(s)?`)) return;
        setIsBulkUpdating(true);
        let successCount = 0;
        for (const regId of selectedParticipants) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/organizer/participants/${regId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'attended' })
                });
                if (res.ok) {
                    setParticipants(prev => prev.map(p => p._id === regId ? { ...p, status: 'attended' } : p));
                    successCount++;
                }
            } catch (e) { console.error(e); }
        }
        setSelectedParticipants([]);
        setIsBulkUpdating(false);
        alert(`Certificates issued to ${successCount} participant(s) successfully!`);
    };

    const handleUpdateStatus = async (regId, status) => {
        setUpdatingStatus(regId);
        try {
            const res = await fetch(`${API_BASE_URL}/api/organizer/participants/${regId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                setParticipants(prev => prev.map(p => p._id === regId ? { ...p, status } : p));
                if (status === 'attended') {
                    alert('Certificate issued successfully!');
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
        setUpdatingStatus(null);
    };

    if (!currentUser) return null;

    return (
        <div style={{ paddingBottom: '50px' }}>
            {/* Dashboard Navigation */}
            <nav className="dashboard-nav" style={{ padding: '20px 40px', background: 'var(--surface-glass)', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
                <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/aditya.jpg" alt="Logo" style={{ height: '36px', borderRadius: '4px', mixBlendMode: 'multiply' }} />
                    <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.3px', fontFamily: "'Outfit', sans-serif" }}>
                        Aditya University
                    </span>
                </div>
                <div className="nav-links" style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => handleTabChange('home')}
                        style={{
                            background: activeTab === 'home' ? '#EFF6FF' : 'transparent',
                            color: activeTab === 'home' ? 'var(--primary)' : 'var(--text-muted)',
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
                            color: activeTab === 'events' ? 'var(--primary)' : 'var(--text-muted)',
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
                        onClick={() => handleTabChange('analytics')}
                        style={{
                            background: activeTab === 'analytics' ? '#EFF6FF' : 'transparent',
                            color: activeTab === 'analytics' ? 'var(--primary)' : 'var(--text-muted)',
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
                        onClick={() => handleTabChange('certificates')}
                        style={{
                            background: activeTab === 'certificates' ? '#EFF6FF' : 'transparent',
                            color: activeTab === 'certificates' ? 'var(--primary)' : 'var(--text-muted)',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                            className="user-profile"
                            title="Profile"
                            onClick={() => setIsIdModalOpen(true)}
                            style={{
                                cursor: 'pointer',
                                padding: '6px',
                                paddingRight: '16px',
                                background: 'white',
                                border: '1px solid var(--border)',
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
                                border: '1px solid var(--border)',
                                color: 'var(--danger)',
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
                            background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
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
                                <div className="stat-icon" style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}><i className="fa-regular fa-calendar-check"></i></div>
                                <div className="stat-info">
                                    <div className="number" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1' }}>{stats.totalEvents}</div>
                                    <h4 style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>My Events</h4>
                                </div>
                            </div>
                            <div className="stat-card" style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #f1f5f9' }}>
                                <div className="stat-icon" style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}><i className="fa-solid fa-users"></i></div>
                                <div className="stat-info">
                                    <div className="number" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1' }}>{stats.totalRegistrations}</div>
                                    <h4 style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>Total Registrations</h4>
                                </div>
                            </div>
                            <div className="stat-card" style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #f1f5f9' }}>
                                <div className="stat-icon" style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}><i className="fa-solid fa-star"></i></div>
                                <div className="stat-info">
                                    <div className="number" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1' }}>4.8</div>
                                    <h4 style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>Average Rating</h4>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px', alignItems: 'stretch' }}>
                            {/* Recent Events Panel */}
                            <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', animation: 'fadeInUp 0.7s ease-out', display: 'flex', flexDirection: 'column' }}>
                                <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div className="section-title" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ width: '4px', height: '24px', background: 'var(--info)', borderRadius: '4px', display: 'block' }}></span>
                                        Organizer Event Hub
                                    </div>
                                    <button onClick={() => setActiveTab('events')} style={{ background: 'none', border: 'none', color: 'var(--info)', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>View All Events <i className="fa-solid fa-arrow-right"></i></button>
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
                                        background: 'var(--surface)',
                                        borderRadius: '20px',
                                        border: '2px dashed var(--border)',
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
                                            color: 'var(--info)',
                                            fontSize: '32px',
                                            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)'
                                        }}>
                                            <i className="fa-solid fa-plus-circle"></i>
                                        </div>
                                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>No Active Events Found</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '280px', margin: '0 0 24px', lineHeight: '1.6' }}>
                                            You haven't launched any campus activities yet. Start building your first student event!
                                        </p>
                                        <button
                                            onClick={() => navigate('/create-event')}
                                            style={{
                                                background: 'linear-gradient(135deg, var(--info) 0%, var(--primary) 100%)',
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
                                            <div className="event-card" key={event._id} style={{ borderRadius: '20px', display: 'flex', alignItems: 'center', padding: '16px', gap: '20px', background: 'var(--surface)', border: '1px solid #f1f5f9', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' }} onClick={() => { setSelectedEvent(event); setIsEventModalOpen(true); }}>
                                                {event.poster ? (
                                                    <div style={{ width: '80px', height: '80px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                                        <img src={event.poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                ) : (
                                                    <div style={{ width: '80px', height: '80px', borderRadius: '14px', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '24px', flexShrink: 0 }}>
                                                        <i className="fa-regular fa-image"></i>
                                                    </div>
                                                )}
                                                <div className="event-details" style={{ padding: '0', flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                        <span style={{ background: event.isApproved ? '#ecfdf5' : 'var(--surface-glass)7ed', color: event.isApproved ? '#059669' : '#ea580c', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>
                                                            {event.isApproved ? 'Approved' : 'Pending'}
                                                        </span>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '500' }}>• {event.category || 'General'}</span>
                                                    </div>
                                                    <div className="event-title" style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><i className="fa-regular fa-calendar" style={{ color: 'var(--info)' }}></i> {event.date}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><i className="fa-solid fa-location-dot" style={{ color: 'var(--warning)' }}></i> {event.location || 'TBA'}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setActiveTab('events'); }}
                                                    style={{ background: 'white', border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                                                    onMouseOver={(e) => { e.currentTarget.style.color = 'var(--info)'; e.currentTarget.style.borderColor = 'var(--info)'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
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
                                    <div className="section-title" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ width: '4px', height: '24px', background: 'var(--warning)', borderRadius: '4px', display: 'block' }}></span>
                                        Upcoming Deadlines
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                                    {myEvents.filter(e => e.deadline).length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
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
                                                            background: isUrgent ? '#fee2e2' : 'var(--surface)',
                                                            color: isUrgent ? 'var(--danger)' : 'var(--text-muted)',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '10px',
                                                            fontWeight: '700',
                                                            border: `1px solid ${isUrgent ? '#fecaca' : 'var(--border)'}`
                                                        }}>
                                                            <span>{deadlineDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                                                            <span style={{ fontSize: '14px', lineHeight: '1' }}>{deadlineDate.getDate()}</span>
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</div>
                                                            <div style={{ fontSize: '11px', color: isUrgent ? 'var(--danger)' : 'var(--text-muted)', fontWeight: isUrgent ? '600' : '400' }}>
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
                                        background: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        padding: '10px',
                                        borderRadius: '10px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'var(--surface)'}
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
                                <div style={{ width: '45px', height: '45px', background: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>
                                    <i className="fa-solid fa-briefcase" style={{ fontSize: '20px' }}></i>
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Events Management Center</h2>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Track, manage and analyze all your organized campus events</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/create-event')}
                                style={{
                                    background: 'linear-gradient(135deg, var(--info) 0%, var(--primary) 100%)',
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
                                    <i className="fa-regular fa-folder-open" style={{ fontSize: '48px', color: 'var(--text-light)', marginBottom: '16px' }}></i>
                                    <h3 style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '8px' }}>Your Portfolio is Empty</h3>
                                    <p style={{ color: 'var(--text-light)' }}>All your published campus events will be summarized here.</p>
                                </div>
                            ) : (
                                myEvents.map(event => (
                                    <div className="event-card" key={event._id} style={{ borderRadius: '20px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => { setSelectedEvent(event); setIsEventModalOpen(true); }}>
                                        <div className="event-image">
                                            <img
                                                src={event.poster || (
                                                    event.category === 'Technical' ? 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000' :
                                                        event.category === 'Cultural' ? 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000' :
                                                            event.category === 'Sports' ? 'https://images.unsplash.com/photo-1461896756970-d5be867d7395?q=80&w=1000' :
                                                                event.category === 'Workshop' ? 'https://images.unsplash.com/photo-1531498860502-236734166953?q=80&w=1000' :
                                                                    event.category === 'Seminar' ? 'https://images.unsplash.com/photo-1475721027461-90adbe67623a?q=80&w=1000' :
                                                                        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000'
                                                )}
                                                alt={event.title}
                                            />
                                            <span className="event-tag" style={{ background: event.isApproved ? 'var(--success)' : 'var(--warning)' }}>{event.isApproved ? 'Approved' : 'Pending'}</span>
                                        </div>
                                        <div className="event-details" style={{ padding: '24px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    <span style={{
                                                        background: event.isApproved ? '#ecfdf5' : 'var(--surface-glass)7ed',
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
                                                    <span style={{ background: 'var(--surface)', color: 'var(--text-muted)', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', border: '1px solid var(--border)' }}>
                                                        {event.category || 'General'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="event-title" style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '16px' }}>{event.title}</div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                                                        <i className="fa-regular fa-calendar"></i>
                                                    </div>
                                                    {event.date}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--surface-glass)beb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
                                                        <i className="fa-solid fa-location-dot"></i>
                                                    </div>
                                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.location || 'TBA'}</span>
                                                </div>
                                            </div>

                                            <div className="event-description" style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', height: '42px', marginBottom: '20px' }}>{event.description}</div>

                                            <div className="card-footer" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ display: 'flex', fontSize: '13px', color: 'var(--text-main)', fontWeight: '700', alignItems: 'center', gap: '6px' }}>
                                                        <i className="fa-solid fa-users" style={{ color: 'var(--info)' }}></i>
                                                        {event.registeredCount || 0}
                                                        <span style={{ fontWeight: '500', color: 'var(--text-light)' }}>Registered</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleManageParticipants(event); }}
                                                        title="Manage Participants & Give Certificates"
                                                        style={{
                                                            background: '#ecfdf5',
                                                            color: '#059669',
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
                                                        onMouseOver={(e) => e.currentTarget.style.background = '#d1fae5'}
                                                        onMouseOut={(e) => e.currentTarget.style.background = '#ecfdf5'}
                                                    >
                                                        <i className="fa-solid fa-award"></i> Give Certificates
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDownloadReport(event._id); }}
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
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event._id); }}
                                                        style={{
                                                            background: 'var(--surface-glass)1f2',
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
                                                        onMouseOut={(e) => e.currentTarget.style.background = 'var(--surface-glass)1f2'}
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

                {activeTab === 'analytics' && (
                    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
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
                                <div style={{ width: '45px', height: '45px', background: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>
                                    <i className="fa-solid fa-chart-pie" style={{ fontSize: '20px' }}></i>
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Event Reporting & Analytics</h2>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Generate and download participant reports for your hosted events.</p>
                                </div>
                            </div>
                        </div>

                        <div className="section-header" id="reports" style={{ marginBottom: '24px' }}>
                            <div className="section-title" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ width: '4px', height: '24px', background: 'var(--info)', borderRadius: '4px', display: 'block' }}></span>
                                Participation Reports
                            </div>
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
                                {myEvents.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>No events found</td></tr>
                                ) : (
                                    myEvents.map(event => (
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
                )}

                {activeTab === 'certificates' && (
                    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                        <div className="section-header" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div className="section-title" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ width: '4px', height: '24px', background: 'var(--success)', borderRadius: '4px', display: 'block' }}></span>
                                Issued Certificates
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                                Total Issued: <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{certificates.length}</span>
                            </div>
                        </div>

                        {certificates.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                <div style={{ width: '80px', height: '80px', background: 'var(--surface)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--warning)', fontSize: '32px' }}>
                                    <i className="fa-solid fa-award"></i>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>No Certificates Issued Yet</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>To issue certificates, go to your events and mark participants as "Attended".</p>
                            </div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Certificate ID</th>
                                        <th>Student</th>
                                        <th>Event Name</th>
                                        <th>Issue Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {certificates.map(cert => (
                                        <tr key={cert._id}>
                                            <td style={{ fontWeight: '700', color: 'var(--info)' }}>{cert.certificateId}</td>
                                            <td>
                                                <div style={{ fontWeight: '600' }}>{cert.studentName}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cert.studentId}</div>
                                            </td>
                                            <td>{cert.eventName}</td>
                                            <td>{new Date(cert.issueDate).toLocaleDateString()}</td>
                                            <td>
                                                <a 
                                                    href={`/verify?cert_id=${cert.certificateId}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600', fontSize: '13px' }}
                                                >
                                                    <i className="fa-solid fa-up-right-from-square" style={{ fontSize: '10px' }}></i> Verify
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

            </div>

            {isIdModalOpen && (
                <div className="modal" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div className="modal-content" style={{ width: '750px', background: 'white', borderRadius: '40px', padding: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'fadeInUp 0.3s ease-out', display: 'flex' }}>

                        {/* Left Side - Profile Summary */}
                        <div style={{ width: '280px', borderRadius: '32px', background: 'linear-gradient(135deg, #059669 0%, var(--success) 100%)', padding: '40px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', boxShadow: '0 10px 40px -10px rgba(16, 185, 129, 0.4)' }}>
                            <div style={{ width: '110px', height: '110px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.3)', marginBottom: '20px', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
                                <img src={`https://ui-avatars.com/api/?name=${currentUser.name}&size=200&background=fff&color=059669`} alt="Profile" style={{ width: '100%', height: '100%' }} />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px', letterSpacing: '-0.5px' }}>{currentUser.name}</h2>
                            <p style={{ fontSize: '14px', opacity: 0.8, fontWeight: '500', margin: 0 }}>Organizer Profile</p>
                        </div>

                        {/* Right Side - Details */}
                        <div style={{ flex: 1, padding: '40px', position: 'relative' }}>
                            <button onClick={() => setIsIdModalOpen(false)} style={{ position: 'absolute', top: '25px', right: '25px', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', transition: 'all 0.2s' }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>

                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ width: '4px', height: '20px', background: 'var(--success)', borderRadius: '4px', display: 'block' }}></span>
                                Professional Details
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '4px' }}>Organizer ID</label>
                                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>{currentUser.id}</div>
                                </div>
                                <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '4px' }}>Department</label>
                                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>{currentUser.dept || 'N/A'}</div>
                                </div>
                                <div style={{ gridColumn: 'span 2', background: 'var(--surface)', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '4px' }}>Email Address</label>
                                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>{currentUser.email}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isEventModalOpen && selectedEvent && (
                <div className="modal" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div className="modal-content" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto', background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'fadeInUp 0.3s ease-out', position: 'relative' }}>
                        <button onClick={() => setIsEventModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', transition: 'all 0.2s' }}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        
                        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '16px', paddingRight: '40px' }}>{selectedEvent.title}</h2>
                        
                        {selectedEvent.poster && (
                            <div style={{ width: '100%', height: '200px', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' }}>
                                <img src={selectedEvent.poster} alt={selectedEvent.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Category</div>
                                <div style={{ fontWeight: '600' }}>{selectedEvent.category || 'General'}</div>
                            </div>
                            <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Date</div>
                                <div style={{ fontWeight: '600' }}>{selectedEvent.date}</div>
                            </div>
                            <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Location</div>
                                <div style={{ fontWeight: '600' }}>{selectedEvent.location || 'TBA'}</div>
                            </div>
                            <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Participation</div>
                                <div style={{ fontWeight: '600' }}>{selectedEvent.isTeamEvent ? `Team (Max ${selectedEvent.maxTeamSize})` : 'Individual'}</div>
                            </div>
                            <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Status</div>
                                <div style={{ fontWeight: '600', color: selectedEvent.isApproved ? '#059669' : '#ea580c' }}>{selectedEvent.isApproved ? 'Approved' : 'Pending'}</div>
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Description</h3>
                            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-muted)' }}>{selectedEvent.description}</p>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                <i className="fa-solid fa-users" style={{ color: 'var(--info)', marginRight: '8px' }}></i>
                                {selectedEvent.registeredCount || 0} Registered
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isParticipantsModalOpen && selectedEvent && (
                <div className="modal" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                    <div style={{ width: '960px', maxWidth: '95vw', maxHeight: '92vh', background: 'white', borderRadius: '28px', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3)', animation: 'fadeInUp 0.3s ease-out', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                        {/* Modal Header */}
                        <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
                            <div>
                                <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 4px' }}>Manage Participants</h2>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                                    <span style={{ fontWeight: '700', color: 'var(--info)' }}>{selectedEvent.title}</span>
                                    &nbsp;·&nbsp; {participants.length} registered
                                    &nbsp;·&nbsp; {participants.filter(p => p.status === 'attended').length} attended
                                </p>
                            </div>
                            <button
                                onClick={() => { setIsParticipantsModalOpen(false); setSelectedParticipants([]); }}
                                style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, transition: 'all 0.2s' }}
                                onMouseOver={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#334155'; }}
                                onMouseOut={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        {/* Scrollable Table */}
                        <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px' }}>
                            {participants.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                    <i className="fa-solid fa-users-slash" style={{ fontSize: '40px', color: 'var(--text-light)', marginBottom: '16px' }}></i>
                                    <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>No participants registered yet.</p>
                                </div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                                            <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f1f5f9', width: '44px' }}>
                                                <input
                                                    type="checkbox"
                                                    title="Select all eligible"
                                                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--info)' }}
                                                    checked={participants.filter(p => p.status !== 'attended').length > 0 && selectedParticipants.length === participants.filter(p => p.status !== 'attended').length}
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f1f5f9' }}>Student</th>
                                            <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f1f5f9' }}>Student ID</th>
                                            <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f1f5f9' }}>Branch</th>
                                            <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f1f5f9' }}>Status</th>
                                            <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #f1f5f9' }}>Certificate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {participants.map((p, idx) => (
                                            <tr key={p._id} style={{ background: selectedParticipants.includes(p._id) ? '#f0fdf4' : idx % 2 === 0 ? 'white' : '#fafafa', transition: 'background 0.15s' }}>
                                                <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' }}>
                                                    {p.status !== 'attended' ? (
                                                        <input
                                                            type="checkbox"
                                                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--info)' }}
                                                            checked={selectedParticipants.includes(p._id)}
                                                            onChange={() => handleToggleParticipant(p._id)}
                                                        />
                                                    ) : (
                                                        <i className="fa-solid fa-circle-check" style={{ color: 'var(--success)', fontSize: '18px', display: 'block', textAlign: 'center' }}></i>
                                                    )}
                                                </td>
                                                <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <img
                                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.studentName)}&background=6366f1&color=fff&size=64`}
                                                            alt=""
                                                            style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 }}
                                                        />
                                                        <div>
                                                            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>{p.studentName}</div>
                                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.studentEmail || '—'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: '600' }}>{p.studentId}</td>
                                                <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle', fontSize: '13px', color: 'var(--text-muted)' }}>{p.studentBranch || '—'}</td>
                                                <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle', textAlign: 'center' }}>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                        padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '700',
                                                        background: p.status === 'attended' ? '#ecfdf5' : '#eff6ff',
                                                        color: p.status === 'attended' ? '#059669' : '#2563eb',
                                                        border: `1px solid ${p.status === 'attended' ? '#d1fae5' : '#bfdbfe'}`
                                                    }}>
                                                        <i className={`fa-solid ${p.status === 'attended' ? 'fa-check' : 'fa-clock'}`} style={{ fontSize: '9px' }}></i>
                                                        {p.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle', textAlign: 'center' }}>
                                                    {p.status !== 'attended' ? (
                                                        <button
                                                            disabled={updatingStatus === p._id}
                                                            onClick={() => handleUpdateStatus(p._id, 'attended')}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                                color: 'white', border: 'none',
                                                                padding: '8px 16px', borderRadius: '10px',
                                                                fontSize: '12px', fontWeight: '700',
                                                                cursor: updatingStatus === p._id ? 'not-allowed' : 'pointer',
                                                                opacity: updatingStatus === p._id ? 0.6 : 1,
                                                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                                transition: 'all 0.2s', whiteSpace: 'nowrap'
                                                            }}
                                                            onMouseOver={e => { if (updatingStatus !== p._id) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                            onMouseOut={e => { e.currentTarget.style.transform = 'none'; }}
                                                        >
                                                            {updatingStatus === p._id
                                                                ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Issuing...</>
                                                                : <><i className="fa-solid fa-award"></i> Give Certificate</>}
                                                        </button>
                                                    ) : (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: '700', fontSize: '13px' }}>
                                                            <i className="fa-solid fa-circle-check"></i> Issued
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Footer Action Bar */}
                        <div style={{ padding: '16px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: selectedParticipants.length > 0 ? '#f0fdf4' : 'white', transition: 'background 0.3s' }}>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                {selectedParticipants.length > 0
                                    ? <span style={{ color: '#059669' }}><i className="fa-solid fa-check-square" style={{ marginRight: '6px' }}></i>{selectedParticipants.length} selected</span>
                                    : <span>Select participants to issue certificates in bulk.</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                {participants.filter(p => p.status !== 'attended').length > 0 && (
                                    <button
                                        onClick={handleSelectAll}
                                        style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--info)'; e.currentTarget.style.color = 'var(--info)'; }}
                                        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                    >
                                        {selectedParticipants.length === participants.filter(p => p.status !== 'attended').length ? 'Deselect All' : 'Select All'}
                                    </button>
                                )}
                                <button
                                    onClick={handleBulkGiveCertificate}
                                    disabled={selectedParticipants.length === 0 || isBulkUpdating}
                                    style={{
                                        background: selectedParticipants.length === 0 ? '#e2e8f0' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        color: selectedParticipants.length === 0 ? 'var(--text-muted)' : 'white',
                                        border: 'none', padding: '10px 24px', borderRadius: '12px',
                                        fontSize: '14px', fontWeight: '700',
                                        cursor: selectedParticipants.length === 0 ? 'not-allowed' : 'pointer',
                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                        boxShadow: selectedParticipants.length > 0 ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isBulkUpdating
                                        ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Issuing...</>
                                        : <><i className="fa-solid fa-award"></i> Give Certificate{selectedParticipants.length > 1 ? ` (${selectedParticipants.length})` : ''}</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizerDashboard;
