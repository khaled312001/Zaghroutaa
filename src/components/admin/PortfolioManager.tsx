"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Trash2, Plus, Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import {
  addGalleryItemAction,
  toggleGalleryItemAction,
  deleteGalleryItemAction,
} from "@/app/admin/cms-actions";
import { cn } from "@/lib/utils";

export type AdminGalleryItem = {
  id: number;
  imageUrl: string;
  title: string | null;
  isActive: boolean;
};

export function PortfolioManager({ items: initial }: { items: AdminGalleryItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [pendingUrl, setPendingUrl] = useState("");
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);

  async function add() {
    if (!pendingUrl) {
      toast.error("ارفعي صورة الأول");
      return;
    }
    setAdding(true);
    try {
      await addGalleryItemAction(pendingUrl, title);
      toast.success("اتضافت الصورة لمعرض الأعمال");
      setPendingUrl("");
      setTitle("");
      router.refresh();
    } catch {
      toast.error("حصل خطأ، حاولي تاني");
    } finally {
      setAdding(false);
    }
  }

  async function toggle(id: number, isActive: boolean) {
    const prev = items;
    setItems((x) => x.map((i) => (i.id === id ? { ...i, isActive } : i)));
    try {
      await toggleGalleryItemAction(id, isActive);
    } catch {
      setItems(prev);
      toast.error("حصل خطأ");
    }
  }

  async function remove(id: number) {
    if (!window.confirm("متأكدة إنك عايزة تمسحي الصورة دي؟")) return;
    const prev = items;
    setItems((x) => x.filter((i) => i.id !== id));
    try {
      await deleteGalleryItemAction(id);
      toast.success("اتمسحت");
    } catch {
      setItems(prev);
      toast.error("حصل خطأ");
    }
  }

  return (
    <div>
      <div className="card-zg mb-6 p-5">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-espresso-900">
          <Plus className="h-5 w-5 text-gold-600" /> إضافة صورة جديدة للأعمال
        </h2>
        <div className="grid gap-4 sm:grid-cols-[1fr_1.2fr] sm:items-end">
          <ImageUpload value={pendingUrl} onChange={setPendingUrl} aspect="aspect-[4/3]" />
          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="وصف مختصر (اختياري)"
              className="w-full rounded-2xl border border-gold-200 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-gold-400"
            />
            <button type="button" onClick={add} disabled={adding || !pendingUrl} className="btn-gold w-full">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              إضافة للمعرض
            </button>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card-zg p-12 text-center text-espresso-400">لسه مفيش صور في معرض الأعمال.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((it) => (
            <div key={it.id} className={cn("card-zg overflow-hidden transition-opacity", !it.isActive && "opacity-50")}>
              <div className="relative aspect-square bg-cream-200">
                <Image src={it.imageUrl} alt={it.title ?? "عمل"} fill sizes="220px" className="object-cover" />
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <button
                  type="button"
                  onClick={() => toggle(it.id, !it.isActive)}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold",
                    it.isActive ? "text-green-700 hover:bg-green-50" : "text-espresso-500 hover:bg-cream-200",
                  )}
                >
                  {it.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {it.isActive ? "ظاهرة" : "مخفية"}
                </button>
                <button type="button" onClick={() => remove(it.id)} className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50" aria-label="مسح">
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
