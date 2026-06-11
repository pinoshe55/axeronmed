import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName } = body;

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: "Dosya adı gerekli" },
        { status: 400 }
      );
    }

    // Validate filename to prevent directory traversal
    if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
      return NextResponse.json(
        { success: false, error: "Geçersiz dosya adı" },
        { status: 400 }
      );
    }

    // Validate file type
    const fileNameLower = fileName.toLowerCase();
    if (!fileNameLower.endsWith(".mp4") && !fileNameLower.endsWith(".webm")) {
      return NextResponse.json(
        { success: false, error: "Sadece .mp4 veya .webm dosyaları silinebilir" },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), "public", "videos", fileName);

    try {
      await fs.unlink(filePath);
    } catch {
      return NextResponse.json(
        { success: false, error: "Dosya bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: `${fileName} silindi` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Video delete error:", error);
    return NextResponse.json(
      { success: false, error: "Dosya silinemedi", details: error.message },
      { status: 500 }
    );
  }
}
