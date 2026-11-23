import { useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import "./Login.css";
import "./Register.css";

function Register() {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle registration
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setMessage("");
            setIsSuccess(false);

            const response = await api.post(
                "/auth/register",
                formData
            );

            setMessage(response.data.message);
            setIsSuccess(true);

            // Clear form after successful registration
            setFormData({
                name: "",
                email: "",
                password: ""
            });

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            {/* Left Side - Branding */}
            <div className="auth-left">

                <div className="brand-logo">
                    <span className="brand-icon">✦</span>
                    <span>NeuraAI</span>
                </div>

                <div className="hero-content">

                    <div className="hero-badge">
                        ✨ Start Your AI Journey
                    </div>

                    <h1>
                        Discover the
                        <br />
                        <span>Power of AI.</span>
                    </h1>

                    <p>
                        Create your account and unlock a smarter
                        way to learn, create and explore.
                        Your AI assistant is just one step away.
                    </p>

                    <div className="hero-visual">
                        <div className="visual-circle circle-one"></div>
                        <div className="visual-circle circle-two"></div>

                        <div className="visual-center">
                            <span>✦</span>
                        </div>
                    </div>

                </div>

                <div className="auth-footer">
                    © 2026 NeuraAI. All rights reserved.
                </div>

            </div>

            {/* Right Side - Registration Form */}
            <div className="auth-right">

                <div className="login-card register-card">

                    <div className="mobile-brand">
                        ✦ NeuraAI
                    </div>

                    <div className="form-heading">

                        <span className="welcome-text">
                            GET STARTED
                        </span>

                        <h2>Create your account</h2>

                        <p>
                            Join us and experience intelligent conversations.
                        </p>

                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* Name */}
                        <div className="form-group">

                            <label>Full Name</label>

                            <div className="input-wrapper">

                                <span className="input-icon">👤</span>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                        {/* Email */}
                        <div className="form-group">

                            <label>Email Address</label>

                            <div className="input-wrapper">

                                <span className="input-icon">✉</span>

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                        {/* Password */}
                        <div className="form-group">

                            <label>Password</label>

                            <div className="input-wrapper">

                                <span className="input-icon">🔒</span>

                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>

                            </div>

                        </div>

                        {/* Success / Error Message */}
                        {message && (
                            <div className={`auth-message ${isSuccess ? "success" : "error"}`}>
                                {message}
                            </div>
                        )}

                        {/* Register Button */}
                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? "Creating Account..." : "Create Account"}

                            {!loading && <span>→</span>}
                        </button>

                    </form>

                    <div className="signup-link">
                        Already have an account?
                        <Link to="/login"> Sign in</Link>
                    </div>

                    <div className="secure-text">
                        🔒 Your information is safe and secure.
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;