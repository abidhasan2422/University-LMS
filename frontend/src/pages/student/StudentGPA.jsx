import { useEffect, useState } from "react";
import {
  FaChartLine,
  FaGraduationCap,
  FaBookOpen,
  FaCalculator,
} from "react-icons/fa";
import api from "../../api/axios";

const StudentGPA = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [cgpaData, setCgpaData] = useState({
    cgpa: 0,
    total_credits: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH CGPA
  // =========================================================

  useEffect(() => {
    const fetchCGPA = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("results/gpa/cgpa/");

        setCgpaData({
          cgpa: Number(response.data?.cgpa || 0),
          total_credits: Number(
            response.data?.total_credits || 0
          ),
        });
      } catch (err) {
        console.error("Failed to fetch CGPA:", err);

        setError(
          err.response?.data?.detail ||
            "Failed to load CGPA information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCGPA();
  }, []);

  // =========================================================
  // VALUES
  // =========================================================

  const cgpa = cgpaData.cgpa;
  const totalCompletedCredits = cgpaData.total_credits;

  return (
    <div className="student-gpa">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

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

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}

      {/* =====================================================
          GPA SUMMARY
      ===================================================== */}

      <div className="row g-4 mb-4">

        {/* ---------------------------------------------------
            SEMESTER GPA
        --------------------------------------------------- */}

        <div className="col-md-3">

          <div className="gpa-summary-card">

            <div className="gpa-summary-icon blue">
              <FaChartLine />
            </div>

            <span>Semester GPA</span>

            <strong>
              --
            </strong>

            <small>
              Select a semester below
            </small>

          </div>

        </div>

        {/* ---------------------------------------------------
            CGPA
        --------------------------------------------------- */}

        <div className="col-md-3">

          <div className="gpa-summary-card">

            <div className="gpa-summary-icon purple">
              <FaGraduationCap />
            </div>

            <span>Overall CGPA</span>

            <strong>
              {loading
                ? "..."
                : cgpa.toFixed(2)}
            </strong>

            <small>
              Out of 4.00
            </small>

          </div>

        </div>

        {/* ---------------------------------------------------
            COMPLETED CREDITS
        --------------------------------------------------- */}

        <div className="col-md-3">

          <div className="gpa-summary-card">

            <div className="gpa-summary-icon green">
              <FaBookOpen />
            </div>

            <span>Completed Credits</span>

            <strong>
              {loading
                ? "..."
                : totalCompletedCredits.toFixed(2)}
            </strong>

            <small>
              Published courses
            </small>

          </div>

        </div>

        {/* ---------------------------------------------------
            CURRENT CREDITS
        --------------------------------------------------- */}

        <div className="col-md-3">

          <div className="gpa-summary-card">

            <div className="gpa-summary-icon orange">
              <FaCalculator />
            </div>

            <span>CGPA Status</span>

            <strong>
              {loading
                ? "..."
                : cgpa > 0
                ? "Available"
                : "N/A"}
            </strong>

            <small>
              Based on published results
            </small>

          </div>

        </div>

      </div>

      {/* =====================================================
          CGPA INFORMATION
      ===================================================== */}

      <div className="gpa-section-card mb-4">

        <div className="gpa-section-header">

          <div>
            <h5>
              Cumulative GPA
            </h5>

            <p>
              Your CGPA is calculated from all published
              course results and their credit values.
            </p>
          </div>

          <div className="gpa-large-value">

            {loading
              ? "..."
              : cgpa.toFixed(2)}

          </div>

        </div>

        <div className="gpa-info-grid">

          <div className="gpa-info-item">

            <span>
              Total Quality Points
            </span>

            <strong>
              {loading
                ? "..."
                : (
                    cgpa *
                    totalCompletedCredits
                  ).toFixed(2)}
            </strong>

          </div>

          <div className="gpa-info-item">

            <span>
              Total Credits
            </span>

            <strong>
              {loading
                ? "..."
                : totalCompletedCredits.toFixed(2)}
            </strong>

          </div>

          <div className="gpa-info-item">

            <span>
              CGPA
            </span>

            <strong>
              {loading
                ? "..."
                : cgpa.toFixed(2)}
            </strong>

          </div>

        </div>

      </div>

      {/* =====================================================
          SEMESTER GPA HISTORY
      ===================================================== */}

      <div className="gpa-section-card mb-4">

        <div className="gpa-section-title">

          <h5>
            Semester GPA History
          </h5>

          <p>
            Semester-wise GPA will appear here when
            semester GPA data is connected.
          </p>

        </div>

        <div className="gpa-empty-state">

          <FaChartLine />

          <h6>
            Semester GPA
          </h6>

          <p>
            Semester GPA information will be loaded
            from the backend.
          </p>

        </div>

      </div>

      {/* =====================================================
          CURRENT SEMESTER COURSE GRADES
      ===================================================== */}

      <div className="gpa-section-card mb-4">

        <div className="gpa-section-title">

          <h5>
            Course Grades
          </h5>

          <p>
            Your published course results are used to
            calculate your GPA and CGPA.
          </p>

        </div>

        <div className="gpa-empty-state">

          <FaBookOpen />

          <h6>
            Course Results
          </h6>

          <p>
            Detailed course grades are available from
            the Results page.
          </p>

        </div>

      </div>

      {/* =====================================================
          GRADING SCALE
      ===================================================== */}

      <div className="gpa-section-card">

        <div className="gpa-section-title">

          <h5>
            Grading Scale
          </h5>

          <p>
            Current grading scale used by the result
            calculation service.
          </p>

        </div>

        <div className="table-responsive">

          <table className="table gpa-grade-table">

            <thead>

              <tr>
                <th>Grade</th>
                <th>Marks</th>
                <th>Grade Point</th>
              </tr>

            </thead>

            <tbody>

              <tr>
                <td>A+</td>
                <td>80 - 100</td>
                <td>4.00</td>
              </tr>

              <tr>
                <td>A</td>
                <td>75 - 79</td>
                <td>3.75</td>
              </tr>

              <tr>
                <td>A-</td>
                <td>70 - 74</td>
                <td>3.50</td>
              </tr>

              <tr>
                <td>B+</td>
                <td>65 - 69</td>
                <td>3.25</td>
              </tr>

              <tr>
                <td>B</td>
                <td>60 - 64</td>
                <td>3.00</td>
              </tr>

              <tr>
                <td>B-</td>
                <td>55 - 59</td>
                <td>2.75</td>
              </tr>

              <tr>
                <td>C+</td>
                <td>50 - 54</td>
                <td>2.50</td>
              </tr>

              <tr>
                <td>C</td>
                <td>45 - 49</td>
                <td>2.25</td>
              </tr>

              <tr>
                <td>D</td>
                <td>40 - 44</td>
                <td>2.00</td>
              </tr>

              <tr>
                <td>F</td>
                <td>Below 40</td>
                <td>0.00</td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default StudentGPA;