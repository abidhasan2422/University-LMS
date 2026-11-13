
import { useEffect, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaClipboardList,
  FaGraduationCap,
  FaSave,
  FaArrowLeft,
} from "react-icons/fa";
import Swal from "sweetalert2";
import api from "../../api/axios";
import "../../styles/admin/assessment-management.css";

const PAGE_SIZE = 10;

const initialAssessmentForm = {
  title: "",
  course_offering: "",
  assessment_type: "ASSIGNMENT",
  maximum_marks: "",
  assessment_date: "",
};

const initialMarkForm = {
  obtained_marks: "",
  remarks: "",
};

function getErrorMessage(error) {
  const data = error.response?.data;

  if (!data) return "Something went wrong. Please try again.";

  if (typeof data === "string") return data;
  if (data.detail) return data.detail;

  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const value = data[firstKey];
    return Array.isArray(value) ? value[0] : String(value);
  }

  return "Something went wrong.";
}

export default function AssessmentManagement() {
  const [activeTab, setActiveTab] = useState("assessments");

  // Assessment states
  const [assessments, setAssessments] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [assessmentForm, setAssessmentForm] = useState(initialAssessmentForm);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [savingAssessment, setSavingAssessment] = useState(false);
  const [assessmentPage, setAssessmentPage] = useState(1);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [assessmentSearch, setAssessmentSearch] = useState("");

  // Mark states
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [marks, setMarks] = useState({});
  const [markForms, setMarkForms] = useState({});
  const [marksLoading, setMarksLoading] = useState(false);
  const [savingMarks, setSavingMarks] = useState(false);

  const totalAssessmentPages = Math.max(
    1,
    Math.ceil(assessmentCount / PAGE_SIZE)
  );

  useEffect(() => {
    fetchOfferings();
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [assessmentPage, assessmentSearch]);

  // -------------------------------
  // Fetch course offerings
  // -------------------------------
  const fetchOfferings = async () => {
    try {
      const response = await api.get("course-offerings/", {
        params: { page_size: 100 },
      });

      setOfferings(response.data.results || response.data);
    } catch (error) {
      console.error("Course offering fetch error:", error);
      Swal.fire("Error", getErrorMessage(error), "error");
    }
  };

  // -------------------------------
  // Fetch assessments
  // -------------------------------
  const fetchAssessments = async () => {
    try {
      setAssessmentLoading(true);

      const response = await api.get("assessments/", {
        params: {
          page: assessmentPage,
          page_size: PAGE_SIZE,
          search: assessmentSearch || undefined,
        },
      });

      setAssessments(response.data.results || response.data);
      setAssessmentCount(response.data.count ?? response.data.length ?? 0);
    } catch (error) {
      console.error("Assessment fetch error:", error);
      Swal.fire("Error", getErrorMessage(error), "error");
    } finally {
      setAssessmentLoading(false);
    }
  };

  // -------------------------------
  // Assessment form handling
  // -------------------------------
  const handleAssessmentChange = (e) => {
    const { name, value } = e.target;

    setAssessmentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetAssessmentForm = () => {
    setAssessmentForm(initialAssessmentForm);
    setEditingAssessment(null);
  };

  const handleEditAssessment = (assessment) => {
    setEditingAssessment(assessment);

    setAssessmentForm({
      title: assessment.title || "",
      course_offering: assessment.course_offering || "",
      assessment_type: assessment.assessment_type || "ASSIGNMENT",
      maximum_marks: assessment.maximum_marks || "",
      assessment_date: assessment.assessment_date || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // -------------------------------
  // Create / update assessment
  // -------------------------------
  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();

    if (!assessmentForm.title.trim()) {
      return Swal.fire("Validation", "Assessment title is required.", "warning");
    }

    if (!assessmentForm.course_offering) {
      return Swal.fire("Validation", "Please select a course offering.", "warning");
    }

    if (Number(assessmentForm.maximum_marks) <= 0) {
      return Swal.fire("Validation", "Maximum marks must be greater than zero.", "warning");
    }

    try {
      setSavingAssessment(true);

      const payload = {
        ...assessmentForm,
        maximum_marks: Number(assessmentForm.maximum_marks),
        course_offering: Number(assessmentForm.course_offering),
        assessment_date: assessmentForm.assessment_date || null,
      };

      if (editingAssessment) {
        await api.put(`assessments/${editingAssessment.id}/`, payload);
        Swal.fire("Updated!", "Assessment updated successfully.", "success");
      } else {
        await api.post("assessments/", payload);
        Swal.fire("Created!", "Assessment created successfully.", "success");
      }

      resetAssessmentForm();
      fetchAssessments();
    } catch (error) {
      Swal.fire("Error", getErrorMessage(error), "error");
    } finally {
      setSavingAssessment(false);
    }
  };

  // -------------------------------
  // Delete assessment
  // -------------------------------
  const handleDeleteAssessment = async (assessment) => {
    const result = await Swal.fire({
      title: "Delete assessment?",
      text: `Are you sure you want to delete "${assessment.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      confirmButtonColor: "#dc3545",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`assessments/${assessment.id}/`);

      Swal.fire("Deleted!", "Assessment deleted successfully.", "success");
      fetchAssessments();

      if (String(selectedAssessment) === String(assessment.id)) {
        setSelectedAssessment("");
        setEnrollments([]);
        setMarks({});
        setMarkForms({});
      }
    } catch (error) {
      Swal.fire("Error", getErrorMessage(error), "error");
    }
  };

  // -------------------------------
  // Load enrollments and marks
  // -------------------------------
  const handleAssessmentSelection = async (assessmentId) => {
    setSelectedAssessment(assessmentId);
    setEnrollments([]);
    setMarks({});
    setMarkForms({});

    if (!assessmentId) return;

    try {
      setMarksLoading(true);

      const [enrollmentResponse, markResponse] = await Promise.all([
        api.get("enrollments/", {
          params: {
            course_offering: assessmentId
              ? assessments.find((item) => String(item.id) === String(assessmentId))
                  ?.course_offering
              : undefined,
            status: "ENROLLED",
            page_size: 100,
          },
        }),
        api.get("assessments/marks/", {
          params: {
            assessment_id: assessmentId,
            page_size: 100,
          },
        }),
      ]);

      const enrollmentData =
        enrollmentResponse.data.results || enrollmentResponse.data;

      const markData = markResponse.data.results || markResponse.data;

      setEnrollments(enrollmentData);

      const markMap = {};
      const formMap = {};

      markData.forEach((mark) => {
        const enrollmentId =
          typeof mark.enrollment === "object"
            ? mark.enrollment.id
            : mark.enrollment;

        markMap[enrollmentId] = mark;

        formMap[enrollmentId] = {
          obtained_marks: mark.obtained_marks,
          remarks: mark.remarks || "",
        };
      });

      enrollmentData.forEach((enrollment) => {
        if (!formMap[enrollment.id]) {
          formMap[enrollment.id] = initialMarkForm;
        }
      });

      setMarks(markMap);
      setMarkForms(formMap);
    } catch (error) {
      Swal.fire("Error", getErrorMessage(error), "error");
    } finally {
      setMarksLoading(false);
    }
  };

  // -------------------------------
  // Mark form handling
  // -------------------------------
  const handleMarkChange = (enrollmentId, field, value) => {
    setMarkForms((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [field]: value,
      },
    }));
  };

  // -------------------------------
  // Save all marks
  // -------------------------------
  const handleSaveMarks = async () => {
    if (!selectedAssessment) {
      return Swal.fire("Warning", "Please select an assessment.", "warning");
    }

    const assessment = assessments.find(
      (item) => String(item.id) === String(selectedAssessment)
    );

    if (!assessment) return;

    const requests = [];

    for (const enrollment of enrollments) {
      const form = markForms[enrollment.id];

      if (
        !form ||
        form.obtained_marks === "" ||
        form.obtained_marks === null ||
        form.obtained_marks === undefined
      ) {
        continue;
      }

      const obtainedMarks = Number(form.obtained_marks);

      if (
        Number.isNaN(obtainedMarks) ||
        obtainedMarks < 0 ||
        obtainedMarks > Number(assessment.maximum_marks)
      ) {
        return Swal.fire(
          "Invalid marks",
          `Marks for ${enrollment.student_name} must be between 0 and ${assessment.maximum_marks}.`,
          "warning"
        );
      }

      const payload = {
        assessment: Number(selectedAssessment),
        enrollment: enrollment.id,
        obtained_marks: obtainedMarks,
        remarks: form.remarks || "",
      };

      const existingMark = marks[enrollment.id];

      if (existingMark) {
        requests.push(
          api.patch(`assessments/marks/${existingMark.id}/`, payload)
        );
      } else {
        requests.push(api.post("assessments/marks/", payload));
      }
    }

    if (requests.length === 0) {
      return Swal.fire(
        "No marks entered",
        "Enter marks for at least one student.",
        "info"
      );
    }

    try {
      setSavingMarks(true);

      const results = await Promise.allSettled(requests);
      const successful = results.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const failed = results.length - successful;

      await handleAssessmentSelection(selectedAssessment);

      if (failed === 0) {
        Swal.fire(
          "Saved!",
          `${successful} student mark(s) saved successfully.`,
          "success"
        );
      } else {
        Swal.fire(
          "Partially saved",
          `${successful} saved successfully; ${failed} failed. Check the failed records and try again.`,
          "warning"
        );
      }
    } catch (error) {
      Swal.fire("Error", getErrorMessage(error), "error");
    } finally {
      setSavingMarks(false);
    }
  };

  const selectedAssessmentData = assessments.find(
    (item) => String(item.id) === String(selectedAssessment)
  );

  return (
    <div className="assessment-management">
      <div className="assessment-page-header">
        <div>
          <h2>Assessment Management</h2>
          <p>Manage course assessments and student marks.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="assessment-tabs">
        <button
          className={activeTab === "assessments" ? "active" : ""}
          onClick={() => setActiveTab("assessments")}
        >
          <FaClipboardList /> Assessments
        </button>

        <button
          className={activeTab === "marks" ? "active" : ""}
          onClick={() => setActiveTab("marks")}
        >
          <FaGraduationCap /> Assessment Marks
        </button>
      </div>

      {/* ================= ASSESSMENTS TAB ================= */}
      {activeTab === "assessments" && (
        <>
          <div className="assessment-card">
            <div className="assessment-card-header">
              <h5>
                {editingAssessment ? "Update Assessment" : "Create Assessment"}
              </h5>

              {editingAssessment && (
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={resetAssessmentForm}
                  type="button"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleAssessmentSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Assessment Title *</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    placeholder="e.g. Mid Term Examination"
                    value={assessmentForm.title}
                    onChange={handleAssessmentChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Course Offering *</label>
                  <select
                    name="course_offering"
                    className="form-select"
                    value={assessmentForm.course_offering}
                    onChange={handleAssessmentChange}
                    required
                  >
                    <option value="">Select course offering</option>
                    {offerings.map((offering) => (
                      <option key={offering.id} value={offering.id}>
                        {offering.course_code} - {offering.course_title} |
                        {offering.semester_name} | Section {offering.section}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Assessment Type *</label>
                  <select
                    name="assessment_type"
                    className="form-select"
                    value={assessmentForm.assessment_type}
                    onChange={handleAssessmentChange}
                    required
                  >
                    <option value="ASSIGNMENT">Assignment</option>
                    <option value="QUIZ">Quiz</option>
                    <option value="PRESENTATION">Presentation</option>
                    <option value="MID">Mid</option>
                    <option value="FINAL">Final</option>
                    <option value="LAB_PERFORMANCE">Lab Performance</option>
                    <option value="LAB_VIVA">Lab Viva</option>
                    <option value="LAB_FINAL">Lab Final</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Maximum Marks *</label>
                  <input
                    type="number"
                    name="maximum_marks"
                    className="form-control"
                    min="0.01"
                    step="0.01"
                    value={assessmentForm.maximum_marks}
                    onChange={handleAssessmentChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Assessment Date</label>
                  <input
                    type="date"
                    name="assessment_date"
                    className="form-control"
                    value={assessmentForm.assessment_date}
                    onChange={handleAssessmentChange}
                  />
                </div>

                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={savingAssessment}
                  >
                    <FaSave className="me-2" />
                    {savingAssessment
                      ? "Saving..."
                      : editingAssessment
                      ? "Update Assessment"
                      : "Create Assessment"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Assessment list */}
          <div className="assessment-card">
            <div className="assessment-card-header">
              <h5>Assessment List</h5>

              <input
                type="search"
                className="form-control assessment-search"
                placeholder="Search assessments..."
                value={assessmentSearch}
                onChange={(e) => {
                  setAssessmentSearch(e.target.value);
                  setAssessmentPage(1);
                }}
              />
            </div>

            <div className="table-responsive">
              <table className="table assessment-table align-middle">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Course</th>
                    <th>Type</th>
                    <th>Semester</th>
                    <th>Maximum Marks</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {assessmentLoading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        Loading assessments...
                      </td>
                    </tr>
                  ) : assessments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        No assessments found.
                      </td>
                    </tr>
                  ) : (
                    assessments.map((assessment) => (
                      <tr key={assessment.id}>
                        <td className="fw-semibold">{assessment.title}</td>
                        <td>
                          {assessment.course_code} - {assessment.course_title}
                          <div className="small text-muted">
                            Section {assessment.section}
                          </div>
                        </td>
                        <td>
                          <span className="assessment-type-badge">
                            {assessment.assessment_type}
                          </span>
                        </td>
                        <td>{assessment.semester_name}</td>
                        <td>{assessment.maximum_marks}</td>
                        <td>{assessment.assessment_date || "—"}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              title="Edit"
                              onClick={() => handleEditAssessment(assessment)}
                            >
                              <FaEdit />
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Delete"
                              onClick={() => handleDeleteAssessment(assessment)}
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

            <div className="assessment-pagination">
              <span>
                Page {assessmentPage} of {totalAssessmentPages}
              </span>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  disabled={assessmentPage <= 1}
                  onClick={() => setAssessmentPage((page) => page - 1)}
                >
                  Previous
                </button>

                <button
                  className="btn btn-sm btn-outline-primary"
                  disabled={assessmentPage >= totalAssessmentPages}
                  onClick={() => setAssessmentPage((page) => page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= MARKS TAB ================= */}
      {activeTab === "marks" && (
        <>
          <div className="assessment-card">
            <h5 className="mb-3">Select Assessment</h5>

            <select
              className="form-select"
              value={selectedAssessment}
              onChange={(e) => handleAssessmentSelection(e.target.value)}
            >
              <option value="">Choose an assessment</option>

              {assessments.map((assessment) => (
                <option key={assessment.id} value={assessment.id}>
                  {assessment.title} | {assessment.course_code} |{" "}
                  {assessment.semester_name} | Max: {assessment.maximum_marks}
                </option>
              ))}
            </select>
          </div>

          {selectedAssessmentData && (
            <div className="assessment-summary">
              <div>
                <span>Assessment</span>
                <strong>{selectedAssessmentData.title}</strong>
              </div>
              <div>
                <span>Course</span>
                <strong>
                  {selectedAssessmentData.course_code} -{" "}
                  {selectedAssessmentData.course_title}
                </strong>
              </div>
              <div>
                <span>Maximum Marks</span>
                <strong>{selectedAssessmentData.maximum_marks}</strong>
              </div>
            </div>
          )}

          <div className="assessment-card">
            <div className="assessment-card-header">
              <h5>Student Marks</h5>

              {selectedAssessment && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveMarks}
                  disabled={savingMarks || marksLoading}
                >
                  <FaSave className="me-2" />
                  {savingMarks ? "Saving..." : "Save All Marks"}
                </button>
              )}
            </div>

            {!selectedAssessment ? (
              <div className="assessment-empty-state">
                <FaGraduationCap />
                <p>Select an assessment to enter student marks.</p>
              </div>
            ) : marksLoading ? (
              <p className="text-center py-4">Loading students and marks...</p>
            ) : enrollments.length === 0 ? (
              <p className="text-center py-4">
                No enrolled students found for this course offering.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table assessment-table align-middle">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>Obtained Marks</th>
                      <th>Remarks</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {enrollments.map((enrollment) => {
                      const form = markForms[enrollment.id] || initialMarkForm;
                      const existingMark = marks[enrollment.id];

                      return (
                        <tr key={enrollment.id}>
                          <td>{enrollment.student_id_code}</td>
                          <td>{enrollment.student_name}</td>
                          <td>
                            <input
                              type="number"
                              className="form-control mark-input"
                              min="0"
                              max={selectedAssessmentData.maximum_marks}
                              step="0.01"
                              value={form.obtained_marks ?? ""}
                              onChange={(e) =>
                                handleMarkChange(
                                  enrollment.id,
                                  "obtained_marks",
                                  e.target.value
                                )
                              }
                              placeholder="Enter marks"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={form.remarks || ""}
                              onChange={(e) =>
                                handleMarkChange(
                                  enrollment.id,
                                  "remarks",
                                  e.target.value
                                )
                              }
                              placeholder="Optional"
                            />
                          </td>
                          <td>
                            {existingMark ? (
                              <span className="badge bg-success">
                                Existing
                              </span>
                            ) : (
                              <span className="badge bg-secondary">
                                Not entered
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
