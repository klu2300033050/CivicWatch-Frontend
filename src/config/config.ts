export const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/** Decode a JWT payload without verification (client-side only use) */
function decodeJwtPayload(token: string): { exp?: number } | null {
    try {
        const base64 = token.split(".")[1];
        const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(json);
    } catch {
        return null;
    }
}

/** Returns true if the stored JWT is missing or expired */
export function isTokenExpired(): boolean {
    const token = localStorage.getItem("auth_token");
    if (!token) return true;
    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return true;
    // exp is in seconds; give 30-second buffer
    return Date.now() / 1000 > payload.exp - 30;
}

/** Clear all auth data from localStorage */
export function clearAuth() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_user_id");
    localStorage.removeItem("user");
}