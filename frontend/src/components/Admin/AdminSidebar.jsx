import {
  FaTachometerAlt,
  FaUsers,
  FaUserTie,
  FaBuilding,
  FaCalendarAlt,
  FaBookOpen,
  FaClipboardList,
  FaClipboardCheck,
  FaFileAlt,
  FaChartBar,
  FaChartLine,
  FaUser,
  FaKey,
  FaSignOutAlt,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import "../../styles/admin/admin-sidebar.css";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <aside className="admin-sidebar">

      {/* Logo */}
      <div className="admin-sidebar-logo">
        <div className="admin-logo-icon">
          <FaBookOpen />
        </div>

        <div>
          <h2>University LMS</h2>
          <span>Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="admin-sidebar-nav">

        <p className="admin-nav-title">
          MAIN
        </p>

        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaTachometerAlt />
          <span>Dashboard</span>
        </NavLink>

        <p className="admin-nav-title">
          MANAGEMENT
        </p>

        <NavLink
          to="/admin/students"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaUsers />
          <span>Students</span>
        </NavLink>

        <NavLink
          to="/admin/instructors"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaUserTie />
          <span>Instructors</span>
        </NavLink>

        <NavLink
          to="/admin/departments"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaBuilding />
          <span>Departments</span>
        </NavLink>

        <NavLink
          to="/admin/semesters"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaCalendarAlt />
          <span>Semesters</span>
        </NavLink>

        <NavLink
          to="/admin/courses"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaBookOpen />
          <span>Courses</span>
        </NavLink>

        <NavLink
          to="/admin/course-offerings"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaClipboardList />
          <span>Course Offerings</span>
        </NavLink>

        <NavLink
          to="/admin/enrollments"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaClipboardCheck />
          <span>Enrollments</span>
        </NavLink>

        <p className="admin-nav-title">
          ACADEMIC
        </p>

        <NavLink
          to="/admin/attendance"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaClipboardCheck />
          <span>Attendance</span>
        </NavLink>

        <NavLink
          to="/admin/assessments"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaFileAlt />
          <span>Assessments</span>
        </NavLink>

        <NavLink
          to="/admin/results"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaChartBar />
          <span>Results</span>
        </NavLink>

        <NavLink
          to="/admin/reports"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaChartLine />
          <span>Reports</span>
        </NavLink>

        <p className="admin-nav-title">
          ACCOUNT
        </p>

        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaUser />
          <span>Profile</span>
        </NavLink>

        <NavLink
          to="/admin/change-password"
          className={({ isActive }) =>
            `admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FaKey />
          <span>Change Password</span>
        </NavLink>

      </nav>

      {/* Logout */}
      <div className="admin-sidebar-bottom">

        <button
          className="admin-logout-button"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
};

export default AdminSidebar;