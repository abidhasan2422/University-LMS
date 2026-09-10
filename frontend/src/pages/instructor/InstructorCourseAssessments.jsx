import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClipboardCheck,
  FaPlus,
  FaSave,
  FaTimes,
} from "react-icons/fa";

import api from "../../api/axios";
import "../../styles/instructor/instructor-course-assessments.css";

const InstructorCourseAssessments = () => {
  const { courseOfferingId } = useParams();
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    assessment_type: "",
    maximum_marks: "",
    assessment_date: "",
  });

  /*
   * Assessment types supported by the backend.
   */
  const assessmentTypes = [
    {
      value: "ASSIGNMENT",
      label: "Assignment",
    },
    {
      value: "QUIZ",
      label: "Quiz",
    },
    {
      value: "PRESENTATION",
      label: "Presentation",
    },
    {
      value: "MID",
      label: "Mid",
    },
    {
      value: "FINAL",
      label: "Final",
    },
    {
      value: "LAB_PERFORMANCE",
      label: "Lab Performance",
    },
    {
      value: "LAB_VIVA",
      label: "Lab Viva",
    },
    {
      value: "LAB_FINAL",
      label: "Lab Final",
    },
  ];

  /*
   * Fetch assessments for this course.
   */
  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `assessments/?course_offering=${courseOfferingId}`
      );

      setAssessments(response.data.results || []);
    } catch (error) {
      console.error("Failed to fetch assessments:", error);

      setError(
        error.response?.data?.detail ||
          "Failed to load assessments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [courseOfferingId]);

  /*
   * Handle form changes.
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /*
   * Reset form.
   */
  const resetForm = () => {
    setFormData({
      assessment_type: "",
      maximum_marks: "",
      assessment_date: "",
    });

    setShowForm(false);
  };

  /*
   * Create assessment.
   */
  const handleCreateAssessment = async (event) => {
    event.preventDefault();

    if (!formData.assessment_type) {
      setError("Please select an assessment type.");
      return;
    }

    if (!formData.maximum_marks) {
      setError("Please enter maximum marks.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.post("assessments/", {
        course_offering: Number(courseOfferingId),
        assessment_type: formData.assessment_type,
        maximum_marks: formData.maximum_marks,
        assessment_date:
          formData.assessment_date || null,
      });

      setSuccess("Assessment created successfully.");

      resetForm();

      await fetchAssessments();
    } catch (error) {
      console.error(
        "Failed to create assessment:",
        error
      );

      const responseData = error.response?.data;

      if (responseData && typeof responseData === "object") {
        const firstError = Object.values(responseData)
          .flat()
          .find((message) => message);

        setError(
          firstError ||
            "Failed to create assessment."
        );
      } else {
        setError("Failed to create assessment.");
      }
    } finally {
      setSaving(false);
    }
  };

  /*
   * Format assessment type.
   */
  const getAssessmentTypeLabel = (type) => {
    const assessment = assessmentTypes.find(
      (item) => item.value === type
    );

    return assessment?.label || type;
  };

  /*
   * Format date.
   */
  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <div className="instructor-course-assessments-page">

      {/* =========================================
          Page Header
      ========================================= */}

      <div className="assessments-page-header">
        <div>
          <h1>
            <FaClipboardCheck />
            Assessments
          </h1>

          <p>
            Manage assessments for this course offering.
          </p>
        </div>

        <button
          className="back-to-course-button"
          onClick={() =>
            navigate(
              `/instructor/courses/${courseOfferingId}`
            )
          }
        >
          <FaArrowLeft />
          Back to Course
        </button>
      </div>

      {/* =========================================
          Messages
      ========================================= */}

      {error && (
        <div className="assessment-message error">
          {error}
        </div>
      )}

      {success && (
        <div className="assessment-message success">
          {success}
        </div>
      )}

      {/* =========================================
          Create Assessment Button
      ========================================= */}

      {!showForm && (
        <div className="assessment-action-bar">
          <button
            className="create-assessment-button"
            onClick={() => {
              setShowForm(true);
              setError("");
              setSuccess("");
            }}
          >
            <FaPlus />
            Create Assessment
          </button>
        </div>
      )}

      {/* =========================================
          Create Assessment Form
      ========================================= */}

      {showForm && (
        <div className="assessment-form-card">

          <div className="assessment-form-header">
            <div>
              <h2>Create Assessment</h2>

              <p>
                Add a new assessment component for this course.
              </p>
            </div>

            <button
              type="button"
              className="close-form-button"
              onClick={resetForm}
            >
              <FaTimes />
            </button>
          </div>

          <form
            className="assessment-form"
            onSubmit={handleCreateAssessment}
          >

            <div className="assessment-form-grid">

              {/* Assessment Type */}

              <div className="form-field">
                <label htmlFor="assessment_type">
                  Assessment Type
                </label>

                <select
                  id="assessment_type"
                  name="assessment_type"
                  value={formData.assessment_type}
                  onChange={handleChange}
                >
                  <option value="">
                    Select assessment type
                  </option>

                  {assessmentTypes.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Maximum Marks */}

              <div className="form-field">
                <label htmlFor="maximum_marks">
                  Maximum Marks
                </label>

                <input
                  id="maximum_marks"
                  name="maximum_marks"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 30"
                  value={formData.maximum_marks}
                  onChange={handleChange}
                />
              </div>

              {/* Assessment Date */}

              <div className="form-field">
                <label htmlFor="assessment_date">
                  Assessment Date
                </label>

                <div className="date-input-wrapper">
                  <FaCalendarAlt />

                  <input
                    id="assessment_date"
                    name="assessment_date"
                    type="date"
                    value={formData.assessment_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

            </div>

            {/* Form Actions */}

            <div className="assessment-form-actions">

              <button
                type="button"
                className="cancel-assessment-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-assessment-button"
                disabled={saving}
              >
                <FaSave />

                {saving
                  ? "Creating..."
                  : "Create Assessment"}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* =========================================
          Loading
      ========================================= */}

      {loading && (
        <div className="assessment-state-card">
          <p>Loading assessments...</p>
        </div>
      )}

      {/* =========================================
          Assessment List
      ========================================= */}

      {!loading && !error && (
        <div className="assessments-list-card">

          <div className="assessments-list-header">
            <div>
              <h2>Course Assessments</h2>

              <p>
                {assessments.length} assessment
                {assessments.length !== 1
                  ? "s"
                  : ""}{" "}
                configured for this course.
              </p>
            </div>
          </div>

          {assessments.length === 0 ? (
            <div className="assessment-empty-state">
              <FaClipboardCheck />

              <h3>No Assessments Yet</h3>

              <p>
                Create the first assessment for this
                course.
              </p>
            </div>
          ) : (
            <div className="assessments-table-wrapper">

              <table className="assessments-table">

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Assessment</th>
                    <th>Maximum Marks</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {assessments.map(
                    (assessment, index) => (
                      <tr key={assessment.id}>

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          <div className="assessment-type-cell">
                            <div className="assessment-type-icon">
                              <FaClipboardCheck />
                            </div>

                            <div>
                              <strong>
                                {getAssessmentTypeLabel(
                                  assessment.assessment_type
                                )}
                              </strong>

                              <span>
                                {assessment.assessment_type}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <strong className="maximum-marks">
                            {assessment.maximum_marks}
                          </strong>
                        </td>

                        <td>
                          <div className="assessment-date-cell">
                            <FaCalendarAlt />

                            <span>
                              {formatDate(
                                assessment.assessment_date
                              )}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={
                              assessment.is_active
                                ? "assessment-status active"
                                : "assessment-status inactive"
                            }
                          >
                            {assessment.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                      </tr>
                    )
                  )}
                </tbody>

              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default InstructorCourseAssessments;