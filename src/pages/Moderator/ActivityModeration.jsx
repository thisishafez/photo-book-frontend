import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { useTheme } from "../../contexts/ThemeContext";
import Navbar from "../../components/Navbar/Navbar";
import { api } from "../../services/api";
import { getUserProfile } from "../../utils/userCache";
import "./ActivityModeration.css";

export default function ActivityModeration() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { darkMode } = useTheme();
  const { unreadCount } = useNotifications();

  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);


  useEffect(() => {
    if (user?.accountType !== "moderator") return;
    loadQueue();
  }, [user]);


  const loadQueue = async () => {
    setIsLoading(true);
    setError("");

    try {
      const activities = await api.activities.getModerationQueue();

      const enriched = await Promise.all(
        activities.map(async (a) => {
          let creatorLabel = a.SourceType;

          if (a.SourceType === "user") {
            const profile = await getUserProfile(a.CreatedBy);
            creatorLabel = profile.display_name || profile.handle;
          }

          return { ...a, creatorLabel };
        })
      );

      setQueue(enriched);

    } catch (err) {
      setError(err.message || "Failed to load moderation queue.");

    } finally {
      setIsLoading(false);
    }
  };


  const approve = async (id) => {
    setProcessingId(id);

    try {
      await api.activities.approveActivity(id);
      setQueue(prev => prev.filter(a => a.ID !== id));

    } catch (err) {
      alert(err.message);

    } finally {
      setProcessingId(null);
    }
  };


  const reject = async (id) => {
    const reason = window.prompt("Reason for rejection (optional):") || null;

    setProcessingId(id);

    try {
      await api.activities.rejectActivity(id, reason);
      setQueue(prev => prev.filter(a => a.ID !== id));

    } catch (err) {
      alert(err.message);

    } finally {
      setProcessingId(null);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    navigate("/login");
  };


  if (user?.accountType !== "moderator") {
    return (
      <div className={`activity-moderation-page${darkMode ? " activity-moderation-page-dark" : ""}`}>

        <Navbar unreadCount={unreadCount} />

        <main>
          <h1>Moderators only</h1>
          <p>You don't have access to this page.</p>

          <button onClick={() => navigate("/")}>
            ← Home
          </button>
        </main>

      </div>
    );
  }


return (
  <>
    <Navbar unreadCount={unreadCount} />

    <div className={`activity-moderation-page${darkMode ? " activity-moderation-page-dark" : ""}`}>

      <main className="activity-moderation-main">

        <h1>
          Activity Moderation Queue
        </h1>

        {error && (
          <div className="api-error">
            {error}
          </div>
        )}

        {isLoading ? (
          <p>
            Loading...
          </p>
        ) : queue.length === 0 ? (
          <p>
            No activities pending review.
          </p>
        ) : (
          queue.map((activity) => (
            <div
              key={activity.ID}
              className="moderation-item"
            >
              <h3>{activity.Title}</h3>

              <p>
                {activity.Description || "No description."}
              </p>

              <p className="moderation-meta">
                Submitted by {activity.creatorLabel}
              </p>

              <div className="moderation-actions">
                <button
                  onClick={() => approve(activity.ID)}
                  disabled={processingId === activity.ID}
                >
                  Approve
                </button>

                <button
                  onClick={() => reject(activity.ID)}
                  disabled={processingId === activity.ID}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}

      </main>

    </div>
  </>
);
}