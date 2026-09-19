import { useEffect, useState } from "react";

import {
  FaBookOpen,
  FaUsers,
  FaDoorOpen,
  FaCalendarAlt,
  FaClock,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

import api from "../../api/axios";
import "../../styles/instructor/instructor-courses.css";

import { useNavigate } from "react-router-dom";


function InstructorCourses() {

  // =========================================
  // State
  // =========================================

  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [semesterFilter, setSemesterFilter] =
    useState("ALL");

  const navigate = useNavigate();


  // =========================================
  // Fetch Courses
  // =========================================

  useEffect(() => {
    fetchCourses();
  }, []);


  const fetchCourses = async () => {

    try {

      setLoading(true);

      setError("");

      const response =
        await api.get("course-offering/");


      const courseData =
        Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];


      setCourses(courseData);

    } catch (error) {

      console.error(
        "Failed to fetch instructor courses:",
        error
      );


      setError(
        error.response?.data?.detail ||
          "Failed to load your courses."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================
  // Format Time
  // =========================================

  const formatTime = (time) => {

    if (!time) {
      return "N/A";
    }


    return new Date(
      `1970-01-01T${time}`
    ).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

  };


  // =========================================
  // Get Unique Semesters
  // =========================================

  const semesters = [
    ...new Set(
      courses
        .map(
          (course) =>
            course.semester_name
        )
        .filter(Boolean)
    ),
  ];


  // =========================================
  // Filter Courses
  // =========================================

  const filteredCourses = courses.filter(
    (course) => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();


      const courseCode =
        (
          course.course_code || ""
        ).toLowerCase();


      const courseTitle =
        (
          course.course_title || ""
        ).toLowerCase();


      // Search
      const matchesSearch =
        !search ||
        courseCode.includes(search) ||
        courseTitle.includes(search);


      // Status
      const matchesStatus =
        statusFilter === "ALL" ||
        course.status === statusFilter;


      // Semester
      const matchesSemester =
        semesterFilter === "ALL" ||
        course.semester_name ===
          semesterFilter;


      return (
        matchesSearch &&
        matchesStatus &&
        matchesSemester
      );

    }
  );


  // =========================================
  // Check Whether User Applied Filter
  // =========================================

  const hasActiveFilter =
    searchTerm.trim() !== "" ||
    statusFilter !== "ALL" ||
    semesterFilter !== "ALL";


  // =========================================
  // Loading
  // =========================================

  if (loading) {

    return (

      <div className="instructor-courses-page">

        <div className="courses-loading">

          Loading your courses...

        </div>

      </div>

    );

  }


  // =========================================
  // Error
  // =========================================

  if (error) {

    return (

      <div className="instructor-courses-page">

        <div className="courses-error">

          {error}

        </div>

      </div>

    );

  }


  // =========================================
  // Render
  // =========================================

  return (

    <div className="instructor-courses-page">


      {/* =====================================
          Page Header
          ===================================== */}

      <div className="courses-header">

        <div>

          <h1>
            My Courses
          </h1>

          <p>
            View and manage the courses
            assigned to you.
          </p>

        </div>


        <div className="courses-header-icon">

          <FaBookOpen />

        </div>

      </div>


      {/* =====================================
          No Courses Assigned
          ===================================== */}

      {courses.length === 0 ? (

        <div className="courses-empty">

          <FaBookOpen />

          <h3>
            No Courses Assigned
          </h3>

          <p>
            You currently do not have
            any assigned courses.
          </p>

        </div>

      ) : (

        <>

          {/* =================================
              Filters
              ================================= */}

          <div className="courses-filters-card">


            {/* Filter Header */}

            <div className="courses-filters-header">

              <div>

                <h2>
                  Course Filters
                </h2>

                <p>
                  Search and filter your
                  assigned courses.
                </p>

              </div>

            </div>


            {/* Filter Row */}

            <div className="courses-filters-row">


              {/* =============================
                  Search
                  ============================= */}

              <div className="course-filter-group search-filter-group">

                <label htmlFor="course-search">

                  Search Courses

                </label>


                <div className="course-search-wrapper">

                  <FaSearch
                    className="course-search-icon"
                  />


                  <input
                    id="course-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(
                        e.target.value
                      )
                    }
                    placeholder="Search by course code or title..."
                  />


                  {searchTerm && (

                    <button
                      type="button"
                      className="course-clear-search"
                      onClick={() =>
                        setSearchTerm("")
                      }
                      aria-label="Clear search"
                    >

                      <FaTimes />

                    </button>

                  )}

                </div>

              </div>


              {/* =============================
                  Status
                  ============================= */}

              <div className="course-filter-group">

                <label htmlFor="status-filter">

                  Status

                </label>


                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                >

                  <option value="ALL">
                    All Status
                  </option>

                  <option value="OPEN">
                    Open
                  </option>

                  <option value="CLOSED">
                    Closed
                  </option>

                  <option value="COMPLETED">
                    Completed
                  </option>

                </select>

              </div>


              {/* =============================
                  Semester
                  ============================= */}

              <div className="course-filter-group">

                <label htmlFor="semester-filter">

                  Semester

                </label>


                <select
                  id="semester-filter"
                  value={semesterFilter}
                  onChange={(e) =>
                    setSemesterFilter(
                      e.target.value
                    )
                  }
                >

                  <option value="ALL">
                    All Semesters
                  </option>


                  {semesters.map(
                    (semester) => (

                      <option
                        key={semester}
                        value={semester}
                      >

                        {semester}

                      </option>

                    )
                  )}

                </select>

              </div>

            </div>

          </div>


          {/* =================================
              Filter Result
              ================================= */}

          {!hasActiveFilter ? (

            /* ---------------------------------
               Initial State
               --------------------------------- */

            <div className="courses-filter-empty">

              <FaSearch />

              <h3>
                Search or Filter Courses
              </h3>

              <p>
                Use the search box or filters
                above to find your courses.
              </p>

            </div>

          ) : filteredCourses.length === 0 ? (

            /* ---------------------------------
               No Matching Course
               --------------------------------- */

            <div className="courses-filter-empty">

              <FaBookOpen />

              <h3>
                No Courses Found
              </h3>

              <p>
                No courses match your current
                search or filter criteria.
              </p>


              <button
                type="button"
                className="clear-course-filters-button"
                onClick={() => {

                  setSearchTerm("");

                  setStatusFilter("ALL");

                  setSemesterFilter("ALL");

                }}
              >

                Clear Filters

              </button>

            </div>

          ) : (

            /* ---------------------------------
               Matching Courses
               --------------------------------- */

            <>

              {/* Result Count */}

              <div className="courses-result-info">

                Showing{" "}

                <strong>
                  {filteredCourses.length}
                </strong>

                {" "}of{" "}

                <strong>
                  {courses.length}
                </strong>

                {" "}courses

              </div>


              {/* Course Grid */}

              <div className="instructor-course-grid">


                {filteredCourses.map(
                  (course) => (

                    <div
                      className="instructor-course-card"
                      key={course.id}
                    >


                      {/* =====================
                          Course Header
                          ===================== */}

                      <div className="course-card-header">

                        <div>

                          <span className="course-code">

                            {course.course_code}

                          </span>


                          <h2>

                            {course.course_title}

                          </h2>

                        </div>


                        <span
                          className={`course-status ${course.status?.toLowerCase()}`}
                        >

                          {course.status}

                        </span>

                      </div>


                      {/* =====================
                          Course Information
                          ===================== */}

                      <div className="course-card-info">


                        {/* Semester */}

                        <div className="course-info-item">

                          <FaCalendarAlt />

                          <div>

                            <span>
                              Semester
                            </span>

                            <strong>

                              {course.semester_name}{" "}

                              {course.academic_year}

                            </strong>

                          </div>

                        </div>


                        {/* Students */}

                        <div className="course-info-item">

                          <FaUsers />

                          <div>

                            <span>
                              Students
                            </span>

                            <strong>

                              {course.capacity -
                                course.available_seats}

                              {" / "}

                              {course.capacity}

                            </strong>

                          </div>

                        </div>


                        {/* Room */}

                        <div className="course-info-item">

                          <FaDoorOpen />

                          <div>

                            <span>
                              Room
                            </span>

                            <strong>

                              {course.room ||
                                "N/A"}

                            </strong>

                          </div>

                        </div>


                        {/* Class Day */}

                        <div className="course-info-item">

                          <FaCalendarAlt />

                          <div>

                            <span>
                              Class Day
                            </span>

                            <strong>

                              {course.day ||
                                "N/A"}

                            </strong>

                          </div>

                        </div>


                        {/* Time */}

                        <div className="course-info-item">

                          <FaClock />

                          <div>

                            <span>
                              Time
                            </span>

                            <strong>

                              {formatTime(
                                course.start_time
                              )}

                              {" - "}

                              {formatTime(
                                course.end_time
                              )}

                            </strong>

                          </div>

                        </div>


                        {/* Section */}

                        <div className="course-info-item">

                          <FaBookOpen />

                          <div>

                            <span>
                              Section
                            </span>

                            <strong>

                              Section{" "}
                              {course.section}

                            </strong>

                          </div>

                        </div>


                        {/* View Course */}

                        <button
                          className="view-course-button"
                          onClick={() =>
                            navigate(
                              `/instructor/courses/${course.id}`
                            )
                          }
                        >

                          View Course

                        </button>


                      </div>

                    </div>

                  )
                )}

              </div>

            </>

          )}

        </>

      )}

    </div>

  );

}

export default InstructorCourses;