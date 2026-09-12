import { useEffect, useMemo, useState } from "react";
import {
  FaClipboardList,
  FaBookOpen,
  FaCheckCircle,
  FaChartBar,
  FaArrowLeft,
} from "react-icons/fa";

import api from "../../api/axios";
import "../../styles/student/Student-assessments.css";

const StudentAssessments = () => {
  const [assessments, setAssessments] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState(null);

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

      setAssessments(response.data.results || []);
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

  useEffect(() => {
    fetchAssessments();
  }, []);

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
  // Calculate Grade
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
  // Group Assessments By Course
  // =========================================

  const courses = useMemo(() => {
    const courseMap = {};

    assessments.forEach((assessment) => {
      const courseCode =
        assessment.course_code || "UNKNOWN";

      if (!courseMap[courseCode]) {
        courseMap[courseCode] = {
          courseCode,
          courseTitle:
            assessment.course_title || "Course",
          assessments: [],
        };
      }

      courseMap[courseCode].assessments.push(
        assessment
      );
    });

    return Object.values(courseMap);
  }, [assessments]);

  // =========================================
  // Course Performance
  // =========================================

  const getCoursePerformance = (course) => {
    const totalObtained = course.assessments.reduce(
      (total, assessment) =>
        total +
        Number(assessment.obtained_marks || 0),
      0
    );

    const totalMaximum = course.assessments.reduce(
      (total, assessment) =>
        total +
        Number(assessment.maximum_marks || 0),
      0
    );

    return totalMaximum > 0
      ? (totalObtained / totalMaximum) * 100
      : 0;
  };

  // =========================================
  // Overall Summary
  // =========================================

  const totalObtained = assessments.reduce(
    (total, assessment) =>
      total +
      Number(assessment.obtained_marks || 0),
    0
  );

  const totalMaximum = assessments.reduce(
    (total, assessment) =>
      total +
      Number(assessment.maximum_marks || 0),
    0
  );

  const overallPercentage =
    totalMaximum > 0
      ? ((totalObtained / totalMaximum) * 100).toFixed(1)
      : "0.0";

  // =========================================
  // Loading
  // =========================================

  if (loading) {
    return (
      <div className="student-assessments">

        <div className="assessments-page-header">
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
  // Error
  // =========================================

  if (error) {
    return (
      <div className="student-assessments">

        <div className="assessments-page-header">
          <span className="assessments-label">
            STUDENT PORTAL
          </span>

          <h2>Assessments</h2>

          <p>
            View your assessment marks and academic
            performance.
          </p>
        </div>

        <div className="assessment-info-box error">
          <FaClipboardList />

          <div>
            <strong>
              Unable to Load Assessments
            </strong>

            <p>{error}</p>
          </div>
        </div>

      </div>
    );
  }

  // =========================================
  // Course Detail View
  // =========================================

  if (selectedCourse) {
    return (
      <div className="student-assessments">

        {/* Header */}

        <div className="assessments-page-header">

          <button
            type="button"
            className="back-to-courses-button"
            onClick={() => setSelectedCourse(null)}
          >
            <FaArrowLeft />
            Back to Courses
          </button>

          <span className="assessments-label">
            STUDENT PORTAL
          </span>

          <h2>
            {selectedCourse.courseCode}
          </h2>

          <p>
            {selectedCourse.courseTitle}
          </p>

        </div>

        {/* Course Assessment Summary */}

        <div className="course-detail-summary">

          <div>
            <span>Published Assessments</span>

            <strong>
              {selectedCourse.assessments.length}
            </strong>
          </div>

          <div>
            <span>Course Performance</span>

            <strong>
              {getCoursePerformance(
                selectedCourse
              ).toFixed(1)}
              %
            </strong>
          </div>

        </div>

        {/* Assessment Table */}

        <div className="assessments-section">

          <div className="assessments-section-header">

            <div>
              <h5>Assessment Marks</h5>

              <p>
                Marks entered by your course instructor.
              </p>
            </div>

          </div>

          <div className="table-responsive">

            <table className="table assessments-table mb-0">

              <thead>
                <tr>
                  <th>Assessment</th>
                  <th>Marks Obtained</th>
                  <th>Total Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {selectedCourse.assessments.map(
                  (assessment) => {

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

                        <td>
                          <span className="assessment-name">
                            {assessment.assessment_type ||
                              "Assessment"}
                          </span>
                        </td>

                        <td>
                          <strong className="marks-obtained">
                            {obtainedMarks.toFixed(2)}
                          </strong>
                        </td>

                        <td>
                          {maximumMarks.toFixed(2)}
                        </td>

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
                              />

                            </div>

                          </div>
                        </td>

                        <td>
                          <strong className="assessment-grade">
                            {grade}
                          </strong>
                        </td>

                        <td>
                          <span className="assessment-status published">
                            <FaCheckCircle />
                            Published
                          </span>
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* Information */}

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
  }

  // =========================================
  // Main Course View
  // =========================================

  return (
    <div className="student-assessments">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="assessments-page-header">

        <span className="assessments-label">
          STUDENT PORTAL
        </span>

        <h2>Assessments</h2>

        <p>
          Select a course to view your assessment
          marks.
        </p>

      </div>

      {/* =========================================
          SUMMARY
      ========================================= */}

      <div className="row g-4 mb-4">

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

        <div className="col-md-4">

          <div className="assessment-summary-card">

            <div className="assessment-summary-icon green">
              <FaCheckCircle />
            </div>

            <div>
              <span>Courses</span>

              <strong>
                {courses.length}
              </strong>

              <small>
                With assessment marks
              </small>
            </div>

          </div>

        </div>

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

      {/* =========================================
          COURSE LIST
      ========================================= */}

      <div className="course-assessments-section">

        <div className="course-assessments-section-header">

          <div>
            <h5>My Courses</h5>

            <p>
              Select a course to view its assessment
              marks.
            </p>
          </div>

        </div>

        {courses.length === 0 ? (

          <div className="assessment-empty-state">

            <FaClipboardList />

            <h3>
              No Assessment Marks Available
            </h3>

            <p>
              Your instructors have not entered any
              assessment marks yet.
            </p>

          </div>

        ) : (

          <div className="course-assessment-grid">

            {courses.map((course) => {

              const performance =
                getCoursePerformance(course);

              return (
                <div
                  className="course-assessment-card"
                  key={course.courseCode}
                >

                  <div className="course-card-top">

                    <div className="course-card-icon">
                      <FaBookOpen />
                    </div>

                    <div>
                      <h3>
                        {course.courseCode}
                      </h3>

                      <p>
                        {course.courseTitle}
                      </p>
                    </div>

                  </div>

                  <div className="course-card-stats">

                    <div>
                      <span>
                        Published Assessments
                      </span>

                      <strong>
                        {course.assessments.length}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Performance
                      </span>

                      <strong>
                        {performance.toFixed(1)}%
                      </strong>
                    </div>

                  </div>

                  <div className="course-card-progress">

                    <div className="progress">

                      <div
                        className="progress-bar"
                        style={{
                          width: `${Math.min(
                            performance,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                  <button
                    type="button"
                    className="view-course-assessments-button"
                    onClick={() =>
                      setSelectedCourse(course)
                    }
                  >
                    View Assessments
                  </button>

                </div>
              );
            })}

          </div>

        )}

      </div>

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
            course instructor. Select a course above
            to view your published marks and grades.
          </p>

        </div>

      </div>

    </div>
  );
};

export default StudentAssessments;