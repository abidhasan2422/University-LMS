import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaChartPie,
} from "react-icons/fa";

import api from "../../api/axios";
import "../../styles/student/student-attendance.css";

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({
    total_classes: 0,
    present: 0,
    absent: 0,
    attendance_percentage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const [attendanceResponse, summaryResponse] = await Promise.all([
        api.get("attendance/"),
        api.get("attendance/summary/"),
      ]);

      setAttendance(attendanceResponse.data.results || []);

      setSummary(
        summaryResponse.data || {
          total_classes: 0,
          present: 0,
          absent: 0,
          attendance_percentage: 0,
        }
      );
    } catch (err) {
      console.error("Attendance loading error:", err);
      setError(
        err.response?.data?.detail || "Unable to load attendance information."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="student-page">
        <div className="attendance-loading">Loading attendance...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-page">
        <div className="attendance-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="student-page">
      <div className="page-header">
        <div>
          <h1>Attendance</h1>
          <p>Track your class attendance and academic participation.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="attendance-summary-grid">
        <div className="attendance-card">
          <div className="attendance-card-icon">
            <FaCalendarAlt />
          </div>
          <div>
            <span>Total Classes</span>
            <strong>{summary.total_classes}</strong>
          </div>
        </div>

        <div className="attendance-card">
          <div className="attendance-card-icon" style={{ color: "#047857" }}>
            <FaCheckCircle />
          </div>
          <div>
            <span>Present</span>
            <strong>{summary.present}</strong>
          </div>
        </div>

        <div className="attendance-card">
          <div className="attendance-card-icon" style={{ color: "#dc2626" }}>
            <FaTimesCircle />
          </div>
          <div>
            <span>Absent</span>
            <strong>{summary.absent}</strong>
          </div>
        </div>

        <div className="attendance-card">
          <div className="attendance-card-icon" style={{ color: "#2563eb" }}>
            <FaChartPie />
          </div>
          <div>
            <span>Attendance Rate</span>
            <strong>{summary.attendance_percentage}%</strong>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="attendance-section">
        <div className="attendance-section-header">
          <div>
            <h2>Attendance History</h2>
            <p>Your recorded attendance by class date.</p>
          </div>
        </div>

        {attendance.length === 0 ? (
          <div className="attendance-empty">
            <FaCalendarAlt />
            <h3>No Attendance Records</h3>
            <p>
              Attendance records will appear here once your instructor records
              them.
            </p>
          </div>
        ) : (
          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Course</th>
                  <th>Semester</th>
                  <th>Section</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record.id}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>
                      <div className="course-info">
                        <strong>{record.course_code}</strong>
                        <span>{record.course_title}</span>
                      </div>
                    </td>
                    <td>{record.semester_name}</td>
                    <td>{record.section}</td>
                    <td>
                      {/* FIXED SYNTAX ERROR HERE */}
                      <span
                        className={`attendance-status ${
                          record.status === "PRESENT" ? "present" : "absent"
                        }`}
                      >
                        {record.status === "PRESENT" ? (
                          <>
                            <FaCheckCircle /> Present
                          </>
                        ) : (
                          <>
                            <FaTimesCircle /> Absent
                          </>
                        )}
                      </span>
                    </td>
                    <td>{record.remarks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;