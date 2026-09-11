import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActivityCard from "../../components/ActivityCard/ActivityCard";
import { api } from "../../services/api";
import { useSuggestedActivities } from "../../hooks/useSuggestedActivities";

export default function UserHome({ user }) {
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const { activities: suggestions, loading: suggestionsLoading } =
    useSuggestedActivities();

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);

      const response = await api.activities.list();

      setActivities(response || []);
    } catch (error) {
      console.error("[UserHome] Failed loading activities", error);

      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Same caveat as HostHome: api.activities.list() only returns the
  // public, approved feed, so any of the user's own activities still
  // pending/rejected moderation won't show up here. Filtering client-side
  // for now until a GET /activities/mine (or similar) endpoint exists.
  const myActivities = activities.filter(
    (activity) => String(activity.CreatedBy) === String(user?.id)
  );

  return (
    <>
      <h1>Hello, {user?.displayName || "there"} 👋</h1>

      <p className="home-subtitle">
        Discover activities you'll enjoy
      </p>

      <section>
        <h2>Your Activities</h2>

        {loading ? (
          <p>Loading your activities...</p>
        ) : myActivities.length === 0 ? (
          <p>
            You haven't created any activities yet — or
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
                onClick={() => navigate(`/activity/${activity.ID}`)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>For You</h2>

        {suggestionsLoading ? (
          <p>Loading activities...</p>
        ) : suggestions.length === 0 ? (
          <p>No activities available yet.</p>
        ) : (
          <div className="activity-grid">
            {suggestions.map(({ activity }) => (
              <ActivityCard
                key={activity.ID}
                title={activity.Title}
                description={activity.Description}
                category={activity.SourceType}
                onClick={() => navigate(`/activity/${activity.ID}`)}
              />
            ))}
          </div>
        )}
      </section>

      <button
        className="create-activity-btn"
        onClick={() => navigate("/create-activity")}
      >
        + Create Activity
      </button>
    </>
  );
}