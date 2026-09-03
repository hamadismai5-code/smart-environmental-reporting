import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import {
  AlertTriangle,
  Camera,
  MapPin,
  Navigation,
  Send,
  CheckCircle,
  Loader2,
  Search,
  X,
} from "lucide-react";

import "leaflet/dist/leaflet.css";

const API_URL =
  "http://localhost:8000/api/submit_report.php";

const DEFAULT_CENTER = [-6.1659, 39.2026];

const categories = [
  "Illegal Dumping",
  "Garbage Pollution",
  "Water Pollution",
  "Air Pollution",
  "Road Damage",
  "Broken Street Lights",
  "Noise Pollution",
  "Crime Activity",
  "Other",
];

const markerIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:42px;
      height:42px;
      background:#166534;
      border:3px solid white;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 5px 15px rgba(0,0,0,.3);
      display:flex;
      align-items:center;
      justify-content:center;
    ">
      <div style="
        width:12px;
        height:12px;
        background:white;
        border-radius:50%;
      "></div>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
});

function MapClickHandler({ setLocation }) {
  useMapEvents({
    click(event) {
      setLocation([
        event.latlng.lat,
        event.latlng.lng,
      ]);
    },
  });

  return null;
}

function MapMover({ location }) {
  const map = useMap();

  useEffect(() => {
    if (!location) return;

    map.flyTo(location, 16, {
      duration: 1,
    });
  }, [location, map]);

  return null;
}

