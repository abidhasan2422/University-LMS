import { useState } from "react";
import axios from "axios";
import { FaLock, FaShieldAlt } from "react-icons/fa";

import "../../styles/student/student-change-password.css";

const StudentChangePassword = () => {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.old_password ||
      !formData.new_password ||
      !formData.confirm_password
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.new_password.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("access_token");

      const response = await axios.post(
        "http://127.0.0.1:8000/api/change-password/",
        {
          old_password: formData.old_password,
          new_password: formData.new_password,
          confirm_password: formData.confirm_password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message || "Password changed successfully."
      );

      setFormData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          "Unable to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-change-password">

      {/* Page Header */}

      <div className="change-password-header">
        <span className="change-password-label">
          ACCOUNT SECURITY
        </span>

        <h2>Change Password</h2>

        <p>
          Update your password to keep your student account secure.
        </p>
      </div>

      {/* Password Card */}

      <div className="change-password-card">

        <div className="change-password-card-header">

          <div className="change-password-icon">
            <FaLock />
          </div>

          <div>
            <h5>Update Password</h5>

            <p>
              Enter your current password and choose a new password.
            </p>
          </div>

        </div>

        <form onSubmit={handleSubmit}>

          {/* Success */}

          {message && (
            <div className="password-message success">
              {message}
            </div>
          )}

          {/* Error */}

          {error && (
            <div className="password-message error">
              {error}
            </div>
          )}

          {/* Current Password */}

          <div className="password-field">

            <label htmlFor="old_password">
              Current Password
            </label>

            <input
              id="old_password"
              type="password"
              name="old_password"
              value={formData.old_password}
              onChange={handleChange}
              placeholder="Enter your current password"
              autoComplete="current-password"
            />

          </div>

          {/* New Password */}

          <div className="password-field">

            <label htmlFor="new_password">
              New Password
            </label>

            <input
              id="new_password"
              type="password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              placeholder="Enter your new password"
              autoComplete="new-password"
            />

            <small>
              Password must contain at least 8 characters.
            </small>

          </div>

          {/* Confirm Password */}

          <div className="password-field">

            <label htmlFor="confirm_password">
              Confirm New Password
            </label>

            <input
              id="confirm_password"
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Confirm your new password"
              autoComplete="new-password"
            />

          </div>

          {/* Security Information */}

          <div className="password-security-info">

            <FaShieldAlt />

            <div>
              <strong>Keep your account secure</strong>

              <p>
                Never share your password with anyone.
                Use a unique password for your LMS account.
              </p>
            </div>

          </div>

          {/* Button */}

          <div className="change-password-actions">

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Changing Password..."
                : "Change Password"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default StudentChangePassword;