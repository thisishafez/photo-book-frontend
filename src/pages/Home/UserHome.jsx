import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActivityCard from "../../components/ActivityCard/ActivityCard";
import { api } from "../../services/api";

export default function UserHome({ user }) {
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
      console.error("[UserHome] Failed loading activities", error);

      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Hello, {user?.displayName || "there"} 👋</h1>

      <p className="home-subtitle">
        Discover activities you'll enjoy
      </p>

      <section>
        <h2>All Activities</h2>

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

      <button
        className="create-activity-btn"
        onClick={() => navigate("/create-activity")}
      >
        + Create Activity
      </button>
    </>
  );
}
