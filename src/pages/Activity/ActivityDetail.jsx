import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import InviteButton from "../../components/InviteButton/InviteButton";
import { useNotifications } from "../../contexts/NotificationContext";
import { useTheme } from "../../contexts/ThemeContext";
import { api } from "../../services/api";
import { getUserProfile } from "../../utils/userCache";
import "./ActivityDetail.css";
import RatingSection from "../../components/RatingSection/RatingSection";

const sourceLabels = { host: "a host", moderator: "a moderator" };

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { darkMode } = useTheme();

  const [activity, setActivity] = useState(null);
  const [creatorLabel, setCreatorLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { loadActivity(); }, [id]);

  const loadActivity = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.activities.getActivityDetails(id);
      setActivity(data);

      if (data.SourceType === "user") {
        const profile = await getUserProfile(data.CreatedBy);
        setCreatorLabel(profile.display_name || profile.handle || "a member");
      } else {
        setCreatorLabel(sourceLabels[data.SourceType] || "unknown");
      }
    } catch (err) {
      setError(err.message || "Activity not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = () => navigate(`/hangout/${id}/invite`);

  if (loading) {
    return (<div><Navbar unreadCount={unreadCount} /><h2>Loading activity...</h2></div>);
  }

  if (error || !activity) {
    return (<div><Navbar unreadCount={unreadCount} /><h2>{error || "Activity not found"}</h2></div>);
  }

  return (
    <div className={`activity-detail-page ${darkMode ? "activity-detail-page-dark" : ""}`}>
      <Navbar unreadCount={unreadCount} />
      <main className="activity-detail-container">
        <button className="back-btn" onClick={() => navigate("/")}>← Back to Home</button>

        <h1>{activity.Title}</h1>
        <p className="creator">Posted by <strong>{creatorLabel}</strong></p>

        {activity.Status !== "approved" && (
          <p className={`status-badge status-${activity.Status}`}>
            Status: {activity.Status}
            {activity.Status === "rejected" && activity.RejectionReason && <> — {activity.RejectionReason}</>}
          </p>
        )}

        <p className="description">{activity.Description || "No description provided."}</p>

        <InviteButton onClick={handleInvite} />

        <section className="comments-section">
  <h2>Ratings</h2>
  <RatingSection activityId={activity.ID} />
  <p className="coming-soon">Comments — coming soon.</p>
</section>
      </main>
    </div>
  );
}