import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000'; // Adjust if needed

const StudentSignup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        id: '',
        branch: '',
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
        if (id === 'studentName') stateKey = 'name';
        else if (id === 'studentId') stateKey = 'id';
        else if (id === 'studentBranch') stateKey = 'branch';
        else if (id === 'studentEmail') stateKey = 'email';
        else if (id === 'studentPassword') stateKey = 'password';
        else if (id === 'studentConfirmPassword') stateKey = 'confirmPassword';
        else if (id === 'studentSecurityQuestion') stateKey = 'question';
        else if (id === 'studentSecurityAnswer') stateKey = 'answer';

        setFormData(prev => ({ ...prev, [stateKey]: value }));
    };


    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) return "min 8 chars";
        if (!hasUpperCase) return "min 1 uppercase letter";
        if (!hasLowerCase) return "min 1 lowercase letter";
        if (!hasNumbers) return "min 1 number";
        if (!hasSpecialChar) return "min 1 special char";

        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match. Please try again.");
            return;
        }

        const strengthError = validatePassword(formData.password);
        if (strengthError) {
            alert("Weak Password: " + strengthError);
            return;
        }

        const userData = {
            name: formData.name,
            id: formData.id,
            branch: formData.branch,
            email: formData.email,
            password: formData.password,
            question: formData.question,
            answer: formData.answer
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/students/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                alert("Student account created successfully! Please login to continue.");
                navigate('/');
            } else {
                const data = await response.json();
                alert(data.message || "Registration failed.");
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Server error. Ensure backend is running.");
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%', padding: '20px' }}>
            <div className="container signup-container">
                <h2 style={{ marginBottom: '8px' }}>
                    <img src="/aditya.jpg" alt="Logo" className="logo" /> Aditya University
                </h2>
                <p className="subtitle">Student Registration</p>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" id="studentName" placeholder="Enter your full name" required onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Student ID</label>
                        <input type="text" id="studentId" placeholder="Enter your Student ID" required onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Branch</label>
                        <select id="studentBranch" required onChange={handleChange}>
                            <option value="">-- Select Branch --</option>
                            <option value="CSE">CSE</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                            <option value="MECH">Mechanical</option>
                            <option value="CIVIL">Civil</option>
                            <option value="IT">IT</option>
                            <option value="AI_ML">AI & ML</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" id="studentEmail" placeholder="student@college.edu" required onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="studentPassword"
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
                                id="studentConfirmPassword"
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
                        <select id="studentSecurityQuestion" required onChange={handleChange}>
                            <option value="">-- Select a question --</option>
                            <option value="pet">What is your first pet’s name?</option>
                            <option value="school">What was your primary school name?</option>
                            <option value="city">In which city were you born?</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Answer</label>
                        <input type="text" id="studentSecurityAnswer" placeholder="Enter your answer" required onChange={handleChange} />
                    </div>

                    <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                        <button type="submit" className="btn">Create Student Account</button>
                        <div className="link">
                            Already have an account? <Link to="/">Sign In</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentSignup;
