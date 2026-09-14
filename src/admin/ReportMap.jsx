import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import { useEffect } from "react";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const reportIcon = new L.Icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapCenter({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    map.setView(
      [latitude, longitude],
      16
    );
  }, [map, latitude, longitude]);

  return null;
}

function ReportMap({
  latitude,
  longitude,
  reportId,
  location,
}) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) ||
      !Number.isFinite(lng)) {
    return (
      <div className="report-map-empty">
        <p>
          GPS location is not available
          for this report.
        </p>
      </div>
    );
  }

  return (
    <div className="report-map-wrapper">

      <MapContainer
        center={[lat, lng]}
        zoom={16}
        scrollWheelZoom={true}
        className="report-map"
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenter
          latitude={lat}
          longitude={lng}
        />

        <Marker
          position={[lat, lng]}
          icon={reportIcon}
        >

          <Popup>

            <strong>
              {reportId}
            </strong>

            <br />

            {location || "Reported location"}

            <br />

            <small>
              {lat}, {lng}
            </small>

          </Popup>

        </Marker>

      </MapContainer>

    </div>
  );
}

export default ReportMap;
