import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "edge"; // edge runtime has no body size limit issue

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

    // Upload to Vercel Blob
    const blob = await put(`videos/${fileName}`, file, {
      access: "public",
      contentType: file.type || "video/mp4",
    });

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);

    return NextResponse.json({
      success: true,
      message: `${fileName} başarıyla yüklendi`,
      file: {
        name: fileName,
        path: blob.url,
        size: file.size,
        sizeFormatted: `${sizeInMB} MB`,
      },
    });
  } catch (error: any) {
    console.error("Video upload error:", error);
    return NextResponse.json(
      { success: false, error: "Dosya yüklenemedi", details: error.message },
      { status: 500 }
    );
  }
}
