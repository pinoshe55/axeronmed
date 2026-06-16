import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "Dosya seçilmedi" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Desteklenmeyen dosya türü" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "Dosya çok büyük (maks 10 MB)" }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Production (Vercel): use Blob storage
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      const blob = await put(`content-images/${filename}`, file, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return NextResponse.json({ url: blob.url });
    }

    // Local dev: save to /public/content-images/
    const { default: fs } = await import("fs/promises");
    const { default: path } = await import("path");
    const dir = path.join(process.cwd(), "public", "content-images");
    await fs.mkdir(dir, { recursive: true });
    const buffer = await file.arrayBuffer();
    await fs.writeFile(path.join(dir, filename), Buffer.from(buffer));
    return NextResponse.json({ url: `/content-images/${filename}` });

  } catch (e: any) {
    console.error("upload-image error:", e);
    return NextResponse.json({ error: e.message || "Yükleme hatası" }, { status: 500 });
  }
}
