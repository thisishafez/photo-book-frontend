import { pick } from "./normalizeHangout";

// internal/user self-profile — no GET handler code has been shared
// yet (only the public_handler.go for GET /users/:id was), so this
// assumes GET /user/profile returns the domain.User struct with the
// same field names as createProfile's request (display_name, handle,
// bio) plus whatever else the backend adds (avatar, interests).
export const normalizeUserProfile = (raw) => {
  if (!raw) return null;
  return {
    accountId: pick(raw, "account_id", "AccountID"),
    displayName: pick(raw, "display_name", "DisplayName") ?? "",
    handle: pick(raw, "handle", "Handle") ?? "",
    bio: pick(raw, "bio", "Bio") ?? "",
    avatar: pick(raw, "avatar", "Avatar", "avatar_url", "AvatarURL") ?? null,
  };
};

// internal/host — CreateProfile returns the domain.Host struct
// directly; only BusinessName/LocationInfo are confirmed field names
// (from createHostProfileRequest). No GET handler was shared — this
// assumes GET /host/profile returns the same shape at the same path,
// matching the badge/qrcode domains' GET+POST-same-path convention.
export const normalizeHostProfile = (raw) => {
  if (!raw) return null;
  return {
    accountId: pick(raw, "account_id", "AccountID"),
    businessName: pick(raw, "business_name", "BusinessName") ?? "",
    locationInfo: pick(raw, "location_info", "LocationInfo") ?? null,
  };
};

// internal/moderator — CreateProfile takes no input beyond AccountID,
// so there's very little confirmed shape here. Same GET-not-shown
// caveat as host.
export const normalizeModeratorProfile = (raw) => {
  if (!raw) return null;
  return {
    accountId: pick(raw, "account_id", "AccountID"),
    createdAt: pick(raw, "created_at", "CreatedAt") ?? null,
  };
};

// Maps a completed hangout (see normalizeHangout) onto the shape
// ActivityHistory.jsx already expects: {id, title, category, date, status}.
// "category" isn't on the hangout or activity domain anywhere we've
// seen, so it falls back to a static label rather than guessing a
// field name that doesn't exist.
export const hangoutToHistoryItem = (hangout) => ({
  id: pick(hangout, "id", "ID"),
  title: pick(hangout, "activity", "Activity")?.title
    ?? pick(hangout, "title", "Title")
    ?? "Hangout",
  category: pick(hangout, "activity", "Activity")?.category ?? "Hangout",
  date: pick(hangout, "scheduled_at", "ScheduledAt"),
  status: pick(hangout, "status", "Status"),
});

// internal/badges — GetBadges returns raw domain.Badge rows.
// No "description" field exists in the payload at all (confirmed
// via network tab), so BadgeCard's description will just be empty
// until the backend adds one.
// internal/userbadge — GET /user/badges returns raw domain.UserBadge rows.
// No "description" field exists in the payload, so it stays empty
// until the backend adds one. host/activity/category/criteria also
// don't exist on this payload at all (see BadgeDetail note below).
export const normalizeUserBadge = (raw) => {
  if (!raw) return null;
  return {
    id: pick(raw, "id", "ID"),
    visible: pick(raw, "visible", "Visible") ?? true,
    emoji: pick(raw, "icon_key_snapshot", "IconKeySnapshot") || "🏅",
    title: pick(raw, "name_snapshot", "NameSnapshot") ?? "Badge",
    description: pick(raw, "description", "Description") ?? "",
    earnedAt: pick(raw, "awarded_at", "AwardedAt") ?? null,
    activityId: pick(raw, "activity_id", "ActivityID") ?? null,
  };
};

export const normalizeUserBadges = (raw) => (raw || []).map(normalizeUserBadge);

// interest catalog rows — GET /user/interests
export const normalizeInterest = (raw) => {
  if (typeof raw === "string") return { id: raw, label: raw };
  return {
    id: pick(raw, "id", "ID", "slug", "Slug"),
    label: pick(raw, "label", "Label", "name", "Name") ?? pick(raw, "slug", "Slug"),
  };
};