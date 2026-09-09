import { useState } from "react";
import { api } from "../../services/api";
import "./FindFriendsModal.css";

export default function FindFriendsModal({ close }) {
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const sendRequest = async () => {
    if (!handle.trim()) return;
    setIsSending(true);
    setStatus(null);
    try {
      await api.circle.sendRequestByHandle(handle.trim());
      setStatus({ type: "success", message: `Request sent to @${handle.trim()}` });
      setHandle("");
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="find-modal">
        <button className="close" onClick={close}>✕</button>
        <h2>Find Friends</h2>
        <p className="find-modal-hint">Enter someone's exact handle to send a request.</p>

        <div className="search-row">
          <input
            className="search-input"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="Handle (e.g. yasin)"
            disabled={isSending}
          />
          <button className="search-btn" onClick={sendRequest} disabled={isSending || !handle.trim()}>
            {isSending ? "Sending..." : "Send Request"}
          </button>
        </div>

        {status && (
          <p className={status.type === "error" ? "find-modal-error" : "find-modal-success"}>
            {status.message}
          </p>
        )}
      </div>
    </div>
  );
}