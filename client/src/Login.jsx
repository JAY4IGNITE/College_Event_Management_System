import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000'; // Adjust if needed

const Login = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const [showSupport, setShowSupport] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        try {
            // No role sent, backend determines it
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Save user info to localStorage
                localStorage.setItem('currentUser', JSON.stringify({ ...data.user, role: data.role }));

                // Redirect based on role returned from server
                if (data.role === 'admin') navigate('/admin-dashboard');
                else if (data.role === 'organizer') navigate('/organizer-dashboard');
                else navigate('/student-dashboard');
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Server error. Ensure backend is running.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%' }}>
            <div className="container" style={{ width: '500px', padding: '48px', position: 'relative' }}>
                <div className="login-header" style={{ marginBottom: '40px' }}>
                    <div className="login-brand" style={{ gap: '12px', marginBottom: '16px' }}>
                        <img src="/aditya.jpg" alt="Logo" style={{ height: '45px', width: 'auto', borderRadius: '10px' }} />
                        <h2 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#1e293b',
                            letterSpacing: '-0.3px',
                            fontFamily: "'Outfit', sans-serif",
                            margin: 0
                        }}>
                            Aditya University
                        </h2>
                    </div>
                    <p className="subtitle" style={{ fontSize: '14px', color: '#64748b', fontWeight: '500', marginTop: '0' }}>Welcome back! Please login to your account.</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            placeholder="User ID or Email"
                            required
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                        />
                        <i className="fa-solid fa-user input-icon"></i>
                    </div>

                    <div className="input-wrapper" style={{ marginBottom: '10px' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ paddingRight: '40px' }}
                        />
                        <i className="fa-solid fa-lock input-icon"></i>
                        <i
                            className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                color: 'var(--text-muted)'
                            }}
                        ></i>
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                        <Link to="/forgot-password" className="forgot-pass-link">Forgot Password?</Link>
                    </div>

                    <button type="submit" className="btn" disabled={isLoggingIn}>
                        {isLoggingIn ? <span><i className="fa-solid fa-circle-notch fa-spin"></i> Signing In...</span> : 'Sign In'}
                    </button>
                </form>

                <div className="signup-area">
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Don't have an account?</p>
                    <div className="signup-options">
                        <Link to="/student-signup" className="forgot-pass-link" style={{ fontWeight: 600 }}>Student Signup</Link>
                        <span style={{ color: 'var(--border)' }}>|</span>
                        <Link to="/organizer-signup" className="forgot-pass-link" style={{ fontWeight: 600 }}>Organizer Signup</Link>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                        <span className="support-link" onClick={() => setShowSupport(true)}>Need help? Contact Support</span>
                    </div>
                </div>

                <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                    <p style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>College Event Management Portal</p>
                </div>

                {/* Support Popup Modal */}
                {showSupport && (
                    <div className="modal" onClick={() => setShowSupport(false)}>
                        <div className="modal-content" style={{ width: '350px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                            <span className="close" onClick={() => setShowSupport(false)}>&times;</span>
                            <div style={{ color: 'var(--primary)', fontSize: '48px', marginBottom: '16px' }}>
                                <i className="fa-solid fa-headset"></i>
                            </div>
                            <h3 style={{ marginBottom: '16px', color: 'var(--text-main)' }}>Contact Support</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                                Having trouble logging in? Contact our admin team for assistance.
                            </p>

                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '12px', textAlign: 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                    <i className="fa-solid fa-envelope" style={{ color: 'var(--primary)', width: '24px' }}></i>
                                    <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>admin@aditya.edu</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <i className="fa-solid fa-phone" style={{ color: 'var(--success)', width: '24px' }}></i>
                                    <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>+91 98765 43210</span>
                                </div>
                            </div>

                            <button className="btn" onClick={() => setShowSupport(false)} style={{ marginTop: '10px' }}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
