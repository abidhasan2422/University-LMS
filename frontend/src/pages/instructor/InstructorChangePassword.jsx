import { useState } from "react";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import api from "../../api/axios";
import "../../styles/instructor/instructor-change-password.css";

const InstructorChangePassword = () => {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState({
    old_password: false,
    new_password: false,
    confirm_password: false,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setSuccess("");
    setError("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await api.post(
        "auth/change-password/",
        formData
      );

      setSuccess(
        response.data?.message ||
          "Password changed successfully."
      );

      setFormData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });

      setShowPassword({
        old_password: false,
        new_password: false,
        confirm_password: false,
      });
    } catch (err) {
      console.error("Change password error:", err);

      const data = err.response?.data;

      if (data?.old_password) {
        setError(data.old_password[0]);
      } else if (data?.new_password) {
        setError(data.new_password[0]);
      } else if (data?.confirm_password) {
        setError(data.confirm_password[0]);
      } else if (data?.detail) {
        setError(data.detail);
      } else {
        setError("Failed to change password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="instructor-change-password-page">

      {/* Page Header */}
      <div className="change-password-page-header">
        <h1>Change Password</h1>
        <p>
          Update your account password securely.
        </p>
      </div>

      {/* Main Card */}
      <div className="change-password-card">

        {/* Card Header */}
        <div className="change-password-card-header">

          <div className="change-password-icon">
            <FaLock />
          </div>

          <div>
            <h2>Change Your Password</h2>
            <p>
              Enter your current password and choose a
              new password.
            </p>
          </div>

        </div>

        <div className="change-password-divider"></div>

        {/* Success Message */}
        {success && (
          <div className="password-success-message">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="password-error-message">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* Current Password */}
          <div className="password-form-group">
            <label htmlFor="old_password">
              Current Password
            </label>

            <div className="password-input-wrapper">

              <input
                type={
                  showPassword.old_password
                    ? "text"
                    : "password"
                }
                id="old_password"
                name="old_password"
                value={formData.old_password}
                onChange={handleChange}
                placeholder="Enter your current password"
                required
              />

              <button
                type="button"
                className="password-toggle-button"
                onClick={() =>
                  togglePasswordVisibility(
                    "old_password"
                  )
                }
                aria-label={
                  showPassword.old_password
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword.old_password ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>
          </div>

          {/* New Password */}
          <div className="password-form-group">
            <label htmlFor="new_password">
              New Password
            </label>

            <div className="password-input-wrapper">

              <input
                type={
                  showPassword.new_password
                    ? "text"
                    : "password"
                }
                id="new_password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                placeholder="Enter your new password"
                required
              />

              <button
                type="button"
                className="password-toggle-button"
                onClick={() =>
                  togglePasswordVisibility(
                    "new_password"
                  )
                }
                aria-label={
                  showPassword.new_password
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword.new_password ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>
          </div>

          {/* Confirm Password */}
          <div className="password-form-group">
            <label htmlFor="confirm_password">
              Confirm New Password
            </label>

            <div className="password-input-wrapper">

              <input
                type={
                  showPassword.confirm_password
                    ? "text"
                    : "password"
                }
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Confirm your new password"
                required
              />

              <button
                type="button"
                className="password-toggle-button"
                onClick={() =>
                  togglePasswordVisibility(
                    "confirm_password"
                  )
                }
                aria-label={
                  showPassword.confirm_password
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword.confirm_password ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="change-password-button"
            disabled={loading}
          >
            {loading
              ? "Changing Password..."
              : "Change Password"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default InstructorChangePassword;