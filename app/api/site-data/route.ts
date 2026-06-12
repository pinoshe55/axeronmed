import { list, put, getDownloadUrl } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BLOB_PATHNAME = "axeron-site-overrides.json";

export async function GET() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json(null);
  try {
    const { blobs } = await list({ prefix: "axeron-site-overrides" });
    const blob = blobs.find((b) => b.pathname === BLOB_PATHNAME);
    if (!blob) return NextResponse.json(null);

    // Use authenticated download URL for private store
    const downloadUrl = await getDownloadUrl(blob.url);
    const res = await fetch(downloadUrl, { cache: "no-store" });
    if (!res.ok) return NextResponse.json(null);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "BLOB_READ_WRITE_TOKEN env variable is missing" },
      { status: 500 }
    );
  }
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
