import { pick } from "./normalizeHangout";

// Host-side badge template — internal/badge domain. CreateBadge/GetBadge
// return the domain.Badge struct directly; only Name and IconKey are
// confirmed field names (from createBadgeRequest), casing isn't shown,
// so fall back through both cases.
export const normalizeHostBadge = (raw) => {
  if (!raw) return null;
  return {
    id: pick(raw, "id", "ID"),
    activityId: pick(raw, "activity_id", "ActivityID"),
    hostId: pick(raw, "host_id", "HostID"),
    name: pick(raw, "name", "Name") ?? "",
    iconKey: pick(raw, "icon_key", "IconKey") ?? "",
    createdAt: pick(raw, "created_at", "CreatedAt") ?? null,
  };
};

// Fixed per-activity QR code — internal/qrcode domain.
export const normalizeQRCode = (raw) => {
  if (!raw) return null;
  return {
    id: pick(raw, "id", "ID"),
    activityId: pick(raw, "activity_id", "ActivityID"),
    code: pick(raw, "code", "Code") ?? "",
    createdAt: pick(raw, "created_at", "CreatedAt") ?? null,
  };
};

// A caller's earned badge — internal/userbadge domain. ListMyBadges
// returns []domain.UserBadge directly. Not confirmed whether the
// Badge template (name/icon) and Activity/Host names are embedded on
// the struct or need a join elsewhere — normalizing defensively for
// either a flat shape or nested Badge/Activity/Host objects, so
// BadgeCard/BadgeDetail don't need edits once the real shape lands.
// Update the pick(...) fallbacks here if the actual payload differs.
export const normalizeUserBadge = (raw) => {
  if (!raw) return null;

  const badgeSrc = pick(raw, "badge", "Badge") ?? raw;
  const activitySrc = pick(raw, "activity", "Activity") ?? null;
  const hostSrc = pick(raw, "host", "Host") ?? null;

  return {
    id: pick(raw, "id", "ID"),
    badgeId: pick(raw, "badge_id", "BadgeID"),
    userId: pick(raw, "user_id", "UserID"),
    activityId: pick(raw, "activity_id", "ActivityID"),

    title: pick(badgeSrc, "name_snapshot", "NameSnapshot", "name", "Name") ?? "Badge",
    emoji: pick(badgeSrc, "icon_key_snapshot", "IconKeySnapshot", "icon_key", "IconKey") || "🏅", 
    description: pick(badgeSrc, "description", "Description") ?? "",
    category: pick(badgeSrc, "category", "Category") ?? "General",
    criteria:
      pick(badgeSrc, "criteria", "Criteria") ??
      "Scan this activity's QR code at the event to earn this badge.",

    activity:
      pick(activitySrc, "title", "Title") ??
      pick(raw, "activity_title", "ActivityTitle") ??
      "an activity",
    host:
      pick(hostSrc, "business_name", "BusinessName") ??
      pick(raw, "host_name", "HostName") ??
      "the host",

    earnedAt: pick(raw, "awarded_at", "AwardedAt", "earned_at", "EarnedAt", "created_at", "CreatedAt"),
    visible: pick(raw, "visible", "Visible") ?? true,
  };
};

export const normalizeUserBadges = (raw) => (raw || []).map(normalizeUserBadge);