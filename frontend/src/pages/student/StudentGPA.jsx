import {
  FaGraduationCap,
  FaChartLine,
  FaBookOpen,
  FaTrophy,
  FaCheckCircle,
} from "react-icons/fa";
import "../../styles/student/student-gpa.css";
const StudentGPA = () => {
  // Temporary data.
  // Later this will come from the Django GPA/Result API.

  const semesterResults = [
    {
      semester: "Spring 2026",
      gpa: 3.67,
      credits: 10.5,
    },
    {
      semester: "Fall 2025",
      gpa: 3.58,
      credits: 12.0,
    },
    {
      semester: "Summer 2025",
      gpa: 3.42,
      credits: 9.0,
    },
    {
      semester: "Spring 2025",
      gpa: 3.50,
      credits: 12.0,
    },
  ];

  const courseResults = [
    {
      code: "CSE101",
      title: "Introduction to Computer Science",
      credit: 3.0,
      grade: "A-",
      gradePoint: 3.7,
    },
    {
      code: "CSE203",
      title: "Data Structures",
      credit: 3.0,
      grade: "B+",
      gradePoint: 3.3,
    },
    {
      code: "CSE205",
      title: "Database Management System",
      credit: 3.0,
      grade: "A+",
      gradePoint: 4.0,
    },
    {
      code: "CSE208",
      title: "Web Engineering Lab",
      credit: 1.5,
      grade: "A-",
      gradePoint: 3.7,
    },
  ];

  // Temporary CGPA.
  // Later this should be calculated by the backend.
  const cgpa = 3.56;

  const totalCompletedCredits = 43.5;

  const currentSemesterCredits = 10.5;

  const currentSemesterGPA = semesterResults[0].gpa;

  return (
    <div className="student-gpa">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="gpa-page-header mb-4">

        <span className="gpa-label">
          STUDENT PORTAL
        </span>

        <h2>GPA &amp; CGPA</h2>

        <p>
          Track your semester GPA, cumulative GPA, and
          academic performance.
        </p>

      </div>

      {/* =========================================
          GPA SUMMARY
      ========================================= */}

      <div className="row g-4 mb-4">

        {/* Semester GPA */}

        <div className="col-md-3">

          <div className="gpa-summary-card">

            <div className="gpa-summary-icon blue">
              <FaChartLine />
            </div>

            <span>Semester GPA</span>

            <strong>
              {currentSemesterGPA.toFixed(2)}
            </strong>

            <small>
              Spring 2026
            </small>

          </div>

        </div>

        {/* CGPA */}

        <div className="col-md-3">

          <div className="gpa-summary-card">

            <div className="gpa-summary-icon purple">
              <FaGraduationCap />
            </div>

            <span>Overall CGPA</span>

            <strong>
              {cgpa.toFixed(2)}
            </strong>

            <small>
              Out of 4.00
            </small>

          </div>

        </div>

        {/* Completed Credits */}

        <div className="col-md-3">

          <div className="gpa-summary-card">

            <div className="gpa-summary-icon green">
              <FaCheckCircle />
            </div>

            <span>Completed Credits</span>

            <strong>
              {totalCompletedCredits.toFixed(1)}
            </strong>

            <small>
              Successfully completed
            </small>

          </div>

        </div>

        {/* Current Credits */}

        <div className="col-md-3">

          <div className="gpa-summary-card">

            <div className="gpa-summary-icon orange">
              <FaBookOpen />
            </div>

            <span>Current Credits</span>

            <strong>
              {currentSemesterCredits.toFixed(1)}
            </strong>

            <small>
              Spring 2026
            </small>

          </div>

        </div>

      </div>

      {/* =========================================
          SEMESTER GPA HISTORY
      ========================================= */}

      <div className="gpa-section mb-4">

        <div className="gpa-section-header">

          <div>
            <h5>Semester GPA History</h5>

            <p>
              Your academic performance across completed
              semesters.
            </p>
          </div>

        </div>

        <div className="table-responsive">

          <table className="table gpa-table mb-0">

            <thead>

              <tr>
                <th>Semester</th>
                <th>Credits</th>
                <th>GPA</th>
                <th>Performance</th>
              </tr>

            </thead>

            <tbody>

              {semesterResults.map(
                (semester, index) => {

                  const performance =
                    semester.gpa >= 3.5
                      ? "Excellent"
                      : semester.gpa >= 3.0
                      ? "Good"
                      : "Needs Improvement";

                  return (
                    <tr key={semester.semester}>

                      <td>

                        <div className="semester-name">

                          {index === 0 && (
                            <span className="current-semester-dot"></span>
                          )}

                          <strong>
                            {semester.semester}
                          </strong>

                          {index === 0 && (
                            <span className="current-semester-badge">
                              Current
                            </span>
                          )}

                        </div>

                      </td>

                      <td>
                        {semester.credits.toFixed(1)}
                      </td>

                      <td>

                        <strong className="semester-gpa-value">
                          {semester.gpa.toFixed(2)}
                        </strong>

                      </td>

                      <td>

                        <span
                          className={`gpa-performance ${
                            semester.gpa >= 3.5
                              ? "excellent"
                              : semester.gpa >= 3.0
                              ? "good"
                              : "needs-improvement"
                          }`}
                        >
                          {performance}
                        </span>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =========================================
          CURRENT SEMESTER COURSE GRADES
      ========================================= */}

      <div className="gpa-section mb-4">

        <div className="gpa-section-header">

          <div>

            <h5>Current Semester Grades</h5>

            <p>
              Grade and grade point breakdown for
              Spring 2026.
            </p>

          </div>

          <div className="current-gpa-display">

            <span>Semester GPA</span>

            <strong>
              {currentSemesterGPA.toFixed(2)}
            </strong>

          </div>

        </div>

        <div className="table-responsive">

          <table className="table gpa-course-table mb-0">

            <thead>

              <tr>
                <th>Course</th>
                <th>Credit</th>
                <th>Grade</th>
                <th>Grade Point</th>
                <th>Credit × Point</th>
              </tr>

            </thead>

            <tbody>

              {courseResults.map((course) => (

                <tr key={course.code}>

                  <td>

                    <div className="gpa-course">

                      <div className="gpa-course-icon">
                        <FaBookOpen />
                      </div>

                      <div>

                        <strong>
                          {course.code}
                        </strong>

                        <span>
                          {course.title}
                        </span>

                      </div>

                    </div>

                  </td>

                  <td>
                    {course.credit.toFixed(1)}
                  </td>

                  <td>

                    <span className="gpa-grade">
                      {course.grade}
                    </span>

                  </td>

                  <td>

                    <strong className="gpa-point">
                      {course.gradePoint.toFixed(2)}
                    </strong>

                  </td>

                  <td>

                    <strong>
                      {(
                        course.credit *
                        course.gradePoint
                      ).toFixed(2)}
                    </strong>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

     

      {/* =========================================
          GRADING SCALE
      ========================================= */}

      <div className="gpa-section">

        <div className="gpa-section-header">

          <div>

            <h5>Grading Scale</h5>

            <p>
              Grade point reference used for GPA
              calculation.
            </p>

          </div>

        </div>

        <div className="grading-scale">

          <div>
            <strong>A+</strong>
            <span>4.00</span>
          </div>

          <div>
            <strong>A</strong>
            <span>3.75</span>
          </div>

          <div>
            <strong>A-</strong>
            <span>3.50</span>
          </div>

          <div>
            <strong>B+</strong>
            <span>3.25</span>
          </div>

          <div>
            <strong>B</strong>
            <span>3.00</span>
          </div>

          <div>
            <strong>B-</strong>
            <span>2.75</span>
          </div>

          <div>
            <strong>C+</strong>
            <span>2.50</span>
          </div>

          <div>
            <strong>C</strong>
            <span>2.25</span>
          </div>

          <div>
            <strong>D</strong>
            <span>2.00</span>
          </div>

          <div>
            <strong>F</strong>
            <span>0.00</span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default StudentGPA;