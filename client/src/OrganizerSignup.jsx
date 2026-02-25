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
                        <input type="email" id="organizerEmail" placeholder="organizer@college.edu" required onChange={handleChange} />
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
                            />
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
