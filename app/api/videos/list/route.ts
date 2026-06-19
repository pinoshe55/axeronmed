import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "videos/" });

    const videos = blobs
      .filter((b) => b.pathname.endsWith(".mp4") || b.pathname.endsWith(".webm"))
      .map((b) => {
        const name = b.pathname.replace("videos/", "");
        const sizeInMB = (b.size / (1024 * 1024)).toFixed(2);
        return {
          name,
          path: b.url,
          size: parseFloat(sizeInMB),
          sizeFormatted: `${sizeInMB} MB`,
          uploadedAt: b.uploadedAt.toISOString(),
        };
      })
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));

    return NextResponse.json({ success: true, videos, count: videos.length });
  } catch (error: any) {
    console.error("Videos list error:", error);
    return NextResponse.json({ success: false, error: "Videolar listelenemiyor", videos: [] });
  }
}
