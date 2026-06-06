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
    if (!fileNameLower.endsWith(".glb") && !fileNameLower.endsWith(".gltf")) {
      return NextResponse.json(
        { success: false, error: "Sadece .glb veya .gltf dosyaları silinebilir" },
        { status: 400 }
      );
    }

    // Delete file from /public/models/
    const modelsDir = path.join(process.cwd(), "public", "models");
    const filePath = path.join(modelsDir, fileName);

    // Security: ensure file is in models directory
    const resolvedPath = path.resolve(filePath);
    const resolvedDir = path.resolve(modelsDir);
    if (!resolvedPath.startsWith(resolvedDir)) {
      return NextResponse.json(
        { success: false, error: "Geçersiz dosya konumu" },
        { status: 400 }
      );
    }

    try {
      await fs.unlink(filePath);
    } catch (deleteError: any) {
      if (deleteError.code === "ENOENT") {
        return NextResponse.json(
          { success: false, error: "Dosya bulunamadı" },
          { status: 404 }
        );
      }
      throw deleteError;
    }

    return NextResponse.json(
      {
        success: true,
        message: `${fileName} başarıyla silindi`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Model delete error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Dosya silinemedi",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
