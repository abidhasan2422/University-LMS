import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaBookOpen,
  FaUsers,
  FaDoorOpen,
  FaCalendarAlt,
  FaClock,
  FaClipboardCheck,
  FaFileAlt,
  FaChartBar,
} from "react-icons/fa";

import api from "../../api/axios";
import "../../styles/instructor/instructor-course-details.css";

function InstructorCourseDetails() {
  const { courseOfferingId } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourse();
  }, [courseOfferingId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `course-offering/${courseOfferingId}/`
      );

      setCourse(response.data);
    } catch (error) {
      console.error("Failed to fetch course:", error);

      setError(
        error.response?.data?.detail ||
          "Failed to load course information."
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
      <div className="instructor-course-details-page">
        <div className="course-details-loading">
          Loading course information...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="instructor-course-details-page">
        <div className="course-details-error">
          {error}
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="instructor-course-details-page">

      {/* Header */}
      <div className="course-details-header">
        <div className="course-details-title">
          <div className="course-details-icon">
            <FaBookOpen />
          </div>

          <div>
            <span>{course.course_code}</span>

            <h1>{course.course_title}</h1>

            <p>
              Section {course.section} ·{" "}
              {course.semester_name} {course.academic_year}
            </p>
          </div>
        </div>

        <span
          className={`course-status ${course.status?.toLowerCase()}`}
        >
          {course.status}
        </span>
      </div>

      {/* Course Information */}
      <div className="course-details-card">
        <div className="course-details-card-header">
          <h2>Course Information</h2>
        </div>

        <div className="course-details-info-grid">

          <div className="course-details-info-item">
            <FaCalendarAlt />
            <div>
              <span>Semester</span>
              <strong>
                {course.semester_name} {course.academic_year}
              </strong>
            </div>
          </div>

          <div className="course-details-info-item">
            <FaUsers />
            <div>
              <span>Students</span>
              <strong>
                {course.capacity - course.available_seats}
                {" / "}
                {course.capacity}
              </strong>
            </div>
          </div>

          <div className="course-details-info-item">
            <FaDoorOpen />
            <div>
              <span>Room</span>
              <strong>{course.room}</strong>
            </div>
          </div>

          <div className="course-details-info-item">
            <FaCalendarAlt />
            <div>
              <span>Class Day</span>
              <strong>{course.day}</strong>
            </div>
          </div>

          <div className="course-details-info-item">
            <FaClock />
            <div>
              <span>Class Time</span>
              <strong>
                {formatTime(course.start_time)}
                {" - "}
                {formatTime(course.end_time)}
              </strong>
            </div>
          </div>

          <div className="course-details-info-item">
            <FaBookOpen />
            <div>
              <span>Section</span>
              <strong>Section {course.section}</strong>
            </div>
          </div>

        </div>
      </div>

      {/* Management */}
      <div className="course-management-card">
        <div className="course-details-card-header">
          <h2>Course Management</h2>
          <p>
            Manage academic activities for this course.
          </p>
        </div>

        <div className="course-management-grid">

          <button className="course-management-item">
            <FaUsers />
            <div>
              <strong>Students</strong>
              <span>View enrolled students</span>
            </div>
          </button>

          <button className="course-management-item">
            <FaClipboardCheck />
            <div>
              <strong>Attendance</strong>
              <span>Take and manage attendance</span>
            </div>
          </button>

          <button className="course-management-item">
            <FaFileAlt />
            <div>
              <strong>Assessments</strong>
              <span>Manage course assessments</span>
            </div>
          </button>

          <button className="course-management-item">
            <FaChartBar />
            <div>
              <strong>Results</strong>
              <span>Manage student results</span>
            </div>
          </button>

        </div>
      </div>

    </div>
  );
}

export default InstructorCourseDetails;