import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createCodeChallenge, randomString } from "@/lib/pkce";
import { X_SCOPES } from "@/lib/x";

export async function GET() {
  const clientId = process.env.X_CLIENT_ID;
  const redirectUri = process.env.X_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return new NextResponse("Missing X_CLIENT_ID or X_REDIRECT_URI.", { status: 500 });
  }

  const state = randomString(32);
  const codeVerifier = randomString(48);
  const challenge = createCodeChallenge(codeVerifier);

  const session = await getSession();
  session.oauthState = state;
  session.codeVerifier = codeVerifier;
  await session.save();

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: X_SCOPES.join(" "),
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  return NextResponse.redirect(
    `https://x.com/i/oauth2/authorize?${params.toString()}`
  );
}