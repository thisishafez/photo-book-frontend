import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import "./CreateActivity.css";

export default function CreateActivity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const activity = await api.activities.createActivity(title.trim(), description.trim() || null);

      if (activity.Status === "approved") {
        navigate(`/activity/${activity.ID}`);
      } else {
        alert("Your activity was submitted and is awaiting moderator review.");
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Couldn't create activity. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-activity-page">
      <h1>Create an Activity</h1>

      {user?.accountType === "user" && (
        <p className="create-activity-note">
          As a regular user, your activity will be reviewed by a moderator before it appears publicly.
        </p>
      )}

      {error && <div className="api-error">{error}</div>}

      <form onSubmit={handleSubmit} className="create-activity-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Activity title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <button type="submit" disabled={isSubmitting || !title.trim()}>
          {isSubmitting ? "Creating..." : "Create Activity"}
        </button>
      </form>
    </div>
  );
}