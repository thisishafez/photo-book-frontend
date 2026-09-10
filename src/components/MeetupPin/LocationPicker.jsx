import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet's default marker icons resolve to relative paths that
// break under most bundlers (Vite included) — point them at the
// CDN copies explicitly, or the marker renders as a broken image.
const markerIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_CENTER = [35.6892, 51.389]; // arbitrary fallback (Tehran)
const DEFAULT_ZOOM = 11;

const hasCoords = (lat, lng) =>
  lat !== null &&
  lat !== undefined &&
  lat !== "" &&
  lng !== null &&
  lng !== undefined &&
  lng !== "";

// Click (or drag the marker) to choose a meetup location. Reports
// back plain lat/lng numbers via onChange — it doesn't know
// anything about place names or addresses, that stays the parent's
// job.
export default function LocationPicker({
  latitude,
  longitude,
  onChange,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Keep the latest onChange available inside Leaflet's event
  // handlers without having to tear the map down and rebuild it
  // every time the parent passes a new function reference.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const placeMarker = (map, lat, lng) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      return;
    }

    markerRef.current = L.marker([lat, lng], {
      icon: markerIcon,
      draggable: true,
    }).addTo(map);

    markerRef.current.on("dragend", () => {
      const { lat: newLat, lng: newLng } =
        markerRef.current.getLatLng();
      onChangeRef.current?.(newLat, newLng);
    });
  };

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const startWithCoords = hasCoords(latitude, longitude);
    const center = startWithCoords
      ? [Number(latitude), Number(longitude)]
      : DEFAULT_CENTER;

    const map = L.map(containerRef.current).setView(
      center,
      startWithCoords ? 15 : DEFAULT_ZOOM
    );

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    ).addTo(map);

    if (startWithCoords) {
      placeMarker(map, Number(latitude), Number(longitude));
    }

    map.on("click", (event) => {
      const { lat, lng } = event.latlng;
      placeMarker(map, lat, lng);
      onChangeRef.current?.(lat, lng);
    });

    mapRef.current = map;

    // The map is often created inside a form that just became
    // visible, so its container may report a zero size at the
    // moment Leaflet measures it. Nudge it once layout settles.
    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If lat/lng change from outside (parent resets the form, or an
  // existing pin loads in), sync the marker without re-creating the
  // whole map.
  useEffect(() => {
    if (!mapRef.current || !hasCoords(latitude, longitude)) return;

    const lat = Number(latitude);
    const lng = Number(longitude);

    placeMarker(mapRef.current, lat, lng);
    mapRef.current.setView([lat, lng], mapRef.current.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  return (
    <div
      ref={containerRef}
      className="location-picker__map"
      role="application"
      aria-label="Click the map to choose a meetup location"
    />
  );
}