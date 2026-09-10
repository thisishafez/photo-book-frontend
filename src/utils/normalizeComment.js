// Same issue as normalizeHangout.js / normalizeArchive.js: the comment
// endpoints return the Go domain struct directly (no `json` tags), so
// keys come back capitalized (ID, ActivityID, Body, ...). Centralizing
// the lookup here so CommentCard/CommentSection/CommentModeration all
// read the same normalized shape instead of each guessing casing.
//
// Confirmed against a real list-comments payload (2026-09-10): each
// entry is a wrapper, not a flat comment —
//   { "Comment": { "ID": ..., "Body": ..., "UserID": ... },
//     "Score": 0, "Upvotes": 0, "Downvotes": 0 }
// so the comment fields must be read from raw.Comment (falling back to
// raw itself in case some endpoint ever returns the flat shape), and
// the vote score lives at the wrapper's top level, not on the comment.

import { pick } from "./normalizeHangout";

export const normalizeComment = (raw) => {
  if (!raw) return null;

  // List-comments responses wrap the comment under "Comment"/"comment";
  // other endpoints (e.g. approve/reject) may return the comment flat.
  const commentSrc = pick(raw, "comment", "Comment") ?? raw;

  const score = pick(
    raw,
    "vote_score",
    "VoteScore",
    "score",
    "Score",
    "net_votes",
    "NetVotes"
  );

  return {
    id: pick(commentSrc, "id", "ID"),
    activity_id: pick(commentSrc, "activity_id", "ActivityID"),
    user_id: pick(
      commentSrc,
      "user_id",
      "UserID",
      "author_id",
      "AuthorID"
    ),
    body: pick(commentSrc, "body", "Body") ?? "",
    status: (pick(commentSrc, "status", "Status") || "pending").toLowerCase(),
    created_at: pick(commentSrc, "created_at", "CreatedAt") ?? null,
    score: typeof score === "number" ? score : 0,
    upvotes: pick(raw, "upvotes", "Upvotes") ?? 0,
    downvotes: pick(raw, "downvotes", "Downvotes") ?? 0,
  };
};

export const normalizeComments = (raw) => (raw || []).map(normalizeComment);