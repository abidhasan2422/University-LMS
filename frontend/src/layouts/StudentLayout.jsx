import { useState } from "react";
import { Outlet } from "react-router-dom";

import StudentSidebar from "../components/student/StudentSidebar";
import StudentNavbar from "../components/student/StudentNavbar";

import "../styles/student-layout.css";

const StudentLayout = () => {
  const [collapsed, setCollapsed] =
    useState(false);

  const toggleSidebar = () => {
    setCollapsed((previous) => !previous);
  };

  return (
    <div
      className={`student-layout ${
        collapsed ? "sidebar-collapsed" : ""
      }`}
    >

      <StudentSidebar
        collapsed={collapsed}
        onToggle={toggleSidebar}
      />

      <div className="student-main">

        <StudentNavbar
          onToggleSidebar={toggleSidebar}
        />

        <main className="student-content">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default StudentLayout;