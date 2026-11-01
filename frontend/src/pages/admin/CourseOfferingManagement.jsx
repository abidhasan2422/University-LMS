
import { useCallback, useEffect, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaSync,
  FaFilter,
} from "react-icons/fa";
import Swal from "sweetalert2";
import api from "../../api/axios";
import "../../styles/admin/course-offering-management.css";

const initialForm = {
  course: "",
  instructor: "",
  semester: "",
  academic_year: new Date().getFullYear(),
  section: "A",
  capacity: 40,
  room: "",
  day: "SATURDAY",
  start_time: "09:00",
  end_time: "10:30",
  status: "OPEN",
};

const days = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
];

const sections = ["A", "B", "C", "D"];
const statuses = ["OPEN", "CLOSED", "COMPLETED"];

function getRows(data) {
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
}

function getErrorMessage(error) {
  const data = error.response?.data;

  if (!data) {
    return "Unable to connect to the server. Please try again.";
  }

  if (typeof data === "string") return data;

  return Object.entries(data)
    .map(([field, messages]) => {
      const message = Array.isArray(messages)
        ? messages.join(" ")
        : typeof messages === "object"
          ? JSON.stringify(messages)
          : String(messages);

      return `${field === "non_field_errors" ? "Error" : field}: ${message}`;
    })
    .join("\n");
}

