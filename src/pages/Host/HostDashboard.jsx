import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { useTheme } from "../../contexts/ThemeContext";
import { api } from "../../services/api";
import "./HostDashboard.css";

// No "list my activities" endpoint exists yet, so the host names the
// activity by id. Meant to be reached via a "Set up badge & QR" link
// from wherever activity management lives, with ?activityId=...
// prefilled — the field stays editable so a host can switch activities
// without leaving the page.
export default function HostDashboard() {
  const [searchParams] = useSearchParams();
  const { darkMode } = useTheme();

  const [activityId, setActivityId] = useState(searchParams.get("activityId") || "");

  const [badge, setBadge] = useState(null);
  const [badgeName, setBadgeName] = useState("");
  const [badgeIcon, setBadgeIcon] = useState("");
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [badgeNotice, setBadgeNotice] = useState(null);

  const [qrCode, setQrCode] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrNotice, setQrNotice] = useState(null);

  const loadActivitySetup = async (id) => {
    if (!id.trim()) return;
    setBadgeNotice(null);
    setQrNotice(null);

    try {
      const existingBadge = await api.activities.getHostBadge(id.trim());
      setBadge(existingBadge);
      setBadgeName(existingBadge?.name || "");
      setBadgeIcon(existingBadge?.iconKey || "");
    } catch (err) {
      setBadge(null);
      if (err.status !== 404) setBadgeNotice({ type: "error", text: err.message });
    }

    try {
      setQrCode(await api.activities.getQRCode(id.trim()));
    } catch (err) {
      setQrCode(null);
      if (err.status !== 404) setQrNotice({ type: "error", text: err.message });
    }
  };

  const handleLoadActivity = (e) => {
    e.preventDefault();
    loadActivitySetup(activityId);
  };

  const handleCreateBadge = async (e) => {
    e.preventDefault();
    if (!activityId.trim() || !badgeName.trim()) return;

    setBadgeLoading(true);
    setBadgeNotice(null);
    try {
      const created = await api.activities.createBadge(activityId.trim(), badgeName.trim(), badgeIcon.trim());
      setBadge(created);
      setBadgeNotice({ type: "success", text: "Badge saved." });
    } catch (err) {
      setBadgeNotice({ type: "error", text: err.message || "Couldn't save the badge." });
    } finally {
      setBadgeLoading(false);
    }
  };

  const handleGenerateQr = async () => {
    if (!activityId.trim()) return;

    setQrLoading(true);
    setQrNotice(null);
    try {
      const generated = await api.activities.generateQRCode(activityId.trim());
      setQrCode(generated);
      setQrNotice({ type: "success", text: "QR code generated." });
    } catch (err) {
      setQrNotice({ type: "error", text: err.message || "Couldn't generate a QR code." });
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <div className={`host-dashboard-page ${darkMode ? "host-dashboard-dark" : ""}`}>
      <Navbar />
      <main className="host-dashboard-container">
        <h1>Host Dashboard</h1>

        <section className="host-dashboard-section">
          <h2>Activity</h2>
          <form className="host-dashboard-form" onSubmit={handleLoadActivity}>
            <label htmlFor="activity-id">Activity ID</label>
            <input
              id="activity-id"
              type="text"
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
              placeholder="Paste the activity's id"
            />
            <button type="submit" disabled={!activityId.trim()}>Load setup</button>
          </form>
        </section>

        <section className="host-dashboard-section">
          <h2>Badge</h2>
          <p className="host-dashboard-hint">
            One badge per activity — attendees who scan the QR code below earn it automatically.
          </p>
          <form className="host-dashboard-form" onSubmit={handleCreateBadge}>
            <label htmlFor="badge-name">Name</label>
            <input
              id="badge-name"
              type="text"
              value={badgeName}
              onChange={(e) => setBadgeName(e.target.value)}
              placeholder="e.g. Trail Finisher"
              disabled={badgeLoading}
            />
            <label htmlFor="badge-icon">Icon (emoji or icon key)</label>
            <input
              id="badge-icon"
              type="text"
              value={badgeIcon}
              onChange={(e) => setBadgeIcon(e.target.value)}
              placeholder="🏅"
              disabled={badgeLoading}
            />
            <button type="submit" disabled={badgeLoading || !activityId.trim() || !badgeName.trim()}>
              {badge ? "Update badge" : "Create badge"}
            </button>
          </form>
          {badgeNotice && (
            <p className={`host-dashboard-notice host-dashboard-notice-${badgeNotice.type}`}>{badgeNotice.text}</p>
          )}
          {badge && <p className="host-dashboard-current">Current: {badge.iconKey} {badge.name}</p>}
        </section>

        <section className="host-dashboard-section">
          <h2>QR Code</h2>
          <p className="host-dashboard-hint">
            Fixed for this activity — display it at the event for attendees to scan.
          </p>
          {qrCode ? (
            <p className="host-dashboard-current">Code: {qrCode.code}</p>
          ) : (
            <button onClick={handleGenerateQr} disabled={qrLoading || !activityId.trim()}>
              {qrLoading ? "Generating…" : "Generate QR code"}
            </button>
          )}
          {qrNotice && (
            <p className={`host-dashboard-notice host-dashboard-notice-${qrNotice.type}`}>{qrNotice.text}</p>
          )}
        </section>
      </main>
    </div>
  );
}