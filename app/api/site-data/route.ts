import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BLOB_PREFIX = "axeron-site-overrides";

function hasBlobCreds() {
  return !!(
    process.env.BLOB_READ_WRITE_TOKEN ||
    (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID)
  );
}

export async function GET() {
  // Local dev fallback
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
    const { blobs } = await list({ prefix: BLOB_PREFIX });
    if (!blobs.length) return NextResponse.json(null);

    // Sort by uploadedAt descending → latest first
    const sorted = [...blobs].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    const latest = sorted[0];

    // Each save creates a NEW unique URL → CDN has never seen it → always fresh, no stale cache
    const res = await fetch(latest.url, { cache: "no-store" });
    if (!res.ok) return NextResponse.json(null);
    const json = await res.json();

    return NextResponse.json(json, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  // Local dev fallback
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
    const { put, list, del } = await import("@vercel/blob");

    // Unique filename per save → brand-new CDN URL → no caching problem
    const timestamp = Date.now();
    await put(`${BLOB_PREFIX}-${timestamp}.json`, body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    // Cleanup: keep only the 2 most recent blobs to avoid accumulation
    try {
      const { blobs } = await list({ prefix: BLOB_PREFIX });
      const sorted = [...blobs].sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
      const toDelete = sorted.slice(2);
      if (toDelete.length) {
        await del(toDelete.map((b) => b.url));
      }
    } catch {
      // cleanup failure is non-critical, ignore
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
