import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export type XUser = {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
};

export type SessionData = {
  user?: XUser;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  oauthState?: string;
  codeVerifier?: string;
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "dev-only-change-this-secret-please",
  cookieName: "tweetxer_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}