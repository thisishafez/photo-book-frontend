import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api";

const getUserId = (user) =>
  user?.id ||
  user?.user_id ||
  user?.userId;

const getUserName = (user) =>
  user?.display_name ||
  user?.displayName ||
  user?.username ||
  user?.name ||
  "User";

export default function InviteFriends() {
  const { id: hangoutId } = useParams();
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFriends = async () => {
      try {
        setLoading(true);

        const response = await api.circle.getCircle();

        const data =
          response?.friends ||
          response?.members ||
          response?.users ||
          response?.data ||
          response ||
          [];

        setFriends(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err.message || "Unable to load your friends."
        );
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, []);

  const toggleUser = (userId) => {
    setSelected((previous) =>
      previous.includes(userId)
        ? previous.filter((id) => id !== userId)
        : [...previous, userId]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (selected.length === 0) {
      setError("Select at least one friend.");
      return;
    }

    try {
      setSending(true);
      setError("");

      await api.hangouts.inviteParticipants(
        hangoutId,
        selected
      );

      navigate(`/hangout/${hangoutId}`);
    } catch (err) {
      setError(
        err.message || "Unable to send invitations."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="invite-friends-page">
      <h1>Invite Friends</h1>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading friends...</p>
      ) : friends.length === 0 ? (
        <p>You don't have any friends to invite.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="friend-list">
            {friends.map((friend) => {
              const userId = getUserId(friend);

              return (
                <label
                  key={userId}
                  className="friend-list__item"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(userId)}
                    onChange={() =>
                      toggleUser(userId)
                    }
                  />

                  <span>
                    {getUserName(friend)}
                  </span>
                </label>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={sending || selected.length === 0}
          >
            {sending
              ? "Sending..."
              : `Invite ${selected.length} friend${
                  selected.length === 1 ? "" : "s"
                }`}
          </button>
        </form>
      )}
    </main>
  );
}