import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import './Login.css';

const Login = () => {
    const [isRightActive, setIsRightActive] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleGoogleSuccess = (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            console.log("Google Login Success:", decoded.name);
            navigate('/citizen-dashboard');
        } catch (error) {
            console.error("Auth Error:", error);
        }
    };

    return (
        <div className="login-body">
            <div className={`container ${isRightActive ? "right-panel-active" : ""}`}>
                {/* SIGN IN */}
                <div className="form-container sign-in-container">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <h1>Log In</h1>
                        <input type="text" placeholder="Username" />
                        <div className="password-wrapper">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Password" 
                            />
                            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? "🙈" : "👁️"}
                            </span>
                        </div>
                        <button onClick={() => navigate('/citizen-dashboard')}>Sign In</button>
                        <div className="social-login">
                            <p>or</p>
                            <GoogleLogin 
                                onSuccess={handleGoogleSuccess} 
                                onError={() => console.log('Login Failed')} 
                            />
                        </div>
                    </form>
                </div>

                {/* OVERLAY */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-right">
                            <h1>SmartResponse AI</h1>
                            <p>Emergency Assistance System</p>
                            <button className="ghost" onClick={() => setIsRightActive(true)}>Sign Up</button>
                        </div>
                        <div className="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <button className="ghost" onClick={() => setIsRightActive(false)}>Sign In</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;