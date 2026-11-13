
import { useEffect, useState } from "react";
import {
  FaSearch,
  FaEye,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaPlus,
  FaFilter,
  FaGraduationCap,
  FaBook,
  FaCalculator,
  FaRedo,
} from "react-icons/fa";
import Swal from "sweetalert2";

import api from "../../api/axios";
import "../../styles/admin/result-management.css";

const ResultManagement = () => {
  // =====================================================
  // Results States
  // =====================================================

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [publicationFilter, setPublicationFilter] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 10;

  // =====================================================
  // Generate Result States
  // =====================================================

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState("");
  const [generating, setGenerating] = useState(false);

  // =====================================================
  // Result Details States
  // =====================================================

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  // =====================================================
  // GPA / CGPA States
  // =====================================================

  const [gpaStudentId, setGpaStudentId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  const [semesterGPA, setSemesterGPA] = useState(null);
  const [cgpa, setCgpa] = useState(null);

  const [gpaLoading, setGpaLoading] = useState(false);
  const [gpaError, setGpaError] = useState("");

  // =====================================================
  // Fetch Results
  // =====================================================

  const fetchResults = async () => {
    try {
      setLoading(true);

      const params = {
        page,
        page_size: pageSize,
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (publicationFilter) {
        params.is_published = publicationFilter;
      }

      const response = await api.get("results/", { params });

      const data = response.data;

      const resultList = Array.isArray(data)
        ? data
        : data.results || [];

      setResults(resultList);

      setTotalPages(
        Array.isArray(data)
          ? 1
          : Math.max(1, Math.ceil((data.count || 0) / pageSize))
      );
    } catch (error) {
      console.error("Failed to fetch results:", error);

      Swal.fire(
        "Error",
        error.response?.data?.detail || "Failed to load results.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [page, statusFilter, publicationFilter]);

  // =====================================================
  // Generate Result
  // =====================================================

  const handleGenerateResult = async (e) => {
    e.preventDefault();

    if (!enrollmentId) {
      Swal.fire(
        "Warning",
        "Please enter an enrollment ID.",
        "warning"
      );
      return;
    }

    try {
      setGenerating(true);

      const response = await api.post("results/", {
        enrollment: enrollmentId,
      });

      await Swal.fire(
        "Success",
        response.data.message || "Result generated successfully.",
        "success"
      );

      setShowGenerateModal(false);
      setEnrollmentId("");
      setPage(1);

      fetchResults();
    } catch (error) {
      console.error("Generate result error:", error);

      const errorData = error.response?.data;

      const message =
        errorData?.detail ||
        errorData?.enrollment ||
        errorData?.assessment ||
        "Failed to generate result.";

      Swal.fire("Error", message, "error");
    } finally {
      setGenerating(false);
    }
  };

  // =====================================================
  // Publish / Unpublish Result
  // =====================================================

  const handlePublish = async (result) => {
    const action = result.is_published ? "unpublish" : "publish";

    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to ${action} this result?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: "Cancel",
    });

    if (!confirmation.isConfirmed) return;

    try {
      if (result.is_published) {
        await api.delete(`results/${result.id}/publish/`);
      } else {
        await api.post(`results/${result.id}/publish/`);
      }

      await Swal.fire(
        "Success",
        `Result ${action}ed successfully.`,
        "success"
      );

      fetchResults();
    } catch (error) {
      console.error("Publication error:", error);

      Swal.fire(
        "Error",
        error.response?.data?.detail ||
          `Failed to ${action} result.`,
        "error"
      );
    }
  };

  // =====================================================
  // Delete Result
  // =====================================================

  const handleDelete = async (id) => {
    const confirmation = await Swal.fire({
      title: "Delete Result?",
      text: "This result will be removed from the active list.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!confirmation.isConfirmed) return;

    try {
      await api.delete(`results/${id}/`);

      await Swal.fire(
        "Deleted",
        "Result deleted successfully.",
        "success"
      );

      fetchResults();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.detail || "Failed to delete result.",
        "error"
      );
    }
  };

  // =====================================================
  // View Result Details
  // =====================================================

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setShowDetailsModal(true);
  };

  // =====================================================
  // Semester GPA Calculation
  // =====================================================

  const handleCalculateSemesterGPA = async (e) => {
    e.preventDefault();

    if (!gpaStudentId || !semesterId) {
      Swal.fire(
        "Warning",
        "Student ID and Semester ID are required.",
        "warning"
      );
      return;
    }

    try {
      setGpaLoading(true);
      setGpaError("");
      setSemesterGPA(null);

      const response = await api.get("results/gpa/semester/", {
        params: {
          student: gpaStudentId,
          semester: semesterId,
          ...(academicYear && {
            academic_year: academicYear,
          }),
        },
      });

      setSemesterGPA(response.data);
    } catch (error) {
      console.error("Semester GPA error:", error);

      const errorData = error.response?.data;

      setGpaError(
        errorData?.detail ||
          errorData?.student ||
          errorData?.semester ||
          "Failed to calculate semester GPA."
      );
    } finally {
      setGpaLoading(false);
    }
  };

  // =====================================================
  // CGPA Calculation
  // =====================================================

  const handleCalculateCGPA = async () => {
    if (!gpaStudentId) {
      Swal.fire(
        "Warning",
        "Please enter Student ID.",
        "warning"
      );
      return;
    }

    try {
      setGpaLoading(true);
      setGpaError("");
      setCgpa(null);

      const response = await api.get("results/gpa/cgpa/", {
        params: {
          student: gpaStudentId,
        },
      });

      setCgpa(response.data);
    } catch (error) {
      console.error("CGPA error:", error);

      const errorData = error.response?.data;

      setGpaError(
        errorData?.detail ||
          errorData?.student ||
          "Failed to calculate CGPA."
      );
    } finally {
      setGpaLoading(false);
    }
  };

  // =====================================================
  // Reset GPA Calculator
  // =====================================================

  const handleResetGPA = () => {
    setGpaStudentId("");
    setSemesterId("");
    setAcademicYear("");
    setSemesterGPA(null);
    setCgpa(null);
    setGpaError("");
  };

  // =====================================================
  // Search Results
  // =====================================================

  const filteredResults = results.filter((result) => {
    const keyword = search.toLowerCase();

    return (
      result.student_name?.toLowerCase().includes(keyword) ||
      result.student_id_code?.toLowerCase().includes(keyword) ||
      result.course_code?.toLowerCase().includes(keyword) ||
      result.course_title?.toLowerCase().includes(keyword)
    );
  });

  // =====================================================
  // Render
  // =====================================================

  return (
    <div className="result-management">

      {/* ===============================================
          Page Header
      =============================================== */}

      <div className="result-page-header">
        <div>
          <h2>Results Management</h2>
          <p>
            Manage student results, grades and publication.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowGenerateModal(true)}
        >
          <FaPlus className="me-2" />
          Generate Result
        </button>
      </div>

      {/* ===============================================
          Summary Cards
      =============================================== */}

      <div className="row g-3 mb-4">

        <div className="col-md-4">
          <div className="result-summary-card">
            <FaGraduationCap />

            <div>
              <h4>{results.length}</h4>
              <p>Results on This Page</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="result-summary-card">
            <FaCheckCircle />

            <div>
              <h4>
                {results.filter(
                  (result) => result.status === "PASS"
                ).length}
              </h4>
              <p>Passed on This Page</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="result-summary-card">
            <FaBook />

            <div>
              <h4>
                {results.filter(
                  (result) => result.is_published
                ).length}
              </h4>
              <p>Published on This Page</p>
            </div>
          </div>
        </div>

      </div>

      {/* ===============================================
          GPA / CGPA Calculator
      =============================================== */}

      <div className="result-gpa-card mb-4">

        <div className="result-gpa-header">
          <div>
            <h5>
              <FaCalculator className="me-2" />
              GPA & CGPA Calculator
            </h5>

            <p>
              Calculate semester GPA and cumulative GPA
              using published results.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleResetGPA}
          >
            <FaRedo className="me-1" />
            Reset
          </button>
        </div>

        <form onSubmit={handleCalculateSemesterGPA}>
          <div className="row g-3">

            <div className="col-md-3">
              <label className="form-label">
                Student ID
              </label>

              <input
                type="number"
                min="1"
                className="form-control"
                placeholder="Enter Student ID"
                value={gpaStudentId}
                onChange={(e) => {
                  setGpaStudentId(e.target.value);
                  setSemesterGPA(null);
                  setCgpa(null);
                  setGpaError("");
                }}
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Semester ID
              </label>

              <input
                type="number"
                min="1"
                className="form-control"
                placeholder="Enter Semester ID"
                value={semesterId}
                onChange={(e) => {
                  setSemesterId(e.target.value);
                  setSemesterGPA(null);
                  setGpaError("");
                }}
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Academic Year (Optional)
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="e.g. 2026"
                value={academicYear}
                onChange={(e) => {
                  setAcademicYear(e.target.value);
                  setSemesterGPA(null);
                  setGpaError("");
                }}
              />
            </div>

            <div className="col-md-3 d-flex align-items-end gap-2">
              <button
                type="submit"
                className="btn btn-primary flex-fill"
                disabled={gpaLoading}
              >
                Semester GPA
              </button>

              <button
                type="button"
                className="btn btn-success flex-fill"
                onClick={handleCalculateCGPA}
                disabled={gpaLoading}
              >
                CGPA
              </button>
            </div>

          </div>
        </form>

        {/* GPA Loading */}

        {gpaLoading && (
          <div className="text-center py-3">
            <div
              className="spinner-border text-primary"
              role="status"
            />
            <p className="mt-2 mb-0">
              Calculating academic performance...
            </p>
          </div>
        )}

        {/* GPA Error */}

        {gpaError && (
          <div className="alert alert-danger mt-3 mb-0">
            {gpaError}
          </div>
        )}

        {/* Semester GPA Result */}

        {semesterGPA && (
          <div className="gpa-result-box mt-4">

            <h6>Semester GPA Result</h6>

            <div className="row g-3">

              <div className="col-md-4">
                <div className="gpa-stat">
                  <span>Semester GPA</span>
                  <h3>
                    {Number(
                      semesterGPA.semester_gpa
                    ).toFixed(2)}
                  </h3>
                </div>
              </div>

              <div className="col-md-4">
                <div className="gpa-stat">
                  <span>Total Credits</span>
                  <h3>
                    {Number(
                      semesterGPA.total_credits
                    ).toFixed(1)}
                  </h3>
                </div>
              </div>

              <div className="col-md-4">
                <div className="gpa-stat">
                  <span>Total Courses</span>
                  <h3>
                    {semesterGPA.courses?.length || 0}
                  </h3>
                </div>
              </div>

            </div>

            <div className="table-responsive mt-4">
              <table className="table table-bordered align-middle">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Title</th>
                    <th>Credit</th>
                    <th>Grade</th>
                    <th>Grade Point</th>
                    <th>Total Marks</th>
                  </tr>
                </thead>

                <tbody>
                  {semesterGPA.courses?.length > 0 ? (
                    semesterGPA.courses.map(
                      (course, index) => (
                        <tr key={index}>
                          <td>{course.course_code}</td>
                          <td>{course.course_title}</td>
                          <td>{course.credit}</td>
                          <td>{course.grade}</td>
                          <td>{course.grade_point}</td>
                          <td>{course.total_marks}</td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-3"
                      >
                        No published course results found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* CGPA Result */}

        {cgpa && (
          <div className="gpa-result-box mt-4">

            <h6>Cumulative GPA Result</h6>

            <div className="row g-3">

              <div className="col-md-6">
                <div className="gpa-stat">
                  <span>Cumulative GPA</span>
                  <h3>
                    {Number(cgpa.cgpa).toFixed(2)}
                  </h3>
                </div>
              </div>

              <div className="col-md-6">
                <div className="gpa-stat">
                  <span>Total Credits</span>
                  <h3>
                    {Number(
                      cgpa.total_credits
                    ).toFixed(1)}
                  </h3>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* ===============================================
          Results Filters
      =============================================== */}

      <div className="result-filter-card">

        <div className="row g-3 align-items-center">

          <div className="col-lg-5">
            <div className="input-group">
              <span className="input-group-text">
                <FaSearch />
              </span>

              <input
                type="text"
                className="form-control"
                placeholder="Search student or course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-lg-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
            >
              <option value="">All Results</option>
              <option value="PASS">Pass</option>
              <option value="FAIL">Fail</option>
            </select>
          </div>

          <div className="col-lg-3">
            <select
              className="form-select"
              value={publicationFilter}
              onChange={(e) => {
                setPage(1);
                setPublicationFilter(e.target.value);
              }}
            >
              <option value="">All Publication Status</option>
              <option value="true">Published</option>
              <option value="false">Unpublished</option>
            </select>
          </div>

          <div className="col-lg-1 text-center">
            <FaFilter className="text-secondary" />
          </div>

        </div>
      </div>

      {/* ===============================================
          Results Table
      =============================================== */}

      <div className="result-table-card">

        <div className="table-responsive">
          <table className="table align-middle">

            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Semester</th>
                <th>Total Marks</th>
                <th>Grade</th>
                <th>GPA</th>
                <th>Status</th>
                <th>Publication</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    Loading results...
                  </td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    No results found.
                  </td>
                </tr>
              ) : (
                filteredResults.map((result) => (

                  <tr key={result.id}>

                    <td>{result.student_id_code}</td>

                    <td>{result.student_name}</td>

                    <td>
                      <strong>{result.course_code}</strong>
                      <small className="d-block text-muted">
                        {result.course_title}
                      </small>
                    </td>

                    <td>{result.semester_name}</td>

                    <td>
                      {Number(result.total_marks).toFixed(2)}
                    </td>

                    <td>
                      <span className="result-grade">
                        {result.letter_grade}
                      </span>
                    </td>

                    <td>
                      {Number(result.grade_point).toFixed(2)}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          result.status === "PASS"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {result.status}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          result.is_published
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {result.is_published
                          ? "Published"
                          : "Unpublished"}
                      </span>
                    </td>

                    <td>
                      <div className="d-flex gap-2">

                        <button
                          className="btn btn-sm btn-outline-info"
                          title="View details"
                          onClick={() =>
                            handleViewDetails(result)
                          }
                        >
                          <FaEye />
                        </button>

                        <button
                          className="btn btn-sm btn-outline-primary"
                          title={
                            result.is_published
                              ? "Unpublish"
                              : "Publish"
                          }
                          onClick={() =>
                            handlePublish(result)
                          }
                        >
                          {result.is_published ? (
                            <FaTimesCircle />
                          ) : (
                            <FaCheckCircle />
                          )}
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete"
                          onClick={() =>
                            handleDelete(result.id)
                          }
                        >
                          <FaTrash />
                        </button>

                      </div>
                    </td>

                  </tr>

                ))
              )}

            </tbody>
          </table>
        </div>

        {/* Pagination */}

        <div className="result-pagination">

          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </button>

        </div>

      </div>

      {/* ===============================================
          Generate Result Modal
      =============================================== */}

      {showGenerateModal && (
        <div className="result-modal-overlay">

          <div className="result-modal">

            <div className="result-modal-header">
              <h5>Generate Student Result</h5>

              <button
                className="btn-close"
                onClick={() => setShowGenerateModal(false)}
              />
            </div>

            <form onSubmit={handleGenerateResult}>

              <div className="mb-3">
                <label className="form-label">
                  Enrollment ID
                </label>

                <input
                  type="number"
                  min="1"
                  className="form-control"
                  placeholder="Enter enrollment ID"
                  value={enrollmentId}
                  onChange={(e) =>
                    setEnrollmentId(e.target.value)
                  }
                  required
                />

                <small className="text-muted">
                  Enter the enrollment ID for the student
                  whose result you want to generate.
                </small>
              </div>

              <div className="d-flex justify-content-end gap-2">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowGenerateModal(false)}
                  disabled={generating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={generating}
                >
                  {generating
                    ? "Generating..."
                    : "Generate Result"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* ===============================================
          Result Details Modal
      =============================================== */}

      {showDetailsModal && selectedResult && (
        <div className="result-modal-overlay">

          <div className="result-modal result-details-modal">

            <div className="result-modal-header">
              <h5>Result Details</h5>

              <button
                className="btn-close"
                onClick={() => setShowDetailsModal(false)}
              />
            </div>

            <div className="result-details-content">

              <h6>Student Information</h6>

              <div className="row g-3 mb-4">

                <div className="col-md-6">
                  <strong>Student ID:</strong>
                  <p>{selectedResult.student_id_code}</p>
                </div>

                <div className="col-md-6">
                  <strong>Student Name:</strong>
                  <p>{selectedResult.student_name}</p>
                </div>

              </div>

              <h6>Course Information</h6>

              <div className="row g-3 mb-4">

                <div className="col-md-6">
                  <strong>Course:</strong>
                  <p>
                    {selectedResult.course_code} -{" "}
                    {selectedResult.course_title}
                  </p>
                </div>

                <div className="col-md-6">
                  <strong>Section:</strong>
                  <p>{selectedResult.section}</p>
                </div>

                <div className="col-md-6">
                  <strong>Semester:</strong>
                  <p>{selectedResult.semester_name}</p>
                </div>

                <div className="col-md-6">
                  <strong>Academic Year:</strong>
                  <p>{selectedResult.academic_year}</p>
                </div>

              </div>

              <h6>Academic Performance</h6>

              <div className="row g-3">

                <div className="col-md-6">
                  <strong>Total Marks:</strong>
                  <p>
                    {Number(selectedResult.total_marks).toFixed(2)}
                    {" / 100"}
                  </p>
                </div>

                <div className="col-md-6">
                  <strong>Percentage:</strong>
                  <p>{selectedResult.percentage}%</p>
                </div>

                <div className="col-md-6">
                  <strong>Letter Grade:</strong>
                  <p>{selectedResult.letter_grade}</p>
                </div>

                <div className="col-md-6">
                  <strong>Grade Point:</strong>
                  <p>{selectedResult.grade_point}</p>
                </div>

                <div className="col-md-6">
                  <strong>Result Status:</strong>
                  <p>{selectedResult.status}</p>
                </div>

                <div className="col-md-6">
                  <strong>Publication:</strong>
                  <p>
                    {selectedResult.is_published
                      ? "Published"
                      : "Unpublished"}
                  </p>
                </div>

                <div className="col-md-6">
                  <strong>Published At:</strong>
                  <p>
                    {selectedResult.published_at
                      ? new Date(
                          selectedResult.published_at
                        ).toLocaleString()
                      : "Not published"}
                  </p>
                </div>

              </div>

            </div>

            <div className="d-flex justify-content-end mt-3">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ResultManagement;
