import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000'; // Adjust if needed

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roleParam = searchParams.get('role');

    const [step, setStep] = useState(1);
    const [role, setRole] = useState(() => {
        const roleParam = searchParams.get('role');
        return (roleParam === 'student' || roleParam === 'organizer') ? roleParam : 'student';
    });
    const [identifier, setIdentifier] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);


    const handleFindUser = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password/find`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, identifier })
            });
            const data = await response.json();

            if (response.ok && data.success) {
                setCurrentUser({ id: data.userId });
                const questionMap = {
                    'pet': "What is your first pet’s name?",
                    'school': "What was your primary school name?",
                    'city': "In which city were you born?"
                };
                setQuestion(questionMap[data.question] || data.question);
                setStep(2);
            } else {
                alert(data.message || "User not found.");
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Server error.');
        }
    };

    const handleVerifyAnswer = () => {
        if (answer.trim()) {
            setStep(3);
        } else {
            alert("Please enter an answer.");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: role,
                    userId: currentUser.id,
                    answer: answer,
                    newPassword: newPassword
                })
            });

            if (response.ok) {
                alert("Password reset successfully! Please login.");
                navigate('/');
            } else {
                const data = await response.json();
                alert(data.message || "Reset failed.");
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Server error.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%' }}>
            <div className="container" style={{ width: '450px', margin: 0 }}>
                <h2><img src="/aditya.jpg" alt="Logo" className="logo" /> Aditya University</h2>
                <p className="subtitle">Forgot Password - Reset your security credentials</p>

                <form onSubmit={(e) => e.preventDefault()}>
                    {step === 1 && (
                        <div id="step1">
                            <div className="form-group">
                                <label>Role</label>
                                <select value={role} onChange={(e) => setRole(e.target.value)}>
                                    <option value="student">Student</option>
                                    <option value="organizer">Organizer</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>User ID or Email</label>
                                <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Enter ID or Email" required />
                            </div>
                            <button type="button" className="btn" onClick={handleFindUser}>Next</button>
                        </div>
                    )}

                    {step === 2 && (
                        <div id="step2">
                            <div className="form-group">
                                <label>Security Question</label>
                                <input type="text" value={question} disabled style={{ backgroundColor: '#f0f2f5' }} />
                            </div>
                            <div className="form-group">
                                <label>Your Answer</label>
                                <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Enter answer" required />
                            </div>
                            <button type="button" className="btn" onClick={handleVerifyAnswer}>Verify</button>
                        </div>
                    )}

                    {step === 3 && (
                        <div id="step3">
                            <div className="form-group">
                                <label>New Password</label>
                                <div className="password-container">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="New password"
                                        required
                                    />
                                    <i className={`fa-solid ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowNewPassword(!showNewPassword)}></i>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <div className="password-container">
                                    <input
                                        type={showConfirmNewPassword ? "text" : "password"}
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        placeholder="Confirm password"
                                        required
                                    />
                                    <i className={`fa-solid ${showConfirmNewPassword ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}></i>
                                </div>
                            </div>
                            <button type="button" className="btn" onClick={handleResetPassword}>Reset Password</button>
                        </div>
                    )}
                </form>

                <div className="link">
                    Remembered? <Link to="/">Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
