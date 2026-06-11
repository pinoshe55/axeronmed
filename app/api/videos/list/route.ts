import { NextResponse } from "next/server";
import { readdirSync, statSync } from "fs";
import { join } from "path";

// Read the directory on every request (otherwise the file list is
// frozen at build time and newly uploaded videos never appear)
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const videosDir = join(process.cwd(), "public", "videos");
    const files = readdirSync(videosDir);

    const videos = files
      .filter((file) => file.endsWith(".mp4") || file.endsWith(".webm"))
      .map((file) => {
        try {
          const filePath = join(videosDir, file);
          const stats = statSync(filePath);
          const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

          return {
            name: file,
            path: `/videos/${file}`,
            size: parseFloat(sizeInMB),
            sizeFormatted: `${sizeInMB} MB`,
            uploadedAt: stats.mtime.toISOString(),
          };
        } catch {
          return null;
        }
      })
      .filter((v) => v !== null);

    return NextResponse.json(
      {
        success: true,
        videos: videos.sort((a, b) => a!.name.localeCompare(b!.name)),
        count: videos.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Videos list error:", error);
    return NextResponse.json(
      { success: false, error: "Videolar listelenemiyor", videos: [] },
      { status: 200 } // Return 200 even on error, with empty videos array
    );
  }
}
