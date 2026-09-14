import { useEffect, useState } from "react";

import {
  Search,
  RefreshCw,
  Eye,
  MapPin,
  CalendarDays,
  FileText,
  AlertCircle,
  Building2,
  UserRound,
  MessageSquare,
  Save,
  X,
  CheckCircle2,
  Navigation,
  Clock,
} from "lucide-react";

import ReportMap from "./ReportMap";

const API_BASE = "http://localhost:8000";

const REPORTS_API = `${API_BASE}/api/admin_reports.php`;
const DEPARTMENTS_API = `${API_BASE}/api/get_departments.php`;
const OFFICERS_API = `${API_BASE}/api/get_officers.php`;
const UPDATE_API = `${API_BASE}/api/update_report.php`;
const HISTORY_API = `${API_BASE}/api/report_history.php`;

function AdminReports() {
  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [selectedReport, setSelectedReport] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [management, setManagement] = useState({
    department_id: "",
    officer_id: "",
    status: "",
    comment: "",
  });

  useEffect(() => {
    loadReports();
    loadDepartments();
    loadOfficers();
  }, []);

  useEffect(() => {
    loadReports();
  }, [status]);

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      let url = REPORTS_API;

      if (status) {
        url += `?status=${encodeURIComponent(status)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load reports"
        );
      }

      setReports(data.reports || []);
    } catch (err) {
      setError(
        err.message || "Unable to load reports"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadDepartments() {
    try {
      const response = await fetch(
        DEPARTMENTS_API
      );

      const data = await response.json();

      if (data.success) {
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error(
        "Department loading error:",
        err
      );
    }
  }

  async function loadOfficers() {
    try {
      const response = await fetch(
        OFFICERS_API
      );

      const data = await response.json();

      if (data.success) {
        setOfficers(data.officers || []);
      }
    } catch (err) {
      console.error(
        "Officer loading error:",
        err
      );
    }
  }

  async function loadHistory(reportId) {
    try {
      setHistoryLoading(true);

      const url =
        `${HISTORY_API}?report_id=` +
        encodeURIComponent(reportId);

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setHistory(data.history || []);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error(
        "History loading error:",
        err
      );

      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  function openReport(report) {
    setSelectedReport(report);

    setManagement({
      department_id:
        report.department_id
          ? String(report.department_id)
          : "",

      officer_id:
        report.assigned_officer_id
          ? String(report.assigned_officer_id)
          : "",

      status: report.status || "Sent",

      comment: "",
    });

    setHistory([]);

    loadHistory(report.id);
  }

  function closeReport() {
    if (saving) {
      return;
    }

    setSelectedReport(null);
    setHistory([]);
  }

  function handleManagementChange(
    event
  ) {
    const { name, value } = event.target;

    setManagement((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function saveChanges() {
    if (!selectedReport) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        report_id: selectedReport.report_id,

        department_id:
          management.department_id
            ? Number(
                management.department_id
              )
            : null,

        officer_id:
          management.officer_id
            ? Number(
                management.officer_id
              )
            : null,

        status: management.status,

        comment:
          management.comment.trim(),
      };

      const response = await fetch(
        UPDATE_API,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update report"
        );
      }

      setSuccess(
        "Report updated successfully."
      );

      await loadReports();
      await loadHistory(
        selectedReport.id
      );

      setManagement((previous) => ({
        ...previous,
        comment: "",
      }));

      const updatedReport =
        reports.find(
          (item) =>
            item.id === selectedReport.id
        );

      if (updatedReport) {
        setSelectedReport({
          ...updatedReport,
          department_id:
            payload.department_id,
          assigned_officer_id:
            payload.officer_id,
          status: payload.status,
        });
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to update report."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleSearch(event) {
    setSearch(event.target.value);
  }

  function getStatusClass(value) {
    switch (value) {
      case "Sent":
        return "status-sent";

      case "Received":
        return "status-received";

      case "Under Review":
        return "status-review";

      case "In Progress":
        return "status-progress";

      case "Resolved":
        return "status-resolved";

      case "Rejected":
        return "status-rejected";

      default:
        return "";
    }
  }

  function formatDate(date) {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString();
  }

  const filteredReports = reports.filter(
    (report) => {
      const searchValue =
        search.toLowerCase().trim();

      if (!searchValue) {
        return true;
      }

      return (
        String(
          report.report_id || ""
        )
          .toLowerCase()
          .includes(searchValue) ||

        String(
          report.category_name || ""
        )
          .toLowerCase()
          .includes(searchValue) ||

        String(
          report.location || ""
        )
          .toLowerCase()
          .includes(searchValue) ||

        String(
          report.description || ""
        )
          .toLowerCase()
          .includes(searchValue)
      );
    }
  );

  const filteredOfficers =
    management.department_id
      ? officers.filter(
          (officer) =>
            String(
              officer.department_id
            ) ===
            String(
              management.department_id
            )
        )
      : officers;

  return (
    <main className="admin-main">
      <div className="admin-topbar">
        <div>
          <h1>Reports</h1>

          <p>
            Manage and review environmental
            reports submitted by citizens.
          </p>
        </div>

        <button
          className="admin-refresh-btn"
          onClick={loadReports}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={
              loading ? "spin" : ""
            }
          />

          Refresh
        </button>
      </div>

      {error && (
        <div className="admin-error">
          <AlertCircle size={18} />

          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="admin-success">
          <CheckCircle2 size={18} />

          <span>{success}</span>
        </div>
      )}

      <section className="reports-toolbar">
        <div className="reports-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search report ID, problem, location..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        <select
          className="reports-filter"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
        >
          <option value="">
            All Statuses
          </option>

          <option value="Sent">
            Sent
          </option>

          <option value="Received">
            Received
          </option>

          <option value="Under Review">
            Under Review
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Resolved">
            Resolved
          </option>

          <option value="Rejected">
            Rejected
          </option>
        </select>
      </section>

      <section className="reports-summary">
        <div>
          <FileText size={18} />

          <span>
            Total Reports:{" "}
            <strong>
              {filteredReports.length}
            </strong>
          </span>
        </div>

        <div>
          <Clock size={18} />

          <span>
            Current Filter:{" "}
            <strong>
              {status || "All"}
            </strong>
          </span>
        </div>
      </section>

      {loading ? (
        <div className="reports-loading">
          <RefreshCw
            size={25}
            className="spin"
          />

          <p>Loading reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="reports-empty">
          <FileText size={40} />

          <h3>
            No reports found
          </h3>

          <p>
            There are no reports matching
            your search or filter.
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-reports-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Problem</th>
                <th>Location</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.map(
                (report) => (
                  <tr
                    key={report.id}
                  >
                    <td>
                      <span className="report-id">
                        {report.report_id}
                      </span>
                    </td>

                    <td>
                      <div className="problem-cell">
                        <strong>
                          {
                            report.category_name
                          }
                        </strong>

                        <span>
                          {report.description
                            ? report.description.slice(
                                0,
                                70
                              ) +
                              (
                                report
                                  .description
                                  .length >
                                70
                                  ? "..."
                                  : ""
                              )
                            : "No description"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="location-cell">
                        <MapPin
                          size={15}
                        />

                        <span>
                          {report.location ||
                            "Location not provided"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`report-status ${getStatusClass(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>
                    </td>

                    <td>
                      <div className="date-cell">
                        <CalendarDays
                          size={15}
                        />

                        <span>
                          {formatDate(
                            report.created_at
                          )}
                        </span>
                      </div>
                    </td>

                    <td>
                      <button
                        className="view-report-btn"
                        onClick={() =>
                          openReport(
                            report
                          )
                        }
                      >
                        <Eye size={16} />

                        View
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedReport && (
        <div
          className="report-modal-overlay"
          onClick={closeReport}
        >
          <div
            className="report-modal report-management-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="report-modal-header">
              <div>
                <h2>
                  Report Details
                </h2>

                <p>
                  {selectedReport.report_id}
                </p>
              </div>

              <button
                className="management-cancel-btn"
                onClick={closeReport}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <div className="report-detail-grid">
              <div>
                <span className="detail-label">
                  Problem Type
                </span>

                <strong>
                  {
                    selectedReport.category_name
                  }
                </strong>
              </div>

              <div>
                <span className="detail-label">
                  Current Status
                </span>

                <span
                  className={`report-status ${getStatusClass(
                    selectedReport.status
                  )}`}
                >
                  {selectedReport.status}
                </span>
              </div>

              <div>
                <span className="detail-label">
                  Location
                </span>

                <strong>
                  {selectedReport.location ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <span className="detail-label">
                  Date Submitted
                </span>

                <strong>
                  {formatDate(
                    selectedReport.created_at
                  )}
                </strong>
              </div>
            </div>

            <div className="report-description-box">
              <div className="detail-label">
                Description
              </div>

              <p>
                {selectedReport.description ||
                  "No description provided."}
              </p>
            </div>

            <div className="management-section">
              <h3 className="management-section-title">
                <Building2 size={18} />

                Manage Report
              </h3>

              <div className="management-form-grid">
                <div className="management-field">
                  <label>
                    Department
                  </label>

                  <select
                    name="department_id"
                    className="management-select"
                    value={
                      management.department_id
                    }
                    onChange={
                      handleManagementChange
                    }
                  >
                    <option value="">
                      Select Department
                    </option>

                    {departments.map(
                      (department) => (
                        <option
                          key={
                            department.id
                          }
                          value={
                            department.id
                          }
                        >
                          {
                            department.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="management-field">
                  <label>
                    Officer
                  </label>

                  <select
                    name="officer_id"
                    className="management-select"
                    value={
                      management.officer_id
                    }
                    onChange={
                      handleManagementChange
                    }
                  >
                    <option value="">
                      Select Officer
                    </option>

                    {filteredOfficers.map(
                      (officer) => (
                        <option
                          key={officer.id}
                          value={officer.id}
                        >
                          {
                            officer.full_name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="management-field">
                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    className="management-select"
                    value={
                      management.status
                    }
                    onChange={
                      handleManagementChange
                    }
                  >
                    <option value="Sent">
                      Sent
                    </option>

                    <option value="Received">
                      Received
                    </option>

                    <option value="Under Review">
                      Under Review
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Resolved">
                      Resolved
                    </option>

                    <option value="Rejected">
                      Rejected
                    </option>
                  </select>
                </div>
              </div>

              <div className="management-field">
                <label>
                  Comment / Action Note
                </label>

                <textarea
                  name="comment"
                  className="management-textarea"
                  rows="4"
                  placeholder="Write an update or action taken..."
                  value={
                    management.comment
                  }
                  onChange={
                    handleManagementChange
                  }
                />
              </div>

              <div className="management-actions">
                <button
                  className="management-cancel-btn"
                  onClick={closeReport}
                  disabled={saving}
                >
                  <X size={17} />

                  Cancel
                </button>

                <button
                  className="management-save-btn"
                  onClick={saveChanges}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />

                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>

            {selectedReport.image_path && (
              <div className="report-photo-box">
                <div className="detail-label">
                  Evidence Photo
                </div>

                <img
                  src={
                    selectedReport.image_path.startsWith(
                      "http"
                    )
                      ? selectedReport.image_path
                      : `${API_BASE}/${selectedReport.image_path.replace(
                          /^\/+/,
                          ""
                        )}`
                  }
                  alt="Report evidence"
                />
              </div>
            )}

            <div className="report-location-box">
              <div className="detail-label">
                <Navigation size={16} />

                Report Location
              </div>

              <ReportMap
                latitude={
                  selectedReport.latitude
                }
                longitude={
                  selectedReport.longitude
                }
                reportId={
                  selectedReport.report_id
                }
                location={
                  selectedReport.location
                }
              />

              {selectedReport.latitude &&
                selectedReport.longitude && (
                  <p>
                    Coordinates:{" "}
                    {
                      selectedReport.latitude
                    }
                    ,{" "}
                    {
                      selectedReport.longitude
                    }
                  </p>
                )}
            </div>

            <div className="report-location-box">
              <div className="detail-label">
                <MessageSquare
                  size={16}
                />

                Report History
              </div>

              {historyLoading ? (
                <div className="history-loading">
                  <RefreshCw
                    size={20}
                    className="spin"
                  />

                  <p>
                    Loading history...
                  </p>
                </div>
              ) : history.length === 0 ? (
                <div className="history-empty">
                  <p>
                    No history available.
                  </p>
                </div>
              ) : (
                <div className="report-history">
                  {history.map(
                    (item, index) => (
                      <div
                        className="history-item"
                        key={item.id}
                      >
                        <div className="history-line">
                          <div className="history-dot">
                            <CheckCircle2
                              size={15}
                            />
                          </div>

                          {index <
                            history.length -
                              1 && (
                            <div className="history-connector" />
                          )}
                        </div>

                        <div className="history-content">
                          <div className="history-top">
                            <span
                              className={`report-status ${getStatusClass(
                                item.status
                              )}`}
                            >
                              {
                                item.status
                              }
                            </span>

                            <span className="history-date">
                              {formatDate(
                                item.created_at
                              )}
                            </span>
                          </div>

                          {item.comment && (
                            <p>
                              {
                                item.comment
                              }
                            </p>
                          )}

                          {item.updated_by_name && (
                            <small>
                              Updated by:{" "}
                              {
                                item.updated_by_name
                              }
                            </small>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="report-detail-footer">
              <UserRound size={16} />

              <span>
                Reports are submitted
                anonymously. No citizen
                personal information is
                displayed.
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminReports;