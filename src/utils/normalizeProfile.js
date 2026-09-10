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
  id: hangout.id,
  title: hangout.activity?.title || hangout.title || "Hangout",
  category: hangout.activity?.category || "Hangout",
  date: hangout.scheduled_at,
  status: hangout.status,
});