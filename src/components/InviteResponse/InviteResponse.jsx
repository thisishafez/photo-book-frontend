import { useState } from "react";
import { api } from "../../services/api";

export default function InviteResponse({
  hangoutId,
  onResponded,
}) {
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const respond = async (accept) => {
    try {
      setLoading(true);
      setError("");

      await api.hangouts.respondToInvite(
        hangoutId,
        accept,
        accept ? null : reason.trim() || null
      );

      onResponded?.();
    } catch (err) {
      setError(
        err.message || "Unable to respond to invitation."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="hangout-invite-response">
      <h2>You're invited</h2>

      <p>
        Would you like to join this hangout?
      </p>

      {error && (
        <div className="hangout-invite-response__error">
          {error}
        </div>
      )}

      {!showReject ? (
        <div className="hangout-invite-response__actions">
          <button
            type="button"
            disabled={loading}
            onClick={() => respond(true)}
          >
            {loading ? "Please wait..." : "Accept"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => setShowReject(true)}
          >
            Decline
          </button>
        </div>
      ) : (
        <div>
          <label>
            Reason (optional)
          </label>

          <textarea
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
            placeholder="Why can't you make it?"
            rows={3}
          />

          <div className="hangout-invite-response__actions">
            <button
              type="button"
              disabled={loading}
              onClick={() => respond(false)}
            >
              {loading ? "Please wait..." : "Decline Invite"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => setShowReject(false)}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </section>
  );
}