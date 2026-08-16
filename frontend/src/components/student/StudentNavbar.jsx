import { FaBars, FaBell, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const StudentNavbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="student-navbar">

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
            className="user-menu dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
          >
            <FaUserCircle className="user-icon" />

            <span>
              {user?.first_name || "Student"}
            </span>
          </button>

          <ul className="dropdown-menu dropdown-menu-end">

            <li>
              <NavItem
                label="Profile"
                path="/student/profile"
              />
            </li>

            <li>
              <hr className="dropdown-divider" />
            </li>

            <li>
              <button
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

const NavItem = ({ label, path }) => {
  return (
    <a
      href={path}
      className="dropdown-item"
    >
      {label}
    </a>
  );
};

export default StudentNavbar;