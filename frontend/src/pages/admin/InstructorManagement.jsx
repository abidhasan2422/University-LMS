import { useEffect, useState } from "react";
import {
  FaEye,
  FaSearch,
  FaSyncAlt,
  FaEdit,
  FaSave,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import Swal from "sweetalert2";

import api from "../../api/axios";
import "../../styles/admin/instructor-management.css";


const InstructorManagement = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [instructors, setInstructors] = useState([]);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // View modal
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  // Action loading
  const [actionLoading, setActionLoading] = useState(false);

  // Edit modal
  const [editingInstructor, setEditingInstructor] = useState(null);

  const [editForm, setEditForm] = useState({
    user: "",
    department: "",
    designation: "",
    qualification: "",
    specialization: "",
    joining_date: "",
    experience_years: "",
    office_phone: "",
    office_room: "",
    employment_status: "",
  });

  const [editLoading, setEditLoading] = useState(false);


  // =========================================================
  // FETCH INSTRUCTORS
  // =========================================================

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (department) {
        params.department = department;
      }

      if (designation) {
        params.designation = designation;
      }

      if (employmentStatus) {
        params.employment_status = employmentStatus;
      }

      const response = await api.get("instructors/", {
        params,
      });

      setInstructors(response.data.results || []);

      const totalCount = response.data.count || 0;

      const pageSize =
        response.data.results?.length || 10;

      setTotalPages(
        pageSize > 0
          ? Math.ceil(totalCount / pageSize)
          : 1
      );
    } catch (error) {
      console.error(
        "Failed to fetch instructors:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Failed to load instructors."
      );
    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // FETCH WHEN FILTERS CHANGE
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInstructors();
    }, 400);

    return () => clearTimeout(timer);
  }, [
    search,
    department,
    designation,
    employmentStatus,
    page,
  ]);


  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const handleOpenEdit = (instructor) => {
    setEditingInstructor(instructor);

    setEditForm({
      user: instructor.user || "",
      department: instructor.department || "",
      designation: instructor.designation || "",
      qualification: instructor.qualification || "",
      specialization: instructor.specialization || "",
      joining_date: instructor.joining_date || "",
      experience_years:
        instructor.experience_years ?? "",
      office_phone: instructor.office_phone || "",
      office_room: instructor.office_room || "",
      employment_status:
        instructor.employment_status || "",
    });

    setSelectedInstructor(null);
  };


  // =========================================================
  // EDIT FORM CHANGE
  // =========================================================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // =========================================================
  // UPDATE INSTRUCTOR
  // =========================================================

  const handleUpdateInstructor = async (e) => {
    e.preventDefault();

    if (!editingInstructor) {
      return;
    }

    try {
      setEditLoading(true);

      await api.put(
        `instructors/${editingInstructor.id}/`,
        {
          user: editForm.user,
          department: editForm.department,
          designation: editForm.designation,
          qualification: editForm.qualification,
          specialization:
            editForm.specialization || null,
          joining_date: editForm.joining_date,
          experience_years:
            editForm.experience_years,
          office_phone:
            editForm.office_phone || null,
          office_room:
            editForm.office_room || null,
          employment_status:
            editForm.employment_status,
        }
      );

      await Swal.fire({
        title: "Updated!",
        text: "Instructor updated successfully.",
        icon: "success",
        confirmButtonColor: "#16a34a",
      });

      setEditingInstructor(null);

      await fetchInstructors();
    } catch (error) {
      console.error(
        "Failed to update instructor:",
        error
      );

      const errorData = error.response?.data;

      let message =
        "Failed to update instructor.";

      if (typeof errorData === "string") {
        message = errorData;
      } else if (errorData) {
        message = Object.entries(errorData)
          .map(([field, value]) => {
            const text = Array.isArray(value)
              ? value.join(", ")
              : value;

            return `${field}: ${text}`;
          })
          .join("\n");
      }

      Swal.fire({
        title: "Update Failed",
        text: message,
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setEditLoading(false);
    }
  };


  // =========================================================
  // DELETE INSTRUCTOR
  // =========================================================

  const handleDelete = async (instructor) => {
    const result = await Swal.fire({
      title: "Delete Instructor?",
      text: `Are you sure you want to delete ${instructor.full_name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading(true);

      await api.delete(
        `instructors/${instructor.id}/`
      );

      await Swal.fire({
        title: "Deleted!",
        text: "Instructor deleted successfully.",
        icon: "success",
        confirmButtonColor: "#16a34a",
      });

      setSelectedInstructor(null);

      await fetchInstructors();
    } catch (error) {
      console.error(
        "Failed to delete instructor:",
        error
      );

      Swal.fire({
        title: "Delete Failed",
        text:
          error.response?.data?.detail ||
          "Failed to delete instructor.",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setActionLoading(false);
    }
  };


  // =========================================================
  // PAGE CHANGE
  // =========================================================

  const handlePageChange = (newPage) => {
    if (
      newPage < 1 ||
      newPage > totalPages
    ) {
      return;
    }

    setPage(newPage);
  };


  // =========================================================
  // RESET FILTERS
  // =========================================================

  const handleReset = () => {
    setSearch("");
    setDepartment("");
    setDesignation("");
    setEmploymentStatus("");
    setPage(1);
  };


  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="admin-student-management">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="student-page-header">

        <div>
          <span className="student-page-label">
            INSTRUCTOR MANAGEMENT
          </span>

          <h1>Instructors</h1>

          <p>
            Manage and monitor university instructors.
          </p>
        </div>

      </div>


      {/* =====================================================
          FILTER SECTION
      ===================================================== */}

      <div className="student-filter-card">

        {/* SEARCH */}

        <div className="student-search-box">

          <FaSearch />

          <input
            type="text"
            placeholder="Search by employee ID, name, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

        </div>


        {/* DEPARTMENT */}

        <select
          className="student-status-filter"
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setPage(1);
          }}
        >

          <option value="">
            All Departments
          </option>

          <option value="1">
            Computer Science & Engineering
          </option>

          <option value="2">
            Software Engineering
          </option>

          <option value="3">
            Electrical & Electronic Engineering
          </option>

          <option value="4">
            Civil Engineering
          </option>

          <option value="5">
            Architecture
          </option>

          <option value="6">
            Business Administration
          </option>

        </select>


        {/* DESIGNATION */}

        <select
          className="student-status-filter"
          value={designation}
          onChange={(e) => {
            setDesignation(e.target.value);
            setPage(1);
          }}
        >

          <option value="">
            All Designations
          </option>

          <option value="LECTURER">
            Lecturer
          </option>

          <option value="SENIOR_LECTURER">
            Senior Lecturer
          </option>

          <option value="ASSISTANT_PROFESSOR">
            Assistant Professor
          </option>

          <option value="ASSOCIATE_PROFESSOR">
            Associate Professor
          </option>

          <option value="PROFESSOR">
            Professor
          </option>

        </select>


        {/* EMPLOYMENT STATUS */}

        <select
          className="student-status-filter"
          value={employmentStatus}
          onChange={(e) => {
            setEmploymentStatus(e.target.value);
            setPage(1);
          }}
        >

          <option value="">
            All Employment Status
          </option>

          <option value="ACTIVE">
            Active
          </option>

          <option value="ON_LEAVE">
            On Leave
          </option>

          <option value="RETIRED">
            Retired
          </option>

          <option value="RESIGNED">
            Resigned
          </option>

        </select>


        {/* RESET */}

        <button
          type="button"
          className="student-reset-button"
          onClick={handleReset}
          title="Reset filters"
        >
          <FaSyncAlt />
          Reset
        </button>

      </div>


      {/* =====================================================
          INSTRUCTOR TABLE
      ===================================================== */}

      <div className="student-table-card">

        <div className="student-table-header">

          <div>

            <h2>
              Instructor List
            </h2>

            <p>
              All registered instructor records.
            </p>

          </div>

          <span className="student-count">
            {instructors.length} instructors
          </span>

        </div>


        {/* ERROR */}

        {error && (
          <div className="student-error">
            {error}
          </div>
        )}


        {/* LOADING */}

        {loading ? (

          <div className="student-loading">
            Loading instructors...
          </div>

        ) : instructors.length === 0 ? (

          <div className="student-empty">
            No instructors found.
          </div>

        ) : (

          <div className="student-table-wrapper">

            <table className="student-table">

              <thead>

                <tr>

                  <th>
                    Employee ID
                  </th>

                  <th>
                    Instructor
                  </th>

                  <th>
                    Department
                  </th>

                  <th>
                    Designation
                  </th>

                  <th>
                    Experience
                  </th>

                  <th>
                    Employment Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {instructors.map(
                  (instructor) => (

                    <tr
                      key={instructor.id}
                    >

                      {/* EMPLOYEE ID */}

                      <td>

                        <span className="student-id">
                          {instructor.employee_id ||
                            "Not assigned"}
                        </span>

                      </td>


                      {/* INSTRUCTOR */}

                      <td>

                        <div className="student-name-cell">

                          <div className="student-avatar">

                            {instructor.full_name
                              ?.charAt(0)
                              ?.toUpperCase()}

                          </div>

                          <div>

                            <strong>
                              {instructor.full_name}
                            </strong>

                            <small>
                              {instructor.email ||
                                "-"}
                            </small>

                          </div>

                        </div>

                      </td>


                      {/* DEPARTMENT */}

                      <td>
                        {instructor.department_name ||
                          "-"}
                      </td>


                      {/* DESIGNATION */}

                      <td>
                        {instructor.designation ||
                          "-"}
                      </td>


                      {/* EXPERIENCE */}

                      <td>
                        {instructor.experience_years ??
                          0}{" "}
                        years
                      </td>


                      {/* EMPLOYMENT STATUS */}

                      <td>

                        <span
                          className={`student-status-badge ${
                            instructor.employment_status?.toLowerCase()
                          }`}
                        >
                          {instructor.employment_status ||
                            "-"}
                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="student-action-buttons">

                          {/* VIEW */}

                          <button
                            type="button"
                            className="student-action view"
                            title="View instructor"
                            onClick={() =>
                              setSelectedInstructor(
                                instructor
                              )
                            }
                          >
                            <FaEye />
                          </button>


                          {/* EDIT */}

                          <button
                            type="button"
                            className="student-action approve"
                            title="Edit instructor"
                            disabled={
                              actionLoading
                            }
                            onClick={() =>
                              handleOpenEdit(
                                instructor
                              )
                            }
                          >
                            <FaEdit />
                          </button>


                          {/* DELETE */}

                          <button
                            type="button"
                            className="student-action delete"
                            title="Delete instructor"
                            disabled={
                              actionLoading
                            }
                            onClick={() =>
                              handleDelete(
                                instructor
                              )
                            }
                          >
                            <FaTrash />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}


        {/* =====================================================
            PAGINATION
        ===================================================== */}

        {!loading &&
          instructors.length > 0 &&
          totalPages > 1 && (

            <div className="student-pagination">

              <button
                type="button"
                disabled={page === 1}
                onClick={() =>
                  handlePageChange(
                    page - 1
                  )
                }
              >
                Previous
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={
                  page === totalPages
                }
                onClick={() =>
                  handlePageChange(
                    page + 1
                  )
                }
              >
                Next
              </button>

            </div>

          )}

      </div>


      {/* =====================================================
          VIEW INSTRUCTOR MODAL
      ===================================================== */}

      {selectedInstructor && (

        <div
          className="student-modal-overlay"
          onClick={() =>
            setSelectedInstructor(null)
          }
        >

          <div
            className="student-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="student-modal-header">

              <div>

                <h2>
                  Instructor Details
                </h2>

                <p>
                  View complete instructor information
                </p>

              </div>

              <button
                type="button"
                className="student-modal-close"
                onClick={() =>
                  setSelectedInstructor(null)
                }
              >
                <FaTimes />
              </button>

            </div>


            {/* BODY */}

            <div className="student-modal-body">

              {/* PROFILE */}

              <div className="student-detail-profile">

                <div className="student-detail-avatar">

                  {selectedInstructor.full_name
                    ?.charAt(0)
                    ?.toUpperCase()}

                </div>

                <div>

                  <h3>
                    {selectedInstructor.full_name}
                  </h3>

                  <p>
                    {selectedInstructor.employee_id ||
                      "Employee ID not assigned"}
                  </p>

                </div>

              </div>


              {/* PERSONAL INFORMATION */}

              <div className="student-detail-section">

                <h4>
                  Personal Information
                </h4>

                <div className="student-detail-grid">

                  <div>
                    <span>
                      Full Name
                    </span>

                    <strong>
                      {selectedInstructor.full_name ||
                        "-"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      First Name
                    </span>

                    <strong>
                      {selectedInstructor.first_name ||
                        "-"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Last Name
                    </span>

                    <strong>
                      {selectedInstructor.last_name ||
                        "-"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Email
                    </span>

                    <strong>
                      {selectedInstructor.email ||
                        "-"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Phone Number
                    </span>

                    <strong>
                      {selectedInstructor.phone_number ||
                        "-"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Employee ID
                    </span>

                    <strong>
                      {selectedInstructor.employee_id ||
                        "Not assigned"}
                    </strong>
                  </div>

                </div>

              </div>


              {/* PROFESSIONAL INFORMATION */}

              <div className="student-detail-section">

                <h4>
                  Professional Information
                </h4>

                <div className="student-detail-grid">

                  <div>
                    <span>
                      Department
                    </span>

                    <strong>
                      {selectedInstructor.department_name ||
                        "-"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Designation
                    </span>

                    <strong>
                      {selectedInstructor.designation ||
                        "-"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Qualification
                    </span>

                    <strong>
                      {selectedInstructor.qualification ||
                        "-"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Specialization
                    </span>

                    <strong>
                      {selectedInstructor.specialization ||
                        "-"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Joining Date
                    </span>

                    <strong>
                      {selectedInstructor.joining_date ||
                        "-"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Experience
                    </span>

                    <strong>
                      {selectedInstructor.experience_years ??
                        0}{" "}
                      years
                    </strong>
                  </div>


                  <div>
                    <span>
                      Employment Status
                    </span>

                    <strong>
                      {selectedInstructor.employment_status ||
                        "-"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Office Phone
                    </span>

                    <strong>
                      {selectedInstructor.office_phone ||
                        "-"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Office Room
                    </span>

                    <strong>
                      {selectedInstructor.office_room ||
                        "-"}
                    </strong>
                  </div>

                </div>

              </div>


              {/* ACTIONS */}

              <div className="student-modal-actions">

                <button
                  type="button"
                  className="student-modal-edit"
                  disabled={
                    actionLoading
                  }
                  onClick={() =>
                    handleOpenEdit(
                      selectedInstructor
                    )
                  }
                >
                  <FaEdit />
                  Edit Instructor
                </button>


                <button
                  type="button"
                  className="student-modal-reject"
                  disabled={
                    actionLoading
                  }
                  onClick={() =>
                    handleDelete(
                      selectedInstructor
                    )
                  }
                >
                  <FaTrash />
                  Delete Instructor
                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          EDIT INSTRUCTOR MODAL
      ===================================================== */}

      {editingInstructor && (

        <div
          className="student-modal-overlay"
          onClick={() => {
            if (!editLoading) {
              setEditingInstructor(null);
            }
          }}
        >

          <div
            className="student-edit-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="student-modal-header">

              <div>

                <h2>
                  Edit Instructor
                </h2>

                <p>
                  Update instructor information.
                </p>

              </div>

              <button
                type="button"
                className="student-modal-close"
                disabled={
                  editLoading
                }
                onClick={() =>
                  setEditingInstructor(
                    null
                  )
                }
              >
                <FaTimes />
              </button>

            </div>


            {/* FORM */}

            <form
              className="student-edit-form"
              onSubmit={
                handleUpdateInstructor
              }
            >

              {/* PROFESSIONAL INFORMATION */}

              <div className="student-edit-section">

                <h4>
                  Professional Information
                </h4>

                <div className="student-edit-grid">

                  {/* DEPARTMENT */}

                  <div className="student-form-group">

                    <label>
                      Department
                    </label>

                    <select
                      name="department"
                      value={
                        editForm.department
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    >

                      <option value="">
                        Select Department
                      </option>

                      <option value="1">
                        Computer Science & Engineering
                      </option>

                      <option value="2">
                        Software Engineering
                      </option>

                      <option value="3">
                        Electrical & Electronic Engineering
                      </option>

                      <option value="4">
                        Civil Engineering
                      </option>

                      <option value="5">
                        Architecture
                      </option>

                      <option value="6">
                        Business Administration
                      </option>

                    </select>

                  </div>


                  {/* DESIGNATION */}

                  <div className="student-form-group">

                    <label>
                      Designation
                    </label>

                    <select
                      name="designation"
                      value={
                        editForm.designation
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    >

                      <option value="">
                        Select Designation
                      </option>

                      <option value="LECTURER">
                        Lecturer
                      </option>

                      <option value="SENIOR_LECTURER">
                        Senior Lecturer
                      </option>

                      <option value="ASSISTANT_PROFESSOR">
                        Assistant Professor
                      </option>

                      <option value="ASSOCIATE_PROFESSOR">
                        Associate Professor
                      </option>

                      <option value="PROFESSOR">
                        Professor
                      </option>

                    </select>

                  </div>


                  {/* QUALIFICATION */}

                  <div className="student-form-group">

                    <label>
                      Qualification
                    </label>

                    <input
                      type="text"
                      name="qualification"
                      value={
                        editForm.qualification
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    />

                  </div>


                  {/* SPECIALIZATION */}

                  <div className="student-form-group">

                    <label>
                      Specialization
                    </label>

                    <input
                      type="text"
                      name="specialization"
                      value={
                        editForm.specialization
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                  </div>


                  {/* JOINING DATE */}

                  <div className="student-form-group">

                    <label>
                      Joining Date
                    </label>

                    <input
                      type="date"
                      name="joining_date"
                      value={
                        editForm.joining_date
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    />

                  </div>


                  {/* EXPERIENCE */}

                  <div className="student-form-group">

                    <label>
                      Experience Years
                    </label>

                    <input
                      type="number"
                      name="experience_years"
                      min="0"
                      max="60"
                      value={
                        editForm.experience_years
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    />

                  </div>


                  {/* EMPLOYMENT STATUS */}

                  <div className="student-form-group">

                    <label>
                      Employment Status
                    </label>

                    <select
                      name="employment_status"
                      value={
                        editForm.employment_status
                      }
                      onChange={
                        handleEditChange
                      }
                      required
                    >

                      <option value="">
                        Select Status
                      </option>

                      <option value="ACTIVE">
                        Active
                      </option>

                      <option value="ON_LEAVE">
                        On Leave
                      </option>

                      <option value="RETIRED">
                        Retired
                      </option>

                      <option value="RESIGNED">
                        Resigned
                      </option>

                    </select>

                  </div>

                </div>

              </div>


              {/* OFFICE INFORMATION */}

              <div className="student-edit-section">

                <h4>
                  Office Information
                </h4>

                <div className="student-edit-grid">

                  {/* OFFICE PHONE */}

                  <div className="student-form-group">

                    <label>
                      Office Phone
                    </label>

                    <input
                      type="text"
                      name="office_phone"
                      value={
                        editForm.office_phone
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                  </div>


                  {/* OFFICE ROOM */}

                  <div className="student-form-group">

                    <label>
                      Office Room
                    </label>

                    <input
                      type="text"
                      name="office_room"
                      value={
                        editForm.office_room
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                  </div>

                </div>

              </div>


              {/* ACTIONS */}

              <div className="student-edit-actions">

                <button
                  type="button"
                  className="student-cancel-button"
                  disabled={
                    editLoading
                  }
                  onClick={() =>
                    setEditingInstructor(
                      null
                    )
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="student-save-button"
                  disabled={
                    editLoading
                  }
                >

                  <FaSave />

                  {editLoading
                    ? "Saving..."
                    : "Save Changes"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};


export default InstructorManagement;