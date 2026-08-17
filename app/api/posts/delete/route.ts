import { NextRequest, NextResponse } from "next/server";
import { xFetch } from "@/lib/x";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const id = body?.id;

  if (!id || !/^\d{1,20}$/.test(String(id))) {
    return NextResponse.json({ error: "Invalid post ID." }, { status: 400 });
  }

  const response = await xFetch(`/2/tweets/${id}`, { method: "DELETE" });
  const text = await response.text();

  return new NextResponse(text || JSON.stringify({ ok: response.ok }), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}