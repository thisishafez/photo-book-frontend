import { useNavigate } from "react-router-dom";
import ActivityCard from "../../components/ActivityCard/ActivityCard";
import { useSuggestedActivities } from "../../hooks/useSuggestedActivities";

export default function UserHome({ user }) {
  const navigate = useNavigate();

  const { activities: suggestions, loading } = useSuggestedActivities();

  return (
    <>
      <h1>Hello, {user?.displayName || "there"} 👋</h1>

      <p className="home-subtitle">
        Discover activities you'll enjoy
      </p>

      <section>
        <h2>For You</h2>

        {loading ? (
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