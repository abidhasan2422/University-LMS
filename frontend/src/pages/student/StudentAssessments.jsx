import {
  FaClipboardList,
  FaBookOpen,
  FaCheckCircle,
  FaClock,
  FaChartBar,
} from "react-icons/fa";

const StudentAssessments = () => {
 
  const assessments = [
    {
      id: 1,
      courseCode: "CSE101",
      courseTitle: "Introduction to Computer Science",
      assessment: "Midterm Examination",
      marksObtained: 82,
      totalMarks: 100,
      status: "Published",
    },
    {
      id: 2,
      courseCode: "CSE203",
      courseTitle: "Data Structures",
      assessment: "Midterm Examination",
      marksObtained: 76,
      totalMarks: 100,
      status: "Published",
    },
    {
      id: 3,
      courseCode: "CSE205",
      courseTitle: "Database Management System",
      assessment: "Class Test",
      marksObtained: 18,
      totalMarks: 20,
      status: "Published",
    },
    {
      id: 4,
      courseCode: "CSE208",
      courseTitle: "Web Engineering Lab",
      assessment: "Lab Performance",
      marksObtained: 27,
      totalMarks: 30,
      status: "Published",
    },
    {
      id: 5,
      courseCode: "CSE208",
      courseTitle: "Web Engineering Lab",
      assessment: "Lab Viva",
      marksObtained: 16,
      totalMarks: 20,
      status: "Pending",
    },
  ];

  const publishedAssessments = assessments.filter(
    (assessment) => assessment.status === "Published"
  );

  const pendingAssessments = assessments.filter(
    (assessment) => assessment.status === "Pending"
  );

  const totalObtained = publishedAssessments.reduce(
    (total, assessment) =>
      total + assessment.marksObtained,
    0
  );

  const totalMarks = publishedAssessments.reduce(
    (total, assessment) =>
      total + assessment.totalMarks,
    0
  );

  const overallPercentage =
    totalMarks > 0
      ? ((totalObtained / totalMarks) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="student-assessments">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="assessments-page-header mb-4">

        <span className="assessments-label">
          STUDENT PORTAL
        </span>

        <h2>Assessments</h2>

        <p>
          View your assessment marks and academic
          performance.
        </p>

      </div>

      {/* =========================================
          SUMMARY
      ========================================= */}

      <div className="row g-4 mb-4">

        {/* Total Assessments */}

        <div className="col-md-4">

          <div className="assessment-summary-card">

            <div className="assessment-summary-icon blue">
              <FaClipboardList />
            </div>

            <div>
              <span>Total Assessments</span>

              <strong>
                {assessments.length}
              </strong>

              <small>
                This semester
              </small>
            </div>

          </div>

        </div>

        {/* Published */}

        <div className="col-md-4">

          <div className="assessment-summary-card">

            <div className="assessment-summary-icon green">
              <FaCheckCircle />
            </div>

            <div>
              <span>Published Marks</span>

              <strong>
                {publishedAssessments.length}
              </strong>

              <small>
                Available to view
              </small>

            </div>

          </div>

        </div>

        {/* Overall */}

        <div className="col-md-4">

          <div className="assessment-summary-card">

            <div className="assessment-summary-icon purple">
              <FaChartBar />
            </div>

            <div>
              <span>Overall Performance</span>

              <strong>
                {overallPercentage}%
              </strong>

              <small>
                Published assessments
              </small>

            </div>

          </div>

        </div>

      </div>

      {/* =========================================
          ASSESSMENT TABLE
      ========================================= */}

      <div className="assessments-section">

        <div className="assessments-section-header">

          <div>

            <h5>Assessment Marks</h5>

            <p>
              Marks entered and published by your
              instructor.
            </p>

          </div>

        </div>

        <div className="table-responsive">

          <table className="table assessments-table mb-0">

            <thead>

              <tr>
                <th>Course</th>
                <th>Assessment</th>
                <th>Marks Obtained</th>
                <th>Total Marks</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {assessments.map((assessment) => {

                const percentage =
                  assessment.totalMarks > 0
                    ? (
                        (assessment.marksObtained /
                          assessment.totalMarks) *
                        100
                      ).toFixed(1)
                    : "0.0";

                return (
                  <tr key={assessment.id}>

                    {/* Course */}

                    <td>

                      <div className="assessment-course">

                        <div className="assessment-course-icon">
                          <FaBookOpen />
                        </div>

                        <div>

                          <strong>
                            {assessment.courseCode}
                          </strong>

                          <span>
                            {assessment.courseTitle}
                          </span>

                        </div>

                      </div>

                    </td>

                    {/* Assessment */}

                    <td>
                      <span className="assessment-name">
                        {assessment.assessment}
                      </span>
                    </td>

                    {/* Obtained */}

                    <td>

                      <strong className="marks-obtained">
                        {assessment.marksObtained}
                      </strong>

                    </td>

                    {/* Total */}

                    <td>
                      {assessment.totalMarks}
                    </td>

                    {/* Percentage */}

                    <td>

                      <div className="assessment-percentage">

                        <strong>
                          {percentage}%
                        </strong>

                        <div className="progress">

                          <div
                            className="progress-bar"
                            style={{
                              width: `${percentage}%`,
                            }}
                          ></div>

                        </div>

                      </div>

                    </td>

                    {/* Status */}

                    <td>

                      {assessment.status ===
                      "Published" ? (
                        <span className="assessment-status published">
                          <FaCheckCircle />
                          Published
                        </span>
                      ) : (
                        <span className="assessment-status pending">
                          <FaClock />
                          Pending
                        </span>
                      )}

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </div>

      {/* =========================================
          INFORMATION
      ========================================= */}

      <div className="assessment-info-box mt-4">

        <FaClipboardList />

        <div>

          <strong>
            Assessment Information
          </strong>

          <p>
            Assessment marks are entered and published
            by your course instructor. Students can
            only view their own published marks.
          </p>

        </div>

      </div>

    </div>
  );
};

export default StudentAssessments;