function ReportIncident() {
  const [problemType, setProblemType] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [locationName, setLocationName] =
    useState("");

  const [coordinates, setCoordinates] =
    useState(null);

  const [photo, setPhoto] = useState(null);

  const [photoPreview, setPhotoPreview] =
    useState("");

  const [loadingLocation, setLoadingLocation] =
    useState(false);

  const [searching, setSearching] =
    useState(false);

  const [searchText, setSearchText] =
    useState("");

  const [searchResults, setSearchResults] =
    useState([]);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] =
    useState(null);

  // --------------------------------
  // GET CURRENT GPS LOCATION
  // --------------------------------

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setLoadingLocation(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

        const newLocation = [lat, lng];

        setCoordinates(newLocation);

        try {
          const response =
            await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
            );

          const data =
            await response.json();

          setLocationName(
            data.display_name ||
              `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          );
        } catch {
          setLocationName(
            `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          );
        }

        setLoadingLocation(false);
      },

      () => {
        setLoadingLocation(false);

        setError(
          "Unable to get your location. Please allow location access."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // --------------------------------
  // SEARCH LOCATION
  // --------------------------------

  const searchLocation = async () => {
    const query = searchText.trim();

    if (!query) return;

    try {
      setSearching(true);
      setSearchResults([]);
      setError("");

      const response =
        await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
            query
          )}&limit=5`
        );

      const data =
        await response.json();

      setSearchResults(data || []);
    } catch {
      setError(
        "Unable to search for this location."
      );
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (result) => {
    const lat = Number(result.lat);
    const lng = Number(result.lon);

    setCoordinates([lat, lng]);

    setLocationName(
      result.display_name
    );

    setSearchResults([]);
  };

  // --------------------------------
  // PHOTO
  // --------------------------------

  const handlePhotoChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Photo must not exceed 5MB."
      );
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, PNG and WEBP images are allowed."
      );
      return;
    }

    setPhoto(file);
    setPhotoPreview(
      URL.createObjectURL(file)
    );

    setError("");
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview("");
  };

  // --------------------------------
  // SUBMIT REPORT
  // --------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess(null);

    if (!problemType) {
      setError(
        "Please select the problem type."
      );
      return;
    }

    if (!description.trim()) {
      setError(
        "Please describe the incident."
      );
      return;
    }

    if (!coordinates) {
      setError(
        "Please select your location on the map or use My Location."
      );
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append(
        "problem_type",
        problemType
      );

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "location",
        locationName.trim()
      );

      formData.append(
        "latitude",
        coordinates[0]
      );

      formData.append(
        "longitude",
        coordinates[1]
      );

      if (photo) {
        formData.append(
          "photo",
          photo
        );
      }

      const response =
        await fetch(API_URL, {
          method: "POST",
          body: formData,
        });

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to submit report."
        );
      }

      setSuccess({
        reportId: data.report_id,
        status: data.status,
      });

      // Clear form
      setProblemType("");
      setDescription("");
      setLocationName("");
      setCoordinates(null);
      setPhoto(null);
      setPhotoPreview("");
      setSearchText("");
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Something went wrong while submitting the report."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------
  // SUCCESS SCREEN
  // --------------------------------

  if (success) {
    return (
      <main className="report-page">
        <div className="report-success">
          <div className="success-icon">
            <CheckCircle size={50} />
          </div>

          <h1>Report Submitted Successfully</h1>

          <p>
            Your report has been sent to the
            responsible authority.
          </p>

          <div className="report-id-box">
            <span>Report ID</span>

            <strong>
              {success.reportId}
            </strong>
          </div>

          <div className="success-actions">
            <a
              href={`/track?report_id=${success.reportId}`}
              className="btn btn-primary"
            >
              Track This Report
            </a>

            <button
              className="btn btn-secondary"
              onClick={() =>
                setSuccess(null)
              }
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="report-page">
      <div className="report-container">

        {/* HEADER */}

        <div className="report-header">
          <div className="report-label">
            <AlertTriangle size={15} />
            Community Reporting
          </div>

          <h1>Report an Incident</h1>

          <p>
            Help improve your community by
            reporting environmental and public
            problems.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="form-error">
            <AlertTriangle size={18} />

            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <X size={17} />
            </button>
          </div>
        )}

        <form
          className="report-form"
          onSubmit={handleSubmit}
        >

          {/* LEFT SIDE */}

          <div className="report-form-main">

            {/* PROBLEM TYPE */}

            <section className="form-card">
              <div className="form-card-header">
                <div className="step-number">
                  1
                </div>

                <div>
                  <h2>
                    What is the problem?
                  </h2>

                  <p>
                    Select the category that
                    best describes the incident.
                  </p>
                </div>
              </div>

              <div className="category-grid">
                {categories.map(
                  (category) => (
                    <button
                      type="button"
                      key={category}
                      className={`category-option ${
                        problemType ===
                        category
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setProblemType(
                          category
                        )
                      }
                    >
                      <AlertTriangle
                        size={18}
                      />

                      <span>
                        {category}
                      </span>
                    </button>
                  )
                )}
              </div>
            </section>

            {/* DESCRIPTION */}

            <section className="form-card">
              <div className="form-card-header">
                <div className="step-number">
                  2
                </div>

                <div>
                  <h2>
                    Describe the incident
                  </h2>

                  <p>
                    Give enough information to
                    help authorities understand
                    the problem.
                  </p>
                </div>
              </div>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Example: Garbage has been dumped near the road..."
                rows={6}
                maxLength={2000}
              />

              <div className="character-count">
                {description.length}/2000
              </div>
            </section>

            {/* PHOTO */}

            <section className="form-card">
              <div className="form-card-header">
                <div className="step-number">
                  3
                </div>

                <div>
                  <h2>
                    Add photo evidence
                  </h2>

                  <p>
                    A photo helps authorities
                    understand the problem.
                  </p>
                </div>
              </div>

              {!photoPreview ? (
                <label className="photo-upload">
                  <Camera size={34} />

                  <strong>
                    Upload a photo
                  </strong>

                  <span>
                    JPG, PNG or WEBP · Maximum
                    5MB
                  </span>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handlePhotoChange
                    }
                  />
                </label>
              ) : (
                <div className="photo-preview">
                  <img
                    src={photoPreview}
                    alt="Evidence preview"
                  />

                  <button
                    type="button"
                    onClick={removePhoto}
                    className="remove-photo"
                  >
                    <X size={18} />
                    Remove photo
                  </button>
                </div>
              )}
            </section>

            {/* LOCATION */}

            <section className="form-card">
              <div className="form-card-header">
                <div className="step-number">
                  4
                </div>

                <div>
                  <h2>
                    Where did it happen?
                  </h2>

                  <p>
                    Your location helps the
                    responsible authority find
                    the incident.
                  </p>
                </div>
              </div>

              {/* SEARCH */}

              <div className="location-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search location..."
                  value={searchText}
                  onChange={(e) =>
                    setSearchText(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter"
                    ) {
                      e.preventDefault();
                      searchLocation();
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={
                    searchLocation
                  }
                  disabled={searching}
                >
                  {searching ? (
                    <Loader2
                      size={17}
                      className="spin"
                    />
                  ) : (
                    "Search"
                  )}
                </button>
              </div>

              {/* SEARCH RESULTS */}

              {searchResults.length >
                0 && (
                <div className="search-results">
                  {searchResults.map(
                    (result) => (
                      <button
                        type="button"
                        key={`${result.lat}-${result.lon}`}
                        onClick={() =>
                          selectSearchResult(
                            result
                          )
                        }
                      >
                        <MapPin
                          size={17}
                        />

                        <span>
                          {
                            result.display_name
                          }
                        </span>
                      </button>
                    )
                  )}
                </div>
              )}

              {/* GPS */}

              <button
                type="button"
                className="gps-button"
                onClick={
                  getCurrentLocation
                }
                disabled={loadingLocation}
              >
                {loadingLocation ? (
                  <Loader2
                    size={18}
                    className="spin"
                  />
                ) : (
                  <Navigation
                    size={18}
                  />
                )}

                {loadingLocation
                  ? "Getting location..."
                  : "Use My Current Location"}
              </button>

              {locationName && (
                <div className="selected-location">
                  <MapPin size={18} />

                  <div>
                    <strong>
                      Selected Location
                    </strong>

                    <span>
                      {locationName}
                    </span>
                  </div>
                </div>
              )}

              <div className="report-map">
                <MapContainer
                  center={
                    coordinates ||
                    DEFAULT_CENTER
                  }
                  zoom={
                    coordinates ? 16 : 13
                  }
                  className="report-leaflet-map"
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapClickHandler
                    setLocation={
                      (location) => {
                        setCoordinates(
                          location
                        );

                        setLocationName(
                          `${location[0].toFixed(
                            6
                          )}, ${location[1].toFixed(
                            6
                          )}`
                        );
                      }
                    }
                  />

                  <MapMover
                    location={coordinates}
                  />

                  {coordinates && (
                    <Marker
                      position={
                        coordinates
                      }
                      icon={markerIcon}
                    >
                      <Popup>
                        <strong>
                          Incident Location
                        </strong>

                        <br />

                        {coordinates[0].toFixed(
                          6
                        )}
                        {", "}
                        {coordinates[1].toFixed(
                          6
                        )}
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>

              <p className="map-help">
                <MapPin size={14} />
                You can click anywhere on the
                map to select the incident
                location.
              </p>
            </section>

            {/* SUBMIT */}

            <button
              type="submit"
              className="submit-report-button"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2
                    size={20}
                    className="spin"
                  />

                  Sending Report...
                </>
              ) : (
                <>
                  <Send size={20} />

                  Submit Report
                </>
              )}
            </button>

            <p className="privacy-note">
              Your report can be submitted
              anonymously. We do not require your
              name, phone number or email.
            </p>
          </div>

          {/* RIGHT SIDE */}

          <aside className="report-sidebar">
            <div className="info-card">
              <div className="info-icon">
                <CheckCircle size={21} />
              </div>

              <h3>
                What happens next?
              </h3>

              <div className="process-step">
                <span>1</span>

                <div>
                  <strong>
                    Report received
                  </strong>

                  <p>
                    Your report is sent to the
                    system.
                  </p>
                </div>
              </div>

              <div className="process-step">
                <span>2</span>

                <div>
                  <strong>
                    Authority reviews
                  </strong>

                  <p>
                    The responsible department
                    checks the incident.
                  </p>
                </div>
              </div>

              <div className="process-step">
                <span>3</span>

                <div>
                  <strong>
                    Action taken
                  </strong>

                  <p>
                    Officers investigate and
                    take appropriate action.
                  </p>
                </div>
              </div>

              <div className="process-step">
                <span>4</span>

                <div>
                  <strong>
                    Problem resolved
                  </strong>

                  <p>
                    The report is marked as
                    resolved.
                  </p>
                </div>
              </div>
            </div>

            <div className="info-card privacy-card">
              <MapPin size={22} />

              <h3>
                Location is important
              </h3>

              <p>
                Providing an accurate location
                helps the responsible team respond
                faster.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}

export default ReportIncident;