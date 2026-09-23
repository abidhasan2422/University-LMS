import {
  FaBars,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

import "../../styles/admin/admin-header.css";

const AdminHeader = () => {
  const { user } = useAuth();

  const firstName = user?.first_name || "Admin";
  const lastName = user?.last_name || "";

  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <header className="admin-header">

      {/* Left Side */}
      <div className="admin-header-left">

        <button
          type="button"
          className="admin-mobile-menu"
        >
          <FaBars />
        </button>

        <div>
          <h1>Admin Portal</h1>
          <p>University Learning Management System</p>
        </div>

      </div>

      {/* Right Side */}
      <div className="admin-header-right">

        {/* Notification */}
        <button
          type="button"
          className="admin-notification-button"
          title="Notifications"
        >
          <FaBell />
          <span className="notification-dot"></span>
        </button>

        {/* User */}
        <div className="admin-header-user">

          <div className="admin-user-icon">
            <FaUserCircle />
          </div>

          <div className="admin-user-info">
            <strong>
              {fullName}
            </strong>

            <span>
              Administrator
            </span>
          </div>

        </div>

      </div>

    </header>
  );
};

export default AdminHeader;