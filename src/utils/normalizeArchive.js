// Confirmed against a real GET /archives and GET /archives/:id
// response on 2026-09-10 (see [ArchiveDetail]/[Archives] console.log
// output) — this replaces an earlier version of this file that
// guessed at the shape without ever seeing a real payload, and got
// it wrong in a few important ways documented inline below.

import { pick } from "./normalizeHangout";

import { MEDIA_BASE_URL } from "../services/api";

// UploadMedia's doc comment on the backend says media_type is
// "photo" | "gif" | "video" | "audio". MediaGrid.jsx was built
// expecting "image" for photos, so translate here rather than
// touching every place that reads item.type.
const normalizeMediaType = (rawType) => {
  const value = (rawType || "").toString().toLowerCase();

  if (value === "photo") return "image";
  if (value === "gif") return "gif";
  if (value === "video") return "video";
  if (value === "audio") return "audio";

  return value || "image";
};

export const normalizeMedia = (raw) => {
  if (!raw) return null;

  return {
    id: pick(raw, "id", "ID"),
    type: normalizeMediaType(
      pick(raw, "media_type", "MediaType", "type", "Type")
    ),
    url:
  normalizeMediaUrl(
    pick(
      raw,
      "url",
      "URL",
      "media_url",
      "MediaURL",
      "file_url",
      "FileURL"
    )
  ),
    name:
      pick(
        raw,
        "filename",
        "Filename",
        "file_name",
        "FileName",
        "name",
        "Name"
      ) ?? "",
    uploaderId: pick(raw, "uploader_id", "UploaderID", "uploaderId"),
    uploader:
      pick(raw, "uploader_name", "UploaderName", "uploader", "Uploader") ??
      null,
    createdAt: pick(
      raw,
      "created_at",
      "CreatedAt",
      "createdAt",
      "uploaded_at",
      "UploadedAt"
    ),
  };
};

const normalizeMediaUrl = (rawUrl) => {

  if (!rawUrl) {
    return null;
  }


  // Already a complete URL
  if (
    rawUrl.startsWith("http://") ||
    rawUrl.startsWith("https://")
  ) {

    return rawUrl;

  }


  return `${MEDIA_BASE_URL}/${rawUrl.replace(/^\/+/, "")}`;

};
// The archive record itself is minimal — just
// {ID, HangoutID, ChatSnapshot, Status, CreatedAt, UpdatedAt}. GET
// /archives returns an array of these directly. GET /archives/:id
// wraps it as {Archive: {...same fields...}, Media: [...]} — Media
// sits alongside Archive, not inside it.
//
// Two things this DOESN'T carry, that the old version of this file
// assumed it did:
// - Title/Activity/Date/Location/Participants aren't here at all.
//   They live on the hangout (HangoutID points to it) — the caller
//   (ArchiveDetail.jsx / Archives.jsx) has to fetch the hangout
//   separately and merge it in.
// - `Status` is the ARCHIVE's own lifecycle flag (e.g. "active" —
//   presumably vs. some purged/deleted state once every participant
//   hides it), not the hangout's planned/ongoing/completed/cancelled
//   status. Whether a hangout "didn't happen" has to be read off the
//   linked hangout's status, not this field. Renamed to archiveStatus
//   so nothing accidentally treats it as the hangout status again.
export const normalizeArchiveCore = (raw) => {
  if (!raw) return null;

  return {
    id: pick(raw, "id", "ID"),
    hangoutId: pick(raw, "hangout_id", "HangoutID"),
    archiveStatus: pick(raw, "status", "Status") ?? "active",
    chatSnapshot: pick(raw, "chat_snapshot", "ChatSnapshot") ?? "",
    createdAt: pick(raw, "created_at", "CreatedAt"),
    updatedAt: pick(raw, "updated_at", "UpdatedAt"),
  };
};

// ChatSnapshot is a plain-text log, not a structured message array —
// one line per message: "[2026-09-10T11:24:44Z] <sender-uuid>: text".
// Parse it into the {id, senderId, sender, timestamp, text} shape
// ChatHistory.jsx already expects (same shape hangout chat messages
// use elsewhere in the app).
const CHAT_LINE_PATTERN = /^\[(.+?)\]\s+([0-9a-fA-F-]{36}):\s?(.*)$/;

export const getChatSnapshotSenderIds = (snapshot) => {
  if (!snapshot) return [];

  const ids = new Set();

  snapshot.split("\n").forEach((line) => {
    const match = line.trim().match(CHAT_LINE_PATTERN);
    if (match) ids.add(match[2]);
  });

  return [...ids];
};

export const parseChatSnapshot = (
  snapshot,
  { currentUserId, senderNames = {} } = {}
) => {
  if (!snapshot) return [];

  return snapshot
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const match = line.match(CHAT_LINE_PATTERN);

      if (!match) {
        // Unrecognized line shape — surface it rather than silently
        // dropping content out of the archived chat.
        return {
          id: `snapshot-${index}`,
          senderId: null,
          sender: "System",
          timestamp: null,
          text: line,
        };
      }

      const [, timestamp, senderId, text] = match;
      const isMine =
        currentUserId && String(currentUserId) === String(senderId);

      return {
        id: `snapshot-${index}`,
        senderId,
        sender: isMine ? "You" : senderNames[senderId] || "Participant",
        timestamp,
        text,
      };
    });
};

const countChatLines = (snapshot) =>
  snapshot
    ? snapshot
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean).length
    : 0;

// GET /archives — list items. Hangout-shaped fields (title, activity,
// date, participants) and media aren't in this response at all — the
// caller fetches the linked hangout by hangoutId and merges it in.
export const normalizeArchiveSummary = (raw) => {
  const core = normalizeArchiveCore(raw);
  if (!core) return null;

  return {
    ...core,
    messagesCount: countChatLines(core.chatSnapshot),
  };
};

// GET /archives/:id — full detail: {Archive: {...}, Media: [...]}.
export const normalizeArchiveDetail = (
  raw,
  { currentUserId, senderNames = {} } = {}
) => {
  if (!raw) return null;

  const archiveRecord = raw?.Archive || raw?.archive || raw;
  const core = normalizeArchiveCore(archiveRecord);
  if (!core) return null;

  const media = (pick(raw, "media", "Media") || []).map(normalizeMedia);
  const messages = parseChatSnapshot(core.chatSnapshot, {
    currentUserId,
    senderNames,
  });

  return {
    ...core,
    media,
    messages,
    mediaCount: media.length,
    messagesCount: messages.length,
  };
};

// GET /hangouts/pending-upload-prompt (mounted on the hangout route
// group, see RegisterUploadPromptRoute in the archive handler).
export const normalizeUploadPrompt = (raw) => ({
  archiveId: pick(raw, "archive_id", "ArchiveID", "id", "ID"),
  hangoutId: pick(raw, "hangout_id", "HangoutID"),
  title:
    pick(raw, "title", "Title", "hangout_title", "HangoutTitle") ?? "Hangout",
  uploadWindowEnds:
    pick(
      raw,
      "upload_window_ends",
      "UploadWindowEnds",
      "upload_window_end",
      "UploadWindowEnd",
      "upload_deadline",
      "UploadDeadline",
      "expires_at",
      "ExpiresAt"
    ) ?? null,
});
