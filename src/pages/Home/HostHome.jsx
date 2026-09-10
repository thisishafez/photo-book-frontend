import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActivityCard from "../../components/ActivityCard/ActivityCard";
import { api } from "../../services/api";

export default function HostHome({ user }) {
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);

      const response = await api.activities.list();

      setActivities(response || []);
    } catch (error) {
      console.error("[HostHome] Failed loading activities", error);

      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // api.activities.list() only returns the public, already-approved
  // feed — there's no "my activities" endpoint yet, so a host's own
  // pending or rejected activities won't show up here at all. This
  // filters what we do have client-side. Worth asking the backend
  // for a GET /activities/mine (or similar) if hosts need visibility
  // into activities still awaiting moderation.
  const myActivities = activities.filter(
    (activity) =>
      String(activity.CreatedBy) === String(user?.id)
  );

  return (
    <>
      <h1>Welcome back, {user?.displayName || "Host"} 👋</h1>

      <p className="home-subtitle">
        Manage the activities you host and see what's live.
      </p>

      <section className="home-action-row">
        <button
          className="create-activity-btn"
          onClick={() => navigate("/create-activity")}
        >
          + Create Activity
        </button>

        <button
          className="home-secondary-btn"
          onClick={() => navigate("/host/dashboard")}
        >
          Go to Host Dashboard
        </button>
      </section>

      <section>
        <h2>Your Activities</h2>

        {loading ? (
          <p>Loading your activities...</p>
        ) : myActivities.length === 0 ? (
          <p>
            You haven't published any activities yet — or
            they're still awaiting moderator approval.
          </p>
        ) : (
          <div className="activity-grid">
            {myActivities.map((activity) => (
              <ActivityCard
                key={activity.ID}
                title={activity.Title}
                description={activity.Description}
                category={activity.SourceType}
                onClick={() =>
                  navigate(`/activity/${activity.ID}`)
                }
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Discover Activities</h2>

        {loading ? (
          <p>Loading activities...</p>
        ) : activities.length === 0 ? (
          <p>No activities available yet.</p>
        ) : (
          <div className="activity-grid">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.ID}
                title={activity.Title}
                description={activity.Description}
                category={activity.SourceType}
                onClick={() =>
                  navigate(`/activity/${activity.ID}`)
                }
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
