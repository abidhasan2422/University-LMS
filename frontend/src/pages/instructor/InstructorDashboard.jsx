import { useEffect, useState } from "react";
import {
  FaBookOpen,
  FaUserGraduate,
  FaCheckCircle,
  FaCalendarAlt,
  FaDoorOpen,
} from "react-icons/fa";

import api from "../../api/axios";
import "../../styles/instructor/instructor-dashboard.css";

function InstructorDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("instructors/dashboard/");
        setDashboard(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load instructor dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="instructor-dashboard-loading">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="instructor-dashboard-error">
        <p>{error}</p>
      </div>
    );
  }

  const instructor = dashboard?.instructor;
  const statistics = dashboard?.statistics;
  const courses = dashboard?.courses || [];

  return (
    <div className="instructor-dashboard">

      {/* =========================================
          Dashboard Header
      ========================================== */}

      <div className="dashboard-header">
        <div>
          <h1>Instructor Dashboard</h1>
          <p>
            Manage your courses and academic activities.
          </p>
        </div>

        <div className="welcome-section">
          <div className="welcome-avatar">
            {instructor?.full_name?.charAt(0)?.toUpperCase()}
          </div>

          <div>
            <span>Welcome back</span>
            <strong>{instructor?.full_name}</strong>
          </div>
        </div>
      </div>


      {/* =========================================
          Statistics
      ========================================== */}

      <div className="dashboard-statistics">

        {/* Total Courses */}

        <div className="stat-card">
          <div className="stat-icon courses-icon">
            <FaBookOpen />
          </div>

          <div className="stat-content">
            <span>Total Courses</span>
            <h2>{statistics?.total_courses || 0}</h2>
          </div>
        </div>


        {/* Total Students */}

        <div className="stat-card">
          <div className="stat-icon students-icon">
            <FaUserGraduate />
          </div>

          <div className="stat-content">
            <span>Total Students</span>
            <h2>{statistics?.total_students || 0}</h2>
          </div>
        </div>


        {/* Active Courses */}

        <div className="stat-card">
          <div className="stat-icon active-icon">
            <FaCheckCircle />
          </div>

          <div className="stat-content">
            <span>Active Courses</span>
            <h2>{statistics?.active_courses || 0}</h2>
          </div>
        </div>

      </div>


      {/* =========================================
          My Courses
      ========================================== */}

      <div className="courses-section">

        <div className="section-header">
          <div>
            <h2>My Courses</h2>
            <p>Courses currently assigned to you.</p>
          </div>

          <span className="course-count">
            {courses.length} Course{courses.length !== 1 ? "s" : ""}
          </span>
        </div>


        {/* Course List */}

        {courses.length === 0 ? (
          <div className="empty-courses">
            <FaBookOpen />
            <h3>No Courses Assigned</h3>
            <p>
              You currently have no courses assigned to you.
            </p>
          </div>
        ) : (
          <div className="course-list">

            {courses.map((course) => (
              <div className="course-card" key={course.id}>

                {/* Course Header */}

                <div className="course-card-header">

                  <div className="course-title">
                    <div className="course-icon">
                      <FaBookOpen />
                    </div>

                    <div>
                      <span className="course-code">
                        {course.course_code}
                      </span>

                      <h3>{course.course_title}</h3>
                    </div>
                  </div>

                  <span
                    className={`course-status ${course.status?.toLowerCase()}`}
                  >
                    {course.status}
                  </span>

                </div>


                {/* Course Information */}

                <div className="course-information">

                  <div className="course-info-item">
                    <FaCalendarAlt />

                    <div>
                      <span>Semester</span>
                      <strong>
                        {course.semester} {course.academic_year}
                      </strong>
                    </div>
                  </div>


                  <div className="course-info-item">
                    <FaUserGraduate />

                    <div>
                      <span>Students</span>
                      <strong>
                        {course.student_count}
                      </strong>
                    </div>
                  </div>


                  <div className="course-info-item">
                    <FaDoorOpen />

                    <div>
                      <span>Room</span>
                      <strong>
                        {course.room || "Not assigned"}
                      </strong>
                    </div>
                  </div>


                  <div className="course-info-item">

                    <FaCalendarAlt />

                    <div>
                      <span>Schedule</span>

                      <strong>
                        {course.day || "Not scheduled"}
                      </strong>

                      {course.start_time && course.end_time && (
                        <small>
                          {course.start_time} - {course.end_time}
                        </small>
                      )}
                    </div>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default InstructorDashboard;