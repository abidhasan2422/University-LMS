import { NavLink, Outlet } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBookOpen,
  FaClipboardCheck,
  FaFileAlt,
  FaChartBar,
  FaUser,
  FaKey,
  FaChalkboardTeacher,
} from "react-icons/fa";

import "../styles/instructor/instructor-layout.css";

function InstructorLayout() {
  return (
    <div className="instructor-layout">
      {/* Sidebar */}
      <aside className="instructor-sidebar">

        {/* Logo / Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <FaChalkboardTeacher />
          </div>

          <div>
            <h2>Instructor Portal</h2>
            <span>University LMS</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">

          <NavLink to="/instructor/dashboard">
            <FaTachometerAlt />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/instructor/courses">
            <FaBookOpen />
            <span>My Courses</span>
          </NavLink>

          <NavLink to="/instructor/attendance">
            <FaClipboardCheck />
            <span>Attendance</span>
          </NavLink>

          <NavLink to="/instructor/assessments">
            <FaFileAlt />
            <span>Assessments</span>
          </NavLink>

          <NavLink to="/instructor/results">
            <FaChartBar />
            <span>Results</span>
          </NavLink>

          <NavLink to="/instructor/profile">
            <FaUser />
            <span>Profile</span>
          </NavLink>

          <NavLink to="/instructor/change-password">
            <FaKey />
            <span>Change Password</span>
          </NavLink>

        </nav>

      </aside>

      {/* Main Content */}
      <main className="instructor-main">
        <Outlet />
      </main>
    </div>
  );
}

export default InstructorLayout;