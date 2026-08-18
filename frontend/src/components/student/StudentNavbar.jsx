import { FaBars, FaBell, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const StudentNavbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="student-navbar">
      {/* Left */}
      <div className="navbar-left">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggleSidebar}
        >
          <FaBars />
        </button>

        <div>
          <h5 className="mb-0">
            Student Portal
          </h5>

          <small className="text-muted">
            Manage your academic information
          </small>
        </div>
      </div>

      {/* Right */}
      <div className="navbar-right">

        {/* Notification */}
        <button
          type="button"
          className="notification-btn"
        >
          <FaBell />
          <span className="notification-dot"></span>
        </button>

        {/* User */}
        <div className="dropdown">
          <button
            type="button"
            className="user-menu dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <FaUserCircle className="user-icon" />

            <span>
              {user?.first_name || "Student"}
            </span>
          </button>

          <ul className="dropdown-menu dropdown-menu-end">

            <li>
              <Link
                to="/student/profile"
                className="dropdown-item"
              >
                Profile
              </Link>
            </li>

            <li>
              <hr className="dropdown-divider" />
            </li>

            <li>
              <button
                type="button"
                className="dropdown-item text-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>

          </ul>
        </div>

      </div>
    </nav>
  );
};

export default StudentNavbar;