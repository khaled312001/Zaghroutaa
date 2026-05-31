import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

// مجلد الرفع — مكان دائم بره مجلد التطبيق عشان الصور ما تتمسحش مع كل نشر
// (على السيرفر بنحدده عبر UPLOAD_DIR، وبيتقدّم عن طريق راوت /media)
const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
const URL_PREFIX = process.env.UPLOAD_URL_PREFIX || "/media";

const MAX_BYTES = 8 * 1024 * 1024; // 8 ميجا
const ALLOWED = ["jpeg", "jpg", "png", "webp", "gif", "avif"];

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "مفيش ملف" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "الملف لازم يكون صورة" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "الصورة كبيرة (الحد ٨ ميجا)" }, { status: 400 });
    }

    let ext = (file.type.split("/")[1] || "jpg").toLowerCase();
    if (ext === "jpeg") ext = "jpg";
    if (!ALLOWED.includes(ext)) ext = "jpg";

    const rand = Math.random().toString(36).slice(2, 9);
    const name = `up-${Date.now()}-${rand}.${ext}`;

    const buf = Buffer.from(await file.arrayBuffer());
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, name), buf);

    return NextResponse.json({ url: `${URL_PREFIX}/${name}` });
  } catch (error) {
    console.error("upload error", error);
    return NextResponse.json({ error: "فشل رفع الصورة" }, { status: 500 });
  }
}
