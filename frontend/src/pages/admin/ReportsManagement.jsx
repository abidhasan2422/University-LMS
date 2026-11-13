
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaBook,
  FaClipboardList,
  FaCalendarCheck,
  FaFileAlt,
  FaGraduationCap,
  FaChartBar,
  FaSearch,
  FaDownload,
  FaPrint,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaExclamationCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaFilter,
  FaEye,
  FaFileCsv,
} from "react-icons/fa";
import api from "../../api/axios";
import "../../styles/admin/reports-management.css";

const REPORTS = [
  { key: "students", label: "Students", icon: FaUsers, endpoint: "reports/students/" },
  { key: "instructors", label: "Instructors", icon: FaChalkboardTeacher, endpoint: "reports/instructors/" },
  { key: "courses", label: "Courses", icon: FaBook, endpoint: "reports/courses/" },
  { key: "enrollments", label: "Enrollments", icon: FaClipboardList, endpoint: "reports/enrollments/" },
  { key: "attendance", label: "Attendance", icon: FaCalendarCheck, endpoint: "reports/attendance/" },
  { key: "assessments", label: "Assessments", icon: FaFileAlt, endpoint: "reports/assessments/" },
  { key: "results", label: "Results", icon: FaGraduationCap, endpoint: "reports/results/" },
  { key: "resultSummary", label: "Result Summary", icon: FaChartBar, endpoint: "reports/results/summary/" },
];

const COLUMNS = {
  students: [
    ["student_id", "Student ID"],
    ["student_name", "Student Name"],
    ["department", "Department"],
    ["semester", "Semester"],
    ["admission_year", "Admission Year"],
    ["session", "Session"],
    ["gender", "Gender"],
    ["status", "Status"],
    ["admission_status", "Admission"],
    ["total_enrollments", "Enrollments"],
  ],
  instructors: [
    ["employee_id", "Employee ID"],
    ["instructor_name", "Instructor Name"],
    ["department", "Department"],
    ["designation", "Designation"],
    ["employment_status", "Employment Status"],
    ["experience_years", "Experience (Years)"],
    ["total_course_offerings", "Course Offerings"],
  ],
  courses: [
    ["course_code", "Course Code"],
    ["course_title", "Course Title"],
    ["course_type", "Type"],
    ["credit", "Credit"],
    ["department", "Department"],
    ["semester", "Semester"],
    ["total_offerings", "Offerings"],
    ["total_enrollments", "Enrollments"],
  ],
  enrollments: [
    ["student_id", "Student ID"],
    ["student_name", "Student Name"],
    ["course_code", "Course Code"],
    ["course_title", "Course Title"],
    ["section", "Section"],
    ["semester", "Semester"],
    ["academic_year", "Academic Year"],
    ["status", "Status"],
    ["enrollment_date", "Enrollment Date"],
  ],
  attendance: [
    ["course_code", "Course Code"],
    ["course_title", "Course Title"],
    ["section", "Section"],
    ["semester", "Semester"],
    ["academic_year", "Academic Year"],
    ["total_records", "Total Records"],
    ["present_count", "Present"],
    ["absent_count", "Absent"],
    ["attendance_percentage", "Attendance %"],
  ],
  assessments: [
    ["title", "Assessment"],
    ["assessment_type", "Type"],
    ["course_code", "Course Code"],
    ["course_title", "Course Title"],
    ["section", "Section"],
    ["semester", "Semester"],
    ["maximum_marks", "Maximum Marks"],
    ["total_submissions", "Submissions"],
    ["average_marks", "Average Marks"],
    ["assessment_date", "Assessment Date"],
  ],
  results: [
    ["student_id", "Student ID"],
    ["course_code", "Course Code"],
    ["course_title", "Course Title"],
    ["section", "Section"],
    ["semester", "Semester"],
    ["academic_year", "Academic Year"],
    ["total_marks", "Total Marks"],
    ["percentage", "Percentage"],
    ["letter_grade", "Grade"],
    ["grade_point", "Grade Point"],
    ["status", "Result"],
    ["is_published", "Published"],
  ],
};

