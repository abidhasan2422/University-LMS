import {
  FaGraduationCap,
  FaCheckCircle,
  FaTimesCircle,
  FaChartLine,
  FaBookOpen,
} from "react-icons/fa";

const StudentResults = () => {
  // Temporary data.
  // Later this will come from the Django Result API.
  const results = [
    {
      id: 1,
      courseCode: "CSE101",
      courseTitle: "Introduction to Computer Science",
      credit: 3.0,
      totalMarks: 82,
      percentage: 82.0,
      letterGrade: "A-",
      gradePoint: 3.7,
      status: "PASS",
    },
    {
      id: 2,
      courseCode: "CSE203",
      courseTitle: "Data Structures",
      credit: 3.0,
      totalMarks: 76,
      percentage: 76.0,
      letterGrade: "B+",
      gradePoint: 3.3,
      status: "PASS",
    },
    {
      id: 3,
      courseCode: "CSE205",
      courseTitle: "Database Management System",
      credit: 3.0,
      totalMarks: 90,
      percentage: 90.0,
      letterGrade: "A+",
      gradePoint: 4.0,
      status: "PASS",
    },
    {
      id: 4,
      courseCode: "CSE208",
      courseTitle: "Web Engineering Lab",
      credit: 1.5,
      totalMarks: 84,
      percentage: 84.0,
      letterGrade: "A-",
      gradePoint: 3.7,
      status: "PASS",
    },
  ];

  const passedCourses = results.filter(
    (result) => result.status === "PASS"
  );

  const failedCourses = results.filter(
    (result) => result.status === "FAIL"
  );

  const totalCredits = results.reduce(
    (total, result) => total + Number(result.credit),
    0
  );

  const weightedGradePoints = results.reduce(
    (total, result) =>
      total +
      Number(result.credit) * Number(result.gradePoint),
    0
  );

  const semesterGPA =
    totalCredits > 0
      ? (weightedGradePoints / totalCredits).toFixed(2)
      : "0.00";

  const averagePercentage =
    results.length > 0
      ? (
          results.reduce(
            (total, result) =>
              total + Number(result.percentage),
            0
          ) / results.length
        ).toFixed(1)
      : "0.0";

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
          SEMESTER
      ========================================= */}

      <div className="result-semester-card mb-4">

        <div>
          <span className="result-semester-label">
            CURRENT SEMESTER
          </span>

          <h5>Spring 2026</h5>

          <p>
            Finalized results for your enrolled courses.
          </p>
        </div>

        <div className="result-semester-icon">
          <FaGraduationCap />
        </div>

      </div>

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}

      <div className="row g-4 mb-4">

        {/* GPA */}

        <div className="col-md-3">

          <div className="result-summary-card">

            <div className="result-summary-icon blue">
              <FaChartLine />
            </div>

            <span>Semester GPA</span>

            <strong>{semesterGPA}</strong>

            <small>
              Out of 4.00
            </small>

          </div>

        </div>

        {/* Average */}

        <div className="col-md-3">

          <div className="result-summary-card">

            <div className="result-summary-icon purple">
              <FaChartLine />
            </div>

            <span>Average Percentage</span>

            <strong>{averagePercentage}%</strong>

            <small>
              Across all courses
            </small>

          </div>

        </div>

        {/* Passed */}

        <div className="col-md-3">

          <div className="result-summary-card">

            <div className="result-summary-icon green">
              <FaCheckCircle />
            </div>

            <span>Passed Courses</span>

            <strong>{passedCourses.length}</strong>

            <small>
              Successfully completed
            </small>

          </div>

        </div>

        {/* Failed */}

        <div className="col-md-3">

          <div className="result-summary-card">

            <div className="result-summary-icon red">
              <FaTimesCircle />
            </div>

            <span>Failed Courses</span>

            <strong>{failedCourses.length}</strong>

            <small>
              This semester
            </small>

          </div>

        </div>

      </div>

      {/* =========================================
          RESULT TABLE
      ========================================= */}

      <div className="results-section">

        <div className="results-section-header">

          <div>

            <h5>Course Results</h5>

            <p>
              Your finalized results for Spring 2026.
            </p>

          </div>

        </div>

        <div className="table-responsive">

          <table className="table results-table mb-0">

            <thead>

              <tr>
                <th>Course</th>
                <th>Credit</th>
                <th>Total Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Grade Point</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {results.map((result) => (

                <tr key={result.id}>

                  {/* Course */}

                  <td>

                    <div className="result-course">

                      <div className="result-course-icon">
                        <FaBookOpen />
                      </div>

                      <div>

                        <strong>
                          {result.courseCode}
                        </strong>

                        <span>
                          {result.courseTitle}
                        </span>

                      </div>

                    </div>

                  </td>

                  {/* Credit */}

                  <td>
                    {Number(result.credit).toFixed(1)}
                  </td>

                  {/* Marks */}

                  <td>

                    <strong className="result-marks">
                      {Number(result.totalMarks).toFixed(2)}
                    </strong>

                  </td>

                  {/* Percentage */}

                  <td>

                    <strong className="result-percentage">
                      {Number(result.percentage).toFixed(2)}%
                    </strong>

                  </td>

                  {/* Grade */}

                  <td>

                    <span className="letter-grade">
                      {result.letterGrade}
                    </span>

                  </td>

                  {/* Grade Point */}

                  <td>

                    <strong className="grade-point">
                      {Number(result.gradePoint).toFixed(2)}
                    </strong>

                  </td>

                  {/* Status */}

                  <td>

                    {result.status === "PASS" ? (

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

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* =========================================
          GRADING INFORMATION
      ========================================= */}

      <div className="result-info-box mt-4">

        <FaGraduationCap />

        <div>

          <strong>
            Result Information
          </strong>

          <p>
            Results are finalized and published by the
            instructor or authorized academic staff.
            Semester GPA is calculated based on course
            credits and grade points.
          </p>

        </div>

      </div>

    </div>
  );
};

export default StudentResults;