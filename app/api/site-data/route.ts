import { list, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BLOB_PATHNAME = "axeron-site-overrides.json";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "axeron-site-overrides" });
    const blob = blobs.find((b) => b.pathname === BLOB_PATHNAME);
    if (!blob) return NextResponse.json(null);

    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) return NextResponse.json(null);

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    await put(BLOB_PATHNAME, body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
