import {
  FaBookOpen,
  FaClipboardCheck,
  FaGraduationCap,
  FaChartLine,
  FaArrowRight,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

const StudentDashboard = () => {
  // Temporary data (Will be replaced with API data)
  const student = {
    name: "Student",
    studentId: "STU-0001",
    department: "Computer Science & Engineering",
    semester: "Spring 2026",
  };

  const stats = [
    {
      title: "Enrolled Courses",
      value: "5",
      subtitle: "Current semester",
      icon: <FaBookOpen />,
      className: "blue",
    },
    {
      title: "Attendance",
      value: "87%",
      subtitle: "Overall attendance",
      icon: <FaClipboardCheck />,
      className: "green",
    },
    {
      title: "Semester GPA",
      value: "3.75",
      subtitle: "Current semester",
      icon: <FaGraduationCap />,
      className: "purple",
    },
    {
      title: "CGPA",
      value: "3.72",
      subtitle: "Overall academic",
      icon: <FaChartLine />,
      className: "orange",
    },
  ];

  const courses = [
    {
      code: "CSE101",
      name: "Introduction to Computer Science",
      instructor: "Dr. Rahman",
      attendance: 92,
      status: "Good",
    },
    {
      code: "CSE203",
      name: "Data Structures",
      instructor: "Mr. Hasan",
      attendance: 88,
      status: "Good",
    },
    {
      code: "CSE205",
      name: "Database Management System",
      instructor: "Ms. Akter",
      attendance: 81,
      status: "Good",
    },
    {
      code: "CSE207",
      name: "Web Engineering",
      instructor: "Dr. Karim",
      attendance: 76,
      status: "Warning",
    },
  ];

  const quickActions = [
    {
      title: "View Courses",
      description: "Check your enrolled courses",
      icon: <FaBookOpen />,
      link: "/student/courses",
    },
    {
      title: "Attendance",
      description: "Check your attendance",
      icon: <FaClipboardCheck />,
      link: "/student/attendance",
    },
    {
      title: "Results",
      description: "View your academic results",
      icon: <FaGraduationCap />,
      link: "/student/results",
    },
  ];

  return (
    <div className="student-dashboard">
      {/* Welcome Section */}
      <div className="welcome-card mb-4">
        <div className="welcome-content">
          <div>
            <span className="welcome-label">STUDENT DASHBOARD</span>
            <h2>Welcome back, {student.name}! 👋</h2>
            <p>
              Here's an overview of your academic performance and activities.
            </p>
            <div className="student-meta">
              <span>
                <FaGraduationCap /> {student.studentId}
              </span>
              <span>
                <FaBookOpen /> {student.department}
              </span>
              <span>
                <FaCalendarAlt /> {student.semester}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="row g-4 mb-4">
        {stats.map((stat) => (
          <div className="col-12 col-sm-6 col-xl-3" key={stat.title}>
            <div className="stat-card">
              <div className={`stat-icon ${stat.className}`}>{stat.icon}</div>
              <div className="stat-content">
                <span className="stat-title">{stat.title}</span>
                <h3>{stat.value}</h3>
                <small>{stat.subtitle}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="row g-4 mb-4">
        {/* Courses */}
        <div className="col-xl-8">
          <div className="dashboard-section">
            <div className="section-header">
              <div>
                <h5>My Courses</h5>
                <p>Your current semester courses</p>
              </div>
              <a href="/student/courses" className="view-all">
                View All <FaArrowRight />
              </a>
            </div>

            <div className="table-responsive">
              <table className="table course-table mb-0">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Instructor</th>
                    <th>Attendance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.code}>
                      <td>
                        <div className="course-info">
                          <div className="course-code">{course.code}</div>
                          <div>
                            <strong>{course.name}</strong>
                            <small>Current semester</small>
                          </div>
                        </div>
                      </td>
                      <td>{course.instructor}</td>
                      <td>
                        <div className="attendance-wrapper">
                          <div className="attendance-value">
                            {course.attendance}%
                          </div>
                          <div className="progress">
                            <div
                              className={`progress-bar ${
                                course.attendance >= 80 ? "good" : "warning"
                              }`}
                              style={{ width: `${course.attendance}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {course.status === "Good" ? (
                          <span className="status-badge good">
                            <FaCheckCircle /> Good
                          </span>
                        ) : (
                          <span className="status-badge warning">
                            <FaExclamationCircle /> Warning
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Academic Performance */}
        <div className="col-xl-4">
          <div className="dashboard-section performance-card">
            <div className="section-header">
              <div>
                <h5>Academic Performance</h5>
                <p>Current semester</p>
              </div>
            </div>

            <div className="gpa-display">
              <div className="gpa-circle">
                <div>
                  <strong>3.75</strong>
                  <span>/ 4.00</span>
                </div>
              </div>
              <h6>Semester GPA</h6>
              <span className="performance-label">Excellent Performance</span>
            </div>

            <div className="performance-item">
              <div>
                <span>Completed Courses</span>
                <strong>5 / 5</strong>
              </div>
              <div className="progress">
                <div
                  className="progress-bar good"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>

            <div className="performance-item">
              <div>
                <span>Attendance</span>
                <strong>87%</strong>
              </div>
              <div className="progress">
                <div
                  className="progress-bar good"
                  style={{ width: "87%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="row g-4">
        {/* Quick Actions */}
        <div className="col-lg-7">
          <div className="dashboard-section">
            <div className="section-header">
              <div>
                <h5>Quick Actions</h5>
                <p>Access your academic information</p>
              </div>
            </div>

            <div className="quick-actions">
              {quickActions.map((action) => (
                <a
                  href={action.link}
                  className="quick-action"
                  key={action.title}
                >
                  <div className="quick-action-icon">{action.icon}</div>
                  <div>
                    <strong>{action.title}</strong>
                    <span>{action.description}</span>
                  </div>
                  <FaArrowRight className="action-arrow" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="col-lg-5">
          <div className="dashboard-section">
            <div className="section-header">
              <div>
                <h5>Academic Information</h5>
                <p>Your current academic status</p>
              </div>
            </div>

            <div className="academic-info">
              <div className="info-row">
                <span>Current Semester</span>
                <strong>Spring 2026</strong>
              </div>
              <div className="info-row">
                <span>Enrolled Courses</span>
                <strong>5</strong>
              </div>
              <div className="info-row">
                <span>Total Credits</span>
                <strong>15.0</strong>
              </div>
              <div className="info-row">
                <span>Current CGPA</span>
                <strong className="cgpa">3.72</strong>
              </div>
              <div className="info-row">
                <span>Academic Status</span>
                <span className="academic-status">
                  <FaCheckCircle /> Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;