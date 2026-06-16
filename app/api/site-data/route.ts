import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BLOB_PATHNAME = "axeron-site-overrides.json";

function hasBlobCreds() {
  return !!(
    process.env.BLOB_READ_WRITE_TOKEN ||
    (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID)
  );
}

export async function GET() {
  // Local dev fallback — read from .local-site-data.json
  if (!hasBlobCreds()) {
    try {
      const fs = (await import("fs/promises")).default;
      const path = (await import("path")).default;
      const raw = await fs.readFile(path.join(process.cwd(), ".local-site-data.json"), "utf-8");
      return NextResponse.json(JSON.parse(raw));
    } catch {
      return NextResponse.json(null);
    }
  }

  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: "axeron-site-overrides" });
    const blob = blobs.find((b) => b.pathname === BLOB_PATHNAME);
    if (!blob) return NextResponse.json(null);
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) return NextResponse.json(null);
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  // Local dev fallback — save to .local-site-data.json
  if (!hasBlobCreds()) {
    try {
      const fs = (await import("fs/promises")).default;
      const path = (await import("path")).default;
      await fs.writeFile(path.join(process.cwd(), ".local-site-data.json"), body, "utf-8");
      return NextResponse.json({ ok: true });
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
  }

  try {
    const { put } = await import("@vercel/blob");
    await put(BLOB_PATHNAME, body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
