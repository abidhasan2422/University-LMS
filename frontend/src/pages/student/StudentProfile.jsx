import {
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaBookOpen,
  FaCalendarAlt,
  FaCheckCircle,
  FaEdit,
} from "react-icons/fa";

const StudentProfile = () => {
  // Temporary data.
  // We will connect this to the backend API later.
  const student = {
    studentId: "STU-0001",
    firstName: "Student",
    lastName: "",
    email: "student@example.com",
    mobile: "01XXXXXXXXX",
    department: "Computer Science & Engineering",
    semester: "Spring 2026",
    academicStatus: "Active",
    registrationDate: "January 2026",
  };

  const fullName = `${student.firstName} ${student.lastName}`.trim();

  return (
    <div className="student-profile">

      {/* Page Header */}
      <div className="profile-page-header mb-4">
        <div>
          <span className="profile-label">
            STUDENT PORTAL
          </span>

          <h2>My Profile</h2>

          <p>
            View your personal and academic information.
          </p>
        </div>
      </div>

      <div className="row g-4">

        {/* =========================
            PROFILE CARD
        ========================= */}

        <div className="col-xl-4">

          <div className="profile-card">

            <div className="profile-cover"></div>

            <div className="profile-avatar">
              <FaUser />
            </div>

            <div className="profile-main-info">

              <h4>{fullName}</h4>

              <p>
                {student.department}
              </p>

              <span className="profile-status">
                <FaCheckCircle />
                {student.academicStatus}
              </span>

            </div>

            <div className="profile-id">
              <span>Student ID</span>

              <strong>
                {student.studentId}
              </strong>
            </div>

          </div>

        </div>

        {/* =========================
            PERSONAL INFORMATION
        ========================= */}

        <div className="col-xl-8">

          <div className="profile-section">

            <div className="profile-section-header">

              <div>
                <h5>Personal Information</h5>

                <p>
                  Your personal contact information
                </p>
              </div>

              <button
                type="button"
                className="profile-edit-btn"
              >
                <FaEdit />
                Edit
              </button>

            </div>

            <div className="profile-info-grid">

              <div className="profile-info-item">

                <div className="profile-info-icon">
                  <FaUser />
                </div>

                <div>
                  <span>Full Name</span>
                  <strong>{fullName}</strong>
                </div>

              </div>

              <div className="profile-info-item">

                <div className="profile-info-icon">
                  <FaIdCard />
                </div>

                <div>
                  <span>Student ID</span>
                  <strong>
                    {student.studentId}
                  </strong>
                </div>

              </div>

              <div className="profile-info-item">

                <div className="profile-info-icon">
                  <FaEnvelope />
                </div>

                <div>
                  <span>Email Address</span>
                  <strong>
                    {student.email}
                  </strong>
                </div>

              </div>

              <div className="profile-info-item">

                <div className="profile-info-icon">
                  <FaPhone />
                </div>

                <div>
                  <span>Mobile Number</span>
                  <strong>
                    {student.mobile}
                  </strong>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =========================
            ACADEMIC INFORMATION
        ========================= */}

        <div className="col-12">

          <div className="profile-section">

            <div className="profile-section-header">

              <div>
                <h5>Academic Information</h5>

                <p>
                  Your current academic information
                </p>
              </div>

            </div>

            <div className="row g-4">

              {/* Department */}

              <div className="col-md-6 col-xl-3">

                <div className="academic-info-card">

                  <div className="academic-icon blue">
                    <FaGraduationCap />
                  </div>

                  <span>Department</span>

                  <strong>
                    {student.department}
                  </strong>

                </div>

              </div>

              {/* Semester */}

              <div className="col-md-6 col-xl-3">

                <div className="academic-info-card">

                  <div className="academic-icon purple">
                    <FaCalendarAlt />
                  </div>

                  <span>Current Semester</span>

                  <strong>
                    {student.semester}
                  </strong>

                </div>

              </div>

              {/* Student ID */}

              <div className="col-md-6 col-xl-3">

                <div className="academic-info-card">

                  <div className="academic-icon green">
                    <FaIdCard />
                  </div>

                  <span>Student ID</span>

                  <strong>
                    {student.studentId}
                  </strong>

                </div>

              </div>

              {/* Registration */}

              <div className="col-md-6 col-xl-3">

                <div className="academic-info-card">

                  <div className="academic-icon orange">
                    <FaBookOpen />
                  </div>

                  <span>Registration Date</span>

                  <strong>
                    {student.registrationDate}
                  </strong>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default StudentProfile;