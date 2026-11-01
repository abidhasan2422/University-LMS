
import { useCallback, useEffect, useState } from "react";
import {
  FaEye,
  FaSearch,
  FaSyncAlt,
  FaEdit,
  FaSave,
  FaTrash,
  FaTimes,
  FaPlus,
} from "react-icons/fa";
import Swal from "sweetalert2";
import api from "../../api/axios";
import "../../styles/admin/course-management.css";

const initialForm = {
  department: "",
  semester: "",
  course_code: "",
  course_title: "",
  course_type: "REGULAR",
  credit: "3.0",
  description: "",
  is_active: true,
};

const getResults = (data) =>
  Array.isArray(data) ? data : data?.results || [];

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [ordering, setOrdering] = useState("course_code");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const loadDropdowns = useCallback(async () => {
    try {
      const [departmentResponse, semesterResponse] = await Promise.all([
        api.get("departments/", { params: { page_size: 100 } }),
        api.get("semesters/", { params: { page_size: 100 } }),
      ]);

      setDepartments(getResults(departmentResponse.data));
      setSemesters(getResults(semesterResponse.data));
    } catch (error) {
      console.error("Failed to load departments or semesters:", error);
      Swal.fire(
        "Error",
        "Unable to load departments or semesters for the course form.",
        "error"
      );
    }
  }, []);

  const loadCourses = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get("courses/", {
        params: {
          search: search.trim() || undefined,
          ordering,
          department: departmentFilter || undefined,
          semester: semesterFilter || undefined,
          page,
        },
      });

      const data = response.data;
      const results = getResults(data);

      setCourses(results);

      if (!Array.isArray(data)) {
        const pageSize = results.length || 10;
        setTotalPages(
          Math.max(1, Math.ceil((data.count || 0) / pageSize))
        );
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to load courses:", error);
      setCourses([]);
      setTotalPages(1);

      Swal.fire(
        "Error",
        error.response?.data?.detail || "Unable to load courses.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [search, ordering, departmentFilter, semesterFilter, page]);

  useEffect(() => {
    loadDropdowns();
  }, [loadDropdowns]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const openAddForm = () => {
    setEditingCourse(null);
    setForm(initialForm);
    setShowForm(true);
  };

  const openEditForm = (course) => {
    setEditingCourse(course);
    setForm({
      department: String(course.department),
      semester: String(course.semester),
      course_code: course.course_code,
      course_title: course.course_title,
      course_type: course.course_type || "REGULAR",
      credit: String(course.credit),
      description: course.description || "",
      is_active: course.is_active,
    });
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.department || !form.semester) {
      Swal.fire(
        "Missing information",
        "Please select a department and semester.",
        "warning"
      );
      return;
    }

    const credit = Number(form.credit);

    if (!Number.isFinite(credit) || credit <= 0 || credit > 6) {
      Swal.fire(
        "Invalid credit",
        "Course credit must be greater than 0 and no more than 6.",
        "warning"
      );
      return;
    }

    const payload = {
      ...form,
      department: Number(form.department),
      semester: Number(form.semester),
      credit: credit.toFixed(1),
      course_code: form.course_code.trim().toUpperCase(),
      course_title: form.course_title.trim(),
      description: form.description.trim(),
    };

    setSaving(true);

    try {
      if (editingCourse) {
        await api.put(`courses/${editingCourse.id}/`, payload);
      } else {
        await api.post("courses/", payload);
      }

      setShowForm(false);
      setEditingCourse(null);

      await Swal.fire(
        editingCourse ? "Updated!" : "Created!",
        editingCourse
          ? "Course updated successfully."
          : "Course created successfully.",
        "success"
      );

      if (!editingCourse && page !== 1) {
        setPage(1);
      } else {
        await loadCourses();
      }
    } catch (error) {
      console.error("Failed to save course:", error);

      const data = error.response?.data;
      const message =
        data && typeof data === "object"
          ? Object.entries(data)
              .map(([field, messages]) => {
                const detail = Array.isArray(messages)
                  ? messages.join(", ")
                  : typeof messages === "string"
                    ? messages
                    : JSON.stringify(messages);

                return `${field}: ${detail}`;
              })
              .join("\n")
          : "Unable to save the course.";

      Swal.fire("Error", message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course) => {
    const result = await Swal.fire({
      title: "Delete course?",
      text: `${course.course_code} - ${course.course_title} will be soft-deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`courses/${course.id}/`);

      await Swal.fire(
        "Deleted!",
        "Course deleted successfully.",
        "success"
      );

      if (courses.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await loadCourses();
      }
    } catch (error) {
      console.error("Failed to delete course:", error);

      Swal.fire(
        "Error",
        error.response?.data?.detail || "Unable to delete this course.",
        "error"
      );
    }
  };

  const resetFilters = () => {
    setSearch("");
    setDepartmentFilter("");
    setSemesterFilter("");
    setOrdering("course_code");
    setPage(1);
  };

  return (
    <div className="course-page">
      <div className="course-page-header">
        <div>
          <h2>Course Management</h2>
          <p>Manage courses, credits, departments, and semesters.</p>
        </div>

        <button
          type="button"
          className="course-btn course-btn-primary"
          onClick={openAddForm}
        >
          <FaPlus /> Add Course
        </button>
      </div>

      <div className="course-toolbar">
        <div className="course-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search course code, title, department..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          aria-label="Filter by department"
          value={departmentFilter}
          onChange={(event) => {
            setDepartmentFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All Departments</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by semester"
          value={semesterFilter}
          onChange={(event) => {
            setSemesterFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All Semesters</option>
          {semesters.map((semester) => (
            <option key={semester.id} value={semester.id}>
              {semester.name} {semester.year}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort courses"
          value={ordering}
          onChange={(event) => {
            setOrdering(event.target.value);
            setPage(1);
          }}
        >
          <option value="course_code">Course code A–Z</option>
          <option value="-course_code">Course code Z–A</option>
          <option value="course_title">Title A–Z</option>
          <option value="-course_title">Title Z–A</option>
          <option value="credit">Credit low to high</option>
          <option value="-credit">Credit high to low</option>
          <option value="-created_at">Recently created</option>
          <option value="created_at">Oldest created</option>
        </select>

        <button
          type="button"
          className="course-btn course-btn-secondary"
          onClick={resetFilters}
        >
          <FaSyncAlt /> Reset
        </button>

        <button
          type="button"
          className="course-btn course-btn-secondary"
          onClick={() => {
            loadDropdowns();
            loadCourses();
          }}
          disabled={loading}
        >
          <FaSyncAlt /> Refresh
        </button>
      </div>

      <div className="course-table-wrapper">
        <table className="course-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Course Code</th>
              <th>Course Title</th>
              <th>Department</th>
              <th>Semester</th>
              <th>Credit</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="course-empty">
                  Loading courses...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan="9" className="course-empty">
                  No courses found.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.id}</td>
                  <td>
                    <strong>{course.course_code}</strong>
                  </td>
                  <td>{course.course_title}</td>
                  <td>{course.department_name}</td>
                  <td>
                    {course.semester_name} {course.semester_year || ""}
                  </td>
                  <td>{course.credit}</td>
                  <td>{course.course_type || "—"}</td>
                  <td>
                    <span
                      className={`course-status ${
                        course.is_active ? "active" : "inactive"
                      }`}
                    >
                      {course.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="course-actions">
                      <button
                        type="button"
                        title="View"
                        className="course-icon-btn view"
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowView(true);
                        }}
                      >
                        <FaEye />
                      </button>

                      <button
                        type="button"
                        title="Edit"
                        className="course-icon-btn edit"
                        onClick={() => openEditForm(course)}
                      >
                        <FaEdit />
                      </button>

                      <button
                        type="button"
                        title="Delete"
                        className="course-icon-btn delete"
                        onClick={() => handleDelete(course)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && courses.length > 0 && (
        <div className="course-pagination">
          <span>
            Page {page} of {totalPages}
          </span>

          <div>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((previous) => previous - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((previous) => previous + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div
          className="course-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowForm(false);
          }}
        >
          <div className="course-modal">
            <div className="course-modal-header">
              <h3>{editingCourse ? "Edit Course" : "Add Course"}</h3>
              <button
                type="button"
                className="course-close-btn"
                onClick={() => setShowForm(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="course-form-grid">
                <div className="course-form-group">
                  <label htmlFor="course-code">Course Code</label>
                  <input
                    id="course-code"
                    name="course_code"
                    value={form.course_code}
                    onChange={handleChange}
                    placeholder="e.g. CSE101"
                    maxLength={20}
                    required
                  />
                </div>

                <div className="course-form-group">
                  <label htmlFor="course-title">Course Title</label>
                  <input
                    id="course-title"
                    name="course_title"
                    value={form.course_title}
                    onChange={handleChange}
                    placeholder="Enter course title"
                    maxLength={255}
                    required
                  />
                </div>

                <div className="course-form-group">
                  <label htmlFor="course-department">Department</label>
                  <select
                    id="course-department"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="course-form-group">
                  <label htmlFor="course-semester">Semester</label>
                  <select
                    id="course-semester"
                    name="semester"
                    value={form.semester}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((semester) => (
                      <option key={semester.id} value={semester.id}>
                        {semester.name} {semester.year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="course-form-group">
                  <label htmlFor="course-type">Course Type</label>
                  <select
                    id="course-type"
                    name="course_type"
                    value={form.course_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="REGULAR">Regular</option>
                    <option value="LAB">Lab</option>
                  </select>
                </div>

                <div className="course-form-group">
                  <label htmlFor="course-credit">Credit</label>
                  <input
                    id="course-credit"
                    name="credit"
                    type="number"
                    min="0.1"
                    max="6"
                    step="0.1"
                    value={form.credit}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="course-form-group course-form-full">
                  <label htmlFor="course-description">Description</label>
                  <textarea
                    id="course-description"
                    name="description"
                    rows="3"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Optional course description"
                  />
                </div>

                <label className="course-checkbox">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                  />
                  Active course
                </label>
              </div>

              <div className="course-modal-footer">
                <button
                  type="button"
                  className="course-btn course-btn-secondary"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="course-btn course-btn-primary"
                  disabled={saving}
                >
                  <FaSave />
                  {saving
                    ? "Saving..."
                    : editingCourse
                      ? "Update Course"
                      : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showView && selectedCourse && (
        <div
          className="course-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowView(false);
          }}
        >
          <div className="course-modal">
            <div className="course-modal-header">
              <h3>Course Details</h3>
              <button
                type="button"
                className="course-close-btn"
                onClick={() => setShowView(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="course-details">
              <p><strong>Course Code:</strong> {selectedCourse.course_code}</p>
              <p><strong>Title:</strong> {selectedCourse.course_title}</p>
              <p><strong>Department:</strong> {selectedCourse.department_name}</p>
              <p><strong>Semester:</strong> {selectedCourse.semester_name}</p>
              <p><strong>Credit:</strong> {selectedCourse.credit}</p>
              <p><strong>Type:</strong> {selectedCourse.course_type || "—"}</p>
              <p><strong>Description:</strong> {selectedCourse.description || "—"}</p>
              <p><strong>Status:</strong> {selectedCourse.is_active ? "Active" : "Inactive"}</p>
              <p>
                <strong>Created:</strong>{" "}
                {selectedCourse.created_at
                  ? new Date(selectedCourse.created_at).toLocaleString()
                  : "—"}
              </p>
            </div>

            <div className="course-modal-footer">
              <button
                type="button"
                className="course-btn course-btn-secondary"
                onClick={() => setShowView(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="course-btn course-btn-primary"
                onClick={() => {
                  setShowView(false);
                  openEditForm(selectedCourse);
                }}
              >
                <FaEdit /> Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
