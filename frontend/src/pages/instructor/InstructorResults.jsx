import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "../../styles/instructor/instructor-results.css";

const InstructorResults = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [assessmentMarks, setAssessmentMarks] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  const [generatingStudent, setGeneratingStudent] = useState(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // =========================================
  // Fetch Instructor Courses
  // =========================================
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        setError("");

        const response = await api.get("course-offering/");

        const courseData = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

        setCourses(courseData);
      } catch (err) {
        console.error("Failed to load courses:", err);
        setError("Failed to load courses.");
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // =========================================
  // Fetch Course Data
  // =========================================
  useEffect(() => {
    if (!selectedCourse) {
      setStudents([]);
      setResults([]);
      setAssessmentMarks([]);
      setAttendanceRecords([]);
      return;
    }

    const fetchCourseData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const [
          studentsResponse,
          resultsResponse,
          assessmentResponse,
          attendanceResponse,
        ] = await Promise.all([
          api.get(
            `enrollments/?course_offering=${selectedCourse}`
          ),
          api.get("results/"),
          api.get(
            `assessments/marks/?course_offering=${selectedCourse}`
          ),
          api.get(
            `attendance/?course_offering=${selectedCourse}`
          ),
        ]);

        // -------------------------------
        // Students
        // -------------------------------
        const studentData = Array.isArray(studentsResponse.data)
          ? studentsResponse.data
          : studentsResponse.data?.results || [];

        setStudents(studentData);

        // -------------------------------
        // Results
        // -------------------------------
        const resultData = Array.isArray(resultsResponse.data)
          ? resultsResponse.data
          : resultsResponse.data?.results || [];

        setResults(resultData);

        // -------------------------------
        // Assessment Marks
        // -------------------------------
        const marksData = Array.isArray(assessmentResponse.data)
          ? assessmentResponse.data
          : assessmentResponse.data?.results || [];

        setAssessmentMarks(marksData);

        // -------------------------------
        // Attendance
        // -------------------------------
        const attendanceData = Array.isArray(attendanceResponse.data)
          ? attendanceResponse.data
          : attendanceResponse.data?.results || [];

        setAttendanceRecords(attendanceData);

      } catch (err) {
        console.error(
          "Failed to load course result data:",
          err
        );

        setError(
          "Failed to load attendance, assessment marks, or results."
        );
      } finally {
        setLoadingData(false);
      }
    };

    fetchCourseData();
  }, [selectedCourse]);

  // =========================================
  // Generate Result
  // =========================================
  const handleGenerateResult = async (enrollmentId) => {
    try {
      setGeneratingStudent(enrollmentId);
      setSuccess("");
      setError("");

      await api.post("results/", {
        enrollment: enrollmentId,
      });

      setSuccess("Result generated successfully.");

      // Reload results
      const response = await api.get("results/");

      const resultData = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setResults(resultData);

    } catch (err) {
      console.error(
        "Failed to generate result:",
        err
      );

      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to generate result.";

      setError(message);
    } finally {
      setGeneratingStudent(null);
    }
  };

  // =========================================
  // Get Student Result
  // =========================================
  const getStudentResult = (enrollmentId) => {
    return results.find(
      (result) =>
        String(result.enrollment) ===
        String(enrollmentId)
    );
  };

  // =========================================
  // Get Student Assessment Marks
  // =========================================
  const getStudentAssessmentMarks = (enrollmentId) => {
    return assessmentMarks.filter(
      (mark) =>
        String(mark.enrollment) ===
        String(enrollmentId)
    );
  };

  // =========================================
  // Get Student Attendance
  // =========================================
  const getStudentAttendance = (enrollmentId) => {
    return attendanceRecords.filter(
      (record) =>
        String(record.enrollment) ===
        String(enrollmentId)
    );
  };

  // =========================================
  // Calculate Attendance Marks
  // =========================================
  const getAttendanceInfo = (enrollmentId) => {
    const records =
      getStudentAttendance(enrollmentId);

    const total = records.length;

    const present = records.filter(
      (record) => record.status === "PRESENT"
    ).length;

    const percentage =
      total > 0
        ? (present / total) * 100
        : 0;

    const marks =
      total > 0
        ? (percentage / 100) * 10
        : 0;

    return {
      total,
      present,
      percentage,
      marks,
    };
  };

  // =========================================
  // Calculate Assessment Information
  // =========================================
  const getAssessmentInfo = (enrollmentId) => {
    const marks =
      getStudentAssessmentMarks(enrollmentId);

    const totalObtained = marks.reduce(
      (sum, mark) =>
        sum + Number(mark.obtained_marks || 0),
      0
    );

    const totalMaximum = marks.reduce(
      (sum, mark) =>
        sum + Number(mark.maximum_marks || 0),
      0
    );

    return {
      marks,
      totalObtained,
      totalMaximum,
    };
  };

  const selectedCourseData = courses.find(
    (course) =>
      String(course.id) ===
      String(selectedCourse)
  );

  return (
    <div className="instructor-results-page">

      {/* =====================================
          Page Header
          ===================================== */}
      <div className="results-page-header">
        <div>
          <h1>Results</h1>
          <p>
            Generate and review student results.
          </p>
        </div>

        <button
          className="results-secondary-button"
          onClick={() =>
            navigate("/instructor/dashboard")
          }
        >
          Back to Dashboard
        </button>
      </div>

      {/* =====================================
          Success
          ===================================== */}
      {success && (
        <div className="results-success-message">
          {success}
        </div>
      )}

      {/* =====================================
          Error
          ===================================== */}
      {error && (
        <div className="results-error-message">
          {error}
        </div>
      )}

      {/* =====================================
          Course Selection
          ===================================== */}
      <div className="results-content-card">
        <h2>Select Course</h2>

        {loadingCourses ? (
          <div className="results-loading">
            Loading courses...
          </div>
        ) : (
          <select
            className="results-course-select"
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setSuccess("");
              setError("");
            }}
          >
            <option value="">
              -- Select a Course --
            </option>

            {courses.map((course) => (
              <option
                key={course.id}
                value={course.id}
              >
                {course.course_code} -{" "}
                {course.course_title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* =====================================
          Student Results
          ===================================== */}
      {selectedCourse && (
        <div className="results-content-card">

          <div className="results-section-header">
            <div>
              <h2>Student Results</h2>

              {selectedCourseData && (
                <p>
                  {selectedCourseData.course_code} —{" "}
                  {selectedCourseData.course_title}
                </p>
              )}
            </div>
          </div>

          {loadingData ? (
            <div className="results-loading">
              Loading marks and results...
            </div>
          ) : students.length === 0 ? (
            <div className="results-empty-state">
              No enrolled students found for this course.
            </div>
          ) : (
            <div className="results-table-container">
              <table className="results-data-table">

                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Attendance</th>
                    <th>Assessments</th>
                    <th>Total Marks</th>
                    <th>Percentage</th>
                    <th>Grade</th>
                    <th>Grade Point</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => {

                    const result =
                      getStudentResult(student.id);

                    const attendance =
                      getAttendanceInfo(student.id);

                    const assessment =
                      getAssessmentInfo(student.id);

                    return (
                      <tr key={student.id}>

                        {/* Student ID */}
                        <td>
                          <span className="student-id">
                            {student.student_id_code ||
                              "N/A"}
                          </span>
                        </td>

                        {/* Student Name */}
                        <td>
                          <span className="student-name">
                            {student.student_name ||
                              "N/A"}
                          </span>
                        </td>

                        {/* Attendance */}
                        <td>
                          {attendance.present} /{" "}
                          {attendance.total}

                          <br />

                          <small>
                            {attendance.marks.toFixed(2)} / 10
                          </small>
                        </td>

                        {/* Assessment Marks */}
                        <td>
                          {assessment.totalObtained} /{" "}
                          {assessment.totalMaximum}

                          {assessment.marks.length > 0 && (
                            <div
                              style={{
                                marginTop: "6px",
                                fontSize: "12px",
                                color: "#64748b",
                              }}
                            >
                              {assessment.marks.map(
                                (mark) => (
                                  <div
                                    key={mark.id}
                                  >
                                    {mark.assessment_type}:{" "}
                                    {mark.obtained_marks} /{" "}
                                    {mark.maximum_marks}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </td>

                        {/* Total */}
                        <td>
                          {result
                            ? result.total_marks
                            : "-"}
                        </td>

                        {/* Percentage */}
                        <td>
                          {result
                            ? `${result.percentage}%`
                            : "-"}
                        </td>

                        {/* Grade */}
                        <td>
                          {result
                            ? result.letter_grade
                            : "-"}
                        </td>

                        {/* Grade Point */}
                        <td>
                          {result
                            ? result.grade_point
                            : "-"}
                        </td>

                        {/* Status */}
                        <td>
                          {result ? (
                            <span
                              className={`results-status-badge ${
                                result.status === "PASS"
                                  ? "results-status-pass"
                                  : "results-status-fail"
                              }`}
                            >
                              {result.status}
                            </span>
                          ) : (
                            <span className="results-status-badge results-status-pending">
                              NOT GENERATED
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td>
                          {!result ? (
                            <button
                              className="results-primary-button"
                              onClick={() =>
                                handleGenerateResult(
                                  student.id
                                )
                              }
                              disabled={
                                generatingStudent ===
                                student.id
                              }
                            >
                              {generatingStudent ===
                              student.id
                                ? "Generating..."
                                : "Generate Result"}
                            </button>
                          ) : (
                            <span className="result-generated">
                              Generated
                            </span>
                          )}
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
    </div>
  );
};

export default InstructorResults;