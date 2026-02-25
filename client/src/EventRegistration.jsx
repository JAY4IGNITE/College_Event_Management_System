import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

const API_BASE_URL = ''; // Adjust if needed

const EventRegistration = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [currentUser, setCurrentUser] = useState(null);
    const [eventDetails, setEventDetails] = useState({
        title: 'Loading',
        date: 'Oct 24, 2026',
        venue: 'Main Campus',
        price: 0,
        id: null
    });

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [upiId, setUpiId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        document.body.classList.add('dashboard-body');
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            setCurrentUser(user);
        }

        const title = searchParams.get('title') || 'Event Registration';
        const price = parseInt(searchParams.get('price') || 0);
        const id = searchParams.get('id');
        const date = searchParams.get('date') || '';
        const venue = searchParams.get('location') || 'Main Campus';

        setEventDetails({ title, date, venue, price, id });
        return () => document.body.classList.remove('dashboard-body');
    }, [searchParams]);

    const handleRegister = async () => {
        setIsProcessing(true);
        try {
            const payload = {
                studentId: currentUser ? currentUser.id : 'guest',
                eventId: eventDetails.id,
                type: 'individual',
                paymentStatus: eventDetails.price > 0 ? 'paid' : 'free',
                amount: eventDetails.price,
                registrationDate: new Date()
            };

            const response = await fetch(`${API_BASE_URL}/api/events/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert(`Registration Confirmed for ${eventDetails.title}! 🎉`);
                navigate('/student-dashboard');
            } else {
                alert('Registration failed. Please try again.');
            }

        } catch (error) {
            console.error("Registration Error:", error);
            alert('Registration Failed. Please try again or check your connection.');
        } finally {
            setIsProcessing(false);
            setPaymentModalOpen(false);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (eventDetails.price > 0) {
            setPaymentModalOpen(true);
        } else {
            handleRegister();
        }
    };

    return (
        <div className="dashboard-body" style={{ background: 'linear-gradient(135deg, #8BC6EC 0%, #9599E2 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="container" style={{ width: '100%', maxWidth: '800px', background: 'rgba(255, 255, 255, 0.95)', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)', padding: '0', display: 'grid', gridTemplateColumns: '1fr 1.4fr', overflow: 'hidden', backdropFilter: 'blur(12px)' }}>

                {/* Left Side - Event Info */}
                <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, var(--info) 100%)', padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    {/* Decorative Elements */}
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ width: '60px', height: '60px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', backdropFilter: 'blur(5px)' }}>
                            <i className="fa-regular fa-clipboard" style={{ fontSize: '28px', color: 'white' }}></i>
                        </div>

                        <h2 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '8px', lineHeight: '1.1', textShadow: '0 4px 6px rgba(0,0,0,0.2)', letterSpacing: '-1px', color: 'white' }}>Event<br />Registration</h2>
                        <p style={{ color: 'var(--border)', fontSize: '16px', marginBottom: '40px', lineHeight: '1.6', fontWeight: '500' }}>Complete your registration for <br /><span style={{ fontWeight: '700', color: '#60a5fa', fontSize: '18px' }}>{eventDetails.title}</span></p>

                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.25)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <i className="fa-regular fa-calendar" style={{ marginTop: '3px', fontSize: '14px', opacity: 0.9 }}></i>
                                    <div>
                                        <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '700', opacity: 0.8 }}>Date</div>
                                        <div style={{ fontSize: '13px', fontWeight: '600' }}>{eventDetails.date}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <i className="fa-solid fa-location-dot" style={{ marginTop: '3px', fontSize: '14px', opacity: 0.9 }}></i>
                                    <div>
                                        <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '700', opacity: 0.8 }}>Venue</div>
                                        <div style={{ fontSize: '13px', fontWeight: '600' }}>{eventDetails.venue}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <i className="fa-solid fa-tag" style={{ marginTop: '3px', fontSize: '14px', opacity: 0.9 }}></i>
                                    <div>
                                        <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '700', opacity: 0.8 }}>Fee</div>
                                        <div style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>{eventDetails.price > 0 ? `₹${eventDetails.price}` : 'Free'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <Link to="/student-dashboard" style={{ position: 'absolute', top: '25px', right: '25px', width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.2s', border: 'none', cursor: 'pointer', textDecoration: 'none', fontSize: '14px', zIndex: 10 }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'var(--border)'; e.currentTarget.style.color = '#334155'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </Link>

                    <div style={{ marginBottom: '25px', marginTop: '5px' }}>
                        <h3 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>Confirm Details</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Please provide your details below.</p>
                    </div>

                    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Full Name</label>
                            <input
                                type="text"
                                defaultValue={currentUser?.name || ''}
                                required
                                placeholder="Full Name"
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--text-light)', fontSize: '13px', background: 'white', color: '#334155', transition: 'all 0.2s', fontWeight: '500', outline: 'none' }}
                                onFocus={(e) => { e.target.style.borderColor = 'var(--info)'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                                onBlur={(e) => { e.target.style.borderColor = 'var(--text-light)'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Email</label>
                            <input
                                type="email"
                                defaultValue={currentUser?.email || ''}
                                required
                                placeholder="Email Address"
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--text-light)', fontSize: '13px', background: 'white', color: '#334155', transition: 'all 0.2s', fontWeight: '500', outline: 'none' }}
                                onFocus={(e) => { e.target.style.borderColor = 'var(--info)'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                                onBlur={(e) => { e.target.style.borderColor = 'var(--text-light)'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>ID</label>
                                <input
                                    type="text"
                                    defaultValue={currentUser?.id || ''}
                                    required
                                    placeholder="Student ID"
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--text-light)', fontSize: '13px', background: 'white', color: '#334155', transition: 'all 0.2s', fontWeight: '500', outline: 'none' }}
                                    onFocus={(e) => { e.target.style.borderColor = 'var(--info)'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'var(--text-light)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Year</label>
                                <select
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--text-light)', fontSize: '13px', background: 'white', color: '#334155', transition: 'all 0.2s', fontWeight: '500', outline: 'none' }}
                                    onFocus={(e) => { e.target.style.borderColor = 'var(--info)'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'var(--text-light)'; e.target.style.boxShadow = 'none'; }}
                                >
                                    <option>1st Year</option>
                                    <option>2nd Year</option>
                                    <option>3rd Year</option>
                                    <option>4th Year</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Department</label>
                                <select
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--text-light)', fontSize: '13px', background: 'white', color: '#334155', transition: 'all 0.2s', fontWeight: '500', outline: 'none' }}
                                    onFocus={(e) => { e.target.style.borderColor = 'var(--info)'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'var(--text-light)'; e.target.style.boxShadow = 'none'; }}
                                >
                                    <option>CSE</option>
                                    <option>ECE</option>
                                    <option>EEE</option>
                                    <option>MECH</option>
                                    <option>CIVIL</option>
                                    <option>IT</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Mobile</label>
                                <input
                                    type="tel"
                                    placeholder="10-digit Mobile Number"
                                    maxLength="10"
                                    pattern="[0-9]{10}"
                                    title="Please enter exactly 10 digits"
                                    required
                                    onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--text-light)', fontSize: '13px', background: 'white', color: '#334155', transition: 'all 0.2s', fontWeight: '500', outline: 'none' }}
                                    onFocus={(e) => { e.target.style.borderColor = 'var(--info)'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'var(--text-light)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        <div style={{ height: '4px' }}></div>

                        <button
                            type="submit"
                            className="btn"
                            style={{
                                background: 'var(--info)',
                                color: 'white',
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.4)',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                letterSpacing: '0.3px'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--info)'; e.currentTarget.style.transform = 'none'; }}
                        >
                            {eventDetails.price > 0 ? (
                                <>
                                    Proceed <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px' }}></i>
                                </>
                            ) : (
                                <>
                                    Confirm <i className="fa-solid fa-check" style={{ fontSize: '12px' }}></i>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {paymentModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s' }}>
                    <div className="modal-content" style={{ background: 'white', width: '90%', maxWidth: '380px', borderRadius: '20px', padding: '0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideIn 0.2s', overflow: 'hidden' }}>

                        <div style={{ padding: '16px 24px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Checkout</h3>
                            <button onClick={() => setPaymentModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontSize: '16px', padding: '4px' }}><i className="fa-solid fa-xmark"></i></button>
                        </div>

                        <div style={{ padding: '24px' }}>
                            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px', border: '1px dashed #4ade80' }}>
                                <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: '#15803d', marginBottom: '2px' }}>Total Payable</div>
                                <div style={{ fontSize: '24px', fontWeight: '800', color: '#166534' }}>₹{eventDetails.price}</div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Payment Method</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div
                                        onClick={() => setPaymentMethod('upi')}
                                        style={{
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: paymentMethod === 'upi' ? '2px solid var(--info)' : '1px solid var(--text-light)',
                                            background: paymentMethod === 'upi' ? '#eff6ff' : 'white',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: paymentMethod === 'upi' ? '#1d4ed8' : 'var(--text-muted)'
                                        }}
                                    >
                                        UPI
                                    </div>
                                    <div
                                        onClick={() => setPaymentMethod('card')}
                                        style={{
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: paymentMethod === 'card' ? '2px solid var(--info)' : '1px solid var(--text-light)',
                                            background: paymentMethod === 'card' ? '#eff6ff' : 'white',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: paymentMethod === 'card' ? '#1d4ed8' : 'var(--text-muted)'
                                        }}
                                    >
                                        Card
                                    </div>
                                </div>
                            </div>

                            {paymentMethod === 'upi' ? (
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <input
                                        type="text"
                                        placeholder="Enter UPI ID (e.g. user@bank)"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--text-light)', fontSize: '13px', background: 'white', outline: 'none' }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--info)'}
                                        onBlur={(e) => e.target.style.borderColor = 'var(--text-light)'}
                                    />
                                </div>
                            ) : (
                                <div style={{ padding: '10px', background: '#fef2f2', borderRadius: '8px', color: 'var(--danger)', fontSize: '12px', textAlign: 'center', marginBottom: '20px' }}>
                                    Unavailable
                                </div>
                            )}

                            <button
                                className="btn"
                                onClick={handleRegister}
                                disabled={isProcessing || (paymentMethod === 'card')}
                                style={{
                                    background: 'var(--success)',
                                    color: 'white',
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    border: 'none',
                                    boxShadow: '0 4px 6px rgba(16, 185, 129, 0.4)',
                                    opacity: (isProcessing || (paymentMethod === 'card')) ? 0.7 : 1
                                }}
                            >
                                {isProcessing ? 'Processing... ' : 'Pay & Register'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventRegistration;