const SUMMARY_LABELS = {
  total_results: "Total Results",
  pass_count: "Passed",
  fail_count: "Failed",
  average_percentage: "Average Percentage",
  average_grade_point: "Average Grade Point",
};

const STATUS_OPTIONS = {
  students: ["ACTIVE", "GRADUATED", "SUSPENDED", "DROPPED"],
  instructors: ["ACTIVE", "ON_LEAVE", "RETIRED", "RESIGNED"],
  enrollments: ["ENROLLED", "DROPPED", "COMPLETED"],
  results: ["PASS", "FAIL"],
};

const KPI_CONFIG = [
  { key: "total_students", label: "Total Students", icon: FaUsers, color: "blue" },
  { key: "total_instructors", label: "Total Instructors", icon: FaChalkboardTeacher, color: "purple" },
  { key: "total_courses", label: "Total Courses", icon: FaBook, color: "orange" },
  { key: "total_enrollments", label: "Total Enrollments", icon: FaClipboardList, color: "green" },
  { key: "total_attendance_records", label: "Attendance Records", icon: FaCalendarCheck, color: "cyan" },
  { key: "published_results", label: "Published Results", icon: FaGraduationCap, color: "pink" },
];

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Published" : "Unpublished";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "string" && value.includes("T")) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleDateString();
  }
  return String(value).replaceAll("_", " ");
};

const formatLabel = (value) =>
  String(value).replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const getStatusClass = (value) => {
  const normalized = String(value).toUpperCase();

  if (["ACTIVE", "APPROVED", "ENROLLED", "COMPLETED", "PASS", "PRESENT"].includes(normalized)) {
    return "success";
  }
  if (["PENDING", "ON_LEAVE", "OPEN"].includes(normalized)) return "warning";
  if (["REJECTED", "SUSPENDED", "DROPPED", "FAIL", "ABSENT", "RESIGNED", "RETIRED"].includes(normalized)) {
    return "danger";
  }
  return "neutral";
};

