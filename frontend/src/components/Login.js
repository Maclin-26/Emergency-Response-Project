import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import './Login.css';

const Login = () => {
    const [isRightActive, setIsRightActive] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [userRole, setUserRole] = useState('citizen');
    const navigate = useNavigate();

    // --- UPDATED: USE YOUR LOCALTUNNEL URL HERE ---
    // Open your JS files and change this line:
const API_URL = "https://emergency-backend-maclin.onrender.com";

    // Google Login Logic
    const login = useGoogleLogin({
        onSuccess: tokenResponse => {
            console.log("Google Login Success:", tokenResponse);
            navigate('/citizen-dashboard');
        },
        onError: () => alert('Google Login Failed'),
    });

    // --- UPDATED SIGN UP LOGIC WITH REMOTE URL ---
    const handleSignUp = async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const fullName = formData.get('fullName');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const password = formData.get('password');

        if (!fullName || !email || !password) {
            alert("Please fill in all required fields!");
            return;
        }

        const userData = { fullName, email, phone, password, role: userRole };

        try {
            // UPDATED: Replaced localhost with API_BASE_URL
            const response = await fetch(`${API_BASE_URL}/api/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                alert(`Account created for ${fullName}!`);
                navigate(userRole === 'driver' ? '/driver-dashboard' : '/citizen-dashboard');
            } else {
                alert("Signup failed! Email might already be registered.");
            }
        } catch (error) {
            console.error("DB Error:", error);
            // Updated alert to mention Localtunnel
            alert("Could not connect to the remote server via Localtunnel!");
        }
    };

    const handleSignIn = (e) => {
        e.preventDefault();
        // Since you are handling the index manually in the form array:
        const email = e.target.form[0].value;
        const pass = e.target.form[1].value;

        if (email && pass) {
            navigate('/citizen-dashboard');
        } else {
            alert("Please enter both email and password.");
        }
    };

    return (
        <div className="login-body">
            <div className={`container ${isRightActive ? "right-panel-active" : ""}`} id="container">
                
                {/* Sign Up Form */}
                <div className="form-container sign-up-container">
                    <form onSubmit={handleSignUp}>
                        <h1>Create Account</h1>
                        <input name="fullName" type="text" placeholder="Full Name" required />
                        <input name="email" type="email" placeholder="Email" required />
                        <input name="phone" type="tel" placeholder="Phone Number" required /> 
                        <input name="password" type="password" placeholder="Password" required />
                        
                        <div className="role-selection">
                            <label>Register as:</label>
                            <select 
                                value={userRole} 
                                onChange={(e) => setUserRole(e.target.value)}
                                className="role-dropdown"
                            >
                                <option value="citizen">Citizen (Request Help)</option>
                                <option value="driver">Driver (Emergency Responder)</option>
                            </select>
                        </div>
                        <button type="submit">Sign Up</button>
                    </form>
                </div>

                {/* Sign In Form */}
                <div className="form-container sign-in-container">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <h1>Log In</h1>
                        <input type="email" placeholder="Email" required />
                        <div className="password-wrapper">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Password" 
                                required
                            />
                            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? "👁️" : "🙈"}
                            </span>
                        </div>
                        <button className="main-btn" onClick={handleSignIn}>Sign In</button>
                        
                        <div className="social-login">
                            <p>or</p>
                            <button type="button" className="google-custom-btn" onClick={() => login()}>
                                <img 
                                    src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" 
                                    alt="Google" 
                                />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Overlay Section */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p>Enter your details to stay connected with help</p>
                            <button className="ghost" onClick={() => setIsRightActive(false)}>Sign In</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>SmartResponse AI</h1>
                            <p>Fastest Emergency Dispatch System</p>
                            <button className="ghost" onClick={() => setIsRightActive(true)}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;