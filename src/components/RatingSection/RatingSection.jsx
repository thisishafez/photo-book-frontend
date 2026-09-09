import { useEffect, useState } from "react";
import { api } from "../../services/api";
import "./RatingSection.css";

function Stars({ value }) {
  // value: 0–5, may be fractional. Two stacked ★★★★★ rows; the top
  // row is clipped to value/5 width so half-stars render crisply
  // without needing an image asset.
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span className="rating-stars" aria-hidden="true">
      <span className="rating-stars-empty">★★★★★</span>
      <span className="rating-stars-filled" style={{ width: `${pct}%` }}>★★★★★</span>
    </span>
  );
}

export default function RatingSection({ activityId }) {
  const [summary, setSummary] = useState(null);
  const [selected, setSelected] = useState(2.5);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "error" | "success", text }

  useEffect(() => { loadSummary(); }, [activityId]);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await api.activities.getRatingSummary(activityId);
      setSummary(data);
      if (data.Count > 0) setSelected(Math.round(data.Average * 2) / 2);
    } catch {
      // Non-fatal — the page still works without a summary.
      setSummary({ Average: 0, Count: 0 });
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setNotice(null);
    try {
      await api.activities.submitRating(activityId, selected);
      setNotice({ type: "success", text: `Saved — you rated this ${selected.toFixed(1)}.` });
      await loadSummary();
    } catch (err) {
      const isAttendanceError = /attend/i.test(err.message || "");
      setNotice({
        type: "error",
        text: isAttendanceError
          ? "You can rate this once you've attended a completed hangout for it."
          : (err.message || "Couldn't save your rating."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="rating-loading">Loading ratings…</p>;

  return (
    <div className="rating-section">
      <div className="rating-summary">
        <Stars value={summary.Average} />
        <span className="rating-average">{summary.Count > 0 ? summary.Average.toFixed(1) : "No ratings yet"}</span>
        {summary.Count > 0 && (
          <span className="rating-count">({summary.Count} rating{summary.Count === 1 ? "" : "s"})</span>
        )}
      </div>

      <div className="rating-input">
        <label htmlFor="rating-slider">Rate this activity</label>
        <div className="rating-input-row">
          <input
            id="rating-slider"
            type="range"
            min="0"
            max="5"
            step="0.5"
            list="rating-ticks"
            value={selected}
            onChange={(e) => setSelected(parseFloat(e.target.value))}
            disabled={submitting}
          />
          <datalist id="rating-ticks">
            {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((v) => <option key={v} value={v} />)}
          </datalist>
          <span className="rating-input-value">{selected.toFixed(1)}</span>
        </div>
        <button className="rating-submit-btn" onClick={submit} disabled={submitting}>
          {submitting ? "Saving…" : "Submit rating"}
        </button>
      </div>

      {notice && <p className={`rating-notice rating-notice-${notice.type}`}>{notice.text}</p>}
    </div>
  );
}