import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { getUserProfile } from "../../utils/userCache";
import { normalizeComments } from "../../utils/normalizeComment";
import CommentCard from "../CommentCard/CommentCard";
import "./CommentSection.css";

export default function CommentSection({ activityId }) {
  const [comments, setComments] = useState([]);
  const [authors, setAuthors] = useState({}); // user_id -> label
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [postNotice, setPostNotice] = useState(null); // { type, text }

  const [votingId, setVotingId] = useState(null);

  useEffect(() => { loadComments(); }, [activityId]);

  const loadComments = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await api.activities.getComments(activityId);
      const normalized = normalizeComments(data);
      setComments(normalized);

      const profiles = await Promise.all(
        normalized.map(async (c) => {
          if (!c.user_id) return [c.id, "Someone"];
          const profile = await getUserProfile(c.user_id);
          return [c.user_id, profile.display_name || profile.handle || "Someone"];
        })
      );
      setAuthors(Object.fromEntries(profiles.map(([id, label]) => [id, label])));
    } catch (err) {
      setLoadError(err.message || "Couldn't load comments.");
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;

    setPosting(true);
    setPostNotice(null);
    try {
      await api.activities.addComment(activityId, body);
      setDraft("");
      setPostNotice({
        type: "success",
        text: "Comment submitted — it'll appear here once a moderator approves it.",
      });
    } catch (err) {
      setPostNotice({ type: "error", text: err.message || "Couldn't post your comment." });
    } finally {
      setPosting(false);
    }
  };

  const handleVote = async (commentId, value) => {
    setVotingId(commentId);
    try {
      await api.comments.vote(commentId, value);
      await loadComments();
    } catch (err) {
      alert(err.message || "Couldn't record your vote.");
    } finally {
      setVotingId(null);
    }
  };

  return (
    <div className="comment-section">
      <form className="comment-composer" onSubmit={submitComment}>
        <label htmlFor="comment-draft">Add a comment</label>
        <textarea
          id="comment-draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Share your thoughts on this activity…"
          rows={3}
          disabled={posting}
        />
        <button type="submit" className="comment-submit-btn" disabled={posting || !draft.trim()}>
          {posting ? "Posting…" : "Post comment"}
        </button>
        {postNotice && (
          <p className={`comment-notice comment-notice-${postNotice.type}`}>{postNotice.text}</p>
        )}
      </form>

      {loading ? (
        <p className="comment-loading">Loading comments…</p>
      ) : loadError ? (
        <p className="comment-notice comment-notice-error">{loadError}</p>
      ) : comments.length === 0 ? (
        <p className="comment-empty">No comments yet — be the first to share your thoughts.</p>
      ) : (
        <div className="comment-list">
          {comments.map((c) => (
            <CommentCard
              key={c.id}
              comment={c}
              authorLabel={authors[c.user_id]}
              onVote={handleVote}
              votingDisabled={votingId === c.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
