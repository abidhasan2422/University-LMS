import {
  FaClipboardCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaBookOpen,
  FaFlask,
  FaArrowRight,
} from "react-icons/fa";

const StudentAttendance = () => {
  // Temporary data.
  // Later this will come from the Django Attendance API.
  const courses = [
    {
      code: "CSE101",
      title: "Introduction to Computer Science",
      type: "REGULAR",
      total: 20,
      present: 18,
      absent: 2,
    },
    {
      code: "CSE203",
      title: "Data Structures",
      type: "REGULAR",
      total: 18,
      present: 16,
      absent: 2,
    },
    {
      code: "CSE205",
      title: "Database Management System",
      type: "REGULAR",
      total: 22,
      present: 18,
      absent: 4,
    },
    {
      code: "CSE208",
      title: "Web Engineering Lab",
      type: "LAB",
      total: 15,
      present: 12,
      absent: 3,
    },
  ];

  // Calculate course attendance.
  const coursesWithPercentage = courses.map((course) => ({
    ...course,
    percentage:
      course.total > 0
        ? ((course.present / course.total) * 100).toFixed(1)
        : "0.0",
  }));

  // Overall attendance.
  const totalClasses = courses.reduce(
    (total, course) => total + course.total,
    0
  );

  const totalPresent = courses.reduce(
    (total, course) => total + course.present,
    0
  );

  const totalAbsent = courses.reduce(
    (total, course) => total + course.absent,
    0
  );

  const overallPercentage =
    totalClasses > 0
      ? ((totalPresent / totalClasses) * 100).toFixed(1)
      : "0.0";

  // Attendance status.
  const getAttendanceStatus = (percentage) => {
    const value = Number(percentage);

    if (value >= 80) {
      return {
        label: "Good",
        className: "good",
        icon: <FaCheckCircle />,
      };
    }

    if (value >= 70) {
      return {
        label: "Warning",
        className: "warning",
        icon: <FaExclamationTriangle />,
      };
    }

    return {
      label: "Critical",
      className: "critical",
      icon: <FaTimesCircle />,
    };
  };

  const overallStatus = getAttendanceStatus(
    overallPercentage
  );

  return (
    <div className="student-attendance">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="attendance-page-header mb-4">

        <span className="attendance-label">
          STUDENT PORTAL
        </span>

        <h2>Attendance</h2>

        <p>
          Track your attendance across all enrolled
          courses.
        </p>

      </div>

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}

      <div className="row g-4 mb-4">

        {/* Overall Attendance */}

        <div className="col-md-4">

          <div className="attendance-summary-card">

            <div className="attendance-summary-icon blue">
              <FaClipboardCheck />
            </div>

            <div className="attendance-summary-content">

              <span>
                Overall Attendance
              </span>

              <div className="attendance-percentage">
                {overallPercentage}%
              </div>

              <div
                className={`attendance-status ${overallStatus.className}`}
              >
                {overallStatus.icon}
                {overallStatus.label}
              </div>

            </div>

          </div>

        </div>

        {/* Present */}

        <div className="col-md-4">

          <div className="attendance-summary-card">

            <div className="attendance-summary-icon green">
              <FaCheckCircle />
            </div>

            <div className="attendance-summary-content">

              <span>
                Classes Attended
              </span>

              <div className="attendance-number">
                {totalPresent}
              </div>

              <small>
                Out of {totalClasses} classes
              </small>

            </div>

          </div>

        </div>

        {/* Absent */}

        <div className="col-md-4">

          <div className="attendance-summary-card">

            <div className="attendance-summary-icon red">
              <FaTimesCircle />
            </div>

            <div className="attendance-summary-content">

              <span>
                Classes Missed
              </span>

              <div className="attendance-number">
                {totalAbsent}
              </div>

              <small>
                Total absent classes
              </small>

            </div>

          </div>

        </div>

      </div>

      {/* =========================================
          COURSE-WISE ATTENDANCE
      ========================================= */}

      <div className="attendance-section mb-4">

        <div className="attendance-section-header">

          <div>

            <h5>
              Course-wise Attendance
            </h5>

            <p>
              Attendance summary for your current
              semester courses.
            </p>

          </div>

        </div>

        <div className="table-responsive">

          <table className="table attendance-table mb-0">

            <thead>

              <tr>
                <th>Course</th>
                <th>Type</th>
                <th>Total Classes</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Attendance</th>
                <th>Status</th>
                <th></th>
              </tr>

            </thead>

            <tbody>

              {coursesWithPercentage.map((course) => {

                const status = getAttendanceStatus(
                  course.percentage
                );

                return (
                  <tr key={course.code}>

                    {/* Course */}

                    <td>

                      <div className="attendance-course">

                        <div className="attendance-course-icon">

                          {course.type === "LAB" ? (
                            <FaFlask />
                          ) : (
                            <FaBookOpen />
                          )}

                        </div>

                        <div>

                          <strong>
                            {course.code}
                          </strong>

                          <span>
                            {course.title}
                          </span>

                        </div>

                      </div>

                    </td>

                    {/* Type */}

                    <td>

                      <span
                        className={`attendance-course-type ${
                          course.type === "LAB"
                            ? "lab"
                            : "regular"
                        }`}
                      >
                        {course.type === "LAB"
                          ? "Lab"
                          : "Regular"}
                      </span>

                    </td>

                    {/* Total */}

                    <td>
                      {course.total}
                    </td>

                    {/* Present */}

                    <td>

                      <span className="present-count">
                        <FaCheckCircle />
                        {course.present}
                      </span>

                    </td>

                    {/* Absent */}

                    <td>

                      <span className="absent-count">
                        <FaTimesCircle />
                        {course.absent}
                      </span>

                    </td>

                    {/* Percentage */}

                    <td>

                      <div className="course-attendance-progress">

                        <div className="course-attendance-value">
                          {course.percentage}%
                        </div>

                        <div className="progress">

                          <div
                            className={`progress-bar ${status.className}`}
                            style={{
                              width: `${course.percentage}%`,
                            }}
                          ></div>

                        </div>

                      </div>

                    </td>

                    {/* Status */}

                    <td>

                      <span
                        className={`attendance-status ${status.className}`}
                      >
                        {status.icon}
                        {status.label}
                      </span>

                    </td>

                    {/* Details */}

                    <td>

                      <button
                        type="button"
                        className="attendance-details-btn"
                      >
                        <FaArrowRight />
                      </button>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </div>

      {/* =========================================
          ATTENDANCE STATUS GUIDE
      ========================================= */}

      <div className="attendance-section">

        <div className="attendance-section-header">

          <div>

            <h5>
              Attendance Status
            </h5>

            <p>
              Understand your attendance status.
            </p>

          </div>

        </div>

        <div className="attendance-status-guide">

          <div className="status-guide-item">

            <span className="status-guide-icon good">
              <FaCheckCircle />
            </span>

            <div>
              <strong>Good</strong>
              <span>
                Attendance is 80% or above.
              </span>
            </div>

          </div>

          <div className="status-guide-item">

            <span className="status-guide-icon warning">
              <FaExclamationTriangle />
            </span>

            <div>
              <strong>Warning</strong>
              <span>
                Attendance is between 70% and 79%.
              </span>
            </div>

          </div>

          <div className="status-guide-item">

            <span className="status-guide-icon critical">
              <FaTimesCircle />
            </span>

            <div>
              <strong>Critical</strong>
              <span>
                Attendance is below 70%.
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default StudentAttendance;