export function getRoleFromAccessToken(accessToken: string): string {
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) return "CUSTOMER";
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const claims = JSON.parse(atob(padded)) as { user_role?: unknown };
    return typeof claims.user_role === "string" ? claims.user_role : "CUSTOMER";
  } catch {
    return "CUSTOMER";
  }
}
