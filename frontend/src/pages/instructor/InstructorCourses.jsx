import { useEffect, useState } from "react";
import {
  FaBookOpen,
  FaUsers,
  FaDoorOpen,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";

import api from "../../api/axios";
import "../../styles/instructor/instructor-courses.css";

function InstructorCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("course-offering/");

      setCourses(response.data.results || []);
    } catch (error) {
      console.error("Failed to fetch instructor courses:", error);

      setError(
        error.response?.data?.detail ||
          "Failed to load your courses."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return "N/A";

    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="instructor-courses-page">
        <div className="courses-loading">
          Loading your courses...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="instructor-courses-page">
        <div className="courses-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="instructor-courses-page">

      {/* Page Header */}
      <div className="courses-header">
        <div>
          <h1>My Courses</h1>
          <p>
            View and manage the courses assigned to you.
          </p>
        </div>

        <div className="courses-header-icon">
          <FaBookOpen />
        </div>
      </div>

      {/* Course List */}
      {courses.length === 0 ? (
        <div className="courses-empty">
          <FaBookOpen />
          <h3>No Courses Assigned</h3>
          <p>
            You currently do not have any assigned courses.
          </p>
        </div>
      ) : (
        <div className="instructor-course-grid">

          {courses.map((course) => (
            <div
              className="instructor-course-card"
              key={course.id}
            >

              {/* Course Header */}
              <div className="course-card-header">

                <div>
                  <span className="course-code">
                    {course.course_code}
                  </span>

                  <h2>
                    {course.course_title}
                  </h2>
                </div>

                <span
                  className={`course-status ${course.status?.toLowerCase()}`}
                >
                  {course.status}
                </span>

              </div>

              {/* Course Information */}
              <div className="course-card-info">

                <div className="course-info-item">
                  <FaCalendarAlt />
                  <div>
                    <span>Semester</span>
                    <strong>
                      {course.semester_name}{" "}
                      {course.academic_year}
                    </strong>
                  </div>
                </div>

                <div className="course-info-item">
                  <FaUsers />
                  <div>
                    <span>Students</span>
                    <strong>
                      {course.capacity -
                        course.available_seats}{" "}
                      / {course.capacity}
                    </strong>
                  </div>
                </div>

                <div className="course-info-item">
                  <FaDoorOpen />
                  <div>
                    <span>Room</span>
                    <strong>
                      {course.room}
                    </strong>
                  </div>
                </div>

                <div className="course-info-item">
                  <FaCalendarAlt />
                  <div>
                    <span>Class Day</span>
                    <strong>
                      {course.day}
                    </strong>
                  </div>
                </div>

                <div className="course-info-item">
                  <FaClock />
                  <div>
                    <span>Time</span>
                    <strong>
                      {formatTime(course.start_time)}
                      {" - "}
                      {formatTime(course.end_time)}
                    </strong>
                  </div>
                </div>

                <div className="course-info-item">
                  <FaBookOpen />
                  <div>
                    <span>Section</span>
                    <strong>
                      Section {course.section}
                    </strong>
                  </div>
                </div>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default InstructorCourses;