const downloadCSV = (rows, columns, filename) => {
  if (!rows.length) return;

  const escapeCSV = (value) => {
    const text = value === null || value === undefined ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };

  const header = columns.map(([, label]) => escapeCSV(label)).join(",");
  const body = rows.map((row) =>
    columns.map(([key]) => escapeCSV(row[key])).join(",")
  );

  const csv = "\uFEFF" + [header, ...body].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

function ReportsManagement() {
  const [summary, setSummary] = useState(null);
  const [resultSummary, setResultSummary] = useState(null);
  const [reportData, setReportData] = useState({});
  const [activeReport, setActiveReport] = useState("overview");

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const [dashboardResponse, resultResponse] = await Promise.all([
        api.get("reports/dashboard/"),
        api.get("reports/results/summary/"),
      ]);
      setSummary(dashboardResponse.data);
      setResultSummary(resultResponse.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load report overview.");
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const fetchReport = useCallback(async (reportKey, force = false) => {
    const report = REPORTS.find((item) => item.key === reportKey);
    if (!report) return;

    if (!force && reportData[reportKey]) return;

    setLoadingReport(true);
    setError("");

    try {
      const response = await api.get(report.endpoint);
      setReportData((previous) => ({
        ...previous,
        [reportKey]: response.data,
      }));
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        `Unable to load the ${report.label.toLowerCase()} report.`
      );
    } finally {
      setLoadingReport(false);
    }
  }, [reportData]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    if (activeReport !== "overview") {
      fetchReport(activeReport);
    }
    setSearch("");
    setStatusFilter("ALL");
    setSortConfig({ key: "", direction: "asc" });
    setCurrentPage(1);
  }, [activeReport, fetchReport]);

  const refreshCurrentReport = async () => {
    setRefreshing(true);
    setError("");

    try {
      if (activeReport === "overview") {
        await fetchSummary();
      } else {
        await fetchReport(activeReport, true);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const currentReport = REPORTS.find((item) => item.key === activeReport);
  const currentColumns = COLUMNS[activeReport] || [];
  const rawData = reportData[activeReport];

  const rows = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    return [];
  }, [rawData]);

  const filteredRows = useMemo(() => {
    let result = [...rows];

    if (search.trim()) {
      const keyword = search.toLowerCase().trim();
      result = result.filter((row) =>
        Object.values(row).some((value) =>
          String(value ?? "").toLowerCase().includes(keyword)
        )
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter((row) =>
        String(row.status ?? row.employment_status ?? row.admission_status ?? "").toUpperCase() === statusFilter
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const first = a[sortConfig.key];
        const second = b[sortConfig.key];

        if (first === null || first === undefined) return 1;
        if (second === null || second === undefined) return -1;

        const comparison =
          typeof first === "number" && typeof second === "number"
            ? first - second
            : String(first).localeCompare(String(second), undefined, {
                numeric: true,
                sensitivity: "base",
              });

        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [rows, search, statusFilter, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, pageSize]);

  const handleSort = (key) => {
    setSortConfig((previous) => ({
      key,
      direction:
        previous.key === key && previous.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  const handleExport = () => {
    if (activeReport === "resultSummary") {
      const columns = Object.entries(SUMMARY_LABELS).map(([key, label]) => [key, label]);
      const values = [resultSummary || {}];
      downloadCSV(values, columns, "result-summary-report");
      return;
    }

    downloadCSV(filteredRows, currentColumns, `${activeReport}-report`);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderOverview = () => (
    <>
      <div className="reports-section-heading">
        <div>
          <h2>Reports Overview</h2>
          <p>Monitor academic activities and institutional performance.</p>
        </div>
        <span className="reports-updated-label">
          <FaCheckCircle /> Live data from your LMS
        </span>
      </div>

      {loadingSummary ? (
        <div className="reports-loading">
          <div className="reports-spinner" />
          <span>Loading dashboard statistics...</span>
        </div>
      ) : (
        <>
          <div className="reports-kpi-grid">
            {KPI_CONFIG.map((item) => {
              const Icon = item.icon;
              return (
                <div className="reports-kpi-card" key={item.key}>
                  <div className={`reports-kpi-icon ${item.color}`}>
                    <Icon />
                  </div>
                  <div className="reports-kpi-content">
                    <span>{item.label}</span>
                    <strong>{Number(summary?.[item.key] ?? 0).toLocaleString()}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="reports-overview-grid">
            <div className="reports-panel">
              <div className="reports-panel-header">
                <div>
                  <h3>Academic Statistics</h3>
                  <p>Current records across the LMS</p>
                </div>
                <FaChartBar />
              </div>
              <div className="reports-stat-list">
                {[
                  ["Departments", summary?.total_departments],
                  ["Semesters", summary?.total_semesters],
                  ["Course Offerings", summary?.total_course_offerings],
                  ["Assessments", summary?.total_assessments],
                  ["All Results", summary?.total_results],
                ].map(([label, value]) => (
                  <div className="reports-stat-row" key={label}>
                    <span>{label}</span>
                    <strong>{Number(value ?? 0).toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="reports-panel">
              <div className="reports-panel-header">
                <div>
                  <h3>Result Performance</h3>
                  <p>Based on published results</p>
                </div>
                <FaGraduationCap />
              </div>
              <div className="reports-result-highlight">
                <div>
                  <span>Average Percentage</span>
                  <strong>
                    {Number(resultSummary?.average_percentage ?? 0).toFixed(2)}%
                  </strong>
                </div>
                <div>
                  <span>Average GPA</span>
                  <strong>
                    {Number(resultSummary?.average_grade_point ?? 0).toFixed(2)}
                  </strong>
                </div>
              </div>
              <div className="reports-pass-fail">
                <div className="reports-pass-item">
                  <FaCheckCircle />
                  <div>
                    <strong>{resultSummary?.pass_count ?? 0}</strong>
                    <span>Passed</span>
                  </div>
                </div>
                <div className="reports-fail-item">
                  <FaTimesCircle />
                  <div>
                    <strong>{resultSummary?.fail_count ?? 0}</strong>
                    <span>Failed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="reports-quick-heading">
            <h3>Available Reports</h3>
            <p>Select a report to explore detailed information.</p>
          </div>

          <div className="reports-quick-grid">
            {REPORTS.filter((item) => item.key !== "resultSummary").map((item) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  className="reports-quick-card"
                  key={item.key}
                  onClick={() => setActiveReport(item.key)}
                >
                  <span className="reports-quick-icon"><Icon /></span>
                  <span className="reports-quick-text">
                    <strong>{item.label} Report</strong>
                    <small>View detailed {item.label.toLowerCase()} data</small>
                  </span>
                  <FaChevronRight className="reports-quick-arrow" />
                </button>
              );
            })}
            <button
              type="button"
              className="reports-quick-card"
              onClick={() => setActiveReport("resultSummary")}
            >
              <span className="reports-quick-icon"><FaChartBar /></span>
              <span className="reports-quick-text">
                <strong>Result Summary</strong>
                <small>View pass, fail and average performance</small>
              </span>
              <FaChevronRight className="reports-quick-arrow" />
            </button>
          </div>
        </>
      )}
    </>
  );

  const renderResultSummary = () => (
    <div className="reports-result-summary-grid">
      {Object.entries(SUMMARY_LABELS).map(([key, label]) => (
        <div className="reports-summary-card" key={key}>
          <span>{label}</span>
          <strong>
            {key.includes("average")
              ? Number(resultSummary?.[key] ?? 0).toFixed(2)
              : Number(resultSummary?.[key] ?? 0).toLocaleString()}
            {key === "average_percentage" ? "%" : ""}
          </strong>
        </div>
      ))}
    </div>
  );

  const renderTable = () => (
    <div className="reports-table-wrapper">
      <table className="reports-table">
        <thead>
          <tr>
            <th className="reports-number-column">#</th>
            {currentColumns.map(([key, label]) => (
              <th key={key}>
                <button
                  type="button"
                  className="reports-sort-button"
                  onClick={() => handleSort(key)}
                >
                  {label}
                  {getSortIcon(key)}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedRows.map((row, index) => (
            <tr key={row.id ?? `${activeReport}-${startIndex + index}`}>
              <td className="reports-number-column">{startIndex + index + 1}</td>
              {currentColumns.map(([key]) => {
                const value = row[key];

                if (key === "status" || key === "employment_status" || key === "admission_status") {
                  return (
                    <td key={key}>
                      <span className={`reports-status-badge ${getStatusClass(value)}`}>
                        {formatLabel(value ?? "N/A")}
                      </span>
                    </td>
                  );
                }

                if (key === "is_published") {
                  return (
                    <td key={key}>
                      <span className={`reports-status-badge ${value ? "success" : "warning"}`}>
                        {value ? "Published" : "Unpublished"}
                      </span>
                    </td>
                  );
                }

                if (key === "attendance_percentage" || key === "percentage") {
                  return (
                    <td key={key}>
                      <strong className="reports-percentage">
                        {Number(value ?? 0).toFixed(2)}%
                      </strong>
                    </td>
                  );
                }

                return <td key={key}>{formatValue(value)}</td>;
              })}
            </tr>
          ))}
          {paginatedRows.length === 0 && (
            <tr>
              <td colSpan={currentColumns.length + 1} className="reports-empty-cell">
                <FaEye />
                <strong>No records found</strong>
                <span>Try changing your search or filter.</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="reports-management-page">
      <div className="reports-page-header">
        <div>
          <div className="reports-breadcrumb">Admin Panel / Reports</div>
          <h1>Reports Management</h1>
          <p>Analyze academic records, monitor performance, and export reports.</p>
        </div>
        <div className="reports-header-actions">
          <button
            type="button"
            className="reports-action-button secondary"
            onClick={refreshCurrentReport}
            disabled={refreshing || loadingReport}
          >
            <FaSyncAlt className={refreshing ? "reports-spin" : ""} />
            Refresh
          </button>
          <button
            type="button"
            className="reports-action-button secondary"
            onClick={handlePrint}
          >
            <FaPrint />
            Print
          </button>
          <button
            type="button"
            className="reports-action-button primary"
            onClick={handleExport}
            disabled={activeReport === "overview" || (activeReport !== "resultSummary" && !filteredRows.length)}
          >
            <FaDownload />
            Export CSV
          </button>
        </div>
      </div>

      <div className="reports-main-layout">
        <aside className="reports-sidebar">
          <span className="reports-sidebar-label">REPORT CENTER</span>
          <button
            type="button"
            className={`reports-nav-item ${activeReport === "overview" ? "active" : ""}`}
            onClick={() => setActiveReport("overview")}
          >
            <FaChartBar />
            <span>Overview</span>
          </button>
          <div className="reports-nav-divider" />
          <span className="reports-sidebar-label">ACADEMIC REPORTS</span>
          {REPORTS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.key}
                className={`reports-nav-item ${activeReport === item.key ? "active" : ""}`}
                onClick={() => setActiveReport(item.key)}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        <main className="reports-content">
          {error && (
            <div className="reports-error">
              <FaExclamationCircle />
              <span>{error}</span>
              <button type="button" onClick={() => setError("")}>Dismiss</button>
            </div>
          )}

          {activeReport === "overview" ? (
            renderOverview()
          ) : (
            <>
              <div className="reports-section-heading">
                <div>
                  <h2>{currentReport?.label} {activeReport === "resultSummary" ? "" : "Report"}</h2>
                  <p>
                    {activeReport === "resultSummary"
                      ? "Published academic result performance statistics."
                      : `Explore and analyze ${currentReport?.label.toLowerCase()} records.`}
                  </p>
                </div>
                <span className="reports-record-count">
                  {activeReport === "resultSummary"
                    ? "Summary"
                    : `${filteredRows.length.toLocaleString()} records`}
                </span>
              </div>

              {activeReport === "resultSummary" ? (
                loadingReport ? (
                  <div className="reports-loading">
                    <div className="reports-spinner" />
                    <span>Loading result summary...</span>
                  </div>
                ) : renderResultSummary()
              ) : (
                <>
                  <div className="reports-toolbar">
                    <div className="reports-search-box">
                      <FaSearch />
                      <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={`Search ${currentReport?.label.toLowerCase()}...`}
                      />
                    </div>

                    {STATUS_OPTIONS[activeReport] && (
                      <div className="reports-filter-box">
                        <FaFilter />
                        <select
                          value={statusFilter}
                          onChange={(event) => setStatusFilter(event.target.value)}
                        >
                          <option value="ALL">All Statuses</option>
                          {STATUS_OPTIONS[activeReport].map((status) => (
                            <option key={status} value={status}>
                              {formatLabel(status)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="reports-page-size">
                      <label htmlFor="reports-page-size">Show</label>
                      <select
                        id="reports-page-size"
                        value={pageSize}
                        onChange={(event) => setPageSize(Number(event.target.value))}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span>entries</span>
                    </div>
                  </div>

                  {loadingReport ? (
                    <div className="reports-loading">
                      <div className="reports-spinner" />
                      <span>Loading {currentReport?.label.toLowerCase()} report...</span>
                    </div>
                  ) : (
                    <>
                      <div className="reports-table-card">
                        <div className="reports-table-card-header">
                          <div>
                            <h3>{currentReport?.label} Records</h3>
                            <p>Click a column heading to sort the data.</p>
                          </div>
                          <span><FaFileCsv /> CSV ready</span>
                        </div>
                        {renderTable()}
                        <div className="reports-pagination">
                          <span>
                            Showing {filteredRows.length ? startIndex + 1 : 0} to{" "}
                            {Math.min(startIndex + pageSize, filteredRows.length)} of{" "}
                            {filteredRows.length} entries
                          </span>
                          <div className="reports-pagination-controls">
                            <button
                              type="button"
                              disabled={safePage <= 1}
                              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                              aria-label="Previous page"
                            >
                              <FaChevronLeft />
                            </button>
                            <span>Page {safePage} of {totalPages}</span>
                            <button
                              type="button"
                              disabled={safePage >= totalPages}
                              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                              aria-label="Next page"
                            >
                              <FaChevronRight />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default ReportsManagement;
