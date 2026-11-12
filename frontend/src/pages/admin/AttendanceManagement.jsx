
import React, { useCallback, useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaSearch,
  FaSave,
  FaSyncAlt,
  FaClipboardCheck,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import Swal from "sweetalert2";
import api from "../../api/axios";
import "../../styles/admin/attendance-management.css";

const AttendanceManagement = () => {
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const [courseOffering, setCourseOffering] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

  const [attendance, setAttendance] = useState({});
  const [remarks, setRemarks] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const getRows = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  const getErrorMessage = (error) => {
    const data = error?.response?.data;

    if (!data) return "Something went wrong. Please try again.";
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;

    return Object.entries(data)
      .map(([key, value]) => {
        return `${key}: ${
          Array.isArray(value) ? value.join(", ") : value
        }`;
      })
      .join("\n");
  };

  const getStudentName = (enrollment) => {
    if (enrollment.student_name) return enrollment.student_name;

    const student = enrollment.student;

    if (student && typeof student === "object") {
      return `${student.user?.first_name || ""} ${
        student.user?.last_name || ""
      }`.trim() || "N/A";
    }

    return "N/A";
  };

  const getStudentId = (enrollment) => {
    return (
      enrollment.student_id_code ||
      enrollment.student?.student_id ||
      "N/A"
    );
  };

  // Load course offerings
  const fetchCourseOfferings = async () => {
    try {
      const response = await api.get("course-offerings/", {
        params: {
          page: 1,
          page_size: 100,
        },
      });

      setCourseOfferings(getRows(response.data));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to load course offerings",
        text: getErrorMessage(error),
      });
    }
  };

  useEffect(() => {
    fetchCourseOfferings();
  }, []);

  // Load enrolled students and existing attendance
  const fetchAttendanceData = useCallback(async () => {
    if (!courseOffering || !attendanceDate) {
      setStudents([]);
      setAttendanceRecords([]);
      setAttendance({});
      setRemarks({});
      return;
    }

    try {
      setLoading(true);

      const [enrollmentResponse, attendanceResponse] =
        await Promise.all([
          api.get("enrollments/", {
            params: {
              course_offering: courseOffering,
              status: "ENROLLED",
              page: 1,
              page_size: 100,
            },
          }),

          api.get("attendance/", {
            params: {
              course_offering: courseOffering,
              date: attendanceDate,
              page: 1,
              page_size: 100,
            },
          }),
        ]);

      const enrollmentRows = getRows(enrollmentResponse.data);
      const attendanceRows = getRows(attendanceResponse.data);

      setStudents(enrollmentRows);
      setAttendanceRecords(attendanceRows);

      const attendanceMap = {};
      const remarksMap = {};

      enrollmentRows.forEach((enrollment) => {
        const existingRecord = attendanceRows.find(
          (record) => record.enrollment === enrollment.id ||
            record.enrollment?.id === enrollment.id
        );

        attendanceMap[enrollment.id] =
          existingRecord?.status || "PRESENT";

        remarksMap[enrollment.id] =
          existingRecord?.remarks || "";
      });

      setAttendance(attendanceMap);
      setRemarks(remarksMap);
    } catch (error) {
      console.error("Attendance loading error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed to load attendance",
        text: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }, [courseOffering, attendanceDate]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // Change attendance status
  const handleStatusChange = (enrollmentId, value) => {
    setAttendance((prev) => ({
      ...prev,
      [enrollmentId]: value,
    }));
  };

  // Change remarks
  const handleRemarksChange = (enrollmentId, value) => {
    setRemarks((prev) => ({
      ...prev,
      [enrollmentId]: value,
    }));
  };

  // Save attendance for all students
  const handleSaveAttendance = async () => {
    if (!courseOffering || !attendanceDate) {
      Swal.fire("Required", "Select a course and date.", "warning");
      return;
    }

    if (attendanceDate > new Date().toLocaleDateString("en-CA")) {
      Swal.fire(
        "Invalid date",
        "Attendance date cannot be in the future.",
        "warning"
      );
      return;
    }

    if (students.length === 0) {
      Swal.fire(
        "No students",
        "No enrolled students are available for this course.",
        "warning"
      );
      return;
    }

    const result = await Swal.fire({
      title: "Save attendance?",
      text: `Save attendance for ${students.length} students?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, save attendance",
      confirmButtonColor: "#0d6efd",
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);

      const requests = students.map((enrollment) => {
        const existingRecord = attendanceRecords.find(
          (record) => record.enrollment === enrollment.id ||
            record.enrollment?.id === enrollment.id
        );

        const payload = {
          enrollment: enrollment.id,
          date: attendanceDate,
          status: attendance[enrollment.id] || "PRESENT",
          remarks: remarks[enrollment.id] || "",
        };

        if (existingRecord) {
          return api.patch(
            `attendance/${existingRecord.id}/`,
            {
              status: payload.status,
              remarks: payload.remarks,
            }
          );
        }

        return api.post("attendance/", payload);
      });

      const results = await Promise.allSettled(requests);

      const successful = results.filter(
        (item) => item.status === "fulfilled"
      ).length;

      const failed = results.filter(
        (item) => item.status === "rejected"
      );

      await fetchAttendanceData();

      if (failed.length === 0) {
        await Swal.fire({
          icon: "success",
          title: "Attendance saved",
          text: `Attendance saved successfully for ${successful} students.`,
        });
      } else {
        const firstError = failed[0].reason;

        await Swal.fire({
          icon: "warning",
          title: "Partially saved",
          html: `
            <p>Successfully saved: ${successful}</p>
            <p>Failed: ${failed.length}</p>
            <p>Please check the API response and try again.</p>
          `,
          footer: getErrorMessage(firstError),
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: getErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset attendance selection
  const handleReset = () => {
    const resetMap = {};

    students.forEach((student) => {
      resetMap[student.id] = "PRESENT";
    });

    setAttendance(resetMap);
  };

  // Search students
  const filteredStudents = students.filter((student) => {
    const keyword = search.toLowerCase();

    return (
      getStudentName(student).toLowerCase().includes(keyword) ||
      getStudentId(student).toLowerCase().includes(keyword)
    );
  });

  // Statistics
  const presentCount = students.filter(
    (student) => attendance[student.id] === "PRESENT"
  ).length;

  const absentCount = students.filter(
    (student) => attendance[student.id] === "ABSENT"
  ).length;

  const recordedCount = attendanceRecords.length;

  return (
    <div className="attendance-management">

      {/* Page Header */}
      <div className="attendance-page-header">
        <div>
          <h2>
            <FaClipboardCheck className="me-2" />
            Attendance Management
          </h2>
          <p>Manage daily student attendance.</p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={fetchAttendanceData}
          disabled={loading || !courseOffering}
        >
          <FaSyncAlt className="me-2" />
          Refresh
        </button>
      </div>

      {/* Course and Date Selection */}
      <div className="attendance-filter-card">
        <div className="row g-3 align-items-end">

          <div className="col-lg-5 col-md-6">
            <label className="form-label">
              Select Course Offering
            </label>

            <select
              className="form-select"
              value={courseOffering}
              onChange={(e) => setCourseOffering(e.target.value)}
            >
              <option value="">Choose a course offering</option>

              {courseOfferings.map((offering) => (
                <option key={offering.id} value={offering.id}>
                  {offering.course_code} - {offering.course_title}
                  {" | Section "}
                  {offering.section}
                  {" | "}
                  {offering.semester_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-lg-4 col-md-6">
            <label className="form-label">
              <FaCalendarAlt className="me-2" />
              Attendance Date
            </label>

            <input
              type="date"
              className="form-control"
              value={attendanceDate}
              max={new Date().toLocaleDateString("en-CA")}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </div>

          <div className="col-lg-3">
            <button
              className="btn btn-primary w-100"
              onClick={fetchAttendanceData}
              disabled={!courseOffering || loading}
            >
              <FaSearch className="me-2" />
              Load Students
            </button>
          </div>

        </div>
      </div>

      {/* Statistics */}
      <div className="row g-3 mb-4">

        <div className="col-md-4">
          <div className="attendance-stat-card">
            <div className="attendance-stat-icon total">
              <FaClipboardCheck />
            </div>
            <div>
              <h6>Total Students</h6>
              <h3>{students.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="attendance-stat-card">
            <div className="attendance-stat-icon present">
              <FaCheckCircle />
            </div>
            <div>
              <h6>Present</h6>
              <h3>{presentCount}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="attendance-stat-card">
            <div className="attendance-stat-icon absent">
              <FaTimesCircle />
            </div>
            <div>
              <h6>Absent</h6>
              <h3>{absentCount}</h3>
            </div>
          </div>
        </div>

      </div>

      {/* Attendance Table */}
      <div className="attendance-table-card">

        <div className="attendance-table-header">
          <div>
            <h5>Student Attendance List</h5>
            <span>
              {recordedCount} existing attendance records
            </span>
          </div>

          <div className="attendance-search">
            <FaSearch />
            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Attendance Status</th>
                <th>Remarks</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="spinner-border text-primary" />
                    <p className="mt-2">Loading students...</p>
                  </td>
                </tr>
              ) : !courseOffering ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    Please select a course offering first.
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    No enrolled students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr key={student.id}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>{getStudentId(student)}</strong>
                    </td>

                    <td>{getStudentName(student)}</td>

                    <td>
                      <div className="attendance-status-options">

                        <label
                          className={`attendance-radio present-radio ${
                            attendance[student.id] === "PRESENT"
                              ? "selected"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            value="PRESENT"
                            checked={
                              attendance[student.id] === "PRESENT"
                            }
                            onChange={() =>
                              handleStatusChange(
                                student.id,
                                "PRESENT"
                              )
                            }
                          />
                          Present
                        </label>

                        <label
                          className={`attendance-radio absent-radio ${
                            attendance[student.id] === "ABSENT"
                              ? "selected"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            value="ABSENT"
                            checked={
                              attendance[student.id] === "ABSENT"
                            }
                            onChange={() =>
                              handleStatusChange(
                                student.id,
                                "ABSENT"
                              )
                            }
                          />
                          Absent
                        </label>

                      </div>
                    </td>

                    <td>
                      <input
                        type="text"
                        className="form-control attendance-remarks"
                        placeholder="Optional remarks"
                        value={remarks[student.id] || ""}
                        onChange={(e) =>
                          handleRemarksChange(
                            student.id,
                            e.target.value
                          )
                        }
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="attendance-table-footer">

          <div className="attendance-footer-info">
            <span>
              Present: <strong>{presentCount}</strong>
            </span>

            <span>
              Absent: <strong>{absentCount}</strong>
            </span>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={handleReset}
              disabled={loading || students.length === 0}
            >
              Reset
            </button>

            <button
              className="btn btn-primary"
              onClick={handleSaveAttendance}
              disabled={
                loading ||
                saving ||
                students.length === 0
              }
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Save Attendance
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
