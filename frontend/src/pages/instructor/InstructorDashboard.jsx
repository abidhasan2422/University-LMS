import { useEffect, useState } from "react";
import api from "../../api/axios";

function InstructorDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("instructors/dashboard/");
        setDashboard(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load instructor dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Instructor Dashboard</h1>

      <h2>
        Welcome, {dashboard?.instructor?.full_name}
      </h2>

      <div>
        <p>
          Total Courses: {dashboard?.statistics?.total_courses}
        </p>

        <p>
          Total Students: {dashboard?.statistics?.total_students}
        </p>

        <p>
          Active Courses: {dashboard?.statistics?.active_courses}
        </p>
      </div>

      <h2>My Courses</h2>

      {dashboard?.courses?.map((course) => (
        <div key={course.id}>
          <h3>
            {course.course_code} - {course.course_title}
          </h3>

          <p>
            Semester: {course.semester}
          </p>

          <p>
            Section: {course.section}
          </p>

          <p>
            Students: {course.student_count}
          </p>
        </div>
      ))}
    </div>
  );
}

export default InstructorDashboard;