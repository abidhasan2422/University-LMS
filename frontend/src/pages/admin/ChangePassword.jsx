
import { useState } from "react";
import {
    FaLock,
    FaEye,
    FaEyeSlash,
    FaKey,
    FaShieldAlt,
} from "react-icons/fa";

import api from "../../api/axios";
import "../../styles/admin/change-password.css";

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        old_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    const togglePassword = (field) => {
        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (
            formData.new_password !==
            formData.confirm_password
        ) {
            setError("New passwords do not match.");
            return;
        }

        if (
            formData.old_password ===
            formData.new_password
        ) {
            setError(
                "New password must be different from the old password."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "users/change-password/",
                formData
            );

            setSuccess(
                response.data.message ||
                "Password changed successfully."
            );

            setFormData({
                old_password: "",
                new_password: "",
                confirm_password: "",
            });

        } catch (err) {
            const errors = err.response?.data;

            if (typeof errors === "string") {
                setError(errors);
            } else if (
                errors &&
                typeof errors === "object"
            ) {
                const firstError = Object.values(errors)
                    .flat()
                    .find((item) => typeof item === "string");

                setError(
                    firstError ||
                    "Unable to change password."
                );
            } else {
                setError(
                    "Something went wrong. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const renderPasswordField = (
        label,
        name,
        field,
        placeholder
    ) => (
        <div className="change-password-field">
            <label className="form-label">
                {label}
            </label>

            <div className="password-input-wrapper">
                <input
                    type={
                        showPassword[field]
                            ? "text"
                            : "password"
                    }
                    name={name}
                    className="form-control"
                    placeholder={placeholder}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                />

                <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePassword(field)}
                    aria-label={
                        showPassword[field]
                            ? "Hide password"
                            : "Show password"
                    }
                >
                    {showPassword[field]
                        ? <FaEyeSlash />
                        : <FaEye />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="change-password-page">

            <div className="change-password-header">
                <div>
                    <h3>Change Password</h3>
                    <p>
                        Update your password to keep your
                        administrator account secure.
                    </p>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-lg-8 col-xl-7">

                    <div className="change-password-card">

                        <div className="password-card-icon">
                            <FaLock />
                        </div>

                        <div className="text-center mb-4">
                            <h4>Update Your Password</h4>
                            <p>
                                Enter your current password
                                and choose a new secure password.
                            </p>
                        </div>

                        {error && (
                            <div className="alert alert-danger">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>

                            {renderPasswordField(
                                "Current Password",
                                "old_password",
                                "old",
                                "Enter current password"
                            )}

                            {renderPasswordField(
                                "New Password",
                                "new_password",
                                "new",
                                "Enter new password"
                            )}

                            {renderPasswordField(
                                "Confirm New Password",
                                "confirm_password",
                                "confirm",
                                "Confirm your new password"
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary w-100 mt-3"
                                disabled={loading}
                            >
                                <FaKey className="me-2" />

                                {loading
                                    ? "Updating Password..."
                                    : "Update Password"}
                            </button>

                        </form>

                    </div>

                    <div className="password-security-note">
                        <FaShieldAlt />

                        <div>
                            <h6>Security Recommendation</h6>
                            <p>
                                Use a strong password containing
                                uppercase letters, lowercase letters,
                                numbers, and special characters.
                                Never share your password with anyone.
                            </p>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default ChangePassword;
