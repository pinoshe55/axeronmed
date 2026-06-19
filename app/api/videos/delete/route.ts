import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body; // Blob URL (e.g. https://xxxx.public.blob.vercel-storage.com/videos/foo.mp4)

    if (!url) {
      return NextResponse.json({ success: false, error: "Blob URL gerekli" }, { status: 400 });
    }

    await del(url);

    return NextResponse.json({ success: true, message: "Video silindi" });
  } catch (error: any) {
    console.error("Video delete error:", error);
    return NextResponse.json({ success: false, error: "Dosya silinemedi", details: error.message }, { status: 500 });
  }
}
