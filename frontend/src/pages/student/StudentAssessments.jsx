import { useEffect, useState } from "react";
import {
  FaClipboardList,
  FaBookOpen,
  FaCheckCircle,
  FaClock,
  FaChartBar,
} from "react-icons/fa";

import api from "../../api/axios";

const StudentAssessments = () => {
  // =========================================
  // State
  // =========================================

  const [assessments, setAssessments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================================
  // Fetch Student Assessment Marks
  // =========================================

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("assessments/marks/");

      const marks = response.data.results || [];

      setAssessments(marks);
    } catch (error) {
      console.error(
        "Failed to fetch student assessment marks:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Failed to load assessment marks."
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
  }, []);

  // =========================================
  // Grade Calculation
  // =========================================

  const getGrade = (percentage) => {
    if (percentage >= 80) return "A+";
    if (percentage >= 75) return "A";
    if (percentage >= 70) return "A-";
    if (percentage >= 65) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 55) return "B-";
    if (percentage >= 50) return "C+";
    if (percentage >= 45) return "C";
    if (percentage >= 40) return "D";

    return "F";
  };

  // =========================================
  // Calculate Percentage
  // =========================================

  const getPercentage = (obtainedMarks, maximumMarks) => {
    if (!maximumMarks || Number(maximumMarks) <= 0) {
      return 0;
    }

    return (
      (Number(obtainedMarks) / Number(maximumMarks)) *
      100
    );
  };

  // =========================================
  // Only Active / Published Marks
  // =========================================

  const publishedAssessments = assessments.filter(
    (assessment) => assessment.is_active !== false
  );

  // =========================================
  // Pending Assessments
  // =========================================

  /*
   * At the moment, the backend returns AssessmentMark
   * records only when a mark exists.
   *
   * Therefore, assessments without AssessmentMark
   * records are not returned by this endpoint.
   *
   * We keep this empty for now until a separate
   * assessment-publication workflow is implemented.
   */

  const pendingAssessments = [];

  // =========================================
  // Summary Calculations
  // =========================================

  const totalObtained = publishedAssessments.reduce(
    (total, assessment) =>
      total + Number(assessment.obtained_marks || 0),
    0
  );

  const totalMarks = publishedAssessments.reduce(
    (total, assessment) =>
      total + Number(assessment.maximum_marks || 0),
    0
  );

  const overallPercentage =
    totalMarks > 0
      ? ((totalObtained / totalMarks) * 100).toFixed(1)
      : "0.0";

  // =========================================
  // Loading State
  // =========================================

  if (loading) {
    return (
      <div className="student-assessments">

        <div className="assessments-page-header mb-4">

          <span className="assessments-label">
            STUDENT PORTAL
          </span>

          <h2>Assessments</h2>

          <p>
            View your assessment marks and academic
            performance.
          </p>

        </div>

        <div className="assessment-info-box">
          <FaClipboardList />

          <div>
            <strong>Loading Assessments...</strong>

            <p>
              Please wait while your assessment marks
              are being loaded.
            </p>
          </div>
        </div>

      </div>
    );
  }

  // =========================================
  // Main UI
  // =========================================

  return (
    <div className="student-assessments">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="assessments-page-header mb-4">

        <span className="assessments-label">
          STUDENT PORTAL
        </span>

        <h2>Assessments</h2>

        <p>
          View your assessment marks and academic
          performance.
        </p>

      </div>

      {/* =========================================
          ERROR
      ========================================= */}

      {error && (
        <div className="assessment-info-box">

          <FaClipboardList />

          <div>
            <strong>Unable to Load Assessments</strong>

            <p>{error}</p>
          </div>

        </div>
      )}

      {/* =========================================
          SUMMARY
      ========================================= */}

      {!error && (
        <div className="row g-4 mb-4">

          {/* Total Assessments */}

          <div className="col-md-4">

            <div className="assessment-summary-card">

              <div className="assessment-summary-icon blue">
                <FaClipboardList />
              </div>

              <div>

                <span>Total Assessments</span>

                <strong>
                  {assessments.length}
                </strong>

                <small>
                  Marks available
                </small>

              </div>

            </div>

          </div>

          {/* Published Marks */}

          <div className="col-md-4">

            <div className="assessment-summary-card">

              <div className="assessment-summary-icon green">
                <FaCheckCircle />
              </div>

              <div>

                <span>Published Marks</span>

                <strong>
                  {publishedAssessments.length}
                </strong>

                <small>
                  Available to view
                </small>

              </div>

            </div>

          </div>

          {/* Overall Performance */}

          <div className="col-md-4">

            <div className="assessment-summary-card">

              <div className="assessment-summary-icon purple">
                <FaChartBar />
              </div>

              <div>

                <span>Overall Performance</span>

                <strong>
                  {overallPercentage}%
                </strong>

                <small>
                  Based on available marks
                </small>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =========================================
          ASSESSMENT TABLE
      ========================================= */}

      {!error && (
        <div className="assessments-section">

          <div className="assessments-section-header">

            <div>

              <h5>Assessment Marks</h5>

              <p>
                Marks entered by your course instructor.
              </p>

            </div>

          </div>

          {assessments.length === 0 ? (

            <div className="assessment-info-box">

              <FaClipboardList />

              <div>

                <strong>
                  No Assessment Marks Available
                </strong>

                <p>
                  Your instructor has not entered any
                  assessment marks yet.
                </p>

              </div>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table assessments-table mb-0">

                <thead>

                  <tr>
                    <th>Course</th>
                    <th>Assessment</th>
                    <th>Marks Obtained</th>
                    <th>Total Marks</th>
                    <th>Percentage</th>
                    <th>Grade</th>
                    <th>Status</th>
                  </tr>

                </thead>

                <tbody>

                  {assessments.map((assessment) => {

                    const obtainedMarks = Number(
                      assessment.obtained_marks || 0
                    );

                    const maximumMarks = Number(
                      assessment.maximum_marks || 0
                    );

                    const percentage =
                      getPercentage(
                        obtainedMarks,
                        maximumMarks
                      );

                    const grade =
                      getGrade(percentage);

                    return (
                      <tr key={assessment.id}>

                        {/* =================================
                            Course
                        ================================= */}

                        <td>

                          <div className="assessment-course">

                            <div className="assessment-course-icon">
                              <FaBookOpen />
                            </div>

                            <div>

                              <strong>
                                {assessment.course_code ||
                                  "N/A"}
                              </strong>

                              <span>
                                {assessment.course_title ||
                                  "Course"}
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* =================================
                            Assessment
                        ================================= */}

                        <td>

                          <span className="assessment-name">

                            {assessment.assessment_type ||
                              "Assessment"}

                          </span>

                        </td>

                        {/* =================================
                            Obtained Marks
                        ================================= */}

                        <td>

                          <strong className="marks-obtained">
                            {obtainedMarks.toFixed(2)}
                          </strong>

                        </td>

                        {/* =================================
                            Maximum Marks
                        ================================= */}

                        <td>
                          {maximumMarks.toFixed(2)}
                        </td>

                        {/* =================================
                            Percentage
                        ================================= */}

                        <td>

                          <div className="assessment-percentage">

                            <strong>
                              {percentage.toFixed(1)}%
                            </strong>

                            <div className="progress">

                              <div
                                className="progress-bar"
                                style={{
                                  width: `${Math.min(
                                    percentage,
                                    100
                                  )}%`,
                                }}
                              ></div>

                            </div>

                          </div>

                        </td>

                        {/* =================================
                            Grade
                        ================================= */}

                        <td>

                          <strong className="assessment-grade">
                            {grade}
                          </strong>

                        </td>

                        {/* =================================
                            Status
                        ================================= */}

                        <td>

                          <span className="assessment-status published">

                            <FaCheckCircle />

                            Published

                          </span>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </div>
      )}

      {/* =========================================
          INFORMATION
      ========================================= */}

      <div className="assessment-info-box mt-4">

        <FaClipboardList />

        <div>

          <strong>
            Assessment Information
          </strong>

          <p>
            Assessment marks are entered by your
            course instructor. You can only view
            your own assessment marks.
          </p>

        </div>

      </div>

    </div>
  );
};

export default StudentAssessments;