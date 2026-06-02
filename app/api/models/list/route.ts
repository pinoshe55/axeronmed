import { NextResponse } from "next/server";
import { readdirSync, statSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const modelsDir = join(process.cwd(), "public", "models");
    const files = readdirSync(modelsDir);

    const models = files
      .filter((file) => file.endsWith(".glb") || file.endsWith(".gltf"))
      .map((file) => {
        try {
          const filePath = join(modelsDir, file);
          const stats = statSync(filePath);
          const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

          return {
            name: file.replace(/\.[^/.]+$/, ""), // Remove extension
            path: `/models/${file}`,
            size: parseFloat(sizeInMB),
            sizeFormatted: `${sizeInMB} MB`,
            uploadedAt: stats.mtime.toISOString(),
          };
        } catch {
          return null;
        }
      })
      .filter((m) => m !== null);

    return NextResponse.json(
      {
        success: true,
        models: models.sort((a, b) => a.name.localeCompare(b.name)),
        count: models.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Models list error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Modeller listelenemiyor",
        models: [],
      },
      { status: 200 } // Return 200 even on error, with empty models array
    );
  }
}
