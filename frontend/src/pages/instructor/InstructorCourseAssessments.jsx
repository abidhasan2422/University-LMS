import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClipboardCheck,
  FaSave,
  FaTimes,
} from "react-icons/fa";

import api from "../../api/axios";
import "../../styles/instructor/instructor-course-assessments.css";

const InstructorCourseAssessments = () => {
  const { courseOfferingId } = useParams();
  const navigate = useNavigate();

  // =========================================
  // Assessment State
  // =========================================

  const [assessments, setAssessments] = useState([]);

  // =========================================
  // Marks Entry State
  // =========================================

  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});

  // =========================================
  // UI State
  // =========================================

  const [loading, setLoading] = useState(true);
  const [marksLoading, setMarksLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================
  // Assessment Types
  // =========================================

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

  // =========================================
  // Fetch Assessments
  // =========================================

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

  // =========================================
  // Initial Load
  // =========================================

  useEffect(() => {
    fetchAssessments();
  }, [courseOfferingId]);

  // =========================================
  // Format Assessment Type
  // =========================================

  const getAssessmentTypeLabel = (type) => {
    const assessment = assessmentTypes.find(
      (item) => item.value === type
    );

    return assessment?.label || type;
  };

  // =========================================
  // Format Date
  // =========================================

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // =========================================
  // Open Mark Entry
  // =========================================

  const handleEnterMarks = async (assessment) => {
    try {
      setSelectedAssessment(assessment);

      setStudents([]);
      setMarks({});

      setMarksLoading(true);
      setError("");
      setSuccess("");

      // -----------------------------------------
      // Get enrolled students
      // -----------------------------------------

      const enrollmentResponse = await api.get(
        `enrollments/?course_offering=${courseOfferingId}`
      );

      const enrollmentData =
        enrollmentResponse.data.results || [];

      setStudents(enrollmentData);

      // -----------------------------------------
      // Get existing assessment marks
      // -----------------------------------------

      const marksResponse = await api.get(
        `assessments/marks/?assessment=${assessment.id}`
      );

      const existingMarks =
        marksResponse.data.results || [];

      // -----------------------------------------
      // Create marks object
      // -----------------------------------------

      const marksMap = {};

      enrollmentData.forEach((student) => {
        const existingMark = existingMarks.find(
          (item) => item.enrollment === student.id
        );

        marksMap[student.id] = existingMark
          ? existingMark.obtained_marks
          : "";

      });

      setMarks(marksMap);
    } catch (error) {
      console.error("Failed to load marks:", error);

      setError(
        error.response?.data?.detail ||
          "Failed to load students and marks."
      );
    } finally {
      setMarksLoading(false);
    }
  };

  // =========================================
  // Close Mark Entry
  // =========================================

  const handleCloseMarks = () => {
    setSelectedAssessment(null);
    setStudents([]);
    setMarks({});

    setError("");
    setSuccess("");
  };

  // =========================================
  // Handle Mark Change
  // =========================================

  const handleMarkChange = (enrollmentId, value) => {
    setMarks((previous) => ({
      ...previous,
      [enrollmentId]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================================
  // Save Marks
  // =========================================

  const handleSaveMarks = async () => {
    if (!selectedAssessment) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // -----------------------------------------
      // Get existing marks
      // -----------------------------------------

      const marksResponse = await api.get(
        `assessments/marks/?assessment=${selectedAssessment.id}`
      );

      const existingMarks =
        marksResponse.data.results || [];

      // -----------------------------------------
      // Validate marks
      // -----------------------------------------

      for (const student of students) {
        const value = marks[student.id];

        if (value === "" || value === null || value === undefined) {
          continue;
        }

        const obtainedMarks = Number(value);
        const maximumMarks = Number(
          selectedAssessment.maximum_marks
        );

        if (Number.isNaN(obtainedMarks)) {
          setError(
            `Invalid marks for ${
              student.student_name || "student"
            }.`
          );
          setSaving(false);
          return;
        }

        if (obtainedMarks < 0) {
          setError(
            `Marks cannot be negative for ${
              student.student_name || "student"
            }.`
          );
          setSaving(false);
          return;
        }

        if (obtainedMarks > maximumMarks) {
          setError(
            `${
              student.student_name || "Student"
            } cannot receive more than ${maximumMarks} marks.`
          );
          setSaving(false);
          return;
        }
      }

      // -----------------------------------------
      // Save each student's mark
      // -----------------------------------------

      for (const student of students) {
        const value = marks[student.id];

        // Skip empty marks
        if (
          value === "" ||
          value === null ||
          value === undefined
        ) {
          continue;
        }

        const obtainedMarks = Number(value);

        const existingMark = existingMarks.find(
          (item) => item.enrollment === student.id
        );

        // -----------------------------------------
        // Update existing mark
        // -----------------------------------------

        if (existingMark) {
          await api.patch(
            `assessments/marks/${existingMark.id}/`,
            {
              obtained_marks: obtainedMarks,
            }
          );
        }

        // -----------------------------------------
        // Create new mark
        // -----------------------------------------

        else {
          await api.post("assessments/marks/", {
            assessment: selectedAssessment.id,
            enrollment: student.id,
            obtained_marks: obtainedMarks,
            remarks: "",
          });
        }
      }

      setSuccess("Marks saved successfully.");

      // Reload marks after saving
    } catch (error) {
      console.error("Failed to save marks:", error);

      const responseData = error.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const firstError = Object.values(responseData)
          .flat()
          .find((message) => message);

        setError(
          firstError || "Failed to save marks."
        );
      } else {
        setError("Failed to save marks.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // Render
  // =========================================

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
            View assessments and enter student marks
            for this course.
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
          Loading Assessments
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

              <h3>No Assessments Available</h3>

              <p>
                No assessments have been configured
                for this course yet.
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
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {assessments.map(
                    (assessment, index) => (
                      <tr key={assessment.id}>

                        {/* Number */}

                        <td>
                          {index + 1}
                        </td>

                        {/* Assessment */}

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

                        {/* Maximum Marks */}

                        <td>
                          <strong className="maximum-marks">
                            {assessment.maximum_marks}
                          </strong>
                        </td>

                        {/* Date */}

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

                        {/* Status */}

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

                        {/* Action */}

                        <td>
                          <button
                            className="enter-marks-button"
                            onClick={() =>
                              handleEnterMarks(
                                assessment
                              )
                            }
                            disabled={
                              !assessment.is_active
                            }
                          >
                            Enter Marks
                          </button>
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

      {/* =========================================
          Marks Entry Section
      ========================================= */}

      {selectedAssessment && (
        <div className="marks-entry-card">

          {/* Marks Header */}

          <div className="marks-entry-header">

            <div>
              <h2>
                {getAssessmentTypeLabel(
                  selectedAssessment.assessment_type
                )}{" "}
                — Marks Entry
              </h2>

              <p>
                Maximum Marks:{" "}
                <strong>
                  {selectedAssessment.maximum_marks}
                </strong>
              </p>
            </div>

            <button
              type="button"
              className="close-marks-button"
              onClick={handleCloseMarks}
            >
              <FaTimes />
            </button>

          </div>

          {/* Marks Loading */}

          {marksLoading ? (
            <div className="assessment-state-card">
              <p>
                Loading students and marks...
              </p>
            </div>
          ) : students.length === 0 ? (
            <div className="assessment-empty-state">
              <h3>No Students Found</h3>

              <p>
                There are no enrolled students in
                this course.
              </p>
            </div>
          ) : (
            <>
              {/* Students Table */}

              <div className="marks-table-wrapper">

                <table className="marks-table">

                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>Marks</th>
                      <th>Maximum</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map(
                      (student, index) => (
                        <tr key={student.id}>

                          {/* Number */}

                          <td>
                            {index + 1}
                          </td>

                          {/* Student ID */}

                          <td>
                            {student.student_id_code ||
                              "N/A"}
                          </td>

                          {/* Student Name */}

                          <td>
                            <strong>
                              {student.student_name ||
                                "Unknown Student"}
                            </strong>
                          </td>

                          {/* Obtained Marks */}

                          <td>
                            <input
                              type="number"
                              min="0"
                              max={
                                selectedAssessment.maximum_marks
                              }
                              step="0.01"
                              value={
                                marks[student.id] ?? ""
                              }
                              onChange={(event) =>
                                handleMarkChange(
                                  student.id,
                                  event.target.value
                                )
                              }
                              placeholder="Enter marks"
                              className="student-mark-input"
                            />
                          </td>

                          {/* Maximum Marks */}

                          <td>
                            {
                              selectedAssessment.maximum_marks
                            }
                          </td>

                        </tr>
                      )
                    )}
                  </tbody>

                </table>

              </div>

              {/* Save Actions */}

              <div className="marks-entry-actions">

                <button
                  type="button"
                  className="cancel-marks-button"
                  onClick={handleCloseMarks}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="save-marks-button"
                  onClick={handleSaveMarks}
                  disabled={saving}
                >
                  <FaSave />

                  {saving
                    ? "Saving..."
                    : "Save Marks"}
                </button>

              </div>
            </>
          )}

        </div>
      )}

    </div>
  );
};

export default InstructorCourseAssessments;