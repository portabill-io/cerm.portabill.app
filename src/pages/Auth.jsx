import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { toast } from "react-toastify";

const Auth = ({ register }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async () => {
    if (register) {
      if (!formData.username || !formData.email || !formData.password) {
        toast.warn("Please fill in username, email, and password");
        return;
      }
    } else {
      if (!formData.email || !formData.password) {
        toast.warn("Email and password are required");
        return;
      }
    }

    try {
      const endpoint = register ? "/auth" : "/auth/login";
      const payload = register
        ? formData
        : { email: formData.email, password: formData.password };

      const res = await axios.post(endpoint, payload);

      if (res.data.token || register) {
        if (register) {
          toast.success("Registered successfully!");
          navigate("/");
        } else {
          localStorage.setItem("token", res.data.token);
          toast.success("Logged in successfully!");
          navigate("/enquirymanagement");
        }
      }
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong";
      toast.error(`Error: ${message}`);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">{register ? "CERM Register" : "CERM Login"}</h2>

          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            {register && (
              <div className="form-group">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="form-input"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="form-input"
              />
            </div>

            <div className="form-group password-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="form-input password-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {!register && (
              <div className="form-options">
                <div className="remember-me">
                  <input type="checkbox" id="remember-me" className="remember-checkbox" />
                  <label htmlFor="remember-me" className="remember-label">Remember me</label>
                </div>
                <a href="#" className="forgot-password">Forgot password?</a>
              </div>
            )}

            <button type="button" className="auth-button" onClick={handleSubmit}>
              {register ? "Register" : "Login"}
            </button>
          </form>

          <p className="auth-switch">
            {register ? "Already have an account? " : "Don't have an account? "}
            <Link to={register ? "/" : "/register"} className="auth-link">
              {register ? "Login" : "Sign up"}
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          font-family: 'Inter', sans-serif;
          background-color: #f3f4f6;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .auth-container {
          width: 100%;
          max-width: 450px;
        }

        .auth-card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          padding: 32px;
        }

        .auth-title {
          color: #1f2937;
          font-size: 28px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 24px;
        }

        .auth-form {
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 16px;
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .form-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .remember-me {
          display: flex;
          align-items: center;
        }

        .remember-checkbox {
          width: 16px;
          height: 16px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          margin-right: 8px;
          accent-color: #6366f1;
        }

        .remember-label {
          font-size: 14px;
          color: #111827;
        }

        .forgot-password {
          font-size: 14px;
          font-weight: 500;
          color: #6366f1;
          text-decoration: none;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }

        .auth-button {
          width: 100%;
          padding: 12px;
          background-color: #6366f1;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .auth-button:hover {
          background-color: #4f46e5;
        }

        .auth-switch {
          text-align: center;
          font-size: 14px;
          color: #6b7280;
          margin-top: 24px;
        }

        .auth-link {
          font-weight: 500;
          color: #6366f1;
          text-decoration: none;
        }

        .auth-link:hover {
          text-decoration: underline;
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          font-size: 18px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Auth;
