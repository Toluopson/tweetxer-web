import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  const storedState = request.cookies.get("tweetxer_oauth_state")?.value;
  const codeVerifier = request.cookies.get("tweetxer_code_verifier")?.value;

  if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
    return new NextResponse("Invalid OAuth state.", { status: 400 });
  }

  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  const redirectUri = process.env.X_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return new NextResponse("Missing X OAuth environment variables.", {
      status: 500,
    });
  }

  const basicAuth = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  console.log("X OAuth diagnostic:", {
  hasClientId: Boolean(clientId),
  clientIdLength: clientId?.length,
  hasClientSecret: Boolean(clientSecret),
  clientSecretLength: clientSecret?.length,
  basicAuthLength: basicAuth.length,
  basicAuthStartsCorrectly: basicAuth.startsWith(""),
});

  const tokenResponse = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    const body = await tokenResponse.text();
    return new NextResponse(`X token exchange failed: ${body}`, {
      status: 502,
    });
  }

  const token = await tokenResponse.json();

  const userResponse = await fetch(
    "https://api.x.com/2/users/me?user.fields=profile_image_url",
    {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
      cache: "no-store",
    }
  );

  if (!userResponse.ok) {
    return new NextResponse(
      "Connected to X, but user lookup failed.",
      { status: 502 }
    );
  }

  const userPayload = await userResponse.json();
  const user = userPayload.data;

  const session = await getSession();

  session.accessToken = token.access_token;
  session.refreshToken = token.refresh_token;
  session.expiresAt =
    Date.now() + (token.expires_in ?? 7200) * 1000;

  session.user = {
    id: user.id,
    name: user.name,
    username: user.username,
    profile_image_url: user.profile_image_url,
  };

  await session.save();

  const response = NextResponse.redirect(
    new URL("/dashboard", request.url)
  );

  response.cookies.delete("tweetxer_oauth_state");
  response.cookies.delete("tweetxer_code_verifier");

  return response;
}