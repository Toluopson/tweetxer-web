import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { xFetch } from "@/lib/x";

export async function GET() {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Not connected." }, { status: 401 });

  const response = await xFetch(
    `/2/users/${session.user.id}/following?max_results=100&user.fields=username,name,profile_image_url`
  );

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}