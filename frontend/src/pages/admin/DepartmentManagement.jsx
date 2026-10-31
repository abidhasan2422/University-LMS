
import { useCallback, useEffect, useState } from "react";
import {
  FaEye,
  FaSearch,
  FaSyncAlt,
  FaEdit,
  FaTrash,
  FaTimes,
  FaPlus,
  FaTrashRestore,
} from "react-icons/fa";
import Swal from "sweetalert2";

import api from "../../api/axios";
import "../../styles/admin/department-management.css";

const emptyForm = {
  name: "",
  code: "",
  description: "",
  is_active: true,
};

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [deletedDepartments, setDeletedDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deletedPage, setDeletedPage] = useState(1);
  const [count, setCount] = useState(0);
  const [deletedCount, setDeletedCount] = useState(0);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const pageSize = 10;

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("departments/", {
        params: {
          search: search.trim() || undefined,
          page,
        },
      });

      const data = response.data;
      setDepartments(Array.isArray(data) ? data : data.results || []);
      setCount(Array.isArray(data) ? data.length : data.count || 0);
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.detail || "Failed to load departments.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  const loadDeletedDepartments = useCallback(async () => {
    try {
      const response = await api.get("departments/deleted/", {
        params: { page: deletedPage },
      });

      const data = response.data;
      setDeletedDepartments(Array.isArray(data) ? data : data.results || []);
      setDeletedCount(Array.isArray(data) ? data.length : data.count || 0);
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.detail ||
          "Failed to load deleted departments.",
        "error"
      );
    }
  }, [deletedPage]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  useEffect(() => {
    if (showDeleted) loadDeletedDepartments();
  }, [showDeleted, loadDeletedDepartments]);

  const openAdd = () => {
    setSelected(null);
    setForm(emptyForm);
    setErrors({});
    setModal("form");
  };

  const openEdit = (department) => {
    setSelected(department);
    setForm({
      name: department.name || "",
      code: department.code || "",
      description: department.description || "",
      is_active: department.is_active,
    });
    setErrors({});
    setModal("form");
  };

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveDepartment = async (event) => {
    event.preventDefault();
    setErrors({});

    const payload = {
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
    };

    try {
      if (selected) {
        await api.put(`departments/${selected.id}/`, payload);
      } else {
        await api.post("departments/", payload);
      }

      setModal("");
      await Swal.fire(
        "Success",
        `Department ${selected ? "updated" : "created"} successfully.`,
        "success"
      );
      loadDepartments();
    } catch (error) {
      const data = error.response?.data || {};
      if (typeof data === "object" && !data.detail) {
        setErrors(data);
      } else {
        Swal.fire(
          "Error",
          data.detail || "Could not save department.",
          "error"
        );
      }
    }
  };

  const viewDepartment = (department) => {
    setSelected(department);
    setModal("view");
  };

  const deleteDepartment = async (department) => {
    const result = await Swal.fire({
      title: "Delete department?",
      text: `${department.name} will be moved to deleted departments.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`departments/${department.id}/`);
      await Swal.fire("Deleted", "Department deleted successfully.", "success");
      loadDepartments();
      if (showDeleted) loadDeletedDepartments();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.detail || "Could not delete department.",
        "error"
      );
    }
  };

  const restoreDepartment = async (department) => {
    const result = await Swal.fire({
      title: "Restore department?",
      text: `Restore ${department.name}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Restore",
    });

    if (!result.isConfirmed) return;

    try {
      await api.patch(`departments/${department.id}/restore/`);
      await Swal.fire("Restored", "Department restored successfully.", "success");
      loadDeletedDepartments();
      loadDepartments();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.detail || "Could not restore department.",
        "error"
      );
    }
  };

  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const deletedTotalPages = Math.max(1, Math.ceil(deletedCount / pageSize));

  const changeSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const activeList = showDeleted ? deletedDepartments : departments;
  const currentPage = showDeleted ? deletedPage : page;
  const currentTotalPages = showDeleted ? deletedTotalPages : totalPages;
  const setCurrentPage = showDeleted ? setDeletedPage : setPage;

  return (
    <div className="department-page">
      <div className="department-page-header">
        <div>
          <h2>Department Management</h2>
          <p>Manage university departments and their records.</p>
        </div>
        <div className="department-header-actions">
          <button
            className="department-btn department-btn-secondary"
            onClick={() => {
              setShowDeleted((previous) => !previous);
              setDeletedPage(1);
            }}
          >
            {showDeleted ? <FaTimes /> : <FaTrashRestore />}
            {showDeleted ? "Active Departments" : "Deleted Departments"}
          </button>

          {!showDeleted && (
            <button className="department-btn department-btn-primary" onClick={openAdd}>
              <FaPlus /> Add Department
            </button>
          )}
        </div>
      </div>

      {!showDeleted && (
        <div className="department-toolbar">
          <div className="department-search">
            <FaSearch />
            <input
              value={search}
              onChange={changeSearch}
              placeholder="Search by department name or code..."
            />
          </div>
          <button
            className="department-btn department-btn-secondary"
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
          >
            <FaSyncAlt /> Reset
          </button>
        </div>
      )}

      <div className="department-table-card">
        <div className="department-table-heading">
          <h3>{showDeleted ? "Deleted Departments" : "All Departments"}</h3>
          <span>{showDeleted ? deletedCount : count} records</span>
        </div>

        {loading && !showDeleted ? (
          <p className="department-message">Loading departments...</p>
        ) : (
          <div className="department-table-wrapper">
            <table className="department-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeList.map((department) => (
                  <tr key={department.id}>
                    <td>{department.id}</td>
                    <td className="department-name">{department.name}</td>
                    <td>{department.code}</td>
                    <td>
                      <span
                        className={`department-status ${
                          department.is_active ? "is-active" : "is-inactive"
                        }`}
                      >
                        {department.is_active ? "Active" : "Deleted"}
                      </span>
                    </td>
                    <td>{department.description || "—"}</td>
                    <td>
                      <div className="department-actions">
                        <button
                          title="View"
                          className="department-icon-btn view"
                          onClick={() => viewDepartment(department)}
                        >
                          <FaEye />
                        </button>

                        {!showDeleted ? (
                          <>
                            <button
                              title="Edit"
                              className="department-icon-btn edit"
                              onClick={() => openEdit(department)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              title="Delete"
                              className="department-icon-btn delete"
                              onClick={() => deleteDepartment(department)}
                            >
                              <FaTrash />
                            </button>
                          </>
                        ) : (
                          <button
                            title="Restore"
                            className="department-icon-btn restore"
                            onClick={() => restoreDepartment(department)}
                          >
                            <FaTrashRestore />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {activeList.length === 0 && (
                  <tr>
                    <td colSpan="6" className="department-message">
                      No departments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="department-pagination">
          <span>
            Page {currentPage} of {currentTotalPages}
          </span>
          <div>
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((previous) => previous - 1)}
            >
              Previous
            </button>
            <button
              disabled={currentPage >= currentTotalPages}
              onClick={() => setCurrentPage((previous) => previous + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {(modal === "form" || modal === "view") && (
        <div className="department-modal-backdrop">
          <div className="department-modal">
            <div className="department-modal-header">
              <h3>
                {modal === "view"
                  ? "Department Details"
                  : selected
                  ? "Edit Department"
                  : "Add Department"}
              </h3>
              <button onClick={() => setModal("")} aria-label="Close">
                <FaTimes />
              </button>
            </div>

            {modal === "view" ? (
              <div className="department-details">
                <p><strong>ID:</strong> {selected.id}</p>
                <p><strong>Name:</strong> {selected.name}</p>
                <p><strong>Code:</strong> {selected.code}</p>
                <p><strong>Description:</strong> {selected.description || "—"}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  {selected.is_active ? "Active" : "Deleted"}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {selected.created_at
                    ? new Date(selected.created_at).toLocaleString()
                    : "—"}
                </p>
                <button
                  className="department-btn department-btn-secondary"
                  onClick={() => setModal("")}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={saveDepartment}>
                <label>
                  Department Name *
                  <input
                    name="name"
                    value={form.name}
                    onChange={updateField}
                    required
                    maxLength={150}
                  />
                  {errors.name && <small className="department-error">{errors.name}</small>}
                </label>

                <label>
                  Department Code *
                  <input
                    name="code"
                    value={form.code}
                    onChange={updateField}
                    required
                    maxLength={20}
                  />
                  {errors.code && <small className="department-error">{errors.code}</small>}
                </label>

                <label>
                  Description
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={updateField}
                    rows={3}
                  />
                  {errors.description && (
                    <small className="department-error">{errors.description}</small>
                  )}
                </label>

                {selected && (
                  <label className="department-checkbox">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={updateField}
                    />
                    Active
                  </label>
                )}

                <div className="department-modal-actions">
                  <button
                    type="button"
                    className="department-btn department-btn-secondary"
                    onClick={() => setModal("")}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="department-btn department-btn-primary">
                    {selected ? "Save Changes" : "Create Department"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
