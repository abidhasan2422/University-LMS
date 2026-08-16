import {
  FaBook,
  FaClipboardCheck,
  FaGraduationCap,
  FaChartLine,
} from "react-icons/fa";

const StudentDashboard = () => {
  const stats = [
    {
      title: "My Courses",
      value: "0",
      icon: <FaBook />,
    },
    {
      title: "Attendance",
      value: "0%",
      icon: <FaClipboardCheck />,
    },
    {
      title: "Semester GPA",
      value: "0.00",
      icon: <FaGraduationCap />,
    },
    {
      title: "CGPA",
      value: "0.00",
      icon: <FaChartLine />,
    },
  ];

  return (
    <div>

      {/* Page Header */}
      <div className="dashboard-header mb-4">
        <div>
          <h3 className="fw-bold mb-1">
            Dashboard
          </h3>

          <p className="text-muted mb-0">
            Welcome to your student dashboard.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="row g-4">

        {stats.map((stat) => (
          <div
            className="col-12 col-sm-6 col-xl-3"
            key={stat.title}
          >
            <div className="dashboard-card">

              <div className="card-icon">
                {stat.icon}
              </div>

              <div>
                <p className="card-title mb-1">
                  {stat.title}
                </p>

                <h3 className="fw-bold mb-0">
                  {stat.value}
                </h3>
              </div>

            </div>
          </div>
        ))}

      </div>

      {/* Bottom Section */}
      <div className="row g-4 mt-1">

        <div className="col-lg-8">
          <div className="content-card">

            <div className="card-header-custom">
              <h5 className="mb-0">
                Recent Academic Activity
              </h5>
            </div>

            <div className="empty-state">
              <FaGraduationCap />

              <h6>
                No academic activity yet
              </h6>

              <p>
                Your recent courses, assessments,
                and results will appear here.
              </p>
            </div>

          </div>
        </div>

        <div className="col-lg-4">
          <div className="content-card">

            <div className="card-header-custom">
              <h5 className="mb-0">
                Quick Information
              </h5>
            </div>

            <div className="quick-info">

              <div>
                <span>Current Semester</span>
                <strong>-</strong>
              </div>

              <div>
                <span>Enrolled Courses</span>
                <strong>0</strong>
              </div>

              <div>
                <span>Attendance</span>
                <strong>0%</strong>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default StudentDashboard;