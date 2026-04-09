import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = ''; // Adjust if needed

const OrganizerSignup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        id: '',
        dept: '',
        email: '',
        password: '',
        confirmPassword: '',
        question: '',
        answer: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        let stateKey = '';
        if (id === 'organizerName') stateKey = 'name';
        else if (id === 'organizerId') stateKey = 'id';
        else if (id === 'organizerDept') stateKey = 'dept';
        else if (id === 'organizerEmail') stateKey = 'email';
        else if (id === 'organizerPassword') stateKey = 'password';
        else if (id === 'organizerConfirmPassword') stateKey = 'confirmPassword';
        else if (id === 'organizerSecurityQuestion') stateKey = 'question';
        else if (id === 'organizerSecurityAnswer') stateKey = 'answer';

        setFormData(prev => ({ ...prev, [stateKey]: value }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (formData.email) {
            const validDomains = ['@adityauniversity.in'];
            const lowerEmail = formData.email.toLowerCase();
            if (!validDomains.some(domain => lowerEmail.endsWith(domain))) {
                alert("Only @adityauniversity.in domain is allowed.");
                return;
            }
        }

        if (strength < 5) {
            alert("Weak Password: You must meet all password requirements.");
            return;
        }

        const userData = {
            name: formData.name,
            id: formData.id,
            dept: formData.dept,
            email: formData.email,
            password: formData.password,
            question: formData.question,
            answer: formData.answer
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/organizers/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                alert("Organizer account created successfully! Please login.");
                navigate('/');
            } else {
                const data = await response.json();
                alert(data.message || "Registration failed.");
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Server error.");
        }
    };

    const getStrength = (pass) => {
        let s = 0;
        if (pass.length >= 8) s++;
        if (/[A-Z]/.test(pass)) s++;
        if (/[a-z]/.test(pass)) s++;
        if (/\d/.test(pass)) s++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) s++;
        return s;
    };

    const strength = getStrength(formData.password);

    const getStrengthColor = (s) => {
        if (s === 0) return 'var(--text-muted)';
        if (s <= 2) return '#ef4444';
        if (s <= 4) return '#eab308';
        return '#22c55e';
    };

    const getStrengthLabel = (s) => {
        if (s === 0) return 'None';
        if (s <= 2) return 'Weak';
        if (s <= 4) return 'Good';
        return 'Strong';
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%', padding: '20px' }}>
            <div className="container signup-container">
                <h2 style={{ marginBottom: '8px' }}>
                    <img src="/aditya.jpg" alt="Logo" className="logo" /> Aditya University
                </h2>
                <p className="subtitle">Organizer Registration</p>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="form-group">
                        <label>Full Name / Title</label>
                        <input type="text" id="organizerName" placeholder="Enter name" required onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Organizer ID</label>
                        <input type="text" id="organizerId" placeholder="Enter ID" required onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Department</label>
                        <input type="text" id="organizerDept" placeholder="e.g. CSE Dept" required onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Official Email</label>
                        <input type="email" id="organizerEmail" placeholder="organizer@adityauniversity.in" required onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="organizerPassword"
                                placeholder="Enter password"
                                required
                                onChange={handleChange}
                                style={{
                                    borderColor: formData.password ? getStrengthColor(strength) : undefined,
                                    boxShadow: formData.password ? `0 0 10px ${getStrengthColor(strength)}40` : undefined,
                                    paddingRight: '90px',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                            {formData.password && (
                                <span style={{
                                    position: 'absolute',
                                    right: '40px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    color: getStrengthColor(strength),
                                    pointerEvents: 'none',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    animation: 'fadeIn 0.3s ease'
                                }}>
                                    {getStrengthLabel(strength)}
                                </span>
                            )}
                            <i
                                className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                                onClick={() => setShowPassword(!showPassword)}
                            ></i>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <div className="password-container">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="organizerConfirmPassword"
                                placeholder="Re-enter password"
                                required
                                onChange={handleChange}
                            />
                            <i
                                className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            ></i>
                        </div>
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <small style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'block', marginTop: '-10px', marginBottom: '10px' }}>
                            Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Security Question</label>
                        <select id="organizerSecurityQuestion" required onChange={handleChange}>
                            <option value="">-- Select a question --</option>
                            <option value="pet">What is your first pet’s name?</option>
                            <option value="school">What was your primary school name?</option>
                            <option value="city">In which city were you born?</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Answer</label>
                        <input type="text" id="organizerSecurityAnswer" placeholder="Enter your answer" required onChange={handleChange} />
                    </div>

                    <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                        <button type="submit" className="btn">Create Organizer Account</button>
                        <div className="link">
                            Already have an account? <Link to="/">Sign In</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrganizerSignup;
