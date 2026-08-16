import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaBook,
  FaClipboardCheck,
  FaChartBar,
  FaGraduationCap,
  FaLock,
} from "react-icons/fa";

const StudentSidebar = ({ collapsed, onToggle }) => {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/student/dashboard",
      icon: <FaHome />,
    },
    {
      name: "My Profile",
      path: "/student/profile",
      icon: <FaUser />,
    },
    {
      name: "My Courses",
      path: "/student/courses",
      icon: <FaBook />,
    },
    {
      name: "Attendance",
      path: "/student/attendance",
      icon: <FaClipboardCheck />,
    },
    {
      name: "Assessments",
      path: "/student/assessments",
      icon: <FaChartBar />,
    },
    {
      name: "Results",
      path: "/student/results",
      icon: <FaGraduationCap />,
    },
    {
      name: "GPA / CGPA",
      path: "/student/academic",
      icon: <FaGraduationCap />,
    },
    {
      name: "Change Password",
      path: "/student/change-password",
      icon: <FaLock />,
    },
  ];

  return (
    <aside
      className={`student-sidebar ${
        collapsed ? "collapsed" : ""
      }`}
    >
      {/* Logo */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <FaGraduationCap />
        </div>

        {!collapsed && (
          <div>
            <h5 className="mb-0">LMS</h5>
            <small>Student Portal</small>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {!collapsed && (
          <div className="menu-label">
            MAIN MENU
          </div>
        )}

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="sidebar-icon">
              {item.icon}
            </span>

            {!collapsed && (
              <span>{item.name}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default StudentSidebar;