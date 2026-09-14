import { useEffect, useState } from "react";

import {
  FileText,
  AlertCircle,
  Clock,
  LoaderCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowUpRight,
  Building2,
  Users,
} from "lucide-react";

const API_URL =
  "http://localhost:8000/api/admin_dashboard.php";

function AdminDashboard() {
  const [stats, setStats] = useState({
    total_reports: 0,
    new_reports: 0,
    under_review: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load dashboard"
        );
      }

      // Convert the API status_summary array
      // into the values used by the dashboard cards.
      const statusSummary = data.status_summary || [];

      const getStatusTotal = (status) => {
        const item = statusSummary.find(
          (row) => row.status === status
        );

        return item ? Number(item.total) : 0;
      };

      setStats({
        total_reports: Number(data.total_reports || 0),

        new_reports:
          getStatusTotal("Sent") +
          getStatusTotal("Received"),

        under_review:
          getStatusTotal("Under Review"),

        in_progress:
          getStatusTotal("In Progress"),

        resolved:
          getStatusTotal("Resolved"),

        rejected:
          getStatusTotal("Rejected"),
      });
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.message || "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const cards = [
    {
      title: "Total Reports",
      value: stats.total_reports,
      icon: FileText,
      className: "total",
    },
    {
      title: "New Reports",
      value: stats.new_reports,
      icon: AlertCircle,
      className: "new",
    },
    {
      title: "Under Review",
      value: stats.under_review,
      icon: Clock,
      className: "review",
    },
    {
      title: "In Progress",
      value: stats.in_progress,
      icon: LoaderCircle,
      className: "progress",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: CheckCircle2,
      className: "resolved",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      className: "rejected",
    },
  ];

  return (
    <main className="admin-main">
      <div className="admin-topbar">
        <div>
          <p className="admin-welcome">
            Municipal Administration
          </p>

          <h1>Dashboard</h1>

          <p className="admin-description">
            Monitor and manage community reports.
          </p>
        </div>

        <button
          type="button"
          className="admin-refresh-btn"
          onClick={loadDashboard}
          disabled={loading}
        >
          <RefreshCw
            size={18}
            className={loading ? "spin" : ""}
          />

          Refresh
        </button>
      </div>

      {error && (
        <div className="admin-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <section className="admin-stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              className={`admin-stat-card ${card.className}`}
              key={card.title}
            >
              <div className="admin-stat-top">
                <div className="admin-stat-icon">
                  <Icon size={22} />
                </div>

                <ArrowUpRight size={18} />
              </div>

              <div className="admin-stat-value">
                {loading ? "—" : card.value}
              </div>

              <div className="admin-stat-title">
                {card.title}
              </div>
            </div>
          );
        })}
      </section>

      <section className="admin-content-grid">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Report Overview</h2>

              <p>
                Current status of environmental reports
              </p>
            </div>

            <button type="button">
              View Reports
            </button>
          </div>

          <div className="status-overview">
            <div className="status-row">
              <span>
                <i className="status-dot sent"></i>
                New Reports
              </span>

              <strong>{stats.new_reports}</strong>
            </div>

            <div className="status-row">
              <span>
                <i className="status-dot review"></i>
                Under Review
              </span>

              <strong>{stats.under_review}</strong>
            </div>

            <div className="status-row">
              <span>
                <i className="status-dot progress"></i>
                In Progress
              </span>

              <strong>{stats.in_progress}</strong>
            </div>

            <div className="status-row">
              <span>
                <i className="status-dot resolved"></i>
                Resolved
              </span>

              <strong>{stats.resolved}</strong>
            </div>

            <div className="status-row">
              <span>
                <i className="status-dot rejected"></i>
                Rejected
              </span>

              <strong>{stats.rejected}</strong>
            </div>
          </div>
        </div>

        <div className="admin-panel admin-quick-panel">
          <h2>Quick Actions</h2>

          <p>
            Manage environmental incidents efficiently.
          </p>

          <button
            type="button"
            className="quick-action"
          >
            <FileText size={20} />

            <span>
              View All Reports
            </span>

            <ArrowUpRight size={18} />
          </button>

          <button
            type="button"
            className="quick-action"
          >
            <Building2 size={20} />

            <span>
              Manage Departments
            </span>

            <ArrowUpRight size={18} />
          </button>

          <button
            type="button"
            className="quick-action"
          >
            <Users size={20} />

            <span>
              Manage Officers
            </span>

            <ArrowUpRight size={18} />
          </button>
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;
