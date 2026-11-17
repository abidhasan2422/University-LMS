import { useState, useMemo } from "react";
import Swal from "sweetalert2";
import {
    FaLock,
    FaEye,
    FaEyeSlash,
    FaKey,
    FaShieldAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaCircle,
} from "react-icons/fa";

import api from "../../api/axios";
import "../../styles/admin/change-password.css";

const PASSWORD_RULES = [
    { id: "length", label: "At least 8 characters", test: (pw) => pw.length >= 8 },
    { id: "upper", label: "One uppercase letter (A-Z)", test: (pw) => /[A-Z]/.test(pw) },
    { id: "lower", label: "One lowercase letter (a-z)", test: (pw) => /[a-z]/.test(pw) },
    { id: "number", label: "One number (0-9)", test: (pw) => /[0-9]/.test(pw) },
    {
        id: "special",
        label: "One special character (!@#$%^&*)",
        test: (pw) => /[^A-Za-z0-9]/.test(pw),
    },
];

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

    // Evaluate password strength & individual rules
    const passwordEvaluation = useMemo(() => {
        const pw = formData.new_password;
        const results = PASSWORD_RULES.map((rule) => ({
            ...rule,
            passed: rule.test(pw),
        }));
        const passedCount = results.filter((r) => r.passed).length;

        let strength = { label: "", level: 0, colorClass: "" };
        if (pw.length > 0) {
            if (passedCount <= 2) {
                strength = { label: "Weak", level: 1, colorClass: "weak" };
            } else if (passedCount === 3) {
                strength = { label: "Fair", level: 2, colorClass: "fair" };
            } else if (passedCount === 4) {
                strength = { label: "Good", level: 3, colorClass: "good" };
            } else {
                strength = { label: "Strong", level: 4, colorClass: "strong" };
            }
        }

        return {
            results,
            passedCount,
            isStrongEnough: passedCount >= 4,
            strength,
        };
    }, [formData.new_password]);

    const passwordsMatch =
        formData.confirm_password.length > 0 &&
        formData.new_password === formData.confirm_password;

    const passwordsMismatch =
        formData.confirm_password.length > 0 &&
        formData.new_password !== formData.confirm_password;

    const isSameAsOld =
        formData.old_password.length > 0 &&
        formData.new_password.length > 0 &&
        formData.old_password === formData.new_password;

    const canSubmit =
        formData.old_password.length > 0 &&
        passwordEvaluation.isStrongEnough &&
        passwordsMatch &&
        !isSameAsOld &&
        !loading;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const togglePassword = (field) => {
        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleReset = () => {
        setFormData({
            old_password: "",
            new_password: "",
            confirm_password: "",
        });
        setShowPassword({ old: false, new: false, confirm: false });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.new_password !== formData.confirm_password) {
            Swal.fire({
                icon: "warning",
                title: "Passwords Do Not Match",
                text: "Please make sure your new password and confirmation match.",
                confirmButtonColor: "#2458c6",
            });
            return;
        }

        if (formData.old_password === formData.new_password) {
            Swal.fire({
                icon: "warning",
                title: "Same Password",
                text: "Your new password must be different from your current password.",
                confirmButtonColor: "#2458c6",
            });
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("users/change-password/", formData);

            handleReset();

            await Swal.fire({
                icon: "success",
                title: "Password Updated",
                text:
                    response.data.message ||
                    "Your administrator password has been changed successfully.",
                confirmButtonColor: "#2458c6",
            });
        } catch (err) {
            const errors = err.response?.data;
            let errorMessage = "Unable to change password. Please try again.";

            if (typeof errors === "string") {
                errorMessage = errors;
            } else if (errors && typeof errors === "object") {
                const firstError = Object.values(errors)
                    .flat()
                    .find((item) => typeof item === "string");
                if (firstError) {
                    errorMessage = firstError;
                }
            }

            Swal.fire({
                icon: "error",
                title: "Password Update Failed",
                text: errorMessage,
                confirmButtonColor: "#2458c6",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change-password-page">
            {/* Top Page Header */}
            <div className="change-password-header">
                <div>
                    <h3 className="page-title">Security &amp; Password</h3>
                    <p className="page-subtitle">
                        Manage your credentials to keep your administrator account protected.
                    </p>
                </div>
            </div>

            <div className="row g-4 align-items-start">
                {/* Main Password Form Card */}
                <div className="col-lg-7">
                    <div className="change-password-card">
                        <div className="password-card-top">
                            <div className="password-card-icon">
                                <FaLock />
                            </div>
                            <div>
                                <h4>Change Password</h4>
                                <p>
                                    Verify your current password and set a strong new one.
                                </p>
                            </div>
                        </div>

                        <hr className="section-divider" />

                        <form onSubmit={handleSubmit}>
                            {/* Current Password */}
                            <div className="change-password-field">
                                <label className="form-label">
                                    Current Password <span className="text-danger">*</span>
                                </label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword.old ? "text" : "password"}
                                        name="old_password"
                                        className="form-control modern-input"
                                        placeholder="Enter your current password"
                                        value={formData.old_password}
                                        onChange={handleChange}
                                        disabled={loading}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => togglePassword("old")}
                                        aria-label={
                                            showPassword.old
                                                ? "Hide current password"
                                                : "Show current password"
                                        }
                                    >
                                        {showPassword.old ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="change-password-field">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label className="form-label mb-0">
                                        New Password <span className="text-danger">*</span>
                                    </label>
                                    {formData.new_password && (
                                        <span
                                            className={`strength-badge ${passwordEvaluation.strength.colorClass}`}
                                        >
                                            {passwordEvaluation.strength.label}
                                        </span>
                                    )}
                                </div>

                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword.new ? "text" : "password"}
                                        name="new_password"
                                        className={`form-control modern-input ${
                                            isSameAsOld ? "is-invalid-custom" : ""
                                        }`}
                                        placeholder="Create a strong new password"
                                        value={formData.new_password}
                                        onChange={handleChange}
                                        disabled={loading}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => togglePassword("new")}
                                        aria-label={
                                            showPassword.new
                                                ? "Hide new password"
                                                : "Show new password"
                                        }
                                    >
                                        {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>

                                {/* 4-Segment Strength Meter */}
                                {formData.new_password && (
                                    <div className="strength-meter-bars">
                                        {[1, 2, 3, 4].map((step) => (
                                            <span
                                                key={step}
                                                className={`strength-bar ${
                                                    passwordEvaluation.strength.level >= step
                                                        ? passwordEvaluation.strength.colorClass
                                                        : ""
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}

                                {isSameAsOld && (
                                    <small className="field-feedback error">
                                        <FaTimesCircle className="me-1" />
                                        New password cannot be the same as your current password.
                                    </small>
                                )}
                            </div>

                            {/* Confirm New Password */}
                            <div className="change-password-field">
                                <label className="form-label">
                                    Confirm New Password <span className="text-danger">*</span>
                                </label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword.confirm ? "text" : "password"}
                                        name="confirm_password"
                                        className={`form-control modern-input ${
                                            passwordsMismatch
                                                ? "is-invalid-custom"
                                                : passwordsMatch
                                                ? "is-valid-custom"
                                                : ""
                                        }`}
                                        placeholder="Re-enter your new password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        disabled={loading}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => togglePassword("confirm")}
                                        aria-label={
                                            showPassword.confirm
                                                ? "Hide confirm password"
                                                : "Show confirm password"
                                        }
                                    >
                                        {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>

                                {passwordsMismatch && (
                                    <small className="field-feedback error">
                                        <FaTimesCircle className="me-1" />
                                        Passwords do not match.
                                    </small>
                                )}
                                {passwordsMatch && (
                                    <small className="field-feedback success">
                                        <FaCheckCircle className="me-1" />
                                        Passwords match.
                                    </small>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="password-form-actions">
                                {(formData.old_password ||
                                    formData.new_password ||
                                    formData.confirm_password) && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary px-4"
                                        onClick={handleReset}
                                        disabled={loading}
                                    >
                                        Clear
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-primary px-4 btn-submit-password"
                                    disabled={!canSubmit}
                                >
                                    {loading ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                            />
                                            Updating Password...
                                        </>
                                    ) : (
                                        <>
                                            <FaKey className="me-2" />
                                            Update Password
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Side Panel: Live Requirements & Best Practices */}
                <div className="col-lg-5">
                    <div className="password-guidelines-card">
                        <div className="guidelines-header">
                            <div className="guidelines-icon">
                                <FaShieldAlt />
                            </div>
                            <div>
                                <h6>Password Requirements</h6>
                                <span>Meet at least 4 of 5 rules below</span>
                            </div>
                        </div>

                        <ul className="password-checklist">
                            {passwordEvaluation.results.map((rule) => (
                                <li
                                    key={rule.id}
                                    className={rule.passed ? "passed" : ""}
                                >
                                    {rule.passed ? (
                                        <FaCheckCircle className="check-icon passed" />
                                    ) : (
                                        <FaCircle className="check-icon pending" />
                                    )}
                                    <span>{rule.label}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="security-tip-box">
                            <strong>Administrator Security Tip</strong>
                            <p>
                                Avoid reusing passwords from other university systems or
                                personal accounts. If you suspect unauthorized access,
                                update your password immediately.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;