function getInstructorName(instructor) {
  if (instructor.instructor_name) return instructor.instructor_name;

  const user = instructor.user ?? {};
  const name = [
    user.first_name ?? instructor.first_name,
    user.last_name ?? instructor.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return name || instructor.employee_id || `Instructor #${instructor.id}`;
}

function getSemesterLabel(semester) {
  return `${semester.name ?? "Semester"}${
    semester.year ? ` ${semester.year}` : ""
  }`;
}

export default function CourseOfferingManagement() {
  const [offerings, setOfferings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewOffering, setViewOffering] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    course: "",
    instructor: "",
    semester: "",
    academic_year: "",
    section: "",
    status: "",
    ordering: "academic_year",
  });
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const loadDropdowns = useCallback(async () => {
    try {
      const [courseResponse, instructorResponse, semesterResponse] =
        await Promise.all([
          api.get("courses/", { params: { page_size: 100 } }),
          api.get("instructors/", { params: { page_size: 100 } }),
          api.get("semesters/", { params: { page_size: 100 } }),
        ]);

      setCourses(getRows(courseResponse.data));
      setInstructors(getRows(instructorResponse.data));
      setSemesters(getRows(semesterResponse.data));
    } catch (error) {
      console.error("Failed to load dropdown data:", error);
      Swal.fire(
        "Dropdown data unavailable",
        "Could not load courses, instructors, or semesters. Check their API endpoints.",
        "error"
      );
    }
  }, []);

  const loadOfferings = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        page,
        search: searchInput.trim(),
        ordering: filters.ordering,
      };

      Object.entries(filters).forEach(([key, value]) => {
        if (key !== "ordering" && value !== "") {
          params[key] = value;
        }
      });

      const response = await api.get("course-offerings/", { params });
      const data = response.data;

      setOfferings(getRows(data));
      setTotalCount(data.count ?? getRows(data).length);
    } catch (error) {
      console.error("Failed to load course offerings:", error);
      setOfferings([]);
      setTotalCount(0);

      Swal.fire(
        "Unable to load offerings",
        getErrorMessage(error),
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [page, searchInput, filters]);

  useEffect(() => {
    loadDropdowns();
  }, [loadDropdowns]);

  useEffect(() => {
    loadOfferings();
  }, [loadOfferings]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setPage(1);
    setFilters((previous) => ({ ...previous, [name]: value }));
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ ...initialForm, academic_year: new Date().getFullYear() });
    setShowForm(true);
  };

  const openEditForm = (offering) => {
    setEditingId(offering.id);
    setForm({
      course: String(offering.course),
      instructor: String(offering.instructor),
      semester: String(offering.semester),
      academic_year: offering.academic_year,
      section: offering.section,
      capacity: offering.capacity,
      room: offering.room,
      day: offering.day,
      start_time: offering.start_time?.slice(0, 5) ?? "09:00",
      end_time: offering.end_time?.slice(0, 5) ?? "10:30",
      status: offering.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.course ||
      !form.instructor ||
      !form.semester ||
      !form.room.trim()
    ) {
      Swal.fire("Required fields", "Please complete all required fields.", "warning");
      return;
    }

    if (form.start_time >= form.end_time) {
      Swal.fire("Invalid schedule", "End time must be later than start time.", "warning");
      return;
    }

    const payload = {
      ...form,
      course: Number(form.course),
      instructor: Number(form.instructor),
      semester: Number(form.semester),
      academic_year: Number(form.academic_year),
      capacity: Number(form.capacity),
      room: form.room.trim(),
    };

    setSaving(true);

    try {
      if (editingId) {
        await api.put(`course-offerings/${editingId}/`, payload);
      } else {
        await api.post("course-offerings/", payload);
      }

      setShowForm(false);
      setEditingId(null);

      await Swal.fire(
        "Success",
        `Course offering ${editingId ? "updated" : "created"} successfully.`,
        "success"
      );

      await loadOfferings();
    } catch (error) {
      Swal.fire("Unable to save", getErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (offering) => {
    const result = await Swal.fire({
      title: "Delete course offering?",
      text: `${offering.course_code} — Section ${offering.section}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#dc3545",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`course-offerings/${offering.id}/`);

      await Swal.fire(
        "Deleted",
        "Course offering deleted successfully.",
        "success"
      );

      if (offerings.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await loadOfferings();
      }
    } catch (error) {
      Swal.fire("Delete failed", getErrorMessage(error), "error");
    }
  };

  return (
    <div className="co-page">
      <div className="co-heading">
        <div>
          <h2>Course Offering Management</h2>
          <p>Manage course sections, instructors, classrooms, and schedules.</p>
        </div>

        <div className="co-heading-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              loadDropdowns();
              loadOfferings();
            }}
          >
            <FaSync className="me-2" />
            Refresh
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreateForm}
          >
            <FaPlus className="me-2" />
            Add Offering
          </button>
        </div>
      </div>

      <div className="co-summary">
        <div className="co-summary-card">
          <span>Total offerings on record</span>
          <strong>{totalCount}</strong>
        </div>
        <div className="co-summary-card">
          <span>Open on this page</span>
          <strong>{offerings.filter((item) => item.status === "OPEN").length}</strong>
        </div>
        <div className="co-summary-card">
          <span>Closed on this page</span>
          <strong>{offerings.filter((item) => item.status === "CLOSED").length}</strong>
        </div>
      </div>

      <div className="co-panel">
        <div className="co-search-row">
          <div className="co-search-box">
            <FaSearch />
            <input
              type="search"
              className="form-control"
              placeholder="Search course, instructor, employee ID, or room..."
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="co-ordering">
            <label htmlFor="co-ordering">Sort by</label>
            <select
              id="co-ordering"
              className="form-select"
              name="ordering"
              value={filters.ordering}
              onChange={handleFilterChange}
            >
              <option value="academic_year">Academic year: oldest first</option>
              <option value="-academic_year">Academic year: newest first</option>
              <option value="course__course_code">Course code: A–Z</option>
              <option value="-course__course_code">Course code: Z–A</option>
              <option value="capacity">Capacity: low to high</option>
              <option value="-capacity">Capacity: high to low</option>
              <option value="start_time">Start time: earliest</option>
              <option value="-start_time">Start time: latest</option>
            </select>
          </div>
        </div>

        <div className="co-filter-title">
          <FaFilter />
          <span>Filter offerings</span>
        </div>

        <div className="co-filter-grid">
          <select
            className="form-select"
            name="course"
            value={filters.course}
            onChange={handleFilterChange}
          >
            <option value="">All courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.course_code} — {course.course_title}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            name="instructor"
            value={filters.instructor}
            onChange={handleFilterChange}
          >
            <option value="">All instructors</option>
            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {getInstructorName(instructor)}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            name="semester"
            value={filters.semester}
            onChange={handleFilterChange}
          >
            <option value="">All semesters</option>
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {getSemesterLabel(semester)}
              </option>
            ))}
          </select>

          <input
            type="number"
            className="form-control"
            name="academic_year"
            placeholder="Academic year"
            min="2000"
            value={filters.academic_year}
            onChange={handleFilterChange}
          />

          <select
            className="form-select"
            name="section"
            value={filters.section}
            onChange={handleFilterChange}
          >
            <option value="">All sections</option>
            {sections.map((section) => (
              <option key={section} value={section}>
                Section {section}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="co-table-wrapper">
          <table className="table table-hover align-middle co-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Instructor</th>
                <th>Semester / Year</th>
                <th>Section</th>
                <th>Schedule</th>
                <th>Seats</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="co-empty">
                    Loading course offerings...
                  </td>
                </tr>
              ) : offerings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="co-empty">
                    No course offerings found.
                  </td>
                </tr>
              ) : (
                offerings.map((offering) => (
                  <tr key={offering.id}>
                    <td>
                      <strong>{offering.course_code}</strong>
                      <small>{offering.course_title}</small>
                    </td>

                    <td>
                      <span>{offering.instructor_name}</span>
                      <small>{offering.employee_id}</small>
                    </td>

                    <td>
                      <span>{offering.semester_name}</span>
                      <small>{offering.academic_year}</small>
                    </td>

                    <td>
                      <span className="co-section">Section {offering.section}</span>
                    </td>

                    <td>
                      <span>{offering.day}</span>
                      <small>
                        {offering.start_time?.slice(0, 5)} –{" "}
                        {offering.end_time?.slice(0, 5)}
                      </small>
                      <small>Room: {offering.room}</small>
                    </td>

                    <td>
                      <strong>{offering.available_seats ?? offering.capacity}</strong>
                      <small>of {offering.capacity} seats</small>
                    </td>

                    <td>
                      <span className={`co-status co-status-${offering.status?.toLowerCase()}`}>
                        {offering.status}
                      </span>
                    </td>

                    <td>
                      <div className="co-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-info"
                          title="View"
                          onClick={() => setViewOffering(offering)}
                        >
                          <FaEye />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          title="Edit"
                          onClick={() => openEditForm(offering)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          title="Delete"
                          onClick={() => handleDelete(offering)}
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

        <div className="co-pagination">
          <span>
            Page {page} of {totalPages} · {totalCount} total offerings
          </span>
          <div>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((previous) => previous - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm ms-2"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((previous) => previous + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="co-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) {
            setShowForm(false);
          }
        }}>
          <div className="co-modal" role="dialog" aria-modal="true">
            <div className="co-modal-header">
              <div>
                <h3>{editingId ? "Edit Course Offering" : "Add Course Offering"}</h3>
                <p>Enter the course allocation and schedule details.</p>
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                disabled={saving}
                onClick={() => setShowForm(false)}
              />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="co-form-grid">
                <div>
                  <label className="form-label">Course *</label>
                  <select className="form-select" name="course" value={form.course} onChange={handleFormChange} required>
                    <option value="">Select course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_code} — {course.course_title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Instructor *</label>
                  <select className="form-select" name="instructor" value={form.instructor} onChange={handleFormChange} required>
                    <option value="">Select instructor</option>
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {getInstructorName(instructor)}
                        {instructor.employee_id ? ` (${instructor.employee_id})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Semester *</label>
                  <select className="form-select" name="semester" value={form.semester} onChange={handleFormChange} required>
                    <option value="">Select semester</option>
                    {semesters.map((semester) => (
                      <option key={semester.id} value={semester.id}>
                        {getSemesterLabel(semester)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Academic year *</label>
                  <input className="form-control" type="number" name="academic_year" min="2000" max={new Date().getFullYear() + 2} value={form.academic_year} onChange={handleFormChange} required />
                </div>

                <div>
                  <label className="form-label">Section *</label>
                  <select className="form-select" name="section" value={form.section} onChange={handleFormChange} required>
                    {sections.map((section) => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Capacity *</label>
                  <input className="form-control" type="number" name="capacity" min="1" max="300" value={form.capacity} onChange={handleFormChange} required />
                </div>

                <div>
                  <label className="form-label">Room *</label>
                  <input className="form-control" name="room" value={form.room} onChange={handleFormChange} placeholder="e.g. AB-301" maxLength={20} required />
                </div>

                <div>
                  <label className="form-label">Day *</label>
                  <select className="form-select" name="day" value={form.day} onChange={handleFormChange} required>
                    {days.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Start time *</label>
                  <input className="form-control" type="time" name="start_time" value={form.start_time} onChange={handleFormChange} required />
                </div>

                <div>
                  <label className="form-label">End time *</label>
                  <input className="form-control" type="time" name="end_time" value={form.end_time} onChange={handleFormChange} required />
                </div>

                <div>
                  <label className="form-label">Status *</label>
                  <select className="form-select" name="status" value={form.status} onChange={handleFormChange} required>
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="co-modal-footer">
                <button type="button" className="btn btn-light" disabled={saving} onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update Offering" : "Create Offering"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewOffering && (
        <div className="co-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setViewOffering(null);
        }}>
          <div className="co-modal co-view-modal" role="dialog" aria-modal="true">
            <div className="co-modal-header">
              <div>
                <h3>Course Offering Details</h3>
                <p>{viewOffering.course_code} — Section {viewOffering.section}</p>
              </div>
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setViewOffering(null)} />
            </div>

            <div className="co-details-grid">
              {[
                ["Course", `${viewOffering.course_code} — ${viewOffering.course_title}`],
                ["Instructor", viewOffering.instructor_name],
                ["Employee ID", viewOffering.employee_id],
                ["Semester", `${viewOffering.semester_name} ${viewOffering.academic_year}`],
                ["Section", viewOffering.section],
                ["Capacity", viewOffering.capacity],
                ["Available seats", viewOffering.available_seats ?? viewOffering.capacity],
                ["Room", viewOffering.room],
                ["Day", viewOffering.day],
                ["Start time", viewOffering.start_time],
                ["End time", viewOffering.end_time],
                ["Status", viewOffering.status],
              ].map(([label, value]) => (
                <div className="co-detail-item" key={label}>
                  <span>{label}</span>
                  <strong>{value ?? "—"}</strong>
                </div>
              ))}
            </div>

            <div className="co-modal-footer">
              <button type="button" className="btn btn-light" onClick={() => setViewOffering(null)}>Close</button>
              <button type="button" className="btn btn-primary" onClick={() => {
                const offering = viewOffering;
                setViewOffering(null);
                openEditForm(offering);
              }}>
                <FaEdit className="me-2" /> Edit Offering
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
