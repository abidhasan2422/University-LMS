import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaUserGraduate,
  FaIdCard,
  FaBookOpen,
  FaLayerGroup,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import api from "../../api/axios";
import "../../styles/instructor/instructor-course-students.css";

const InstructorCourseStudents = () => {
  const { courseOfferingId } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `enrollments/?course_offering=${courseOfferingId}`
      );

      setStudents(response.data.results || []);
    } catch (error) {
      console.error("Failed to fetch students:", error);

      setError(
        error.response?.data?.detail ||
          "Failed to load students. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [courseOfferingId]);

  return (
    <div className="instructor-course-students-page">
      {/* Page Header */}
      <div className="students-page-header">
        <div>
          <h1>
            <FaUserGraduate />
            Students
          </h1>

          <p>
            View students enrolled in this course offering.
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

      {/* Loading State */}
      {loading && (
        <div className="students-state-card">
          <p>Loading students...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="students-state-card error">
          <p>{error}</p>

          <button
            className="retry-button"
            onClick={fetchStudents}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Students Content */}
      {!loading && !error && (
        <>
          {/* Summary Card */}
          <div className="students-summary-card">
            <div className="summary-icon">
              <FaUserGraduate />
            </div>

            <div>
              <span>Total Students</span>
              <strong>{students.length}</strong>
            </div>
          </div>

          {/* Students Table */}
          <div className="students-table-card">
            <div className="students-table-header">
              <div>
                <h2>Enrolled Students</h2>
                <p>
                  Students currently associated with this course.
                </p>
              </div>
            </div>

            {students.length === 0 ? (
              <div className="empty-students">
                <FaUserGraduate />

                <h3>No Students Found</h3>

                <p>
                  There are currently no students enrolled in this
                  course.
                </p>
              </div>
            ) : (
              <div className="students-table-wrapper">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>Course</th>
                      <th>Section</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student.id}>
                        <td>{index + 1}</td>

                        <td>
                          <div className="student-id">
                            <FaIdCard />
                            {student.student_id_code || "N/A"}
                          </div>
                        </td>

                        <td>
                          <div className="student-name">
                            <FaUserGraduate />
                            {student.student_name || "N/A"}
                          </div>
                        </td>

                        <td>
                          <div className="course-info">
                            <strong>
                              {student.course_code || "N/A"}
                            </strong>

                            <span>
                              {student.course_title || "N/A"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="section-info">
                            <FaLayerGroup />
                            {student.section || "N/A"}
                          </div>
                        </td>

                        <td>
                          <span
                            className={`student-status ${
                              student.status?.toLowerCase() || ""
                            }`}
                          >
                            {student.status === "ENROLLED" ? (
                              <FaCheckCircle />
                            ) : (
                              <FaTimesCircle />
                            )}

                            {student.status || "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default InstructorCourseStudents;