import { useEffect, useState } from "react";
import api from "../../api/axios";

import {
  FaBookOpen,
  FaCalendarAlt,
  FaUserGraduate,
} from "react-icons/fa";

import "../../styles/student/student-courses.css";

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("enrollments/");

      setCourses(response.data.results || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load your courses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="student-courses">
        <div className="courses-loading">
          Loading your courses...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-courses">
        <div className="courses-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="student-courses">

      {/* Page Header */}
      <div className="courses-page-header">
        <span className="courses-label">
          ACADEMIC
        </span>

        <h2>My Courses</h2>

        <p>
          View your currently enrolled courses and
          academic information.
        </p>
      </div>

      {/* Summary */}
      <div className="courses-summary">

        <div className="courses-summary-card">

          <div className="courses-summary-icon">
            <FaBookOpen />
          </div>

          <div className="courses-summary-content">
            <span>Total Courses</span>
            <strong>{courses.length}</strong>
          </div>

        </div>

      </div>

      {/* Courses */}
      {courses.length === 0 ? (
        <div className="courses-empty">

          <div className="empty-icon">
            <FaBookOpen />
          </div>

          <h5>No Courses Found</h5>

          <p>
            You are not currently enrolled in any courses.
          </p>

        </div>
      ) : (
        <div className="courses-grid">

          {courses.map((enrollment) => (

            <div
              className="course-card"
              key={enrollment.id}
            >

              {/* Card Header */}
              <div className="course-card-header">

                <div className="course-icon">
                  <FaBookOpen />
                </div>

                <span className="course-status">
                  {enrollment.status}
                </span>

              </div>

              {/* Card Body */}
              <div className="course-card-body">

                <span className="course-code">
                  {enrollment.course_code}
                </span>

                <h5>
                  {enrollment.course_title}
                </h5>

                <div className="course-info">

                  <div className="course-info-item">
                    <FaCalendarAlt />
                    <span>
                      {enrollment.semester_name}
                    </span>
                  </div>

                  <div className="course-info-item">
                    <FaUserGraduate />
                    <span>
                      Section {enrollment.section}
                    </span>
                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
};

export default StudentCourses;