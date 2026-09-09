export function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const claims = decodeToken(token);
  if (!claims?.exp) return true; // no exp claim = treat as expired/invalid

  // exp is in seconds since epoch; Date.now() is in ms
  return claims.exp * 1000 <= Date.now();
}