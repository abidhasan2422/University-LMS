import { useState } from "react";
import "../../styles/instructor/instructor-change-password.css";
import api from "../../api/axios";
const InstructorChangePassword = () => {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
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

      <div className="change-password-page-header">
        <h1>Change Password</h1>
        <p>
          Update your account password securely.
        </p>
      </div>

      <div className="change-password-card">

        <div className="change-password-card-header">
          <h2>Change Your Password</h2>
          <p>
            Enter your current password and choose a
            new password.
          </p>
        </div>

        {success && (
          <div className="password-success-message">
            {success}
          </div>
        )}

        {error && (
          <div className="password-error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="password-form-group">
            <label htmlFor="old_password">
              Current Password
            </label>

            <input
              type="password"
              id="old_password"
              name="old_password"
              value={formData.old_password}
              onChange={handleChange}
              placeholder="Enter your current password"
              required
            />
          </div>

          <div className="password-form-group">
            <label htmlFor="new_password">
              New Password
            </label>

            <input
              type="password"
              id="new_password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              placeholder="Enter your new password"
              required
            />
          </div>

          <div className="password-form-group">
            <label htmlFor="confirm_password">
              Confirm New Password
            </label>

            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Confirm your new password"
              required
            />
          </div>

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