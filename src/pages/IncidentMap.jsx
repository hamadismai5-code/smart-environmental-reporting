import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  Search,
  MapPin,
  Navigation,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

import "leaflet/dist/leaflet.css";

/* =========================================================
   CONFIG
   ========================================================= */

const API_URL =
  "http://localhost:8000/api/get_reports.php";

const DEFAULT_CENTER = [-6.1659, 39.2026];

/* =========================================================
   HELPERS
   ========================================================= */

function getStatusClass(status) {
  switch (status) {
    case "Sent":
      return "sent";

    case "Received":
      return "received";

    case "Under Review":
      return "review";

    case "In Progress":
      return "progress";

    case "Resolved":
      return "resolved";

    case "Rejected":
      return "rejected";

    default:
      return "sent";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "Resolved":
      return <CheckCircle size={15} />;

    case "Rejected":
      return <XCircle size={15} />;

    case "In Progress":
      return <Clock size={15} />;

    default:
      return <AlertTriangle size={15} />;
  }
}

/* =========================================================
   CUSTOM MARKER
   ========================================================= */

function createMarkerIcon(status) {
  let background = "#166534";

  if (status === "Sent") {
    background = "#2563eb";
  }

  if (status === "Received") {
    background = "#7c3aed";
  }

  if (status === "Under Review") {
    background = "#d97706";
  }

  if (status === "In Progress") {
    background = "#0891b2";
  }

  if (status === "Resolved") {
    background = "#16a34a";
  }

  if (status === "Rejected") {
    background = "#dc2626";
  }

  return L.divIcon({
    className: "",
    html: `
      <div
        style="
          width:38px;
          height:38px;
          background:${background};
          border:3px solid #ffffff;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow:0 5px 14px rgba(15,23,42,.28);
        "
      >
        <div
          style="
            width:10px;
            height:10px;
            background:#ffffff;
            border-radius:50%;
          "
        ></div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });
}

/* =========================================================
   MAP FLY COMPONENT
   ========================================================= */

function MapController({ selectedReport }) {
  const map = useMap();

  useEffect(() => {
    if (
      selectedReport &&
      selectedReport.latitude &&
      selectedReport.longitude
    ) {
      map.flyTo(
        [
          Number(selectedReport.latitude),
          Number(selectedReport.longitude),
        ],
        16,
        {
          duration: 1.2,
        }
      );
    }
  }, [selectedReport, map]);

  return null;
}

/* =========================================================
   INCIDENT MAP
   ========================================================= */

function IncidentMap() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] =
    useState(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [myLocation, setMyLocation] =
    useState(null);

  /* =======================================================
     LOAD REPORTS
     ======================================================= */

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(
          "Failed to connect to server"
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to load incidents"
        );
      }

      setReports(data.reports || []);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load incidents. Make sure PHP server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  /* =======================================================
     FILTER REPORTS
     ======================================================= */

  const filteredReports = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return reports;
    }

    return reports.filter((report) => {
      return (
        report.report_id
          ?.toLowerCase()
          .includes(keyword) ||
        report.problem_type
          ?.toLowerCase()
          .includes(keyword) ||
        report.location
          ?.toLowerCase()
          .includes(keyword) ||
        report.status
          ?.toLowerCase()
          .includes(keyword)
      );
    });
  }, [reports, search]);

  /* =======================================================
     MY LOCATION
     ======================================================= */

  const findMyLocation = () => {
    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by your browser."
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        setMyLocation(location);
      },
      () => {
        alert(
          "Unable to get your current location."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  /* =======================================================
     COUNTS
     ======================================================= */

  const resolvedCount = reports.filter(
    (report) => report.status === "Resolved"
  ).length;

  const progressCount = reports.filter(
    (report) => report.status === "In Progress"
  ).length;

  const sentCount = reports.filter(
    (report) => report.status === "Sent"
  ).length;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="incident-map-page">

      {/* HEADER */}
      <div className="map-page-header">

        <div>
          <div className="map-label">
            <MapPin size={14} />
            Community Incidents
          </div>

          <h1>Incident Map</h1>

          <p>
            View environmental and community
            incidents reported in your area.
          </p>
        </div>

        <button
          className="my-location-btn"
          onClick={findMyLocation}
        >
          <Navigation size={17} />
          My Location
        </button>

      </div>

      {/* MAP LAYOUT */}
      <div className="incident-map-layout">

        {/* =================================================
            SIDEBAR
            ================================================= */}

        <aside className="incident-sidebar">

          {/* SEARCH */}
          <div className="map-search">

            <div
              style={{
                position: "relative",
              }}
            >
              <Search
                size={17}
                style={{
                  position: "absolute",
                  left: "13px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />

              <input
                type="text"
                placeholder="Search incidents..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                style={{
                  paddingLeft: "40px",
                }}
              />
            </div>

          </div>

          {/* COUNT */}
          <div className="incident-count">

            <span>
              Showing{" "}
              <strong>
                {filteredReports.length}
              </strong>{" "}
              incidents
            </span>

            <button
              onClick={loadReports}
              title="Refresh incidents"
              style={{
                border: "none",
                background: "transparent",
                color: "#64748b",
                padding: "5px",
              }}
            >
              <RefreshCw size={15} />
            </button>

          </div>

          {/* LIST */}
          <div className="incident-list">

            {loading && (
              <div className="map-loading">
                <RefreshCw
                  size={28}
                  className="spin"
                />

                <p style={{ marginTop: "10px" }}>
                  Loading incidents...
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="map-error">

                <AlertTriangle
                  size={30}
                />

                <p
                  style={{
                    marginTop: "10px",
                  }}
                >
                  {error}
                </p>

                <button
                  className="btn btn-primary"
                  style={{
                    marginTop: "15px",
                  }}
                  onClick={loadReports}
                >
                  Try Again
                </button>

              </div>
            )}

            {!loading &&
              !error &&
              filteredReports.length === 0 && (
                <div className="no-incidents">

                  <div className="no-incidents-icon">
                    <MapPin size={25} />
                  </div>

                  <strong>
                    No incidents found
                  </strong>

                  <p
                    style={{
                      marginTop: "5px",
                    }}
                  >
                    Try another search.
                  </p>

                </div>
              )}

            {!loading &&
              !error &&
              filteredReports.map(
                (report) => (
                  <button
                    key={report.report_id}
                    className={`incident-item ${
                      selectedReport?.report_id ===
                      report.report_id
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedReport(report)
                    }
                  >

                    <div className="incident-item-icon">
                      <AlertTriangle
                        size={19}
                      />
                    </div>

                    <div className="incident-item-content">

                      <h4>
                        {report.problem_type}
                      </h4>

                      <p>
                        {report.description}
                      </p>

                      {report.location && (
                        <div className="incident-item-location">
                          <MapPin size={11} />
                          {report.location}
                        </div>
                      )}

                      <span
                        className={`map-status ${getStatusClass(
                          report.status
                        )}`}
                      >
                        {getStatusIcon(
                          report.status
                        )}

                        <span
                          style={{
                            marginLeft: "4px",
                          }}
                        >
                          {report.status}
                        </span>
                      </span>

                    </div>

                  </button>
                )
              )}

          </div>

        </aside>

        {/* =================================================
            MAP
            ================================================= */}

        <div className="map-wrapper">

          {loading ? (
            <div className="map-loading">
              <RefreshCw
                size={32}
                className="spin"
              />

              <p style={{ marginTop: "10px" }}>
                Loading map...
              </p>
            </div>
          ) : (
            <MapContainer
              center={DEFAULT_CENTER}
              zoom={13}
              className="full-map"
              scrollWheelZoom={true}
            >

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapController
                selectedReport={
                  selectedReport
                }
              />

              {/* REPORT MARKERS */}
              {filteredReports.map(
                (report) => {
                  if (
                    report.latitude === null ||
                    report.longitude === null
                  ) {
                    return null;
                  }

                  const position = [
                    Number(report.latitude),
                    Number(report.longitude),
                  ];

                  return (
                    <Marker
                      key={report.report_id}
                      position={position}
                      icon={createMarkerIcon(
                        report.status
                      )}
                      eventHandlers={{
                        click: () =>
                          setSelectedReport(
                            report
                          ),
                      }}
                    >

                      <Popup>

                        <div className="map-popup">

                          {report.image_path && (
                            <img
                              src={`http://localhost:8000/${report.image_path}`}
                              alt={
                                report.problem_type
                              }
                              className="popup-image"
                            />
                          )}

                          <div className="popup-category">
                            {report.problem_type}
                          </div>

                          <p>
                            <strong>
                              Report ID:
                            </strong>{" "}
                            {report.report_id}
                          </p>

                          <p>
                            <strong>
                              Location:
                            </strong>{" "}
                            {report.location ||
                              "Not provided"}
                          </p>

                          <p>
                            <strong>
                              Status:
                            </strong>{" "}
                            {report.status}
                          </p>

                          <p>
                            {report.description}
                          </p>

                          <button
                            className="popup-details-button"
                            onClick={() =>
                              setSelectedReport(
                                report
                              )
                            }
                          >
                            View Report
                          </button>

                        </div>

                      </Popup>

                    </Marker>
                  );
                }
              )}

              {/* USER LOCATION */}
              {myLocation && (
                <Marker
                  position={myLocation}
                >
                  <Popup>
                    <strong>
                      Your current location
                    </strong>
                  </Popup>
                </Marker>
              )}

            </MapContainer>
          )}

          {/* =================================================
              LEGEND
              ================================================= */}

          <div className="map-legend">

            <h4>Incident Status</h4>

            <div className="legend-item">
              <span className="legend-dot sent"></span>
              Sent ({sentCount})
            </div>

            <div className="legend-item">
              <span className="legend-dot progress"></span>
              In Progress ({progressCount})
            </div>

            <div className="legend-item">
              <span className="legend-dot resolved"></span>
              Resolved ({resolvedCount})
            </div>

          </div>

        </div>

      </div>

    </main>
  );
}

export default IncidentMap;