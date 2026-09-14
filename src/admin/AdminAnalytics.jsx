import { useEffect, useMemo, useState } from "react";

import {
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Search,
  Send,
  TrendingUp,
  AlertCircle,
  Building2,
  Tag,
  Activity,
} from "lucide-react";

const ANALYTICS_API =
  "http://localhost:8000/api/admin_analytics.php";

function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

     const response = await fetch(ANALYTICS_API, {
      method: "GET",
     credentials: "include",
    });

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Failed to load analytics."
        );
      }

      setData(result);
    } catch (err) {
      console.error("Analytics error:", err);

      setError(
        err.message || "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const summary = data?.summary || {};
  const statuses = data?.statuses || [];
  const departments = data?.departments || [];
  const categories = data?.categories || [];
  const monthly = data?.monthly || [];

  const filteredCategories = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return categories;
    }

    return categories.filter((item) =>
      String(item.name || "")
        .toLowerCase()
        .includes(value)
    );
  }, [categories, search]);

  const maxDepartment = useMemo(() => {
    return Math.max(
      ...departments.map((item) =>
        Number(item.total || 0)
      ),
      1
    );
  }, [departments]);

  const maxCategory = useMemo(() => {
    return Math.max(
      ...categories.map((item) =>
        Number(item.total || 0)
      ),
      1
    );
  }, [categories]);

  const chartData = useMemo(() => {
    if (!monthly.length) {
      return {
        points: "",
        circles: [],
        maxValue: 1,
      };
    }

    const width = 700;
    const height = 240;
    const padding = 30;

    const values = monthly.map((item) =>
      Number(item.total || 0)
    );

    const maxValue = Math.max(...values, 1);

    const circles = monthly.map((item, index) => {
      const x =
        padding +
        (index * (width - padding * 2)) /
          Math.max(monthly.length - 1, 1);

      const y =
        height -
        padding -
        (Number(item.total || 0) / maxValue) *
          (height - padding * 2);

      return {
        x,
        y,
        month: item.month,
        total: Number(item.total || 0),
      };
    });

    const points = circles
      .map((point) => `${point.x},${point.y}`)
      .join(" ");

    return {
      points,
      circles,
      maxValue,
    };
  }, [monthly]);

  function formatMonth(value) {
    if (!value) {
      return "";
    }

    const parts = String(value).split("-");

    if (parts.length !== 2) {
      return value;
    }

    const date = new Date(
      Number(parts[0]),
      Number(parts[1]) - 1
    );

    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  }

  function getStatusClass(status) {
    const value = String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-");

    return `analytics-status analytics-status-${value}`;
  }

  /*
   * LOADING
   */
  if (loading) {
    return (
      <main className="admin-main">
        <div className="analytics-loading">
          <RefreshCw
            size={30}
            className="spin"
          />

          <h2>Loading analytics...</h2>

          <p>
            Preparing your reporting insights.
          </p>
        </div>
      </main>
    );
  }

  /*
   * ERROR
   */
  if (error) {
    return (
      <main className="admin-main">
        <div className="analytics-error">
          <AlertCircle size={30} />

          <h2>
            Unable to load analytics
          </h2>

          <p>{error}</p>

          <button
            className="management-save-btn"
            onClick={loadAnalytics}
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  /*
   * DASHBOARD
   */
  return (
    <main className="admin-main">

      {/* HEADER */}
      <div className="analytics-header">

        <div className="analytics-title-row">

          <div className="analytics-title-icon">
            <BarChart3 size={25} />
          </div>

          <div>
            <h1>Analytics</h1>

            <p>
              Monitor environmental reports,
              trends and municipal performance.
            </p>
          </div>

        </div>

        <button
          className="admin-refresh-btn"
          onClick={loadAnalytics}
        >
          <RefreshCw size={17} />
          Refresh Data
        </button>

      </div>


      {/* KPI CARDS */}
      <section className="analytics-kpi-grid">

        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon total">
            <FileText size={23} />
          </div>

          <div>
            <span>Total Reports</span>

            <strong>
              {summary.total_reports ?? 0}
            </strong>

            <small>
              All submitted reports
            </small>
          </div>
        </div>


        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon sent">
            <Send size={23} />
          </div>

          <div>
            <span>Sent</span>

            <strong>
              {summary.sent ?? 0}
            </strong>

            <small>
              Newly submitted
            </small>
          </div>
        </div>


        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon review">
            <Clock3 size={23} />
          </div>

          <div>
            <span>Under Review</span>

            <strong>
              {summary.under_review ?? 0}
            </strong>

            <small>
              Being investigated
            </small>
          </div>
        </div>


        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon progress">
            <Activity size={23} />
          </div>

          <div>
            <span>In Progress</span>

            <strong>
              {summary.in_progress ?? 0}
            </strong>

            <small>
              Currently being handled
            </small>
          </div>
        </div>


        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon resolved">
            <CheckCircle2 size={23} />
          </div>

          <div>
            <span>Resolved</span>

            <strong>
              {summary.resolved ?? 0}
            </strong>

            <small>
              Successfully completed
            </small>
          </div>
        </div>


        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon month">
            <TrendingUp size={23} />
          </div>

          <div>
            <span>This Month</span>

            <strong>
              {summary.this_month ?? 0}
            </strong>

            <small>
              Reports this month
            </small>
          </div>
        </div>

      </section>


      {/* MAIN CHARTS */}
      <section className="analytics-main-grid">

        {/* TREND */}
        <div className="analytics-panel analytics-trend-panel">

          <div className="analytics-panel-header">

            <div>
              <h2>Reporting Trend</h2>

              <p>
                Reports submitted over the last
                12 months.
              </p>
            </div>

            <div className="analytics-panel-icon">
              <TrendingUp size={20} />
            </div>

          </div>


          {monthly.length === 0 ? (
            <div className="analytics-no-data">
              No monthly data available.
            </div>
          ) : (
            <div className="analytics-line-chart">

              <svg
                viewBox="0 0 700 240"
                preserveAspectRatio="none"
              >

                <line
                  x1="30"
                  y1="30"
                  x2="30"
                  y2="210"
                  className="chart-axis"
                />

                <line
                  x1="30"
                  y1="210"
                  x2="670"
                  y2="210"
                  className="chart-axis"
                />

                <line
                  x1="30"
                  y1="75"
                  x2="670"
                  y2="75"
                  className="chart-grid-line"
                />

                <line
                  x1="30"
                  y1="120"
                  x2="670"
                  y2="120"
                  className="chart-grid-line"
                />

                <line
                  x1="30"
                  y1="165"
                  x2="670"
                  y2="165"
                  className="chart-grid-line"
                />

                <polyline
                  points={chartData.points}
                  fill="none"
                  className="analytics-line"
                />

                {chartData.circles.map(
                  (point) => (
                    <circle
                      key={point.month}
                      cx={point.x}
                      cy={point.y}
                      r="5"
                      className="analytics-point"
                    />
                  )
                )}

              </svg>


              <div className="analytics-chart-labels">

                {monthly.map((item) => (
                  <span key={item.month}>
                    {formatMonth(item.month)}
                  </span>
                ))}

              </div>

            </div>
          )}

        </div>


        {/* STATUS */}
        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>
              <h2>Report Status</h2>

              <p>
                Current distribution by status.
              </p>
            </div>

            <div className="analytics-panel-icon">
              <Activity size={20} />
            </div>

          </div>


          <div className="analytics-status-list">

            {statuses.length === 0 ? (
              <div className="analytics-no-data">
                No status data available.
              </div>
            ) : (
              statuses.map((item) => {

                const total =
                  Number(summary.total_reports || 0);

                const count =
                  Number(item.total || 0);

                const percentage =
                  total > 0
                    ? Math.round(
                        (count / total) * 100
                      )
                    : 0;

                return (
                  <div
                    className="analytics-status-row"
                    key={item.status}
                  >

                    <div className="analytics-status-info">

                      <span
                        className={getStatusClass(
                          item.status
                        )}
                      >
                        {item.status}
                      </span>

                      <strong>{count}</strong>

                    </div>

                    <div className="analytics-progress">

                      <div
                        className="analytics-progress-fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                    <small>
                      {percentage}%
                    </small>

                  </div>
                );
              })
            )}

          </div>

        </div>

      </section>


      {/* DEPARTMENTS + CATEGORIES */}
      <section className="analytics-secondary-grid">

        {/* DEPARTMENTS */}
        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>
              <h2>
                Reports by Department
              </h2>

              <p>
                Department workload overview.
              </p>
            </div>

            <div className="analytics-panel-icon">
              <Building2 size={20} />
            </div>

          </div>


          <div className="analytics-ranking-list">

            {departments.length === 0 ? (
              <div className="analytics-no-data">
                No department data available.
              </div>
            ) : (
              departments.map(
                (department, index) => {

                  const total =
                    Number(
                      department.total || 0
                    );

                  const percentage =
                    Math.round(
                      (total / maxDepartment) *
                        100
                    );

                  return (
                    <div
                      className="analytics-ranking-item"
                      key={department.id}
                    >

                      <div className="ranking-number">
                        {index + 1}
                      </div>

                      <div className="ranking-content">

                        <div className="ranking-title">

                          <span>
                            {department.name}
                          </span>

                          <strong>
                            {total}
                          </strong>

                        </div>

                        <div className="analytics-progress">

                          <div
                            className="analytics-progress-fill department-fill"
                            style={{
                              width:
                                `${percentage}%`,
                            }}
                          />

                        </div>

                      </div>

                    </div>
                  );
                }
              )
            )}

          </div>

        </div>


        {/* CATEGORIES */}
        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>
              <h2>
                Reports by Category
              </h2>

              <p>
                Most common incident types.
              </p>
            </div>

            <div className="analytics-panel-icon">
              <Tag size={20} />
            </div>

          </div>


          <div className="analytics-category-search">

            <Search size={16} />

            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>


          <div className="analytics-ranking-list">

            {filteredCategories.length === 0 ? (
              <div className="analytics-no-data">
                No categories found.
              </div>
            ) : (
              filteredCategories.map(
                (category, index) => {

                  const total =
                    Number(
                      category.total || 0
                    );

                  const percentage =
                    Math.round(
                      (total / maxCategory) *
                        100
                    );

                  return (
                    <div
                      className="analytics-ranking-item"
                      key={category.id}
                    >

                      <div className="ranking-number">
                        {index + 1}
                      </div>

                      <div className="ranking-content">

                        <div className="ranking-title">

                          <span>
                            {category.name}
                          </span>

                          <strong>
                            {total}
                          </strong>

                        </div>

                        <div className="analytics-progress">

                          <div
                            className="analytics-progress-fill category-fill"
                            style={{
                              width:
                                `${percentage}%`,
                            }}
                          />

                        </div>

                      </div>

                    </div>
                  );
                }
              )
            )}

          </div>

        </div>

      </section>


      {/* SUMMARY */}
      <section className="analytics-summary-banner">

        <div className="analytics-summary-icon">
          <BarChart3 size={25} />
        </div>

        <div>
          <h3>
            Reporting Overview
          </h3>

          <p>
            The system has received{" "}
            <strong>
              {summary.total_reports ?? 0}
            </strong>{" "}
            environmental reports in total,
            including{" "}
            <strong>
              {summary.today ?? 0}
            </strong>{" "}
            submitted today and{" "}
            <strong>
              {summary.resolved ?? 0}
            </strong>{" "}
            successfully resolved.
          </p>
        </div>

      </section>

    </main>
  );
}

export default AdminAnalytics;