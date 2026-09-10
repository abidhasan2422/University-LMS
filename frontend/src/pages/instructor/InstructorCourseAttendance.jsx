import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaClipboardCheck,
  FaSave,
  FaUserGraduate,
  FaTimesCircle,
} from "react-icons/fa";

import api from "../../api/axios";
import "../../styles/instructor/instructor-course-attendance.css";

const InstructorCourseAttendance = () => {
  const { courseOfferingId } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * Fetch enrolled students
   */
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `enrollments/?course_offering=${courseOfferingId}`
      );

      const enrolledStudents = response.data.results || [];

      setStudents(enrolledStudents);

      /*
       * Default every student to PRESENT.
       */
      const initialAttendance = {};

      enrolledStudents.forEach((student) => {
        initialAttendance[student.id] = "PRESENT";
      });

      setAttendance(initialAttendance);
    } catch (error) {
      console.error("Failed to fetch students:", error);

      setError(
        error.response?.data?.detail ||
          "Failed to load students."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [courseOfferingId]);

  /*
   * Change attendance status
   */
  const handleAttendanceChange = (enrollmentId, status) => {
    setAttendance((previous) => ({
      ...previous,
      [enrollmentId]: status,
    }));
  };

  /*
   * Save attendance
   */
  const handleSaveAttendance = async () => {
    if (!date) {
      setError("Please select an attendance date.");
      return;
    }

    if (students.length === 0) {
      setError("There are no students to mark attendance.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      for (const student of students) {
        await api.post("attendance/", {
          enrollment: student.id,
          date: date,
          status: attendance[student.id] || "PRESENT",
        });
      }

      setSuccess("Attendance saved successfully.");
    } catch (error) {
      console.error("Failed to save attendance:", error);

      setError(
        error.response?.data?.detail ||
          "Failed to save attendance. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="instructor-course-attendance-page">

      {/* =========================================
          Page Header
      ========================================= */}

      <div className="attendance-page-header">
        <div>
          <h1>
            <FaClipboardCheck />
            Attendance
          </h1>

          <p>
            Mark attendance for students enrolled in this course.
          </p>
        </div>

        <button
          className="back-to-course-button"
          onClick={() =>
            navigate(`/instructor/courses/${courseOfferingId}`)
          }
        >
          <FaArrowLeft />
          Back to Course
        </button>
      </div>

      {/* =========================================
          Date Selection
      ========================================= */}

      <div className="attendance-controls-card">
        <div className="attendance-date-group">
          <label htmlFor="attendance-date">
            <FaCalendarAlt />
            Attendance Date
          </label>

          <input
            id="attendance-date"
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setSuccess("");
              setError("");
            }}
          />
        </div>

        <div className="attendance-count">
          <FaUserGraduate />
          <span>
            Students: <strong>{students.length}</strong>
          </span>
        </div>
      </div>

      {/* =========================================
          Messages
      ========================================= */}

      {error && (
        <div className="attendance-message error">
          <FaTimesCircle />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="attendance-message success">
          <FaCheckCircle />
          <span>{success}</span>
        </div>
      )}

      {/* =========================================
          Loading
      ========================================= */}

      {loading && (
        <div className="attendance-state-card">
          <p>Loading students...</p>
        </div>
      )}

      {/* =========================================
          Attendance Table
      ========================================= */}

      {!loading && students.length > 0 && (
        <div className="attendance-table-card">

          <div className="attendance-table-header">
            <div>
              <h2>Student Attendance</h2>

              <p>
                Select Present or Absent for each student.
              </p>
            </div>
          </div>

          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Course</th>
                  <th>Section</th>
                  <th>Attendance Status</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student, index) => {
                  const currentStatus =
                    attendance[student.id] || "PRESENT";

                  return (
                    <tr key={student.id}>

                      <td>{index + 1}</td>

                      <td>
                        <span className="attendance-student-id">
                          {student.student_id_code || "N/A"}
                        </span>
                      </td>

                      <td>
                        <div className="attendance-student-name">
                          <FaUserGraduate />
                          <span>
                            {student.student_name || "N/A"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="attendance-course">
                          <strong>
                            {student.course_code || "N/A"}
                          </strong>

                          <span>
                            {student.course_title || "N/A"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="attendance-section">
                          {student.section || "N/A"}
                        </span>
                      </td>

                      <td>
                        <div className="attendance-status-buttons">

                          <button
                            type="button"
                            className={
                              currentStatus === "PRESENT"
                                ? "status-button present active"
                                : "status-button present"
                            }
                            onClick={() =>
                              handleAttendanceChange(
                                student.id,
                                "PRESENT"
                              )
                            }
                          >
                            <FaCheckCircle />
                            Present
                          </button>

                          <button
                            type="button"
                            className={
                              currentStatus === "ABSENT"
                                ? "status-button absent active"
                                : "status-button absent"
                            }
                            onClick={() =>
                              handleAttendanceChange(
                                student.id,
                                "ABSENT"
                              )
                            }
                          >
                            <FaTimesCircle />
                            Absent
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Save Button */}

          <div className="attendance-footer">
            <button
              className="save-attendance-button"
              onClick={handleSaveAttendance}
              disabled={saving}
            >
              <FaSave />

              {saving
                ? "Saving..."
                : "Save Attendance"}
            </button>
          </div>

        </div>
      )}

      {/* =========================================
          Empty State
      ========================================= */}

      {!loading && students.length === 0 && !error && (
        <div className="attendance-state-card empty">
          <FaUserGraduate />

          <h3>No Students Found</h3>

          <p>
            There are currently no students enrolled in this
            course.
          </p>
        </div>
      )}
    </div>
  );
};

export default InstructorCourseAttendance;