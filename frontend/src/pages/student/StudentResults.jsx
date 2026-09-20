import { useEffect, useMemo, useState } from "react";
import {
  FaGraduationCap,
  FaCheckCircle,
  FaTimesCircle,
  FaChartLine,
  FaBookOpen,
  FaSearch,
  FaFilter,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";

import api from "../../api/axios";

const StudentResults = () => {
  const [results, setResults] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * =========================================
   * Fetch Student Results
   * =========================================
   */

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("results/");

        const resultData =
          response.data.results || response.data || [];

        setResults(resultData);
      } catch (error) {
        console.error("Failed to fetch results:", error);

        setError(
          error.response?.data?.detail ||
            "Failed to load your results."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  /*
   * =========================================
   * Filter Results
   * =========================================
   */

  const filteredResults = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return results.filter((result) => {
      const matchesSearch =
        !search ||
        result.course_code
          ?.toLowerCase()
          .includes(search) ||
        result.course_title
          ?.toLowerCase()
          .includes(search);

      const matchesGrade =
        gradeFilter === "ALL" ||
        result.letter_grade === gradeFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        result.status === statusFilter;

      return (
        matchesSearch &&
        matchesGrade &&
        matchesStatus
      );
    });
  }, [
    results,
    searchTerm,
    gradeFilter,
    statusFilter,
  ]);

  /*
   * =========================================
   * Summary Information
   * =========================================
   */

  const passedCourses = results.filter(
    (result) => result.status === "PASS"
  );

  const failedCourses = results.filter(
    (result) => result.status === "FAIL"
  );

  const averagePercentage =
    results.length > 0
      ? (
          results.reduce(
            (total, result) =>
              total + Number(result.percentage || 0),
            0
          ) / results.length
        ).toFixed(2)
      : "0.00";

  /*
   * =========================================
   * Semester Information
   * =========================================
   */

  const semesterName =
    results.length > 0
      ? results[0].semester_name || "Current Semester"
      : "Current Semester";

  const academicYear =
    results.length > 0
      ? results[0].academic_year || ""
      : "";

  /*
   * =========================================
   * Filter State
   * =========================================
   */

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    gradeFilter !== "ALL" ||
    statusFilter !== "ALL";

  /*
   * =========================================
   * Clear Filters
   * =========================================
   */

  const handleClearFilters = () => {
    setSearchTerm("");
    setGradeFilter("ALL");
    setStatusFilter("ALL");
  };

  /*
   * =========================================
   * Loading State
   * =========================================
   */

  if (loading) {
    return (
      <div className="student-results">

        <div className="results-page-header mb-4">
          <span className="results-label">
            STUDENT PORTAL
          </span>

          <h2>Results</h2>

          <p>
            View your finalized academic results and
            course grades.
          </p>
        </div>

        <div className="results-state-card">
          <FaSpinner className="results-loading-icon" />

          <h5>Loading Results...</h5>

          <p>
            Please wait while we load your academic
            results.
          </p>
        </div>

      </div>
    );
  }

  /*
   * =========================================
   * Main Page
   * =========================================
   */

  return (
    <div className="student-results">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="results-page-header mb-4">

        <span className="results-label">
          STUDENT PORTAL
        </span>

        <h2>Results</h2>

        <p>
          View your finalized academic results and
          course grades.
        </p>

      </div>

      {/* =========================================
          ERROR MESSAGE
      ========================================= */}

      {error && (
        <div className="results-message error mb-4">
          <FaTimesCircle />

          <span>{error}</span>
        </div>
      )}

      {/* =========================================
          SEMESTER CARD
      ========================================= */}

      {!error && results.length > 0 && (
        <div className="result-semester-card mb-4">

          <div>
            <span className="result-semester-label">
              CURRENT RESULTS
            </span>

            <h5>
              {semesterName}
              {academicYear
                ? ` ${academicYear}`
                : ""}
            </h5>

            <p>
              Finalized results for your published
              courses.
            </p>
          </div>

          <div className="result-semester-icon">
            <FaGraduationCap />
          </div>

        </div>
      )}

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}

      {!error && results.length > 0 && (
        <div className="row g-4 mb-4">

          {/* Average Percentage */}

          <div className="col-md-4">

            <div className="result-summary-card">

              <div className="result-summary-icon blue">
                <FaChartLine />
              </div>

              <span>
                Average Percentage
              </span>

              <strong>
                {averagePercentage}%
              </strong>

              <small>
                Across all published courses
              </small>

            </div>

          </div>

          {/* Passed */}

          <div className="col-md-4">

            <div className="result-summary-card">

              <div className="result-summary-icon green">
                <FaCheckCircle />
              </div>

              <span>
                Passed Courses
              </span>

              <strong>
                {passedCourses.length}
              </strong>

              <small>
                Successfully completed
              </small>

            </div>

          </div>

          {/* Failed */}

          <div className="col-md-4">

            <div className="result-summary-card">

              <div className="result-summary-icon red">
                <FaTimesCircle />
              </div>

              <span>
                Failed Courses
              </span>

              <strong>
                {failedCourses.length}
              </strong>

              <small>
                Courses requiring attention
              </small>

            </div>

          </div>

        </div>
      )}

      {/* =========================================
          SEARCH & FILTER
      ========================================= */}

      {!error && results.length > 0 && (
        <div className="results-filter-card mb-4">

          <div className="results-filter-header">

            <div>
              <h5>
                Find Result
              </h5>

              <p>
                Search and filter your course results.
              </p>
            </div>

            <FaFilter />

          </div>

          <div className="row g-3 align-items-end">

            {/* Search */}

            <div className="col-md-5">

              <label
                htmlFor="result-search"
                className="results-filter-label"
              >
                Search Course
              </label>

              <div className="results-search-wrapper">

                <FaSearch className="results-search-icon" />

                <input
                  id="result-search"
                  type="text"
                  className="form-control results-search-input"
                  placeholder="Search by course code or title..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                />

                {searchTerm && (
                  <button
                    type="button"
                    className="results-search-clear"
                    onClick={() =>
                      setSearchTerm("")
                    }
                  >
                    <FaTimes />
                  </button>
                )}

              </div>

            </div>

            {/* Grade Filter */}

            <div className="col-md-3">

              <label
                htmlFor="grade-filter"
                className="results-filter-label"
              >
                Grade
              </label>

              <select
                id="grade-filter"
                className="form-select"
                value={gradeFilter}
                onChange={(event) =>
                  setGradeFilter(event.target.value)
                }
              >
                <option value="ALL">
                  All Grades
                </option>

                <option value="A+">A+</option>
                <option value="A">A</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B">B</option>
                <option value="B-">B-</option>
                <option value="C+">C+</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="F">F</option>
              </select>

            </div>

            {/* Status Filter */}

            <div className="col-md-2">

              <label
                htmlFor="status-filter"
                className="results-filter-label"
              >
                Status
              </label>

              <select
                id="status-filter"
                className="form-select"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="ALL">
                  All
                </option>

                <option value="PASS">
                  Pass
                </option>

                <option value="FAIL">
                  Fail
                </option>
              </select>

            </div>

            {/* Clear */}

            <div className="col-md-2">

              {hasActiveFilters && (
                <button
                  type="button"
                  className="results-clear-filter-button"
                  onClick={handleClearFilters}
                >
                  <FaTimes />
                  Clear Filters
                </button>
              )}

            </div>

          </div>

        </div>
      )}

      {/* =========================================
          RESULT COUNT
      ========================================= */}

      {!error && results.length > 0 && (
        <div className="results-count mb-3">

          Showing{" "}
          <strong>
            {filteredResults.length}
          </strong>{" "}
          of{" "}
          <strong>
            {results.length}
          </strong>{" "}
          results

        </div>
      )}

      {/* =========================================
          RESULT TABLE
      ========================================= */}

      {!error &&
        results.length > 0 &&
        filteredResults.length > 0 && (

          <div className="results-section">

            <div className="results-section-header">

              <div>
                <h5>
                  Course Results
                </h5>

                <p>
                  Your finalized published academic
                  results.
                </p>
              </div>

            </div>

            <div className="table-responsive">

              <table className="table results-table mb-0">

                <thead>

                  <tr>
                    <th>#</th>
                    <th>Course</th>
                    <th>Total Marks</th>
                    <th>Percentage</th>
                    <th>Grade</th>
                    <th>Grade Point</th>
                    <th>Status</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredResults.map(
                    (result, index) => (

                      <tr key={result.id}>

                        {/* Number */}

                        <td>
                          {index + 1}
                        </td>

                        {/* Course */}

                        <td>

                          <div className="result-course">

                            <div className="result-course-icon">
                              <FaBookOpen />
                            </div>

                            <div>

                              <strong>
                                {result.course_code ||
                                  "N/A"}
                              </strong>

                              <span>
                                {result.course_title ||
                                  "N/A"}
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* Total Marks */}

                        <td>

                          <strong className="result-marks">
                            {Number(
                              result.total_marks || 0
                            ).toFixed(2)}
                          </strong>

                        </td>

                        {/* Percentage */}

                        <td>

                          <strong className="result-percentage">
                            {Number(
                              result.percentage || 0
                            ).toFixed(2)}
                            %
                          </strong>

                        </td>

                        {/* Grade */}

                        <td>

                          <span className="letter-grade">
                            {result.letter_grade ||
                              "N/A"}
                          </span>

                        </td>

                        {/* Grade Point */}

                        <td>

                          <strong className="grade-point">
                            {Number(
                              result.grade_point || 0
                            ).toFixed(2)}
                          </strong>

                        </td>

                        {/* Status */}

                        <td>

                          {result.status ===
                          "PASS" ? (

                            <span className="result-status pass">
                              <FaCheckCircle />
                              Pass
                            </span>

                          ) : (

                            <span className="result-status fail">
                              <FaTimesCircle />
                              Fail
                            </span>

                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

      {/* =========================================
          NO SEARCH RESULT
      ========================================= */}

      {!error &&
        results.length > 0 &&
        filteredResults.length === 0 && (

          <div className="results-state-card">

            <FaSearch />

            <h5>
              No Results Found
            </h5>

            <p>
              No results match your current search
              or filters.
            </p>

            <button
              type="button"
              className="results-clear-filter-button"
              onClick={handleClearFilters}
            >
              <FaTimes />
              Clear Filters
            </button>

          </div>
        )}

      {/* =========================================
          NO RESULTS FROM API
      ========================================= */}

      {!error &&
        results.length === 0 && (

          <div className="results-state-card">

            <FaGraduationCap />

            <h5>
              No Published Results
            </h5>

            <p>
              Your finalized results have not been
              published yet.
            </p>

          </div>
        )}

      {/* =========================================
          RESULT INFORMATION
      ========================================= */}

      {!error && results.length > 0 && (
        <div className="result-info-box mt-4">

          <FaGraduationCap />

          <div>

            <strong>
              Result Information
            </strong>

            <p>
              Results shown here are finalized and
              published by authorized academic staff.
              Your semester GPA and overall CGPA are
              available separately in the GPA section.
            </p>

          </div>

        </div>
      )}

    </div>
  );
};

export default StudentResults;