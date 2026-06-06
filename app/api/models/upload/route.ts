import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Dosya seçilmedi" },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".glb") && !fileName.endsWith(".gltf")) {
      return NextResponse.json(
        { success: false, error: "Sadece .glb veya .gltf dosyaları kabul edilir" },
        { status: 400 }
      );
    }

    // Validate file size (100 MB max)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "Dosya çok büyük (Max: 100 MB)" },
        { status: 400 }
      );
    }

    // Save file to /public/models/
    const modelsDir = path.join(process.cwd(), "public", "models");
    const filePath = path.join(modelsDir, fileName);

    // Ensure directory exists
    try {
      await fs.mkdir(modelsDir, { recursive: true });
    } catch {
      // Directory might already exist
    }

    // Convert file to buffer and write
    const buffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(buffer));

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);

    return NextResponse.json(
      {
        success: true,
        message: `${fileName} başarıyla yüklendi`,
        file: {
          name: fileName.replace(/\.[^/.]+$/, ""),
          path: `/models/${fileName}`,
          size: file.size,
          sizeFormatted: `${sizeInMB} MB`,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Model upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Dosya yüklenemedi",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
