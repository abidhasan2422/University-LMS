
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
import "../../styles/admin/semester-management.css";

const initialForm = {
  name: "SPRING",
  year: new Date().getFullYear(),
  start_date: "",
  end_date: "",
  is_active: true,
};

const SemesterManagement = () => {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("-year");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const loadSemesters = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get("semesters/", {
        params: {
          search: search.trim() || undefined,
          ordering,
          page,
        },
      });

      const data = response.data;

      // Supports DRF paginated responses and ordinary list responses.
      const results = Array.isArray(data) ? data : data.results || [];

      setSemesters(results);

      if (!Array.isArray(data)) {
        const pageSize = results.length || 10;
        setTotalPages(
          Math.max(1, Math.ceil((data.count || 0) / pageSize))
        );
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to load semesters:", error);
      setSemesters([]);
      setTotalPages(1);

      Swal.fire(
        "Error",
        error.response?.data?.detail ||
          "Unable to load semesters. Please check the backend API.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [search, ordering, page]);

  useEffect(() => {
    loadSemesters();
  }, [loadSemesters]);

  const openAddForm = () => {
    setEditingSemester(null);
    setForm({
      ...initialForm,
      year: new Date().getFullYear(),
    });
    setShowForm(true);
  };

  const openEditForm = (semester) => {
    setEditingSemester(semester);
    setForm({
      name: semester.name,
      year: semester.year,
      start_date: semester.start_date,
      end_date: semester.end_date,
      is_active: semester.is_active,
    });
    setShowForm(true);
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.start_date ||
      !form.end_date ||
      form.start_date >= form.end_date
    ) {
      Swal.fire(
        "Invalid dates",
        "The end date must be later than the start date.",
        "warning"
      );
      return;
    }

    const payload = {
      ...form,
      year: Number(form.year),
    };

    setSaving(true);

    try {
      if (editingSemester) {
        await api.put(
          `semesters/${editingSemester.id}/`,
          payload
        );

        await Swal.fire(
          "Updated!",
          "Semester updated successfully.",
          "success"
        );
      } else {
        await api.post("semesters/", payload);

        await Swal.fire(
          "Created!",
          "Semester created successfully.",
          "success"
        );
      }

      setShowForm(false);
      setEditingSemester(null);

      if (!editingSemester && page !== 1) {
        setPage(1);
      } else {
        await loadSemesters();
      }
    } catch (error) {
      console.error("Failed to save semester:", error);

      const data = error.response?.data;
      const message =
        data && typeof data === "object"
          ? Object.entries(data)
              .map(([field, messages]) => {
                const text = Array.isArray(messages)
                  ? messages.join(", ")
                  : typeof messages === "string"
                    ? messages
                    : JSON.stringify(messages);

                return `${field}: ${text}`;
              })
              .join("\n")
          : "Unable to save the semester.";

      Swal.fire("Error", message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleView = (semester) => {
    setSelectedSemester(semester);
    setShowView(true);
  };

  const handleDelete = async (semester) => {
    const result = await Swal.fire({
      title: "Delete semester?",
      text: `${semester.name} ${semester.year} will be soft-deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`semesters/${semester.id}/`);

      await Swal.fire(
        "Deleted!",
        "Semester deleted successfully.",
        "success"
      );

      if (semesters.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await loadSemesters();
      }
    } catch (error) {
      console.error("Failed to delete semester:", error);

      Swal.fire(
        "Error",
        error.response?.data?.detail ||
          "Unable to delete this semester.",
        "error"
      );
    }
  };

  const changeSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const changeOrdering = (event) => {
    setOrdering(event.target.value);
    setPage(1);
  };

  return (
    <div className="semester-page">
      <div className="semester-page-header">
        <div>
          <h2>Semester Management</h2>
          <p>Manage academic semesters and their schedules.</p>
        </div>

        <button
          type="button"
          className="semester-btn semester-btn-primary"
          onClick={openAddForm}
        >
          <FaPlus /> Add Semester
        </button>
      </div>

      <div className="semester-toolbar">
        <div className="semester-search">
          <FaSearch />
          <input
            type="text"
            value={search}
            onChange={changeSearch}
            placeholder="Search by semester name or year..."
          />
        </div>

        <select
          value={ordering}
          onChange={changeOrdering}
          aria-label="Sort semesters"
        >
          <option value="-year">Newest year first</option>
          <option value="year">Oldest year first</option>
          <option value="name">Name A–Z</option>
          <option value="-name">Name Z–A</option>
          <option value="-created_at">Recently created</option>
          <option value="created_at">Oldest created</option>
        </select>

        <button
          type="button"
          className="semester-btn semester-btn-secondary"
          onClick={() => {
            setSearch("");
            setOrdering("-year");
            setPage(1);
          }}
        >
          <FaSyncAlt /> Reset
        </button>

        <button
          type="button"
          className="semester-btn semester-btn-secondary"
          onClick={loadSemesters}
          disabled={loading}
        >
          <FaSyncAlt /> Refresh
        </button>
      </div>

      <div className="semester-table-wrapper">
        <table className="semester-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Semester</th>
              <th>Year</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="semester-empty">
                  Loading semesters...
                </td>
              </tr>
            ) : semesters.length === 0 ? (
              <tr>
                <td colSpan="7" className="semester-empty">
                  No semesters found.
                </td>
              </tr>
            ) : (
              semesters.map((semester) => (
                <tr key={semester.id}>
                  <td>{semester.id}</td>
                  <td>
                    <strong>
                      {semester.name.charAt(0) +
                        semester.name.slice(1).toLowerCase()}
                    </strong>
                  </td>
                  <td>{semester.year}</td>
                  <td>{semester.start_date}</td>
                  <td>{semester.end_date}</td>
                  <td>
                    <span
                      className={`semester-status ${
                        semester.is_active ? "active" : "inactive"
                      }`}
                    >
                      {semester.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="semester-actions">
                      <button
                        type="button"
                        title="View"
                        className="semester-icon-btn view"
                        onClick={() => handleView(semester)}
                      >
                        <FaEye />
                      </button>

                      <button
                        type="button"
                        title="Edit"
                        className="semester-icon-btn edit"
                        onClick={() => openEditForm(semester)}
                      >
                        <FaEdit />
                      </button>

                      <button
                        type="button"
                        title="Delete"
                        className="semester-icon-btn delete"
                        onClick={() => handleDelete(semester)}
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

      {!loading && semesters.length > 0 && (
        <div className="semester-pagination">
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
          className="semester-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <div className="semester-modal">
            <div className="semester-modal-header">
              <h3>
                {editingSemester ? "Edit Semester" : "Add Semester"}
              </h3>
              <button
                type="button"
                className="semester-close-btn"
                onClick={() => setShowForm(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="semester-form-grid">
                <div className="semester-form-group">
                  <label htmlFor="semester-name">Semester Name</label>
                  <select
                    id="semester-name"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="SPRING">Spring</option>
                    <option value="SUMMER">Summer</option>
                    <option value="FALL">Fall</option>
                  </select>
                </div>

                <div className="semester-form-group">
                  <label htmlFor="semester-year">Year</label>
                  <input
                    id="semester-year"
                    type="number"
                    name="year"
                    min="2000"
                    max="2100"
                    value={form.year}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="semester-form-group">
                  <label htmlFor="semester-start">Start Date</label>
                  <input
                    id="semester-start"
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="semester-form-group">
                  <label htmlFor="semester-end">End Date</label>
                  <input
                    id="semester-end"
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    min={form.start_date || undefined}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <label className="semester-checkbox">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleFormChange}
                  />
                  Active semester
                </label>
              </div>

              <div className="semester-modal-footer">
                <button
                  type="button"
                  className="semester-btn semester-btn-secondary"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="semester-btn semester-btn-primary"
                  disabled={saving}
                >
                  <FaSave />
                  {saving
                    ? "Saving..."
                    : editingSemester
                      ? "Update Semester"
                      : "Create Semester"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showView && selectedSemester && (
        <div
          className="semester-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowView(false);
            }
          }}
        >
          <div className="semester-modal">
            <div className="semester-modal-header">
              <h3>Semester Details</h3>
              <button
                type="button"
                className="semester-close-btn"
                onClick={() => setShowView(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="semester-details">
              <p>
                <strong>ID:</strong> {selectedSemester.id}
              </p>
              <p>
                <strong>Name:</strong> {selectedSemester.name}
              </p>
              <p>
                <strong>Year:</strong> {selectedSemester.year}
              </p>
              <p>
                <strong>Start Date:</strong> {selectedSemester.start_date}
              </p>
              <p>
                <strong>End Date:</strong> {selectedSemester.end_date}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {selectedSemester.is_active ? "Active" : "Inactive"}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {selectedSemester.created_at
                  ? new Date(selectedSemester.created_at).toLocaleString()
                  : "—"}
              </p>
              <p>
                <strong>Last Updated:</strong>{" "}
                {selectedSemester.updated_at
                  ? new Date(selectedSemester.updated_at).toLocaleString()
                  : "—"}
              </p>
            </div>

            <div className="semester-modal-footer">
              <button
                type="button"
                className="semester-btn semester-btn-secondary"
                onClick={() => setShowView(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="semester-btn semester-btn-primary"
                onClick={() => {
                  setShowView(false);
                  openEditForm(selectedSemester);
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

export default SemesterManagement;
