import { useEffect, useState } from "react";

import {
  FaUsers,
  FaUserTie,
  FaBookOpen,
  FaBuilding,
  FaClock,
  FaClipboardList,
  FaChartLine,
  FaArrowRight,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import "../../styles/admin/admin-dashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("admin/dashboard/");
        setDashboardData(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);

        setError(
          error.response?.data?.detail ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-section-card text-center py-5">
          <h5>Loading dashboard...</h5>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR STATE
  // =========================================================

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="admin-section-card text-center py-5">
          <h5 className="text-danger">{error}</h5>
        </div>
      </div>
    );
  }

  // =========================================================
  // API DATA
  // =========================================================

  const statistics = dashboardData?.statistics || {};
  const pending = dashboardData?.pending || {};
  const overview = dashboardData?.overview || {};

  // =========================================================
  // STATISTICS
  // =========================================================

  const stats = [
    {
      title: "Total Students",
      value: statistics.total_students ?? 0,
      subtitle: "Registered students",
      icon: <FaUsers />,
      className: "blue",
    },
    {
      title: "Total Instructors",
      value: statistics.total_instructors ?? 0,
      subtitle: "Registered instructors",
      icon: <FaUserTie />,
      className: "purple",
    },
    {
      title: "Total Courses",
      value: statistics.total_courses ?? 0,
      subtitle: "Available courses",
      icon: <FaBookOpen />,
      className: "green",
    },
    {
      title: "Departments",
      value: statistics.total_departments ?? 0,
      subtitle: "Academic departments",
      icon: <FaBuilding />,
      className: "orange",
    },
  ];

  // =========================================================
  // PENDING ACTIONS
  // =========================================================

  const pendingItems = [
    {
      title: "Instructor Approvals",
      value: pending.instructor_approvals ?? 0,
      description: "Instructor accounts waiting for approval",
      icon: <FaClock />,
      link: "/admin/instructors",
    },
  ];

  // =========================================================
  // QUICK ACTIONS
  // =========================================================

  const quickActions = [
    {
      title: "Manage Students",
      description: "View and manage student accounts",
      icon: <FaUsers />,
      link: "/admin/students",
    },
    {
      title: "Manage Instructors",
      description: "Approve and manage instructors",
      icon: <FaUserTie />,
      link: "/admin/instructors",
    },
    {
      title: "Manage Courses",
      description: "Create and manage courses",
      icon: <FaBookOpen />,
      link: "/admin/courses",
    },
    {
      title: "Manage Departments",
      description: "Manage academic departments",
      icon: <FaBuilding />,
      link: "/admin/departments",
    },
  ];

  return (
    <div className="admin-dashboard">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="admin-dashboard-header">

        <div>
          <span className="admin-dashboard-label">
            ADMIN PORTAL
          </span>

          <h1>
            Dashboard
          </h1>

          <p>
            Manage and monitor your university LMS
            from one place.
          </p>
        </div>

      </div>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="row g-4 mb-4">

        {stats.map((stat) => (
          <div
            className="col-12 col-sm-6 col-xl-3"
            key={stat.title}
          >

            <div className="admin-stat-card">

              <div
                className={`admin-stat-icon ${stat.className}`}
              >
                {stat.icon}
              </div>

              <div className="admin-stat-content">

                <span>
                  {stat.title}
                </span>

                <h3>
                  {stat.value}
                </h3>

                <small>
                  {stat.subtitle}
                </small>

              </div>

            </div>

          </div>
        ))}

      </div>


      {/* =====================================================
          PENDING ACTIONS
      ===================================================== */}

      <div className="admin-section-card mb-4">

        <div className="admin-section-header">

          <div>
            <h2>
              Pending Actions
            </h2>

            <p>
              Items that may require administrator attention.
            </p>
          </div>

        </div>


        <div className="row g-3">

          {pendingItems.map((item) => (

            <div
              className="col-12 col-md-6"
              key={item.title}
            >

              <div className="admin-pending-card">

                <div className="admin-pending-icon">
                  {item.icon}
                </div>

                <div className="admin-pending-content">

                  <span>
                    {item.title}
                  </span>

                  <strong>
                    {item.value}
                  </strong>

                  <p>
                    {item.description}
                  </p>

                </div>

                <button
                  type="button"
                  className="admin-pending-button"
                  onClick={() => navigate(item.link)}
                >
                  <FaArrowRight />
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="row g-4 mb-4">

        {/* ---------------------------------------------------
            SYSTEM OVERVIEW
        --------------------------------------------------- */}

        <div className="col-12">

          <div className="admin-section-card h-100">

            <div className="admin-section-header">

              <div>
                <h2>
                  System Overview
                </h2>

                <p>
                  Current LMS information.
                </p>
              </div>

            </div>


            <div className="admin-overview-list">

              <div className="admin-overview-item">

                <div>
                  <FaUsers />

                  <span>
                    Active Students
                  </span>
                </div>

                <strong>
                  {overview.active_students ?? 0}
                </strong>

              </div>


              <div className="admin-overview-item">

                <div>
                  <FaUserTie />

                  <span>
                    Active Instructors
                  </span>
                </div>

                <strong>
                  {overview.active_instructors ?? 0}
                </strong>

              </div>


              <div className="admin-overview-item">

                <div>
                  <FaBookOpen />

                  <span>
                    Active Courses
                  </span>
                </div>

                <strong>
                  {overview.active_courses ?? 0}
                </strong>

              </div>


              <div className="admin-overview-item">

                <div>
                  <FaChartLine />

                  <span>
                    Active Enrollments
                  </span>
                </div>

                <strong>
                  {overview.active_enrollments ?? 0}
                </strong>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <div className="admin-section-card">

        <div className="admin-section-header">

          <div>
            <h2>
              Quick Actions
            </h2>

            <p>
              Quickly access common administration tasks.
            </p>
          </div>

        </div>


        <div className="row g-3">

          {quickActions.map((action) => (

            <div
              className="col-12 col-sm-6 col-xl-3"
              key={action.title}
            >

              <button
                type="button"
                className="admin-quick-action"
                onClick={() => navigate(action.link)}
              >

                <div className="admin-quick-action-icon">
                  {action.icon}
                </div>

                <div className="admin-quick-action-content">

                  <strong>
                    {action.title}
                  </strong>

                  <span>
                    {action.description}
                  </span>

                </div>

                <FaArrowRight className="admin-quick-action-arrow" />

              </button>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;