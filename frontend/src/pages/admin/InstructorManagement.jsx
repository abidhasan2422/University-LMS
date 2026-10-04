import { useEffect, useState } from "react";
import { FaEye, FaSearch, FaSyncAlt } from "react-icons/fa";

import api from "../../api/axios";
import "../../styles/admin/student-management.css";

const InstructorManagement = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [instructors, setInstructors] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedInstructor, setSelectedInstructor] = useState(null);

  // =========================================================
  // FETCH INSTRUCTORS
  // =========================================================

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await api.get("instructors/", {
        params,
      });

      setInstructors(response.data.results || []);

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
        "Failed to fetch instructors:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Failed to load instructors."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH WHEN SEARCH / PAGE CHANGES
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInstructors();
    }, 400);

    return () => clearTimeout(timer);
  }, [search, page]);

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
  // RESET
  // =========================================================

  const handleReset = () => {
    setSearch("");
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
            INSTRUCTOR MANAGEMENT
          </span>

          <h1>Instructors</h1>

          <p>
            Manage and monitor university instructors.
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
            placeholder="Search by employee ID, name, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

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
          INSTRUCTOR TABLE
      ===================================================== */}

      <div className="student-table-card">

        <div className="student-table-header">

          <div>
            <h2>
              Instructor List
            </h2>

            <p>
              All registered instructor records.
            </p>
          </div>

          <span className="student-count">
            {instructors.length} instructors
          </span>

        </div>

        {error && (
          <div className="student-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="student-loading">
            Loading instructors...
          </div>
        ) : instructors.length === 0 ? (
          <div className="student-empty">
            No instructors found.
          </div>
        ) : (
          <div className="student-table-wrapper">

            <table className="student-table">

              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Instructor</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Experience</th>
                  <th>Employment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {instructors.map((instructor) => (

                  <tr key={instructor.id}>

                    {/* Employee ID */}
                    <td>
                      <span className="student-id">
                        {instructor.employee_id ||
                          "Not assigned"}
                      </span>
                    </td>

                    {/* Instructor */}
                    <td>

                      <div className="student-name-cell">

                        <div className="student-avatar">
                          {instructor.full_name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <div>

                          <strong>
                            {instructor.full_name}
                          </strong>

                          <small>
                            {instructor.email || "-"}
                          </small>

                        </div>

                      </div>

                    </td>

                    {/* Department */}
                    <td>
                      {instructor.department_name || "-"}
                    </td>

                    {/* Designation */}
                    <td>
                      {instructor.designation || "-"}
                    </td>

                    {/* Experience */}
                    <td>
                      {instructor.experience_years ?? 0} years
                    </td>

                    {/* Employment Status */}
                    <td>
                      <span
                        className={`student-status-badge ${
                          instructor.employment_status?.toLowerCase()
                        }`}
                      >
                        {instructor.employment_status || "-"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>

                      <div className="student-action-buttons">

                        <button
                          type="button"
                          className="student-action view"
                          title="View instructor"
                          onClick={() =>
                            setSelectedInstructor(
                              instructor
                            )
                          }
                        >
                          <FaEye />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        {!loading &&
          instructors.length > 0 &&
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
          VIEW INSTRUCTOR MODAL
      ===================================================== */}

      {selectedInstructor && (

        <div
          className="student-modal-overlay"
          onClick={() =>
            setSelectedInstructor(null)
          }
        >

          <div
            className="student-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="student-modal-header">

              <div>

                <h2>
                  Instructor Details
                </h2>

                <p>
                  View instructor information
                </p>

              </div>

              <button
                type="button"
                className="student-modal-close"
                onClick={() =>
                  setSelectedInstructor(null)
                }
              >
                ×
              </button>

            </div>

            <div className="student-modal-body">

              <div className="student-detail-profile">

                <div className="student-detail-avatar">
                  {selectedInstructor.full_name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <div>

                  <h3>
                    {selectedInstructor.full_name}
                  </h3>

                  <p>
                    {selectedInstructor.employee_id ||
                      "Employee ID not assigned"}
                  </p>

                </div>

              </div>

              <div className="student-detail-section">

                <h4>
                  Personal Information
                </h4>

                <div className="student-detail-grid">

                  <div>
                    <span>Full Name</span>
                    <strong>
                      {selectedInstructor.full_name || "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>
                      {selectedInstructor.email || "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>
                      {selectedInstructor.phone_number || "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Employee ID</span>
                    <strong>
                      {selectedInstructor.employee_id ||
                        "Not assigned"}
                    </strong>
                  </div>

                </div>

              </div>

              <div className="student-detail-section">

                <h4>
                  Professional Information
                </h4>

                <div className="student-detail-grid">

                  <div>
                    <span>Department</span>
                    <strong>
                      {selectedInstructor.department_name ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Designation</span>
                    <strong>
                      {selectedInstructor.designation ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Qualification</span>
                    <strong>
                      {selectedInstructor.qualification ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Specialization</span>
                    <strong>
                      {selectedInstructor.specialization ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Joining Date</span>
                    <strong>
                      {selectedInstructor.joining_date ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Experience</span>
                    <strong>
                      {selectedInstructor.experience_years ?? 0} years
                    </strong>
                  </div>

                  <div>
                    <span>Employment Status</span>
                    <strong>
                      {selectedInstructor.employment_status ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Office Room</span>
                    <strong>
                      {selectedInstructor.office_room ||
                        "-"}
                    </strong>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default InstructorManagement;