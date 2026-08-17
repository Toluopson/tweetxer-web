import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { xFetch } from "@/lib/x";

export async function GET() {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Not connected." }, { status: 401 });

  const response = await xFetch(
    `/2/users/${session.user.id}/tweets?max_results=100&tweet.fields=created_at,public_metrics`
  );

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}