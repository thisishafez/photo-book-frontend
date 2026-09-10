import "./CommentCard.css";

const formatTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function CommentCard({
  comment,
  authorLabel,
  onVote,
  votingDisabled,
}) {
  return (
    <div className="comment-card">
      <div className="comment-header">
        <strong>{authorLabel || "Someone"}</strong>
        <span className="comment-time">{formatTime(comment.created_at)}</span>
      </div>

      <p className="comment-body">{comment.body}</p>

      <div className="comment-footer">
        <button
          type="button"
          className="comment-vote-btn"
          aria-label="Upvote"
          disabled={votingDisabled}
          onClick={() => onVote?.(comment.id, 1)}
        >
          ▲
        </button>
        <span className="comment-score">{comment.score}</span>
        <button
          type="button"
          className="comment-vote-btn"
          aria-label="Downvote"
          disabled={votingDisabled}
          onClick={() => onVote?.(comment.id, -1)}
        >
          ▼
        </button>
      </div>
    </div>
  );
}
