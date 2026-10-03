import { useEffect, useState } from "react";

import {
  FaEye,
  FaSearch,
  FaCheck,
  FaTimes,
  FaSyncAlt,
  FaIdCard,
} from "react-icons/fa";

import api from "../../api/axios";
import "../../styles/admin/student-management.css";

const StudentManagement = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [students, setStudents] = useState([]);

  const [search, setSearch] = useState("");
  const [admissionStatus, setAdmissionStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  // Approval modal state
  const [approvalStudent, setApprovalStudent] = useState(null);
  const [suggestedStudentId, setSuggestedStudentId] = useState("");
  const [customStudentId, setCustomStudentId] = useState("");

  const [generatingId, setGeneratingId] = useState(false);

  // =========================================================
  // FETCH STUDENTS
  // =========================================================

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (admissionStatus) {
        params.admission_status = admissionStatus;
      }

      const response = await api.get("students/", {
        params,
      });

      setStudents(response.data.results || []);

      const totalCount = response.data.count || 0;

      const pageSize =
        response.data.results?.length || 10;

      setTotalPages(
        pageSize > 0
          ? Math.ceil(totalCount / pageSize)
          : 1
      );
    } catch (error) {
      console.error(
        "Failed to fetch students:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Failed to load students."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH WHEN FILTERS CHANGE
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 400);

    return () => clearTimeout(timer);
  }, [
    search,
    admissionStatus,
    page,
  ]);

  // =========================================================
  // OPEN APPROVAL MODAL
  // =========================================================

  const handleOpenApproval = async (student) => {
    try {
      setApprovalStudent(student);
      setSuggestedStudentId("");
      setCustomStudentId("");
      setGeneratingId(true);

      const response = await api.post(
        `students/${student.id}/generate-student-id/`,
        {}
      );

      setSuggestedStudentId(
        response.data.suggested_student_id || ""
      );
    } catch (error) {
      console.error(
        "Failed to generate student ID:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to generate Student ID."
      );

      setApprovalStudent(null);
    } finally {
      setGeneratingId(false);
    }
  };

  // =========================================================
  // REGENERATE STUDENT ID
  // =========================================================

  const handleGenerateStudentId = async () => {
    if (!approvalStudent) {
      return;
    }

    try {
      setGeneratingId(true);

      const response = await api.post(
        `students/${approvalStudent.id}/generate-student-id/`,
        {}
      );

      setSuggestedStudentId(
        response.data.suggested_student_id || ""
      );

      setCustomStudentId("");
    } catch (error) {
      console.error(
        "Failed to generate student ID:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to generate Student ID."
      );
    } finally {
      setGeneratingId(false);
    }
  };

  // =========================================================
  // CONFIRM APPROVAL
  // =========================================================

  const handleConfirmApproval = async () => {
    if (!approvalStudent) {
      return;
    }

    const finalStudentId =
      customStudentId.trim() ||
      suggestedStudentId;

    if (!finalStudentId) {
      alert(
        "Please generate or enter a Student ID."
      );

      return;
    }

    try {
      setActionLoading(true);

      await api.post(
        `students/${approvalStudent.id}/approve/`,
        {
          student_id: finalStudentId,
        }
      );

      alert(
        `Student approved successfully.\nStudent ID: ${finalStudentId}`
      );

      setApprovalStudent(null);
      setSuggestedStudentId("");
      setCustomStudentId("");

      setSelectedStudent(null);

      await fetchStudents();
    } catch (error) {
      console.error(
        "Failed to approve student:",
        error
      );

      const errorData = error.response?.data;

      if (typeof errorData === "string") {
        alert(errorData);
      } else if (errorData?.detail) {
        alert(errorData.detail);
      } else {
        alert("Failed to approve student.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // REJECT STUDENT
  // =========================================================

  const handleReject = async (student) => {
    const confirmed = window.confirm(
      `Are you sure you want to reject ${student.full_name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      await api.post(
        `students/${student.id}/reject/`,
        {}
      );

      alert("Student rejected successfully.");

      setSelectedStudent(null);

      await fetchStudents();
    } catch (error) {
      console.error(
        "Failed to reject student:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to reject student."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const getAdmissionStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "approved";

      case "PENDING":
        return "pending";

      case "REJECTED":
        return "rejected";

      default:
        return "";
    }
  };

  // =========================================================
  // PAGE CHANGE
  // =========================================================

  const handlePageChange = (newPage) => {
    if (
      newPage < 1 ||
      newPage > totalPages
    ) {
      return;
    }

    setPage(newPage);
  };

  // =========================================================
  // RESET FILTERS
  // =========================================================

  const handleReset = () => {
    setSearch("");
    setAdmissionStatus("");
    setPage(1);
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="admin-student-management">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="student-page-header">
        <div>
          <span className="student-page-label">
            STUDENT MANAGEMENT
          </span>

          <h1>
            Students
          </h1>

          <p>
            Manage and monitor university students.
          </p>
        </div>
      </div>

      {/* =====================================================
          FILTER SECTION
      ===================================================== */}

      <div className="student-filter-card">

        <div className="student-search-box">
          <FaSearch />

          <input
            type="text"
            placeholder="Search by student ID, name, email or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className="student-status-filter"
          value={admissionStatus}
          onChange={(e) => {
            setAdmissionStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">
            All Admission Status
          </option>

          <option value="PENDING">
            Pending
          </option>

          <option value="APPROVED">
            Approved
          </option>

          <option value="REJECTED">
            Rejected
          </option>
        </select>

        <button
          type="button"
          className="student-reset-button"
          onClick={handleReset}
          title="Reset filters"
        >
          <FaSyncAlt />
          Reset
        </button>
      </div>

      {/* =====================================================
          STUDENT TABLE
      ===================================================== */}

      <div className="student-table-card">

        <div className="student-table-header">
          <div>
            <h2>
              Student List
            </h2>

            <p>
              All registered student records.
            </p>
          </div>

          <span className="student-count">
            {students.length} students
          </span>
        </div>

        {/* ERROR */}

        {error && (
          <div className="student-error">
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="student-loading">
            Loading students...
          </div>
        ) : students.length === 0 ? (
          <div className="student-empty">
            No students found.
          </div>
        ) : (
          <div className="student-table-wrapper">

            <table className="student-table">

              <thead>
                <tr>
                  <th>
                    Student ID
                  </th>

                  <th>
                    Student
                  </th>

                  <th>
                    Department
                  </th>

                  <th>
                    Semester
                  </th>

                  <th>
                    Admission Status
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>

                    <td>
                      <span className="student-id">
                        {student.student_id ||
                          "Not assigned"}
                      </span>
                    </td>

                    <td>
                      <div className="student-name-cell">

                        <div className="student-avatar">
                          {student.full_name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {student.full_name}
                          </strong>

                          <small>
                            Student #{student.id}
                          </small>
                        </div>

                      </div>
                    </td>

                    <td>
                      {student.department_name || "-"}
                    </td>

                    <td>
                      {student.semester_name || "-"}
                    </td>

                    <td>
                      <span
                        className={`student-status-badge admission ${getAdmissionStatusClass(
                          student.admission_status
                        )}`}
                      >
                        {student.admission_status}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`student-status-badge ${student.status?.toLowerCase()}`}
                      >
                        {student.status}
                      </span>
                    </td>

                    <td>
                      <div className="student-action-buttons">

                        {/* VIEW */}

                        <button
                          type="button"
                          className="student-action view"
                          title="View student"
                          onClick={() =>
                            setSelectedStudent(student)
                          }
                        >
                          <FaEye />
                        </button>

                        {/* APPROVE */}

                        {student.admission_status ===
                          "PENDING" && (
                          <>
                            <button
                              type="button"
                              className="student-action approve"
                              title="Approve student"
                              disabled={actionLoading}
                              onClick={() =>
                                handleOpenApproval(student)
                              }
                            >
                              <FaCheck />
                            </button>

                            {/* REJECT */}

                            <button
                              type="button"
                              className="student-action reject"
                              title="Reject student"
                              disabled={actionLoading}
                              onClick={() =>
                                handleReject(student)
                              }
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

        {/* =================================================
            PAGINATION
        ================================================= */}

        {!loading &&
          students.length > 0 &&
          totalPages > 1 && (

          <div className="student-pagination">

            <button
              type="button"
              disabled={page === 1}
              onClick={() =>
                handlePageChange(page - 1)
              }
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() =>
                handlePageChange(page + 1)
              }
            >
              Next
            </button>

          </div>
        )}

      </div>

      {/* =====================================================
          STUDENT DETAILS MODAL
      ===================================================== */}

      {selectedStudent && (
        <div
          className="student-modal-overlay"
          onClick={() =>
            setSelectedStudent(null)
          }
        >

          <div
            className="student-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="student-modal-header">

              <div>
                <h2>
                  Student Details
                </h2>

                <p>
                  View complete student information
                </p>
              </div>

              <button
                type="button"
                className="student-modal-close"
                onClick={() =>
                  setSelectedStudent(null)
                }
              >
                <FaTimes />
              </button>

            </div>

            {/* BODY */}

            <div className="student-modal-body">

              {/* PROFILE */}

              <div className="student-detail-profile">

                <div className="student-detail-avatar">
                  {selectedStudent.full_name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <div>
                  <h3>
                    {selectedStudent.full_name}
                  </h3>

                  <p>
                    {selectedStudent.student_id ||
                      "Student ID not assigned"}
                  </p>
                </div>

              </div>

              {/* =================================================
                  PERSONAL INFORMATION
              ================================================= */}

              <div className="student-detail-section">

                <h4>
                  Personal Information
                </h4>

                <div className="student-detail-grid">

                  <div>
                    <span>
                      Full Name
                    </span>

                    <strong>
                      {selectedStudent.full_name ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Student ID
                    </span>

                    <strong>
                      {selectedStudent.student_id ||
                        "Not assigned"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Date of Birth
                    </span>

                    <strong>
                      {selectedStudent.date_of_birth ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Gender
                    </span>

                    <strong>
                      {selectedStudent.gender ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Blood Group
                    </span>

                    <strong>
                      {selectedStudent.blood_group ||
                        "-"}
                    </strong>
                  </div>

                </div>

              </div>

              {/* =================================================
                  ACADEMIC INFORMATION
              ================================================= */}

              <div className="student-detail-section">

                <h4>
                  Academic Information
                </h4>

                <div className="student-detail-grid">

                  <div>
                    <span>
                      Department
                    </span>

                    <strong>
                      {selectedStudent.department_name ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Semester
                    </span>

                    <strong>
                      {selectedStudent.semester_name ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Admission Year
                    </span>

                    <strong>
                      {selectedStudent.admission_year ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Session
                    </span>

                    <strong>
                      {selectedStudent.session ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Admission Status
                    </span>

                    <strong>
                      {selectedStudent.admission_status ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Student Status
                    </span>

                    <strong>
                      {selectedStudent.status ||
                        "-"}
                    </strong>
                  </div>

                </div>

              </div>

              {/* =================================================
                  GUARDIAN INFORMATION
              ================================================= */}

              <div className="student-detail-section">

                <h4>
                  Guardian Information
                </h4>

                <div className="student-detail-grid">

                  <div>
                    <span>
                      Guardian Name
                    </span>

                    <strong>
                      {selectedStudent.guardian_name ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Guardian Phone
                    </span>

                    <strong>
                      {selectedStudent.guardian_phone ||
                        "-"}
                    </strong>
                  </div>

                </div>

              </div>

              {/* =================================================
                  ADDRESS INFORMATION
              ================================================= */}

              <div className="student-detail-section">

                <h4>
                  Address Information
                </h4>

                <div className="student-detail-address">

                  <div>
                    <span>
                      Present Address
                    </span>

                    <strong>
                      {selectedStudent.present_address ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Permanent Address
                    </span>

                    <strong>
                      {selectedStudent.permanent_address ||
                        "-"}
                    </strong>
                  </div>

                </div>

              </div>

              {/* =================================================
                  ACTIONS
              ================================================= */}

              {selectedStudent.admission_status ===
                "PENDING" && (

                <div className="student-modal-actions">

                  <button
                    type="button"
                    className="student-modal-approve"
                    disabled={actionLoading}
                    onClick={() =>
                      handleOpenApproval(
                        selectedStudent
                      )
                    }
                  >
                    <FaCheck />
                    Approve Student
                  </button>

                  <button
                    type="button"
                    className="student-modal-reject"
                    disabled={actionLoading}
                    onClick={() =>
                      handleReject(
                        selectedStudent
                      )
                    }
                  >
                    <FaTimes />
                    Reject Student
                  </button>

                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          APPROVE STUDENT MODAL
      ===================================================== */}

      {approvalStudent && (
        <div
          className="student-modal-overlay"
          onClick={() => {
            if (
              !actionLoading &&
              !generatingId
            ) {
              setApprovalStudent(null);
            }
          }}
        >

          <div
            className="student-approval-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="student-modal-header">

              <div>
                <h2>
                  Approve Student
                </h2>

                <p>
                  Review and assign the Student ID
                  before approval.
                </p>
              </div>

              <button
                type="button"
                className="student-modal-close"
                disabled={
                  actionLoading ||
                  generatingId
                }
                onClick={() =>
                  setApprovalStudent(null)
                }
              >
                <FaTimes />
              </button>

            </div>

            {/* BODY */}

            <div className="student-modal-body">

              {/* STUDENT INFORMATION */}

              <div className="approval-student-info">

                <div className="student-detail-avatar">
                  {approvalStudent.full_name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <div>
                  <h3>
                    {approvalStudent.full_name}
                  </h3>

                  <p>
                    {approvalStudent.department_name}
                    {" • "}
                    {approvalStudent.semester_name}
                  </p>
                </div>

              </div>

              {/* STUDENT ID */}

              <div className="student-id-section">

                <label>
                  Student ID
                </label>

                <div className="student-id-input-wrapper">

                  <FaIdCard />

                  <input
                    type="text"
                    value={
                      customStudentId ||
                      suggestedStudentId
                    }
                    placeholder={
                      generatingId
                        ? "Generating Student ID..."
                        : "Student ID"
                    }
                    onChange={(e) =>
                      setCustomStudentId(
                        e.target.value
                      )
                    }
                    disabled={
                      generatingId ||
                      actionLoading
                    }
                  />

                </div>

                <small>
                  The suggested ID is generated
                  automatically based on the
                  admission year and department.
                  You can change it if necessary.
                </small>

              </div>

              {/* GENERATE BUTTON */}

              <button
                type="button"
                className="student-generate-id-button"
                disabled={
                  generatingId ||
                  actionLoading
                }
                onClick={
                  handleGenerateStudentId
                }
              >
                <FaIdCard />

                {generatingId
                  ? "Generating..."
                  : "Generate Student ID"}
              </button>

              {/* ACTIONS */}

              <div className="student-approval-actions">

                <button
                  type="button"
                  className="student-cancel-button"
                  disabled={
                    actionLoading ||
                    generatingId
                  }
                  onClick={() =>
                    setApprovalStudent(null)
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="student-confirm-approve-button"
                  disabled={
                    actionLoading ||
                    generatingId ||
                    !(
                      customStudentId.trim() ||
                      suggestedStudentId
                    )
                  }
                  onClick={
                    handleConfirmApproval
                  }
                >
                  <FaCheck />

                  {actionLoading
                    ? "Approving..."
                    : "Approve Student"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default StudentManagement;