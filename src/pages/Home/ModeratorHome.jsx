import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

const PREVIEW_LIMIT = 5;

export default function ModeratorHome({ user }) {
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.activities.getModerationQueue();

      setQueue(response || []);
    } catch (err) {
      setError(
        err.message || "Failed to load moderation queue."
      );
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  const preview = queue.slice(0, PREVIEW_LIMIT);
  const remaining = queue.length - preview.length;

  return (
    <>
      <h1>Welcome back, {user?.displayName || "Moderator"} 👋</h1>

      <p className="home-subtitle">
        Here's what's waiting on your review.
      </p>

      <section className="home-action-row">
        <button
          className="create-activity-btn"
          onClick={() => navigate("/moderation/activities")}
        >
          Review Activities
        </button>

        <button
          className="home-secondary-btn"
          onClick={() => navigate("/moderation/comments")}
        >
          Review Comments
        </button>
      </section>

      <section>
        <h2>Pending Activities ({queue.length})</h2>

        {loading ? (
          <p>Loading moderation queue...</p>
        ) : error ? (
          <p>{error}</p>
        ) : queue.length === 0 ? (
          <p>Nothing waiting on review right now 🎉</p>
        ) : (
          <>
            <ul className="home-moderation-list">
              {preview.map((activity) => (
                <li key={activity.ID}>
                  <span>{activity.Title}</span>

                  <button
                    className="home-link-btn"
                    onClick={() =>
                      navigate("/moderation/activities")
                    }
                  >
                    Review
                  </button>
                </li>
              ))}
            </ul>

            {remaining > 0 && (
              <p>
                +{remaining} more waiting —{" "}
                <button
                  className="home-link-btn"
                  onClick={() =>
                    navigate("/moderation/activities")
                  }
                >
                  view all
                </button>
              </p>
            )}
          </>
        )}
      </section>
    </>
  );
}
