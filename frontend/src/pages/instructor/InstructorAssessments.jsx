import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileAlt,
  FaBookOpen,
  FaArrowRight,
  FaCalendarAlt,
  FaUsers,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

import api from "../../api/axios";
import "../../styles/instructor/instructor-assessments.css";

const InstructorAssessments = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * =========================================
   * Fetch Instructor Courses
   * =========================================
   */

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("course-offering/");

        setCourses(
          response.data.results || response.data || []
        );
      } catch (error) {
        console.error("Failed to fetch courses:", error);

        setError(
          error.response?.data?.detail ||
            "Failed to load courses."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  /*
   * =========================================
   * Search + Course Filter
   * =========================================
   */

  const filteredCourses = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesCourse =
        selectedCourse === "ALL" ||
        String(course.id) === String(selectedCourse);

      const matchesSearch =
        !search ||
        course.course_code
          ?.toLowerCase()
          .includes(search) ||
        course.course_title
          ?.toLowerCase()
          .includes(search) ||
        course.semester_name
          ?.toLowerCase()
          .includes(search) ||
        String(course.section || "")
          .toLowerCase()
          .includes(search);

      return matchesCourse && matchesSearch;
    });
  }, [courses, searchTerm, selectedCourse]);

  /*
   * =========================================
   * Active Filter
   * =========================================
   */

  const hasActiveFilter =
    searchTerm.trim() !== "" ||
    selectedCourse !== "ALL";

  /*
   * =========================================
   * Open Course Assessments
   * =========================================
   */

  const handleOpenAssessments = (courseOfferingId) => {
    navigate(
      `/instructor/courses/${courseOfferingId}/assessments`
    );
  };

  /*
   * =========================================
   * Clear Filters
   * =========================================
   */

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCourse("ALL");
  };

  return (
    <div className="instructor-assessments-page">

      {/* =========================================
          Page Header
      ========================================= */}

      <div className="assessments-global-header">
        <div>
          <h1>
            <FaFileAlt />
            Assessments
          </h1>

          <p>
            Search and select a course to manage
            assessments and marks.
          </p>
        </div>
      </div>

      {/* =========================================
          Search & Filter
      ========================================= */}

      {!loading &&
        !error &&
        courses.length > 0 && (
          <div className="assessments-filters-card">

            <div className="assessments-filters-header">
              <div>
                <h2>Find Course</h2>

                <p>
                  Search or select a course to manage
                  assessments.
                </p>
              </div>
            </div>

            <div className="assessments-filters-row">

              {/* Search */}

              <div className="assessments-filter-group">

                <label htmlFor="assessment-search">
                  Search Course
                </label>

                <div className="assessments-search-wrapper">

                  <FaSearch className="assessments-search-icon" />

                  <input
                    id="assessment-search"
                    type="text"
                    placeholder="Search by code, title, semester..."
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      className="assessments-clear-search"
                      onClick={() =>
                        setSearchTerm("")
                      }
                    >
                      <FaTimes />
                    </button>
                  )}

                </div>
              </div>

              {/* Select Course */}

              <div className="assessments-filter-group">

                <label htmlFor="assessment-course">
                  Select Course
                </label>

                <select
                  id="assessment-course"
                  value={selectedCourse}
                  onChange={(event) =>
                    setSelectedCourse(event.target.value)
                  }
                >
                  <option value="ALL">
                    All Courses
                  </option>

                  {courses.map((course) => (
                    <option
                      key={course.id}
                      value={course.id}
                    >
                      {course.course_code} -{" "}
                      {course.course_title}
                    </option>
                  ))}
                </select>

              </div>

              {/* Clear Filters */}

              {(searchTerm ||
                selectedCourse !== "ALL") && (
                <button
                  type="button"
                  className="assessments-clear-filters-button"
                  onClick={handleClearFilters}
                >
                  <FaTimes />
                  Clear Filters
                </button>
              )}

            </div>
          </div>
        )}

      {/* =========================================
          Loading
      ========================================= */}

      {loading && (
        <div className="assessments-global-state">
          <p>Loading courses...</p>
        </div>
      )}

      {/* =========================================
          Error
      ========================================= */}

      {!loading && error && (
        <div className="assessments-global-state error">
          <p>{error}</p>
        </div>
      )}

      {/* =========================================
          No Courses
      ========================================= */}

      {!loading &&
        !error &&
        courses.length === 0 && (
          <div className="assessments-global-state empty">

            <FaBookOpen />

            <h3>No Courses Found</h3>

            <p>
              You currently do not have any assigned
              courses.
            </p>

          </div>
        )}

      {/* =========================================
          Initial State
      ========================================= */}

      {!loading &&
        !error &&
        courses.length > 0 &&
        !hasActiveFilter && (
          <div className="assessments-global-state empty">

            <FaBookOpen />

            <h3>Search or Select a Course</h3>

            <p>
              Use the search box or select a course to
              view assessment options.
            </p>

          </div>
        )}

      {/* =========================================
          Result Count
      ========================================= */}

      {!loading &&
        !error &&
        courses.length > 0 &&
        hasActiveFilter &&
        filteredCourses.length > 0 && (
          <div className="assessments-result-info">

            <span>
              Showing{" "}
              <strong>
                {filteredCourses.length}
              </strong>{" "}
              of{" "}
              <strong>
                {courses.length}
              </strong>{" "}
              courses
            </span>

          </div>
        )}

      {/* =========================================
          Course Cards
      ========================================= */}

      {!loading &&
        !error &&
        hasActiveFilter &&
        filteredCourses.length > 0 && (
          <div className="assessments-course-grid">

            {filteredCourses.map((course) => (
              <div
                className="assessments-course-card"
                key={course.id}
              >

                <div className="assessments-course-icon">
                  <FaBookOpen />
                </div>

                <div className="assessments-course-content">

                  <h2>
                    {course.course_code || "N/A"}
                  </h2>

                  <p className="assessments-course-title">
                    {course.course_title || "N/A"}
                  </p>

                  <div className="assessments-course-info">

                    <div>
                      <FaCalendarAlt />

                      <span>
                        {course.semester_name ||
                          "N/A"}
                      </span>
                    </div>

                    <div>
                      <FaUsers />

                      <span>
                        Section{" "}
                        {course.section || "N/A"}
                      </span>
                    </div>

                  </div>

                  <button
                    type="button"
                    className="open-assessments-button"
                    onClick={() =>
                      handleOpenAssessments(course.id)
                    }
                  >
                    Open Assessments
                    <FaArrowRight />
                  </button>

                </div>
              </div>
            ))}

          </div>
        )}

      {/* =========================================
          No Search Result
      ========================================= */}

      {!loading &&
        !error &&
        courses.length > 0 &&
        hasActiveFilter &&
        filteredCourses.length === 0 && (
          <div className="assessments-global-state empty">

            <FaBookOpen />

            <h3>No Courses Found</h3>

            <p>
              No courses match your search or selected
              filter.
            </p>

            <button
              type="button"
              className="assessments-clear-filters-button"
              onClick={handleClearFilters}
            >
              <FaTimes />
              Clear Filters
            </button>

          </div>
        )}

    </div>
  );
};

export default InstructorAssessments;