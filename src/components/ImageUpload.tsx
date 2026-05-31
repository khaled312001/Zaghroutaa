"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { UploadCloud, Loader2, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export async function uploadImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("الملف لازم يكون صورة");
  if (file.size > 8 * 1024 * 1024) throw new Error("الصورة كبيرة (الحد ٨ ميجا)");
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.error || "فشل رفع الصورة");
  return data.url as string;
}

export function ImageUpload({
  value,
  onChange,
  aspect = "aspect-[4/3]",
  className,
}: {
  value?: string;
  onChange: (url: string) => void;
  aspect?: string;
  className?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file?: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(file);
      onChange(url);
      toast.success("اترفعت الصورة");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div className={cn("group relative overflow-hidden rounded-2xl border border-gold-200 bg-cream-100", aspect)}>
          <Image src={value} alt="صورة مرفوعة" fill sizes="400px" className="object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-espresso-900/0 opacity-0 transition group-hover:bg-espresso-900/40 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-espresso-800"
            >
              تغيير
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white"
              aria-label="مسح"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-pearl/70">
              <Loader2 className="h-6 w-6 animate-spin text-gold-600" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]); }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-cream-50 p-6 text-center transition",
            aspect,
            drag ? "border-gold-400 bg-gold-50" : "border-gold-200 hover:border-gold-300",
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-7 w-7 animate-spin text-gold-600" />
              <span className="text-sm text-espresso-500">جاري الرفع...</span>
            </>
          ) : (
            <>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-50 text-gold-600">
                <UploadCloud className="h-6 w-6" />
              </span>
              <span className="text-sm font-semibold text-espresso-700">ارفعي صورة</span>
              <span className="flex items-center gap-1 text-xs text-espresso-400">
                <ImageIcon className="h-3.5 w-3.5" /> اضغطي أو اسحبي الصورة هنا
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
