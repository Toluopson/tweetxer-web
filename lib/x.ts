import { getSession } from "./session";

const X_API = "https://api.x.com";

export const X_SCOPES = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "follows.read",
  "follows.write",
  "offline.access",
];

export async function xFetch(path: string, init: RequestInit = {}) {
  const session = await getSession();

  if (!session.accessToken) {
    throw new Error("Not connected to X.");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${session.accessToken}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${X_API}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (response.status === 401 && session.refreshToken) {
    const refreshed = await refreshAccessToken(session.refreshToken);
    if (refreshed) {
      headers.set("Authorization", `Bearer ${refreshed}`);
      return fetch(`${X_API}${path}`, { ...init, headers, cache: "no-store" });
    }
  }

  return response;
}

async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const body = new URLSearchParams({
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    client_id: clientId,
  });

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${X_API}/2/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) return null;

  const token = await response.json();
  const session = await getSession();
  session.accessToken = token.access_token;
  if (token.refresh_token) session.refreshToken = token.refresh_token;
  session.expiresAt = Date.now() + (token.expires_in ?? 7200) * 1000;
  await session.save();
  return token.access_token as string;
}

export async function getCurrentUser() {
  const response = await xFetch("/2/users/me?user.fields=profile_image_url,public_metrics");
  if (!response.ok) throw new Error(`X user lookup failed: ${response.status}`);
  const data = await response.json();
  return data.data;
}