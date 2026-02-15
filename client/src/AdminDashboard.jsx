import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000';

// Add animations
const styles = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes slideUp {
        from { 
            opacity: 0;
            transform: translateY(20px);
        }
        to { 
            opacity: 1;
            transform: translateY(0);
        }
    }
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
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
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    if (!document.head.querySelector('style[data-admin-animations]')) {
        styleSheet.setAttribute('data-admin-animations', 'true');
        document.head.appendChild(styleSheet);
    }
}

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [stats, setStats] = useState({ students: 0, organizers: 0, events: 0 });
    const [pendingEvents, setPendingEvents] = useState([]);
    const [students, setStudents] = useState([]);
    const [organizers, setOrganizers] = useState([]);
    const [activeTab, setActiveTab] = useState('home');

    // New state for enhanced features
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [activityLog, setActivityLog] = useState([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [sortBy, setSortBy] = useState('name');
    const [allEvents, setAllEvents] = useState([]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user || user.role !== 'admin') {
            navigate('/');
        } else {
            setCurrentUser(user);
            fetchAllData();
        }
    }, [navigate]);

    const fetchAllData = async () => {
        try {
            // Fetch Stats
            const statsRes = await fetch(`${API_BASE_URL}/api/admin/stats`);
            const statsData = await statsRes.json();
            setStats({
                students: statsData.studentCount,
                organizers: statsData.organizerCount,
                events: statsData.eventCount
            });

            // Fetch All Events to filter pending
            const eventsRes = await fetch(`${API_BASE_URL}/api/admin/events/all`);
            const allEventsData = await eventsRes.json();
            setAllEvents(allEventsData);
            setPendingEvents(allEventsData.filter(e => !e.isApproved));

            // Fetch All Users
            const usersRes = await fetch(`${API_BASE_URL}/api/admin/users`);
            const usersData = await usersRes.json();
            setStudents(usersData.students);
            setOrganizers(usersData.organizers);

            // Generate activity log from recent data
            const activities = [];

            // Add recent student registrations
            usersData.students.slice(0, 3).forEach(student => {
                activities.push({
                    id: `student-${student.id}`,
                    type: 'user_registered',
                    role: 'student',
                    message: `${student.name} registered as a student`,
                    timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
                    icon: 'fa-user-plus',
                    color: '#3b82f6'
                });
            });

            // Add recent organizer registrations
            usersData.organizers.slice(0, 2).forEach(organizer => {
                activities.push({
                    id: `organizer-${organizer.id}`,
                    type: 'user_registered',
                    role: 'organizer',
                    message: `${organizer.name} registered as an organizer`,
                    timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
                    icon: 'fa-user-tie',
                    color: '#f97316'
                });
            });

            // Add pending event submissions
            allEventsData.filter(e => !e.isApproved).slice(0, 3).forEach(event => {
                activities.push({
                    id: `event-${event._id}`,
                    type: 'event_pending',
                    message: `Event "${event.title}" submitted for approval`,
                    timestamp: new Date(Date.now() - Math.random() * 86400000 * 5),
                    icon: 'fa-calendar-plus',
                    color: '#eab308'
                });
            });

            // Sort activities by timestamp
            activities.sort((a, b) => b.timestamp - a.timestamp);
            setActivityLog(activities.slice(0, 10));

        } catch (error) {
            console.error('Error fetching admin data:', error);
        }
    };

    const handleApproveEvent = async (eventId) => {
        if (!window.confirm("Approve this event?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/events/${eventId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isApproved: true, status: 'upcoming' })
            });
            if (res.ok) {
                fetchAllData();
            }
        } catch (error) { console.error(error); }
    };

    const handleRejectEvent = async (eventId) => {
        if (!window.confirm("Reject and delete this event?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`, { method: 'DELETE' });
            if (res.ok) {
                fetchAllData();
            }
        } catch (error) { console.error(error); }
    };

    const handleDeleteUser = async (role, id) => {
        if (!window.confirm(`Are you sure you want to delete this ${role}? This action cannot be undone.`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${role}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                // alert(`${role} deleted successfully`);
                fetchAllData();
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/');
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchTerm('');
        setSelectedUsers([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Filter and search functions
    const getFilteredUsers = () => {
        let allUsers = [];

        if (filterRole === 'all' || filterRole === 'student') {
            allUsers = [...allUsers, ...students.map(s => ({ ...s, role: 'student' }))];
        }
        if (filterRole === 'all' || filterRole === 'organizer') {
            allUsers = [...allUsers, ...organizers.map(o => ({ ...o, role: 'organizer' }))];
        }

        // Apply search filter
        if (searchTerm) {
            allUsers = allUsers.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.branch && user.branch.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.dept && user.dept.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply sorting
        allUsers.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'email') return a.email.localeCompare(b.email);
            return 0;
        });

        return allUsers;
    };

    // Bulk actions
    const handleSelectUser = (userId, role) => {
        const userKey = `${role}-${userId}`;
        if (selectedUsers.includes(userKey)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userKey));
        } else {
            setSelectedUsers([...selectedUsers, userKey]);
        }
    };

    const handleSelectAll = () => {
        const filteredUsers = getFilteredUsers();
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(u => `${u.role}-${u.id}`));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.length === 0) return;
        if (!window.confirm(`Delete ${selectedUsers.length} selected user(s)? This action cannot be undone.`)) return;

        try {
            for (const userKey of selectedUsers) {
                const [role, id] = userKey.split('-');
                await fetch(`${API_BASE_URL}/api/admin/users/${role}/${id}`, { method: 'DELETE' });
            }
            setSelectedUsers([]);
            fetchAllData();
        } catch (error) {
            console.error('Error deleting users:', error);
            alert('Failed to delete some users');
        }
    };

    // Export to CSV
    const exportToCSV = (data, filename) => {
        if (data.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleExportUsers = () => {
        const filteredUsers = getFilteredUsers();
        const exportData = filteredUsers.map(user => ({
            Name: user.name,
            Email: user.email,
            Role: user.role,
            Department: user.dept || user.branch || 'N/A',
            ID: user.id
        }));
        exportToCSV(exportData, `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleExportEvents = () => {
        const exportData = allEvents.map(event => ({
            Title: event.title,
            Date: event.date,
            Location: event.location || 'TBA',
            Status: event.isApproved ? 'Approved' : 'Pending',
            Organizer: event.organizerId,
            Description: event.description
        }));
        exportToCSV(exportData, `events_export_${new Date().toISOString().split('T')[0]}.csv`);
    };

    // User details modal
    const handleViewUserDetails = (user, role) => {
        setSelectedUser({ ...user, role });
        setShowUserModal(true);
    };

    // Analytics calculations
    const getAnalytics = () => {
        // Safely handle empty arrays
        const totalEvents = allEvents.length || 0;
        const approvedEvents = allEvents.filter(e => e.isApproved).length || 0;
        const pendingEventsCount = allEvents.filter(e => !e.isApproved).length || 0;
        const totalStudents = students.length || 0;
        const totalOrganizers = organizers.length || 0;
        const totalUsers = totalStudents + totalOrganizers;

        // Calculate approval rate with proper handling
        const approvalRate = totalEvents > 0
            ? ((approvedEvents / totalEvents) * 100).toFixed(1)
            : '0.0';

        // Calculate student to organizer ratio
        let studentToOrganizerRatio;
        if (totalOrganizers === 0) {
            studentToOrganizerRatio = totalStudents > 0 ? `${totalStudents}` : '0';
        } else {
            studentToOrganizerRatio = (totalStudents / totalOrganizers).toFixed(1);
        }

        // Calculate percentage distributions
        const studentPercentage = totalUsers > 0
            ? ((totalStudents / totalUsers) * 100).toFixed(1)
            : '0.0';
        const organizerPercentage = totalUsers > 0
            ? ((totalOrganizers / totalUsers) * 100).toFixed(1)
            : '0.0';

        return {
            approvedEvents,
            pendingEventsCount,
            approvalRate,
            totalUsers,
            totalStudents,
            totalOrganizers,
            totalEvents,
            studentToOrganizerRatio,
            studentPercentage,
            organizerPercentage
        };
    };

    if (!currentUser) return null;

    return (
        <div style={{ paddingBottom: '50px' }}>
            {/* Navbar */}
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
                        onClick={() => handleTabChange('approvals')}
                        style={{
                            background: activeTab === 'approvals' ? '#EFF6FF' : 'transparent',
                            color: activeTab === 'approvals' ? '#2563eb' : '#64748b',
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
                        <i className="fa-solid fa-check-double" style={{ fontSize: '13px' }}></i> Approvals
                        {pendingEvents.length > 0 && (
                            <span style={{ background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', marginLeft: '4px' }}>{pendingEvents.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => handleTabChange('users')}
                        style={{
                            background: activeTab === 'users' ? '#EFF6FF' : 'transparent',
                            color: activeTab === 'users' ? '#2563eb' : '#64748b',
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
                        <i className="fa-solid fa-users-gear" style={{ fontSize: '13px' }}></i> Users
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
                        <i className="fa-solid fa-calendar-days" style={{ fontSize: '13px' }}></i> Events
                    </button>
                    <button
                        onClick={() => handleTabChange('analytics')}
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
                                src={`https://ui-avatars.com/api/?name=Admin&background=2563eb&color=fff&size=128`}
                                alt="Avatar"
                                style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                            />
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                System Admin
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
                            onMouseOver={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
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
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            overflow: 'hidden',
                            padding: '40px',
                            color: 'white',
                            boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.3)',
                            marginBottom: '40px',
                            animation: 'fadeInUp 0.5s ease-out',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.6 }}></div>
                            <div style={{ position: 'absolute', bottom: '-20%', left: '10%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.6 }}></div>

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#bfdbfe', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </div>
                                <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-1px', color: 'white' }}>
                                    Welcome back, Admin!
                                </h1>
                                <p style={{ fontSize: '16px', color: '#bfdbfe', maxWidth: '500px', lineHeight: '1.6', margin: 0 }}>
                                    You have <span style={{ color: 'white', fontWeight: '700' }}>{pendingEvents.length} events</span> pending approval and <span style={{ color: 'white', fontWeight: '700' }}>{stats.students + stats.organizers} users</span> in the system.
                                </p>
                            </div>

                            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <button
                                    onClick={() => setActiveTab('approvals')}
                                    style={{
                                        background: 'white',
                                        color: '#2563eb',
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
                                    <i className="fa-solid fa-check-double"></i> Review Approvals
                                </button>
                            </div>
                        </div>

                        <div className="stats-grid" style={{ animation: 'fadeInUp 0.6s ease-out', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
                            <div className="stat-card" style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #f1f5f9' }}>
                                <div className="stat-icon" style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}><i className="fa-solid fa-users"></i></div>
                                <div className="stat-info">
                                    <div className="number" style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', lineHeight: '1' }}>{stats.students}</div>
                                    <h4 style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Total Students</h4>
                                </div>
                            </div>
                            <div className="stat-card" style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #f1f5f9' }}>
                                <div className="stat-icon" style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}><i className="fa-solid fa-user-tie"></i></div>
                                <div className="stat-info">
                                    <div className="number" style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', lineHeight: '1' }}>{stats.organizers}</div>
                                    <h4 style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Total Organizers</h4>
                                </div>
                            </div>
                            <div className="stat-card" style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #f1f5f9' }}>
                                <div className="stat-icon" style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}><i className="fa-solid fa-calendar-check"></i></div>
                                <div className="stat-info">
                                    <div className="number" style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', lineHeight: '1' }}>{stats.events}</div>
                                    <h4 style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Total Events</h4>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px', alignItems: 'stretch', marginBottom: '24px' }}>
                            <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', animation: 'fadeInUp 0.7s ease-out', display: 'flex', flexDirection: 'column' }}>
                                <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div className="section-title" style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ width: '4px', height: '24px', background: '#8b5cf6', borderRadius: '4px', display: 'block' }}></span>
                                        Activity Timeline
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                                    {activityLog.map(activity => (
                                        <div key={activity.id} style={{ display: 'flex', alignItems: 'start', gap: '16px', padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                            onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${activity.color}15`, color: activity.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                                                <i className={`fa-solid ${activity.icon}`}></i>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{activity.message}</div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                                    <i className="fa-regular fa-clock" style={{ marginRight: '4px' }}></i>
                                                    {activity.timestamp.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {activityLog.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                            <i className="fa-solid fa-inbox" style={{ fontSize: '32px', marginBottom: '12px', display: 'block' }}></i>
                                            No recent activities
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', animation: 'fadeInUp 0.8s ease-out', display: 'flex', flexDirection: 'column' }}>
                                <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div className="section-title" style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ width: '4px', height: '24px', background: '#10b981', borderRadius: '4px', display: 'block' }}></span>
                                        Quick Actions
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <button
                                        onClick={() => {
                                            fetchAllData();
                                        }}
                                        style={{
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '16px',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s',
                                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                                    >
                                        <i className="fa-solid fa-rotate" style={{ fontSize: '20px' }}></i>
                                        <span>Refresh Data</span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('approvals')}
                                        style={{
                                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '16px',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s',
                                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                                    >
                                        <i className="fa-solid fa-calendar-check" style={{ fontSize: '20px' }}></i>
                                        <span>View All Events</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            const analytics = getAnalytics();
                                            const reportData = [{
                                                'Total Users': analytics.totalUsers,
                                                'Students': analytics.totalStudents,
                                                'Organizers': analytics.totalOrganizers,
                                                'Total Events': analytics.totalEvents,
                                                'Approved Events': analytics.approvedEvents,
                                                'Pending Events': analytics.pendingEventsCount,
                                                'Approval Rate': `${analytics.approvalRate}%`,
                                                'Student/Organizer Ratio': analytics.studentToOrganizerRatio,
                                                'Generated Date': new Date().toLocaleString()
                                            }];
                                            exportToCSV(reportData, `admin_report_${new Date().toISOString().split('T')[0]}.csv`);
                                        }}
                                        style={{
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '16px',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s',
                                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                                    >
                                        <i className="fa-solid fa-file-chart-column" style={{ fontSize: '20px' }}></i>
                                        <span>System Report</span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('analytics')}
                                        style={{
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '16px',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s',
                                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                                    >
                                        <i className="fa-solid fa-chart-pie" style={{ fontSize: '20px' }}></i>
                                        <span>View Analytics</span>
                                    </button>

                                    <button
                                        onClick={handleExportUsers}
                                        style={{
                                            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '16px',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s',
                                            boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                                    >
                                        <i className="fa-solid fa-users" style={{ fontSize: '20px' }}></i>
                                        <span>Export Users</span>
                                    </button>

                                    <button
                                        onClick={handleExportEvents}
                                        style={{
                                            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '16px',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s',
                                            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                                    >
                                        <i className="fa-solid fa-calendar-days" style={{ fontSize: '20px' }}></i>
                                        <span>Export Events</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', animation: 'fadeInUp 0.7s ease-out', display: 'flex', flexDirection: 'column' }}>
                                <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div className="section-title" style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ width: '4px', height: '24px', background: '#3b82f6', borderRadius: '4px', display: 'block' }}></span>
                                        Recent Students
                                    </div>
                                    <button onClick={() => setActiveTab('users')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>View All <i className="fa-solid fa-arrow-right"></i></button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {students.slice(0, 5).map(student => (
                                        <div key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
                                            onClick={() => handleViewUserDetails(student, 'student')}
                                            onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'}
                                            onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '600' }}>
                                                {student.name.charAt(0)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{student.name}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{student.branch || 'Student'} • {student.email}</div>
                                            </div>
                                            <i className="fa-solid fa-chevron-right" style={{ color: '#cbd5e1', fontSize: '12px' }}></i>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', animation: 'fadeInUp 0.8s ease-out', display: 'flex', flexDirection: 'column' }}>
                                <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div className="section-title" style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ width: '4px', height: '24px', background: '#3b82f6', borderRadius: '4px', display: 'block' }}></span>
                                        Recent Organizers
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {organizers.slice(0, 5).map(organizer => (
                                        <div key={organizer.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
                                            onClick={() => handleViewUserDetails(organizer, 'organizer')}
                                            onMouseOver={(e) => e.currentTarget.style.background = '#fff7ed'}
                                            onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f97316', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '600' }}>
                                                {organizer.name.charAt(0)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{organizer.name}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{organizer.dept || 'Organizer'} • {organizer.email}</div>
                                            </div>
                                            <i className="fa-solid fa-chevron-right" style={{ color: '#cbd5e1', fontSize: '12px' }}></i>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'approvals' && (
                    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                        <div className="section-header" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div className="section-title" style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ width: '4px', height: '24px', background: '#3b82f6', borderRadius: '4px', display: 'block' }}></span>
                                Pending Approvals
                            </div>
                        </div>

                        <div className="events-grid">
                            {pendingEvents.length === 0 ? (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.8)', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
                                    <i className="fa-solid fa-check-double" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
                                    <h3 style={{ fontSize: '18px', color: '#64748b', marginBottom: '8px' }}>All caught up!</h3>
                                    <p style={{ color: '#94a3b8' }}>No pending events to approve.</p>
                                </div>
                            ) : (
                                pendingEvents.map(event => (
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
                                            <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
                                                <strong>Organizer ID:</strong> {event.organizerId}
                                            </div>

                                            <div className="card-footer" style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                <button
                                                    onClick={() => handleApproveEvent(event._id)}
                                                    style={{
                                                        background: '#ecfdf5',
                                                        color: '#059669',
                                                        border: '1px solid #d1fae5',
                                                        padding: '10px',
                                                        borderRadius: '8px',
                                                        fontSize: '13px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        width: '100%',
                                                        transition: 'all 0.2s',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = '#d1fae5'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = '#ecfdf5'}
                                                >
                                                    <i className="fa-solid fa-check"></i> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectEvent(event._id)}
                                                    style={{
                                                        background: '#fee2e2',
                                                        color: '#ef4444',
                                                        border: '1px solid #fecaca',
                                                        padding: '10px',
                                                        borderRadius: '8px',
                                                        fontSize: '13px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        width: '100%',
                                                        transition: 'all 0.2s',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = '#fecaca'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
                                                >
                                                    <i className="fa-solid fa-xmark"></i> Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                        {/* Search and Filter Controls */}
                        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginBottom: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '16px', alignItems: 'center' }}>
                                <div style={{ position: 'relative' }}>
                                    <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}></i>
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or department..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px 12px 44px',
                                            borderRadius: '12px',
                                            border: '2px solid #e2e8f0',
                                            fontSize: '14px',
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>

                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    style={{
                                        padding: '12px 40px 12px 16px',
                                        borderRadius: '12px',
                                        border: '2px solid #e2e8f0',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#1e293b',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        background: 'white',
                                        appearance: 'none',
                                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%2364748b\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 16px center'
                                    }}
                                >
                                    <option value="all">All Users</option>
                                    <option value="student">Students Only</option>
                                    <option value="organizer">Organizers Only</option>
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={{
                                        padding: '12px 40px 12px 16px',
                                        borderRadius: '12px',
                                        border: '2px solid #e2e8f0',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#1e293b',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        background: 'white',
                                        appearance: 'none',
                                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%2364748b\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 16px center'
                                    }}
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="email">Sort by Email</option>
                                </select>
                            </div>

                            {/* Bulk Actions Bar */}
                            {selectedUsers.length > 0 && (
                                <div style={{
                                    marginTop: '16px',
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    border: '2px solid #bfdbfe'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <i className="fa-solid fa-circle-check" style={{ color: '#3b82f6', fontSize: '20px' }}></i>
                                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e40af' }}>
                                            {selectedUsers.length} user(s) selected
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => setSelectedUsers([])}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                border: '2px solid #3b82f6',
                                                background: 'white',
                                                color: '#3b82f6',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                                        >
                                            Clear Selection
                                        </button>
                                        <button
                                            onClick={handleBulkDelete}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: '#ef4444',
                                                color: 'white',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
                                            onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}
                                        >
                                            <i className="fa-solid fa-trash-can"></i>
                                            Delete Selected
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Directory Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div className="section-title" style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ width: '4px', height: '24px', background: '#3b82f6', borderRadius: '4px', display: 'block' }}></span>
                                User Directory
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginLeft: '8px' }}>
                                    ({getFilteredUsers().length} {filterRole === 'all' ? 'users' : filterRole + 's'})
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={handleSelectAll}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '10px',
                                        border: '2px solid #e2e8f0',
                                        background: 'white',
                                        color: '#64748b',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
                                >
                                    <i className={`fa-${selectedUsers.length === getFilteredUsers().length && getFilteredUsers().length > 0 ? 'solid' : 'regular'} fa-square-check`}></i>
                                    {selectedUsers.length === getFilteredUsers().length && getFilteredUsers().length > 0 ? 'Deselect All' : 'Select All'}
                                </button>
                                <button
                                    onClick={handleExportUsers}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        color: 'white',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                                >
                                    <i className="fa-solid fa-download"></i>
                                    Export CSV
                                </button>
                            </div>
                        </div>

                        {/* Unified User List */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
                            {getFilteredUsers().length === 0 ? (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                                    <i className="fa-solid fa-users-slash" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
                                    <h3 style={{ fontSize: '18px', color: '#64748b', marginBottom: '8px' }}>No users found</h3>
                                    <p style={{ color: '#94a3b8' }}>Try adjusting your search or filter criteria</p>
                                </div>
                            ) : (
                                getFilteredUsers().map(user => {
                                    const userKey = `${user.role}-${user.id}`;
                                    const isSelected = selectedUsers.includes(userKey);
                                    const roleColor = user.role === 'student' ? '#3b82f6' : '#f97316';
                                    const roleBg = user.role === 'student' ? '#eff6ff' : '#fff7ed';

                                    return (
                                        <div
                                            key={userKey}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                                padding: '16px',
                                                borderRadius: '16px',
                                                background: 'white',
                                                border: `2px solid ${isSelected ? roleColor : '#f1f5f9'}`,
                                                boxShadow: isSelected ? `0 4px 12px ${roleColor}30` : '0 2px 4px rgba(0,0,0,0.02)',
                                                transition: 'all 0.2s',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleSelectUser(user.id, user.role)}
                                        >
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '6px',
                                                border: `2px solid ${isSelected ? roleColor : '#cbd5e1'}`,
                                                background: isSelected ? roleColor : 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                transition: 'all 0.2s'
                                            }}>
                                                {isSelected && <i className="fa-solid fa-check" style={{ color: 'white', fontSize: '10px' }}></i>}
                                            </div>

                                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: roleBg, color: roleColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '600', flexShrink: 0 }}>
                                                {user.name.charAt(0)}
                                            </div>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                                                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                        background: roleBg,
                                                        color: roleColor,
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        textTransform: 'capitalize',
                                                        marginRight: '6px'
                                                    }}>
                                                        {user.role}
                                                    </span>
                                                    {user.branch || user.dept || 'N/A'}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    <i className="fa-regular fa-envelope" style={{ marginRight: '4px' }}></i>
                                                    {user.email}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleViewUserDetails(user, user.role)}
                                                    style={{
                                                        background: roleBg,
                                                        color: roleColor,
                                                        border: 'none',
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '10px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    title="View Details"
                                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                    onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                                                >
                                                    <i className="fa-solid fa-eye"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.role, user.id)}
                                                    style={{
                                                        background: '#fee2e2',
                                                        color: '#ef4444',
                                                        border: 'none',
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '10px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    title="Delete User"
                                                    onMouseOver={(e) => { e.currentTarget.style.background = '#fecaca'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.transform = 'none'; }}
                                                >
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                        <div className="section-header" style={{ marginBottom: '24px' }}>
                            <div className="section-title" style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ width: '4px', height: '24px', background: '#8b5cf6', borderRadius: '4px', display: 'block' }}></span>
                                System Analytics & Insights
                            </div>
                        </div>

                        {/* Analytics Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                            {/* Total Users Card */}
                            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '20px', padding: '28px', color: 'white', boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', fontWeight: '600' }}>Total Users</div>
                                    <div style={{ fontSize: '42px', fontWeight: '800', marginBottom: '8px' }}>{getAnalytics().totalUsers}</div>
                                    <div style={{ fontSize: '13px', opacity: 0.8 }}>
                                        <i className="fa-solid fa-users" style={{ marginRight: '6px' }}></i>
                                        {stats.students} Students • {stats.organizers} Organizers
                                    </div>
                                </div>
                            </div>

                            {/* Approval Rate Card */}
                            <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '20px', padding: '28px', color: 'white', boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', fontWeight: '600' }}>Event Approval Rate</div>
                                    <div style={{ fontSize: '42px', fontWeight: '800', marginBottom: '8px' }}>{getAnalytics().approvalRate}%</div>
                                    <div style={{ fontSize: '13px', opacity: 0.8 }}>
                                        <i className="fa-solid fa-chart-line" style={{ marginRight: '6px' }}></i>
                                        {getAnalytics().approvedEvents} of {allEvents.length} events approved
                                    </div>
                                </div>
                            </div>

                            {/* Pending Events Card */}
                            <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '20px', padding: '28px', color: 'white', boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', fontWeight: '600' }}>Pending Approvals</div>
                                    <div style={{ fontSize: '42px', fontWeight: '800', marginBottom: '8px' }}>{getAnalytics().pendingEventsCount}</div>
                                    <div style={{ fontSize: '13px', opacity: 0.8 }}>
                                        <i className="fa-solid fa-clock" style={{ marginRight: '6px' }}></i>
                                        Awaiting review
                                    </div>
                                </div>
                            </div>

                            {/* User Ratio Card */}
                            <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '20px', padding: '28px', color: 'white', boxShadow: '0 10px 30px rgba(250, 112, 154, 0.3)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', fontWeight: '600' }}>Student/Organizer Ratio</div>
                                    <div style={{ fontSize: '42px', fontWeight: '800', marginBottom: '8px' }}>{getAnalytics().studentToOrganizerRatio}:1</div>
                                    <div style={{ fontSize: '13px', opacity: 0.8 }}>
                                        <i className="fa-solid fa-balance-scale" style={{ marginRight: '6px' }}></i>
                                        System balance
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Breakdown */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {/* User Distribution */}
                            <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="fa-solid fa-chart-pie" style={{ color: '#8b5cf6' }}></i>
                                    User Distribution
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Students</span>
                                                <span style={{ fontSize: '14px', fontWeight: '700', color: '#3b82f6' }}>
                                                    {getAnalytics().totalStudents} ({getAnalytics().studentPercentage}%)
                                                </span>
                                            </div>
                                            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${getAnalytics().studentPercentage}%`,
                                                    background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                                                    borderRadius: '10px',
                                                    transition: 'width 0.5s ease'
                                                }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Organizers</span>
                                                <span style={{ fontSize: '14px', fontWeight: '700', color: '#f97316' }}>
                                                    {getAnalytics().totalOrganizers} ({getAnalytics().organizerPercentage}%)
                                                </span>
                                            </div>
                                            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${getAnalytics().organizerPercentage}%`,
                                                    background: 'linear-gradient(90deg, #f97316 0%, #ea580c 100%)',
                                                    borderRadius: '10px',
                                                    transition: 'width 0.5s ease'
                                                }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Event Statistics */}
                            <div style={{ background: 'white', borderRadius: '20px', padding: '28px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="fa-solid fa-calendar-days" style={{ color: '#10b981' }}></i>
                                    Event Statistics
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                                        <div>
                                            <div style={{ fontSize: '13px', color: '#166534', fontWeight: '600', marginBottom: '4px' }}>Approved Events</div>
                                            <div style={{ fontSize: '24px', fontWeight: '800', color: '#15803d' }}>{getAnalytics().approvedEvents}</div>
                                        </div>
                                        <i className="fa-solid fa-circle-check" style={{ fontSize: '32px', color: '#22c55e' }}></i>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#fef3c7', borderRadius: '12px', border: '1px solid #fde68a' }}>
                                        <div>
                                            <div style={{ fontSize: '13px', color: '#92400e', fontWeight: '600', marginBottom: '4px' }}>Pending Review</div>
                                            <div style={{ fontSize: '24px', fontWeight: '800', color: '#b45309' }}>{getAnalytics().pendingEventsCount}</div>
                                        </div>
                                        <i className="fa-solid fa-hourglass-half" style={{ fontSize: '32px', color: '#eab308' }}></i>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                                        <div>
                                            <div style={{ fontSize: '13px', color: '#1e40af', fontWeight: '600', marginBottom: '4px' }}>Total Events</div>
                                            <div style={{ fontSize: '24px', fontWeight: '800', color: '#1d4ed8' }}>{stats.events}</div>
                                        </div>
                                        <i className="fa-solid fa-calendar-check" style={{ fontSize: '32px', color: '#3b82f6' }}></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'events' && (
                    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                        <div className="section-header" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div className="section-title" style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ width: '4px', height: '24px', background: '#3b82f6', borderRadius: '4px', display: 'block' }}></span>
                                All Campus Events
                            </div>
                        </div>

                        <div className="events-grid">
                            {allEvents.length === 0 ? (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.8)', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
                                    <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }}></i>
                                    <h3 style={{ fontSize: '18px', color: '#64748b', marginBottom: '8px' }}>No Events Found</h3>
                                    <p style={{ color: '#94a3b8' }}>There are currently no events registered in the system.</p>
                                </div>
                            ) : (
                                allEvents.map(event => (
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
                                            <span className="event-tag" style={{ background: event.isApproved ? '#10b981' : '#f59e0b' }}>
                                                {event.isApproved ? 'Approved' : 'Pending'}
                                            </span>
                                        </div>
                                        <div className="event-details">
                                            <div className="event-title">{event.title}</div>
                                            <div className="event-info"><i className="fa-regular fa-calendar"></i> {event.date}</div>
                                            <div className="event-info"><i className="fa-solid fa-location-dot"></i> {event.location || 'TBA'}</div>
                                            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={() => handleRejectEvent(event._id)}
                                                    style={{
                                                        flex: 1,
                                                        background: '#fee2e2',
                                                        color: '#ef4444',
                                                        border: '1px solid #fecaca',
                                                        padding: '10px',
                                                        borderRadius: '8px',
                                                        fontSize: '13px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                                    }}
                                                >
                                                    <i className="fa-solid fa-trash-can"></i> Delete Event
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(4px)',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                    onClick={() => setShowUserModal(false)}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '24px',
                            padding: '32px',
                            maxWidth: '500px',
                            width: '90%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            animation: 'slideUp 0.3s ease-out',
                            position: 'relative'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowUserModal(false)}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                border: 'none',
                                background: '#f1f5f9',
                                color: '#64748b',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#1e293b'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                        >
                            <i className="fa-solid fa-xmark" style={{ fontSize: '18px' }}></i>
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: selectedUser.role === 'student' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '32px',
                                fontWeight: '700',
                                margin: '0 auto 16px',
                                boxShadow: selectedUser.role === 'student' ? '0 8px 20px rgba(59, 130, 246, 0.4)' : '0 8px 20px rgba(249, 115, 22, 0.4)'
                            }}>
                                {selectedUser.name.charAt(0)}
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>{selectedUser.name}</h2>
                            <div style={{
                                display: 'inline-block',
                                padding: '6px 16px',
                                borderRadius: '20px',
                                background: selectedUser.role === 'student' ? '#eff6ff' : '#fff7ed',
                                color: selectedUser.role === 'student' ? '#2563eb' : '#ea580c',
                                fontSize: '13px',
                                fontWeight: '700',
                                textTransform: 'capitalize'
                            }}>
                                <i className={`fa-solid fa-${selectedUser.role === 'student' ? 'graduation-cap' : 'user-tie'}`} style={{ marginRight: '6px' }}></i>
                                {selectedUser.role}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</div>
                                <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fa-regular fa-envelope" style={{ color: '#3b82f6' }}></i>
                                    {selectedUser.email}
                                </div>
                            </div>

                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {selectedUser.role === 'student' ? 'Branch' : 'Department'}
                                </div>
                                <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fa-solid fa-building" style={{ color: '#f97316' }}></i>
                                    {selectedUser.branch || selectedUser.dept || 'Not specified'}
                                </div>
                            </div>

                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User ID</div>
                                <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fa-solid fa-fingerprint" style={{ color: '#10b981' }}></i>
                                    {selectedUser.id}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowUserModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: '2px solid #e2e8f0',
                                    background: 'white',
                                    color: '#64748b',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
                                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    handleDeleteUser(selectedUser.role, selectedUser.id);
                                    setShowUserModal(false);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                            >
                                <i className="fa-solid fa-trash-can"></i>
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
