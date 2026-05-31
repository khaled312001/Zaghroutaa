"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Trash2, Plus, Loader2 } from "lucide-react";
import { toggleReviewAction, deleteReviewAction, addReviewAction } from "@/app/admin/actions";
import { ImageUpload } from "@/components/ImageUpload";
import { cn } from "@/lib/utils";

export type AdminReview = {
  id: number;
  imageUrl: string;
  name: string | null;
  text: string | null;
  isActive: boolean;
};

export function ReviewsManager({ reviews: initial }: { reviews: AdminReview[] }) {
  const [reviews, setReviews] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");

  async function toggle(id: number, isActive: boolean) {
    const prev = reviews;
    setReviews((r) => r.map((x) => (x.id === id ? { ...x, isActive } : x)));
    try {
      await toggleReviewAction(id, isActive);
    } catch {
      setReviews(prev);
      toast.error("حصل خطأ");
    }
  }

  async function remove(id: number) {
    if (!window.confirm("متأكدة إنك عايزة تمسحي الريفيو ده؟")) return;
    const prev = reviews;
    setReviews((r) => r.filter((x) => x.id !== id));
    try {
      await deleteReviewAction(id);
      toast.success("اتمسح الريفيو");
    } catch {
      setReviews(prev);
      toast.error("حصل خطأ");
    }
  }

  async function add() {
    if (!url.trim()) {
      toast.error("اكتبي رابط الصورة");
      return;
    }
    setAdding(true);
    try {
      await addReviewAction(url, name);
      toast.success("اتضاف الريفيو — اعملي تحديث للصفحة عشان يظهر");
      setUrl("");
      setName("");
    } catch {
      toast.error("حصل خطأ، اتأكدي من الرابط");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div>
      {/* إضافة */}
      <div className="card-zg mb-6 p-5">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-espresso-900">
          <Plus className="h-5 w-5 text-gold-600" /> إضافة رأي جديد
        </h2>
        <p className="mb-3 text-xs text-espresso-500">
          ارفعي صورة سكرين شوت الرأي مباشرة من جهازك، واكتبي اسم العميلة (اختياري).
        </p>
        <div className="grid gap-4 sm:grid-cols-[1fr_1.2fr] sm:items-end">
          <ImageUpload value={url} onChange={setUrl} aspect="aspect-[3/4]" />
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسم العميلة (اختياري)"
              className="w-full rounded-2xl border border-gold-200 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-gold-400"
            />
            <button type="button" onClick={add} disabled={adding || !url} className="btn-gold w-full">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              إضافة الرأي
            </button>
          </div>
        </div>
      </div>

      {/* القائمة */}
      {reviews.length === 0 ? (
        <div className="card-zg p-12 text-center text-espresso-400">لسه مفيش آراء.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className={cn(
                "card-zg overflow-hidden transition-opacity",
                !r.isActive && "opacity-50",
              )}
            >
              <div className="relative aspect-[3/4] bg-cream-200">
                <Image src={r.imageUrl} alt={r.name ?? "رأي عميلة"} fill sizes="200px" className="object-cover" />
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <button
                  type="button"
                  onClick={() => toggle(r.id, !r.isActive)}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold",
                    r.isActive ? "text-green-700 hover:bg-green-50" : "text-espresso-500 hover:bg-cream-200",
                  )}
                >
                  {r.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {r.isActive ? "ظاهر" : "مخفي"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(r.id)}
                  className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
                  aria-label="مسح"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
