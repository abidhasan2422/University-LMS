
import React, { useCallback, useEffect, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaEye,
  FaTrash,
  FaCheckCircle,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
  FaGraduationCap,
  FaTimes,
} from "react-icons/fa";
import Swal from "sweetalert2";
import api from "../../api/axios";
import "../../styles/admin/enrollment-management.css";

const PAGE_SIZE = 10;

const EnrollmentManagement = () => {
  // Main data
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [instructors, setInstructors] = useState([]);

  // Loading
  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [courseOfferingFilter, setCourseOfferingFilter] = useState("");
  const [instructorFilter, setInstructorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ordering, setOrdering] = useState("-enrollment_date");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  // Form
  const [formData, setFormData] = useState({
    student: "",
    course_offering: "",
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Extract results from paginated or unpaginated API response
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
        const message = Array.isArray(value) ? value.join(", ") : value;
        return `${key}: ${message}`;
      })
      .join("\n");
  };

  // Fetch enrollment list
  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page,
        page_size: PAGE_SIZE,
      };

      if (search.trim()) params.search = search.trim();
      if (courseOfferingFilter) {
        params.course_offering = courseOfferingFilter;
      }
      if (instructorFilter) params.instructor = instructorFilter;
      if (statusFilter) params.status = statusFilter;
      if (ordering) params.ordering = ordering;

      const response = await api.get("enrollments/", { params });

      setEnrollments(getRows(response.data));
      setTotalCount(response.data?.count ?? getRows(response.data).length);
    } catch (error) {
      console.error("Enrollment fetch error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed to load enrollments",
        text: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }, [
    page,
    search,
    courseOfferingFilter,
    instructorFilter,
    statusFilter,
    ordering,
  ]);

  // Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      setDropdownLoading(true);

      const [studentResponse, offeringResponse, instructorResponse] =
        await Promise.all([
          api.get("students/", {
            params: { page: 1, page_size: 100 },
          }),
          api.get("course-offerings/", {
            params: { page: 1, page_size: 100 },
          }),
          api.get("instructors/", {
            params: { page: 1, page_size: 100 },
          }),
        ]);

      setStudents(getRows(studentResponse.data));

      // Only OPEN offerings can receive new enrollments
      const offerings = getRows(offeringResponse.data);
      setCourseOfferings(
        offerings.filter((item) => item.status === "OPEN")
      );

      setInstructors(getRows(instructorResponse.data));
    } catch (error) {
      console.error("Dropdown data error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed to load form data",
        text: getErrorMessage(error),
      });
    } finally {
      setDropdownLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Form input handler
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Create enrollment
  const handleCreateEnrollment = async (e) => {
    e.preventDefault();

    if (!formData.student || !formData.course_offering) {
      Swal.fire({
        icon: "warning",
        title: "Required fields",
        text: "Please select a student and a course offering.",
      });
      return;
    }

    try {
      setSubmitting(true);

      await api.post("enrollments/", {
        student: Number(formData.student),
        course_offering: Number(formData.course_offering),
      });

      setShowCreateModal(false);

      setFormData({
        student: "",
        course_offering: "",
      });

      setPage(1);

      await Swal.fire({
        icon: "success",
        title: "Enrollment created",
        text: "Student enrolled successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      await fetchDropdownData();
      await fetchEnrollments();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Enrollment failed",
        text: getErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  // View enrollment details
  const handleViewEnrollment = async (id) => {
    try {
      const response = await api.get(`enrollments/${id}/`);

      setSelectedEnrollment(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Unable to load details",
        text: getErrorMessage(error),
      });
    }
  };

  // Mark enrollment as completed using PATCH
  const handleCompleteEnrollment = async (enrollment) => {
    const result = await Swal.fire({
      title: "Mark as completed?",
      text: `Do you want to mark ${getStudentName(enrollment)}'s enrollment as completed?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, complete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#198754",
    });

    if (!result.isConfirmed) return;

    try {
      await api.patch(`enrollments/${enrollment.id}/`, {
        status: "COMPLETED",
      });

      Swal.fire({
        icon: "success",
        title: "Completed",
        text: "Enrollment marked as completed successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      if (selectedEnrollment?.id === enrollment.id) {
        setSelectedEnrollment({
          ...selectedEnrollment,
          status: "COMPLETED",
        });
      }

      await fetchEnrollments();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: getErrorMessage(error),
      });
    }
  };

  // Drop enrollment using DELETE
  const handleDropEnrollment = async (enrollment) => {
    const result = await Swal.fire({
      title: "Drop enrollment?",
      text: `Are you sure you want to drop ${getStudentName(enrollment)}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, drop it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`enrollments/${enrollment.id}/`);

      Swal.fire({
        icon: "success",
        title: "Enrollment dropped",
        timer: 1600,
        showConfirmButton: false,
      });

      setShowDetailsModal(false);
      setSelectedEnrollment(null);

      await fetchEnrollments();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Unable to drop enrollment",
        text: getErrorMessage(error),
      });
    }
  };

  // Helper functions
  const getStudentName = (enrollment) => {
    if (enrollment?.student_name) return enrollment.student_name;

    const student = enrollment?.student;
    if (typeof student === "object" && student !== null) {
      const firstName = student.user?.first_name || "";
      const lastName = student.user?.last_name || "";
      return `${firstName} ${lastName}`.trim() || "N/A";
    }

    return "N/A";
  };

  const getStudentId = (enrollment) => {
    return (
      enrollment?.student_id_code ||
      enrollment?.student?.student_id ||
      "N/A"
    );
  };

  const getCourseName = (enrollment) => {
    return (
      enrollment?.course_title ||
      enrollment?.course_offering?.course?.title ||
      "N/A"
    );
  };

  const getCourseCode = (enrollment) => {
    return (
      enrollment?.course_code ||
      enrollment?.course_offering?.course?.course_code ||
      "N/A"
    );
  };

  const getStatusBadge = (statusValue) => {
    const statusClasses = {
      ENROLLED: "enrollment-status-enrolled",
      DROPPED: "enrollment-status-dropped",
      COMPLETED: "enrollment-status-completed",
    };

    return (
      <span
        className={`enrollment-status ${
          statusClasses[statusValue] || ""
        }`}
      >
        {statusValue || "N/A"}
      </span>
    );
  };

  const getInstructorName = (instructor) => {
    return (
      instructor.instructor_name ||
      instructor.user?.get_full_name ||
      `${instructor.user?.first_name || ""} ${
        instructor.user?.last_name || ""
      }`.trim() ||
      instructor.employee_id ||
      "Instructor"
    );
  };

  const resetFilters = () => {
    setSearch("");
    setCourseOfferingFilter("");
    setInstructorFilter("");
    setStatusFilter("");
    setOrdering("-enrollment_date");
    setPage(1);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setFormData({
      student: "",
      course_offering: "",
    });
  };

  // Render component
  return (
    <div className="enrollment-management">
      {/* Page Header */}
      <div className="enrollment-page-header">
        <div>
          <h2>
            <FaGraduationCap className="me-2" />
            Enrollment Management
          </h2>
          <p>Manage student course enrollments.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus className="me-2" />
          Create Enrollment
        </button>
      </div>

      {/* Statistics */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="enrollment-stat-card">
            <h6>Total Enrollments</h6>
            <h3>{totalCount}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="enrollment-stat-card">
            <h6>Current Page Records</h6>
            <h3>{enrollments.length}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="enrollment-stat-card">
            <h6>Current Page</h6>
            <h3>
              {page} / {totalPages}
            </h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="enrollment-filter-card">
        <div className="row g-3 align-items-end">
          <div className="col-lg-3 col-md-6">
            <label className="form-label">Search</label>
            <div className="input-group">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Student ID, name, course..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <label className="form-label">Course Offering</label>
            <select
              className="form-select"
              value={courseOfferingFilter}
              onChange={(e) => {
                setCourseOfferingFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Courses</option>
              {courseOfferings.map((offering) => (
                <option key={offering.id} value={offering.id}>
                  {offering.course_code} - {offering.section}
                </option>
              ))}
            </select>
          </div>

          <div className="col-lg-2 col-md-6">
            <label className="form-label">Instructor</label>
            <select
              className="form-select"
              value={instructorFilter}
              onChange={(e) => {
                setInstructorFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Instructors</option>
              {instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {getInstructorName(instructor)}
                </option>
              ))}
            </select>
          </div>

          <div className="col-lg-2 col-md-6">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Status</option>
              <option value="ENROLLED">Enrolled</option>
              <option value="COMPLETED">Completed</option>
              <option value="DROPPED">Dropped</option>
            </select>
          </div>

          <div className="col-lg-3 col-md-6">
            <label className="form-label">Sort By</label>
            <select
              className="form-select"
              value={ordering}
              onChange={(e) => {
                setOrdering(e.target.value);
                setPage(1);
              }}
            >
              <option value="-enrollment_date">Newest First</option>
              <option value="enrollment_date">Oldest First</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="col-12 d-flex justify-content-end gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={resetFilters}
            >
              <FaSyncAlt className="me-2" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Enrollment Table */}
      <div className="enrollment-table-card">
        <div className="enrollment-table-header">
          <h5>Enrollment List</h5>
          <span>Total: {totalCount}</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Section</th>
                <th>Semester</th>
                <th>Academic Year</th>
                <th>Status</th>
                <th>Enrollment Date</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-5">
                    <div
                      className="spinner-border text-primary"
                      role="status"
                    />
                    <p className="mt-2 mb-0">Loading enrollments...</p>
                  </td>
                </tr>
              ) : enrollments.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-5">
                    No enrollments found.
                  </td>
                </tr>
              ) : (
                enrollments.map((enrollment, index) => (
                  <tr key={enrollment.id}>
                    <td>{(page - 1) * PAGE_SIZE + index + 1}</td>

                    <td>{getStudentId(enrollment)}</td>

                    <td>{getStudentName(enrollment)}</td>

                    <td>
                      <strong>{getCourseCode(enrollment)}</strong>
                      <div className="text-muted small">
                        {getCourseName(enrollment)}
                      </div>
                    </td>

                    <td>{enrollment.section || "N/A"}</td>

                    <td>{enrollment.semester_name || "N/A"}</td>

                    <td>{enrollment.academic_year || "N/A"}</td>

                    <td>{getStatusBadge(enrollment.status)}</td>

                    <td>
                      {enrollment.enrollment_date
                        ? new Date(
                            enrollment.enrollment_date
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          title="View Details"
                          onClick={() =>
                            handleViewEnrollment(enrollment.id)
                          }
                        >
                          <FaEye />
                        </button>

                        {enrollment.status === "ENROLLED" && (
                          <>
                            <button
                              className="btn btn-sm btn-outline-success"
                              title="Mark as Completed"
                              onClick={() =>
                                handleCompleteEnrollment(enrollment)
                              }
                            >
                              <FaCheckCircle />
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Drop Enrollment"
                              onClick={() =>
                                handleDropEnrollment(enrollment)
                              }
                            >
                              <FaTrash />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="enrollment-pagination">
          <span>
            Showing {enrollments.length} of {totalCount} enrollments
          </span>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((prev) => prev - 1)}
            >
              <FaChevronLeft />
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              className="btn btn-outline-primary btn-sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((prev) => prev + 1)}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Create Enrollment Modal */}
      {showCreateModal && (
        <div className="enrollment-modal-overlay">
          <div className="enrollment-modal">
            <div className="enrollment-modal-header">
              <h5>Create New Enrollment</h5>
              <button
                className="btn-close"
                onClick={closeCreateModal}
                aria-label="Close"
              />
            </div>

            <form onSubmit={handleCreateEnrollment}>
              <div className="enrollment-modal-body">
                {dropdownLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" />
                    <p className="mt-2">Loading form data...</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <label className="form-label">
                        Select Student <span className="text-danger">*</span>
                      </label>

                      <select
                        className="form-select"
                        name="student"
                        value={formData.student}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">Choose a student</option>

                        {students.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.student_id || `ID ${student.id}`} -{" "}
                            {student.user?.first_name || ""}{" "}
                            {student.user?.last_name || ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Select Course Offering{" "}
                        <span className="text-danger">*</span>
                      </label>

                      <select
                        className="form-select"
                        name="course_offering"
                        value={formData.course_offering}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">Choose a course offering</option>

                        {courseOfferings.map((offering) => (
                          <option
                            key={offering.id}
                            value={offering.id}
                          >
                            {offering.course_code} -{" "}
                            {offering.course_title} | Section{" "}
                            {offering.section} |{" "}
                            {offering.semester_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {courseOfferings.length === 0 && (
                      <div className="alert alert-warning">
                        No OPEN course offerings are currently available.
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="enrollment-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeCreateModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    submitting ||
                    dropdownLoading ||
                    courseOfferings.length === 0
                  }
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaPlus className="me-2" />
                      Create Enrollment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enrollment Details Modal */}
      {showDetailsModal && selectedEnrollment && (
        <div className="enrollment-modal-overlay">
          <div className="enrollment-modal">
            <div className="enrollment-modal-header">
              <h5>Enrollment Details</h5>

              <button
                className="btn-close"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedEnrollment(null);
                }}
                aria-label="Close"
              />
            </div>

            <div className="enrollment-modal-body">
              <div className="enrollment-detail-row">
                <strong>Enrollment ID:</strong>
                <span>{selectedEnrollment.id}</span>
              </div>

              <div className="enrollment-detail-row">
                <strong>Student ID:</strong>
                <span>{getStudentId(selectedEnrollment)}</span>
              </div>

              <div className="enrollment-detail-row">
                <strong>Student Name:</strong>
                <span>{getStudentName(selectedEnrollment)}</span>
              </div>

              <div className="enrollment-detail-row">
                <strong>Course Code:</strong>
                <span>{getCourseCode(selectedEnrollment)}</span>
              </div>

              <div className="enrollment-detail-row">
                <strong>Course Title:</strong>
                <span>{getCourseName(selectedEnrollment)}</span>
              </div>

              <div className="enrollment-detail-row">
                <strong>Section:</strong>
                <span>{selectedEnrollment.section || "N/A"}</span>
              </div>

              <div className="enrollment-detail-row">
                <strong>Semester:</strong>
                <span>{selectedEnrollment.semester_name || "N/A"}</span>
              </div>

              <div className="enrollment-detail-row">
                <strong>Academic Year:</strong>
                <span>{selectedEnrollment.academic_year || "N/A"}</span>
              </div>

              <div className="enrollment-detail-row">
                <strong>Semester Year:</strong>
                <span>{selectedEnrollment.semester_year || "N/A"}</span>
              </div>

              <div className="enrollment-detail-row">
                <strong>Status:</strong>
                <span>{getStatusBadge(selectedEnrollment.status)}</span>
              </div>

              <div className="enrollment-detail-row">
                <strong>Enrollment Date:</strong>
                <span>
                  {selectedEnrollment.enrollment_date
                    ? new Date(
                        selectedEnrollment.enrollment_date
                      ).toLocaleString()
                    : "N/A"}
                </span>
              </div>
            </div>

            <div className="enrollment-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedEnrollment(null);
                }}
              >
                Close
              </button>

              {selectedEnrollment.status === "ENROLLED" && (
                <>
                  <button
                    className="btn btn-success"
                    onClick={() =>
                      handleCompleteEnrollment(selectedEnrollment)
                    }
                  >
                    <FaCheckCircle className="me-2" />
                    Mark Completed
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      handleDropEnrollment(selectedEnrollment)
                    }
                  >
                    <FaTrash className="me-2" />
                    Drop Enrollment
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentManagement;
