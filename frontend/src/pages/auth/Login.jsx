import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGraduationCap, FaLock, FaEnvelope } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

import "../../styles/auth/login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const data = await login(email, password);

      if (data.user?.role === "STUDENT") {
        navigate("/student/dashboard");
      } else {
        setError("This account is not a student account.");
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Invalid email or password."
      );
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">

        {/* Left Side */}

        <div className="login-brand">

          <div className="brand-icon">
            <FaGraduationCap />
          </div>

          <h1>University LMS</h1>

          <p>
            Your complete academic management
            platform.
          </p>

          <div className="brand-features">
            <div>
              <span>✓</span>
              <p>Access your courses</p>
            </div>

            <div>
              <span>✓</span>
              <p>Track your academic progress</p>
            </div>

            <div>
              <span>✓</span>
              <p>View results and GPA</p>
            </div>
          </div>

        </div>

        {/* Login Card */}

        <div className="login-card">

          <div className="login-header">

            <div className="mobile-brand-icon">
              <FaGraduationCap />
            </div>

            <span>STUDENT PORTAL</span>

            <h2>Welcome back</h2>

            <p>
              Sign in to access your academic portal.
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            {/* Email */}

            <div className="login-field">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">

                <FaEnvelope />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your university email"
                  autoComplete="email"
                  required
                />

              </div>

            </div>

            {/* Password */}

            <div className="login-field">

              <div className="password-label">

                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    navigate("/forgot-password")
                  }
                >
                  Forgot password?
                </button>

              </div>

              <div className="input-wrapper">

                <FaLock />

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

              </div>

            </div>

            {/* Error */}

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          <div className="login-footer">
            <span>University Learning Management System</span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;