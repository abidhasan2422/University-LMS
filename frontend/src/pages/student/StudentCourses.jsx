import { useEffect, useState } from "react";
import axios from "axios";
import { FaBookOpen, FaCalendarAlt, FaUserGraduate } from "react-icons/fa";

import "../../styles/student-layout.css";

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/enrollments/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

      {/* Header */}

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

          <div>
            <span>Total Courses</span>
            <strong>{courses.length}</strong>
          </div>

        </div>

      </div>

      {/* Courses */}

      {courses.length === 0 ? (
        <div className="courses-empty">

          <FaBookOpen />

          <h5>No Courses Found</h5>

          <p>
            You are not currently enrolled in any courses.
          </p>

        </div>
      ) : (
        <div className="row g-4">

          {courses.map((enrollment) => (

            <div
              className="col-md-6 col-xl-4"
              key={enrollment.id}
            >

              <div className="course-card">

                {/* Course Header */}

                <div className="course-card-header">

                  <div className="course-icon">
                    <FaBookOpen />
                  </div>

                  <span className="course-status">
                    {enrollment.status}
                  </span>

                </div>

                {/* Course Information */}

                <div className="course-card-body">

                  <span className="course-code">
                    {enrollment.course_code}
                  </span>

                  <h5>
                    {enrollment.course_title}
                  </h5>

                  <div className="course-info">

                    <div>
                      <FaCalendarAlt />
                      <span>
                        {enrollment.semester_name}
                      </span>
                    </div>

                    <div>
                      <FaUserGraduate />
                      <span>
                        Section {enrollment.section}
                      </span>
                    </div>

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