// src/components/ResultsMap.jsx
// Leaflet map component for ATL Decider Results page.
// Renders pins for venues that have valid coords. Uses OpenStreetMap tiles.

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet marker icons not loading in Vite/CRA bundles.
// We point to the CDN-hosted icon assets rather than bundling them.
const DefaultIcon = L.icon({
  iconUrl:
    "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Numbered ranking icon (1 = top result)
function rankIcon(rank, isHighlighted) {
  const bg = isHighlighted ? "#d2532a" : "#1c1917";
  const html = `
    <div style="
      width:30px;height:30px;border-radius:50%;
      background:${bg};color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-weight:700;font-family:Inter,system-ui,sans-serif;font-size:14px;
      border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);
    ">${rank}</div>
  `;
  return L.divIcon({
    html,
    className: "atl-rank-icon",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

// Auto-fit the map bounds to all visible markers
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [points, map]);
  return null;
}

export default function ResultsMap({ venues, highlightedId, onPinClick }) {
  const mapRef = useRef(null);

  // Filter venues that have valid coords
  const mapped = useMemo(
    () =>
      (venues || [])
        .map((v, i) => ({ ...v, _rank: i + 1 }))
        .filter(
          (v) =>
            Array.isArray(v.coords) &&
            v.coords.length === 2 &&
            typeof v.coords[0] === "number" &&
            typeof v.coords[1] === "number"
        ),
    [venues]
  );

  const points = useMemo(() => mapped.map((v) => v.coords), [mapped]);

  if (!mapped.length) {
    return (
      <div
        className="rounded-2xl border bg-stone-50 p-6 text-sm opacity-70"
        style={{ minHeight: 180 }}
      >
        Map unavailable for these picks (missing coordinates).
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ height: 320, position: "relative" }}
    >
      <MapContainer
        ref={mapRef}
        center={mapped[0].coords}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {mapped.map((v) => (
          <Marker
            key={v.id}
            position={v.coords}
            icon={rankIcon(v._rank, highlightedId === v.id)}
            eventHandlers={{
              click: () => {
                if (onPinClick) onPinClick(v.id);
              },
            }}
          >
            <Popup>
              <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>
                  #{v._rank} · {v.name}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
                  {v.neighborhood}
                </div>
                {v.url && (
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 12, color: "#d2532a" }}
                  >
                    Visit website →
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

/* END OF FILE — last line above is "}" closing ResultsMap */
