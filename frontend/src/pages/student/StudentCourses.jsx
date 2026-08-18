import {
  FaBookOpen,
  FaFlask,
  FaUserTie,
  FaCalendarAlt,
  FaCreditCard,
  FaArrowRight,
} from "react-icons/fa";

const StudentCourses = () => {
  // Temporary data.
  // We will connect this to the Enrollment API later.
  const courses = [
    {
      code: "CSE101",
      title: "Introduction to Computer Science",
      credit: "3.0",
      type: "REGULAR",
      semester: "Spring 2026",
      instructor: "Dr. Rahman",
    },
    {
      code: "CSE203",
      title: "Data Structures",
      credit: "3.0",
      type: "REGULAR",
      semester: "Spring 2026",
      instructor: "Mr. Hasan",
    },
    {
      code: "CSE205",
      title: "Database Management System",
      credit: "3.0",
      type: "REGULAR",
      semester: "Spring 2026",
      instructor: "Ms. Akter",
    },
    {
      code: "CSE207",
      title: "Web Engineering",
      credit: "3.0",
      type: "REGULAR",
      semester: "Spring 2026",
      instructor: "Dr. Karim",
    },
    {
      code: "CSE208",
      title: "Web Engineering Lab",
      credit: "1.5",
      type: "LAB",
      semester: "Spring 2026",
      instructor: "Dr. Karim",
    },
  ];

  return (
    <div className="student-courses">

      {/* Page Header */}
      <div className="courses-page-header mb-4">
        <span className="courses-label">
          STUDENT PORTAL
        </span>

        <h2>My Courses</h2>

        <p>
          View your currently enrolled courses and
          course information.
        </p>
      </div>

      {/* Course Summary */}
      <div className="row g-4 mb-4">

        <div className="col-md-4">
          <div className="course-summary-card">
            <div className="course-summary-icon blue">
              <FaBookOpen />
            </div>

            <div>
              <span>Total Courses</span>
              <strong>{courses.length}</strong>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="course-summary-card">
            <div className="course-summary-icon purple">
              <FaCreditCard />
            </div>

            <div>
              <span>Total Credits</span>
              <strong>
                {courses
                  .reduce(
                    (total, course) =>
                      total + Number(course.credit),
                    0
                  )
                  .toFixed(1)}
              </strong>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="course-summary-card">
            <div className="course-summary-icon green">
              <FaCalendarAlt />
            </div>

            <div>
              <span>Current Semester</span>
              <strong>Spring 2026</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Courses */}
      <div className="courses-section">

        <div className="courses-section-header">

          <div>
            <h5>Enrolled Courses</h5>

            <p>
              Courses registered for the current semester
            </p>
          </div>

        </div>

        <div className="row g-4 p-4">

          {courses.map((course) => (

            <div
              className="col-md-6 col-xl-4"
              key={course.code}
            >

              <div className="course-card">

                <div className="course-card-top">

                  <div className="course-code-box">
                    {course.code}
                  </div>

                  <span
                    className={`course-type ${
                      course.type === "LAB"
                        ? "lab"
                        : "regular"
                    }`}
                  >
                    {course.type === "LAB"
                      ? "Lab"
                      : "Regular"}
                  </span>

                </div>

                <div className="course-card-body">

                  <h5>
                    {course.title}
                  </h5>

                  <div className="course-detail">
                    <FaUserTie />
                    <span>
                      {course.instructor}
                    </span>
                  </div>

                  <div className="course-detail">
                    <FaCreditCard />
                    <span>
                      {course.credit} Credits
                    </span>
                  </div>

                  <div className="course-detail">
                    <FaCalendarAlt />
                    <span>
                      {course.semester}
                    </span>
                  </div>

                </div>

                <div className="course-card-footer">

                  <span>
                    Course Details
                  </span>

                  <FaArrowRight />

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
};

export default StudentCourses;