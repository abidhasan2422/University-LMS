import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaClipboardCheck,
  FaBookOpen,
  FaArrowRight,
  FaCalendarAlt,
  FaUsers,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

import api from "../../api/axios";
import "../../styles/instructor/instructor-attendance.css";

const InstructorAttendance = () => {
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
   * Check Whether User Applied a Filter
   * =========================================
   */

  const hasActiveFilter =
    searchTerm.trim() !== "" ||
    selectedCourse !== "ALL";

  /*
   * =========================================
   * Open Course Attendance
   * =========================================
   */

  const handleOpenAttendance = (courseOfferingId) => {
    navigate(
      `/instructor/courses/${courseOfferingId}/attendance`
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
    <div className="instructor-attendance-page">

      {/* =========================================
          Page Header
      ========================================= */}

      <div className="attendance-global-header">
        <div>
          <h1>
            <FaClipboardCheck />
            Attendance
          </h1>

          <p>
            Search and select a course to manage student
            attendance.
          </p>
        </div>
      </div>

      {/* =========================================
          Search & Filter Card
      ========================================= */}

      {!loading &&
        !error &&
        courses.length > 0 && (
          <div className="attendance-filters-card">

            <div className="attendance-filters-header">
              <div>
                <h2>Find Course</h2>

                <p>
                  Search or select a course to manage
                  attendance.
                </p>
              </div>
            </div>

            <div className="attendance-filters-row">

              {/* Search Course */}

              <div className="attendance-filter-group search-group">

                <label htmlFor="attendance-search">
                  Search Course
                </label>

                <div className="attendance-search-wrapper">

                  <FaSearch className="attendance-search-icon" />

                  <input
                    id="attendance-search"
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
                      className="attendance-clear-search"
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

              <div className="attendance-filter-group">

                <label htmlFor="attendance-course">
                  Select Course
                </label>

                <select
                  id="attendance-course"
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
                  className="attendance-clear-filters-button"
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
          Loading State
      ========================================= */}

      {loading && (
        <div className="attendance-global-state">
          <p>Loading courses...</p>
        </div>
      )}

      {/* =========================================
          Error State
      ========================================= */}

      {!loading && error && (
        <div className="attendance-global-state error">
          <p>{error}</p>
        </div>
      )}

      {/* =========================================
          No Courses From Backend
      ========================================= */}

      {!loading &&
        !error &&
        courses.length === 0 && (
          <div className="attendance-global-state empty">

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
          Show Before Search / Filter
      ========================================= */}

      {!loading &&
        !error &&
        courses.length > 0 &&
        !hasActiveFilter && (
          <div className="attendance-global-state empty">

            <FaBookOpen />

            <h3>Search or Select a Course</h3>

            <p>
              Use the search box or select a course to
              view attendance options.
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
          <div className="attendance-result-info">

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
          <div className="attendance-course-grid">

            {filteredCourses.map((course) => (
              <div
                className="attendance-course-card"
                key={course.id}
              >

                {/* Course Icon */}

                <div className="attendance-course-icon">
                  <FaBookOpen />
                </div>

                {/* Course Content */}

                <div className="attendance-course-content">

                  <h2>
                    {course.course_code || "N/A"}
                  </h2>

                  <p className="attendance-course-title">
                    {course.course_title || "N/A"}
                  </p>

                  <div className="attendance-course-info">

                    {/* Semester */}

                    <div>
                      <FaCalendarAlt />

                      <span>
                        {course.semester_name ||
                          "N/A"}
                      </span>
                    </div>

                    {/* Section */}

                    <div>
                      <FaUsers />

                      <span>
                        Section{" "}
                        {course.section || "N/A"}
                      </span>
                    </div>

                  </div>

                  {/* Open Attendance */}

                  <button
                    type="button"
                    className="open-attendance-button"
                    onClick={() =>
                      handleOpenAttendance(course.id)
                    }
                  >
                    Open Attendance

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
          <div className="attendance-global-state empty">

            <FaBookOpen />

            <h3>No Courses Found</h3>

            <p>
              No courses match your search or selected
              filter.
            </p>

            <button
              type="button"
              className="attendance-clear-filters-button"
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

export default InstructorAttendance;