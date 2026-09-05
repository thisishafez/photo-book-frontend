// src/utils/jwt.js
export function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false; // no exp claim, treat as non-expiring
    const nowInSeconds = Date.now() / 1000;
    return payload.exp < nowInSeconds;
  } catch (error) {
    // malformed token = treat as expired
    return true;
  }
}