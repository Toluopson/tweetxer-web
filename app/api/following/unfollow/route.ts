import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { xFetch } from "@/lib/x";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ error: "Not connected." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const targetUserId = body?.targetUserId;

  if (!targetUserId || !/^\d{1,20}$/.test(String(targetUserId))) {
    return NextResponse.json({ error: "Invalid target user ID." }, { status: 400 });
  }

  if (String(targetUserId) === session.user.id) {
    return NextResponse.json({ error: "You cannot unfollow yourself." }, { status: 400 });
  }

  const response = await xFetch(
    `/2/users/${session.user.id}/following/${targetUserId}`,
    { method: "DELETE" }
  );

  const text = await response.text();
  return new NextResponse(text || JSON.stringify({ ok: response.ok }), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}