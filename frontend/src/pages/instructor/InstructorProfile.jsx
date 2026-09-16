import { useEffect, useState } from "react";
import api from "../../api/axios";
import "../../styles/instructor/instructor-profile.css";

const InstructorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      // First get the logged-in instructor's ID
      const dashboardResponse = await api.get("instructors/dashboard/");

      const instructorId = dashboardResponse.data?.instructor?.id;

      if (!instructorId) {
        throw new Error("Instructor profile not found.");
      }

      // Then get the complete instructor profile
      const profileResponse = await api.get(
        `instructors/${instructorId}/`
      );

      setProfile(profileResponse.data);
    } catch (err) {
      console.error("Error fetching instructor profile:", err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load instructor profile."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="instructor-profile-page">
        <div className="profile-loading">
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="instructor-profile-page">
        <div className="profile-error">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="instructor-profile-page">

      {/* Header */}
      <div className="profile-page-header">
        <div>
          <h1>Instructor Profile</h1>
          <p>
            View your personal and professional information.
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="profile-content-card">

        {/* Profile Header */}
        <div className="profile-header-section">

          <div className="profile-picture-container">
            {profile.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt={profile.full_name}
                className="profile-picture"
              />
            ) : (
              <div className="profile-picture-placeholder">
                {profile.first_name?.charAt(0)}
                {profile.last_name?.charAt(0)}
              </div>
            )}
          </div>

          <div className="profile-header-info">
            <h2>{profile.full_name}</h2>

            <p className="profile-designation">
              {profile.designation}
            </p>

            <p className="profile-employee-id">
              Employee ID: {profile.employee_id || "N/A"}
            </p>
          </div>

        </div>

        {/* Personal Information */}
        <div className="profile-section">

          <h3>Personal Information</h3>

          <div className="profile-grid">

            <div className="profile-field">
              <span className="profile-label">
                First Name
              </span>
              <span className="profile-value">
                {profile.first_name || "N/A"}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-label">
                Last Name
              </span>
              <span className="profile-value">
                {profile.last_name || "N/A"}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-label">
                Email
              </span>
              <span className="profile-value">
                {profile.email || "N/A"}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-label">
                Mobile
              </span>
              <span className="profile-value">
                {profile.mobile || "N/A"}
              </span>
            </div>

          </div>
        </div>

        {/* Professional Information */}
        <div className="profile-section">

          <h3>Professional Information</h3>

          <div className="profile-grid">

            <div className="profile-field">
              <span className="profile-label">
                Employee ID
              </span>
              <span className="profile-value">
                {profile.employee_id || "N/A"}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-label">
                Department
              </span>
              <span className="profile-value">
                {profile.department_name || "N/A"}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-label">
                Designation
              </span>
              <span className="profile-value">
                {profile.designation || "N/A"}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-label">
                Qualification
              </span>
              <span className="profile-value">
                {profile.qualification || "N/A"}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-label">
                Specialization
              </span>
              <span className="profile-value">
                {profile.specialization || "N/A"}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-label">
                Joining Date
              </span>
              <span className="profile-value">
                {profile.joining_date || "N/A"}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-label">
                Experience
              </span>
              <span className="profile-value">
                {profile.experience_years ?? 0} years
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-label">
                Employment Status
              </span>

              <span
                className={`profile-status-badge ${
                  profile.employment_status === "ACTIVE"
                    ? "profile-status-active"
                    : "profile-status-other"
                }`}
              >
                {profile.employment_status}
              </span>
            </div>

          </div>
        </div>

        {/* Office Information */}
        <div className="profile-section">

          <h3>Office Information</h3>

          <div className="profile-grid">

            <div className="profile-field">
              <span className="profile-label">
                Office Phone
              </span>
              <span className="profile-value">
                {profile.office_phone || "N/A"}
              </span>
            </div>

            <div className="profile-field">
              <span className="profile-label">
                Office Room
              </span>
              <span className="profile-value">
                {profile.office_room || "N/A"}
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default InstructorProfile;