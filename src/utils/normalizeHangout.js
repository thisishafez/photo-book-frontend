// The hangout endpoints return the Go domain structs directly, which
// have no `json` tags — so keys come back capitalized (ID, Title,
// OrganizerID, ...) instead of the id/title/organizer_id shape the
// rest of the app expects. This is the same issue we already worked
// around for circle connections; centralizing it here so every
// hangout screen (list, detail, card) reads consistent field names
// instead of each page growing its own fallback chain.

export const pick = (obj, ...keys) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
};

export const normalizeParticipant = (raw) => ({
  id: pick(raw, "id", "ID"),
  user_id: pick(raw, "user_id", "UserID", "userId"),
  status:
    pick(
      raw,
      "invite_status",
      "InviteStatus",
      "status",
      "Status"
    ) || "pending",
  reason: pick(raw, "reason", "Reason") ?? null,
});

export const normalizeHangout = (raw) => {
  if (!raw) return null;

  const participants = (
    pick(raw, "participants", "Participants") || []
  ).map(normalizeParticipant);

  return {
    id: pick(raw, "id", "ID"),
    title: pick(raw, "title", "Title"),
    description: pick(raw, "description", "Description"),
    status: pick(raw, "status", "Status"),
    scheduled_at: pick(raw, "scheduled_at", "ScheduledAt"),
    // Confirmed by the backend team alongside the cancel/complete spec
    // (2026-09-10) — wasn't part of the shape we normalized before.
    scheduled_end_at: pick(raw, "scheduled_end_at", "ScheduledEndAt"),
    organizer_id: pick(raw, "organizer_id", "OrganizerID"),
    activity_id: pick(raw, "activity_id", "ActivityID"),
    activity: pick(raw, "activity", "Activity") ?? null,
    // Optimistic-concurrency counter the backend bumps on every write.
    // Not sent back on any request yet, but worth carrying through so
    // a future If-Match-style guard doesn't need another round of
    // "add this field to the normalizer" first.
    version: pick(raw, "version", "Version"),
    participants,
  };
};
