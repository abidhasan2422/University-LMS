import { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import {
    FaUserCircle,
    FaEnvelope,
    FaPhone,
    FaUserShield,
    FaCalendarAlt,
    FaEdit,
    FaSave,
    FaTimes,
    FaLock,
    FaCheckCircle,
    FaExclamationCircle,
    FaSyncAlt,
} from "react-icons/fa";

import api from "../../api/axios";
import "../../styles/admin/admin-profile.css";

// Reusable Toast configuration for clean non-blocking notifications
const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    },
});

const AdminProfile = () => {
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        phone_number: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [fetchError, setFetchError] = useState("");

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setFetchError("");

            const response = await api.get("users/profile/");
            const data = response.data;

            setProfile(data);
            setFormData({
                first_name: data.first_name || "",
                last_name: data.last_name || "",
                phone_number: data.phone_number || "",
            });
        } catch (err) {
            setFetchError(
                err.response?.data?.detail ||
                    "Failed to load profile information. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // Track whether the user has actually modified any fields
    const hasChanges = useMemo(() => {
        if (!profile) return false;
        return (
            formData.first_name.trim() !== (profile.first_name || "") ||
            formData.last_name.trim() !== (profile.last_name || "") ||
            formData.phone_number.trim() !== (profile.phone_number || "")
        );
    }, [formData, profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEdit = () => {
        setFormData({
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            phone_number: profile.phone_number || "",
        });
        setEditing(true);
    };

    const handleCancel = async () => {
        if (hasChanges) {
            const result = await Swal.fire({
                title: "Discard unsaved changes?",
                text: "Any edits you made to your profile will be lost.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3545",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Yes, discard",
                cancelButtonText: "Keep editing",
                reverseButtons: true,
            });

            if (!result.isConfirmed) return;
        }

        setEditing(false);
        setFormData({
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            phone_number: profile.phone_number || "",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!hasChanges) {
            setEditing(false);
            return;
        }

        try {
            setSaving(true);

            const payload = {
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                phone_number: formData.phone_number.trim(),
            };

            const response = await api.patch("users/profile/", payload);
            const updatedUser = response.data.user || response.data;

            setProfile(updatedUser);
            setFormData({
                first_name: updatedUser.first_name || "",
                last_name: updatedUser.last_name || "",
                phone_number: updatedUser.phone_number || "",
            });
            setEditing(false);

            Toast.fire({
                icon: "success",
                title: response.data.message || "Profile updated successfully",
            });
        } catch (err) {
            const errors = err.response?.data;
            let errorMessage = "Unable to update profile. Please check your inputs.";

            if (typeof errors === "object" && errors !== null) {
                const firstError = Object.values(errors).flat()[0];
                if (typeof firstError === "string") {
                    errorMessage = firstError;
                }
            }

            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: errorMessage,
                confirmButtonColor: "#2458c6",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-profile-state-card">
                <div className="spinner-border text-primary" role="status" />
                <h5>Loading Profile</h5>
                <p className="text-muted mb-0">
                    Fetching your administrator account details...
                </p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="admin-profile-state-card error">
                <FaExclamationCircle className="state-icon text-danger" />
                <h5>Unable to Load Profile</h5>
                <p className="text-muted">
                    {fetchError || "Profile information is currently unavailable."}
                </p>
                <button
                    className="btn btn-primary px-4"
                    onClick={fetchProfile}
                >
                    <FaSyncAlt className="me-2" />
                    Try Again
                </button>
            </div>
        );
    }

    const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
    const initials = `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase();
    const isActive = profile.status?.toUpperCase() === "ACTIVE";

    return (
        <div className="admin-profile-page">
            {/* Top Page Header */}
            <div className="admin-profile-header">
                <div>
                    <h3 className="page-title">Account Settings</h3>
                    <p className="page-subtitle">
                        Manage your personal details and view your administrator credentials.
                    </p>
                </div>

                {!editing && (
                    <button
                        type="button"
                        className="btn btn-primary btn-edit-profile"
                        onClick={handleEdit}
                    >
                        <FaEdit className="me-2" />
                        Edit Profile
                    </button>
                )}
            </div>

            <div className="row g-4">
                {/* Left Column: Identity Overview Card */}
                <div className="col-lg-4">
                    <div className="admin-profile-card profile-overview-card">
                        <div className="profile-cover-banner" />

                        <div className="profile-identity-body">
                            <div className="profile-avatar-wrapper">
                                <div className="profile-avatar">
                                    {initials || <FaUserCircle />}
                                </div>
                                <span
                                    className={`avatar-status-dot ${isActive ? "active" : "inactive"}`}
                                    title={`Status: ${profile.status}`}
                                />
                            </div>

                            <h4 className="profile-name">
                                {fullName || "Administrator"}
                            </h4>
                            <p className="profile-email">{profile.email}</p>

                            <div className="profile-badges">
                                <span className="badge-role">
                                    <FaUserShield className="me-1" />
                                    {profile.role}
                                </span>
                                <span
                                    className={`badge-status ${isActive ? "active" : "inactive"}`}
                                >
                                    {isActive ? (
                                        <FaCheckCircle className="me-1" />
                                    ) : (
                                        <FaExclamationCircle className="me-1" />
                                    )}
                                    {profile.status}
                                </span>
                            </div>

                            <hr className="profile-divider" />

                            <div className="profile-meta-list">
                                <div className="profile-meta-item">
                                    <div className="meta-icon">
                                        <FaEnvelope />
                                    </div>
                                    <div className="meta-content">
                                        <span className="meta-label">Email Address</span>
                                        <span className="meta-value">{profile.email}</span>
                                    </div>
                                </div>

                                <div className="profile-meta-item">
                                    <div className="meta-icon">
                                        <FaPhone />
                                    </div>
                                    <div className="meta-content">
                                        <span className="meta-label">Phone Number</span>
                                        <span className="meta-value">
                                            {profile.phone_number || "Not provided"}
                                        </span>
                                    </div>
                                </div>

                                <div className="profile-meta-item">
                                    <div className="meta-icon">
                                        <FaCalendarAlt />
                                    </div>
                                    <div className="meta-content">
                                        <span className="meta-label">Member Since</span>
                                        <span className="meta-value">
                                            {profile.created_at
                                                ? new Date(profile.created_at).toLocaleDateString(
                                                      undefined,
                                                      {
                                                          year: "numeric",
                                                          month: "long",
                                                          day: "numeric",
                                                      }
                                                  )
                                                : "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Editable Form Card */}
                <div className="col-lg-8">
                    <div className="admin-profile-card">
                        <div className="profile-section-header">
                            <div>
                                <h5>Personal Information</h5>
                                <p>
                                    {editing
                                        ? "Update your details below and click Save Changes."
                                        : "Your basic personal and system access details."}
                                </p>
                            </div>
                            {editing && (
                                <span className="editing-pill">Editing Mode</span>
                            )}
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">
                                        First Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        className={`form-control modern-input ${
                                            !editing ? "readonly-input" : ""
                                        }`}
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        disabled={!editing || saving}
                                        required
                                        maxLength={100}
                                        placeholder="Enter first name"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Last Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        className={`form-control modern-input ${
                                            !editing ? "readonly-input" : ""
                                        }`}
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        disabled={!editing || saving}
                                        required
                                        maxLength={100}
                                        placeholder="Enter last name"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Phone Number <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        className={`form-control modern-input ${
                                            !editing ? "readonly-input" : ""
                                        }`}
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        disabled={!editing || saving}
                                        required
                                        maxLength={20}
                                        placeholder="e.g. +880 1XXX-XXXXXX"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label d-flex justify-content-between">
                                        <span>Email Address</span>
                                        <span className="locked-hint">
                                            <FaLock className="me-1" /> Read-only
                                        </span>
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control modern-input locked-input"
                                        value={profile.email}
                                        disabled
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label d-flex justify-content-between">
                                        <span>System Role</span>
                                        <span className="locked-hint">
                                            <FaLock className="me-1" /> Managed
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control modern-input locked-input"
                                        value={profile.role}
                                        disabled
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label d-flex justify-content-between">
                                        <span>Account Status</span>
                                        <span className="locked-hint">
                                            <FaLock className="me-1" /> Managed
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control modern-input locked-input"
                                        value={profile.status}
                                        disabled
                                    />
                                </div>
                            </div>

                            {editing && (
                                <div className="profile-form-actions">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary px-4"
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        <FaTimes className="me-2" />
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary px-4"
                                        disabled={saving || !hasChanges}
                                    >
                                        {saving ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                    aria-hidden="true"
                                                />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave className="me-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;