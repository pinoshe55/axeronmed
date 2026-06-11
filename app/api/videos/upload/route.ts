import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Dosya seçilmedi" },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "_");
    if (!fileName.endsWith(".mp4") && !fileName.endsWith(".webm")) {
      return NextResponse.json(
        { success: false, error: "Sadece .mp4 veya .webm dosyaları kabul edilir" },
        { status: 400 }
      );
    }

    // Validate file size (50 MB max)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "Dosya çok büyük (Max: 50 MB)" },
        { status: 400 }
      );
    }

    // Save file to /public/videos/
    const videosDir = path.join(process.cwd(), "public", "videos");
    await fs.mkdir(videosDir, { recursive: true });

    const buffer = await file.arrayBuffer();
    await fs.writeFile(path.join(videosDir, fileName), Buffer.from(buffer));

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);

    return NextResponse.json(
      {
        success: true,
        message: `${fileName} başarıyla yüklendi`,
        file: {
          name: fileName,
          path: `/videos/${fileName}`,
          size: file.size,
          sizeFormatted: `${sizeInMB} MB`,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Video upload error:", error);
    return NextResponse.json(
      { success: false, error: "Dosya yüklenemedi", details: error.message },
      { status: 500 }
    );
  }
}
