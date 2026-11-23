import { useState } from "react";
import api from "../services/api";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login() {

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle login form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            const response = await api.post("/auth/login", formData);

            // Save user details in Redux
            dispatch(setUser(response.data.user));

            navigate("/");

        } catch (error) {
            setMessage(
                error.response?.data?.message || "Login failed. Please try again."
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
                        ✨ Your Intelligent AI Assistant
                    </div>

                    <h1>
                        Think smarter.
                        <br />
                        <span>Create faster.</span>
                    </h1>

                    <p>
                        Experience the power of AI conversations.
                        Ask questions, explore ideas and bring your
                        imagination to life.
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

            {/* Right Side - Login Form */}
            <div className="auth-right">

                <div className="login-card">

                    <div className="mobile-brand">
                        ✦ NeuraAI
                    </div>

                    <div className="form-heading">
                        <span className="welcome-text">WELCOME BACK</span>

                        <h2>Sign in to your account</h2>

                        <p>
                            Enter your details to continue your AI journey.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>

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

                            <div className="password-label">
                                <label>Password</label>
                            </div>

                            <div className="input-wrapper">
                                <span className="input-icon">🔒</span>

                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
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

                        {/* Error Message */}
                        {message && (
                            <div className="auth-message">
                                {message}
                            </div>
                        )}

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}

                            {!loading && <span>→</span>}
                        </button>

                    </form>

                    <div className="signup-link">
                        Don't have an account?
                        <Link to="/register"> Create account</Link>
                    </div>

                    <div className="secure-text">
                        🔒 Your account is protected and secure.
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;