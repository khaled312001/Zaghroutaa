"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Shapes, Plus, Trash2, Loader2, Pencil, Check, X } from "lucide-react";
import {
  createCategoryAction, updateCategoryAction, deleteCategoryAction,
} from "@/app/admin/category-actions";
import { CategoryIcon } from "@/lib/categoryIcons";
import { cn, toArabicDigits } from "@/lib/utils";

export type AdminCategory = {
  id: number;
  slug: string;
  nameAr: string;
  emoji: string | null;
  order: number;
  productCount: number;
};

const inputClass =
  "w-full rounded-xl border border-gold-200 bg-cream-50 px-3 py-2.5 text-sm text-espresso-800 outline-none focus:border-gold-400";

export function CategoriesManager({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ nameAr: "", emoji: "", slug: "" });
  const [editing, setEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ nameAr: "", emoji: "" });

  const run = (fn: () => Promise<unknown>, ok?: string) =>
    start(async () => {
      try {
        await fn();
        if (ok) toast.success(ok);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "حصل خطأ");
      }
    });

  const add = () => {
    if (!form.nameAr.trim()) return toast.error("اكتبي اسم القسم");
    run(async () => {
      await createCategoryAction({
        nameAr: form.nameAr,
        emoji: form.emoji || null,
        slug: form.slug || null,
      });
      setForm({ nameAr: "", emoji: "", slug: "" });
    }, "اتعمل القسم");
  };

  const startEdit = (c: AdminCategory) => {
    setEditing(c.id);
    setEditForm({ nameAr: c.nameAr, emoji: c.emoji ?? "" });
  };

  const saveEdit = (id: number) => {
    if (!editForm.nameAr.trim()) return toast.error("اكتبي اسم القسم");
    run(async () => {
      await updateCategoryAction(id, { nameAr: editForm.nameAr, emoji: editForm.emoji || null });
      setEditing(null);
    }, "اتعدّل القسم");
  };

  return (
    <div className="space-y-6">
      {/* إضافة قسم */}
      <div className="card-zg p-5">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-espresso-900">
          <Shapes className="h-5 w-5 text-gold-600" /> قسم جديد
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block sm:col-span-2 lg:col-span-1">
            <span className="mb-1 block text-xs font-semibold text-espresso-600">اسم القسم *</span>
            <input
              value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
              placeholder="مثلاً: التوزيعات"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-espresso-600">إيموجي (اختياري)</span>
            <input
              value={form.emoji}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              placeholder="🎁"
              maxLength={4}
              className={cn(inputClass, "text-center text-lg")}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-espresso-600">رابط بالإنجليزي (اختياري)</span>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="favors"
              dir="ltr"
              className={inputClass}
            />
          </label>
        </div>
        <button type="button" onClick={add} disabled={pending} className="btn-gold mt-4 px-5 py-2.5 text-sm">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} ضيفي القسم
        </button>
      </div>

      {/* القائمة */}
      {categories.length === 0 ? (
        <div className="card-zg p-10 text-center text-espresso-400">لسه مفيش أقسام.</div>
      ) : (
        <div className="space-y-3">
          {categories.map((c) => (
            <div key={c.id} className="card-zg flex flex-wrap items-center justify-between gap-3 p-4">
              {editing === c.id ? (
                <>
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <input
                      value={editForm.emoji}
                      onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })}
                      placeholder="🎁"
                      maxLength={4}
                      className={cn(inputClass, "w-16 text-center text-lg")}
                    />
                    <input
                      value={editForm.nameAr}
                      onChange={(e) => setEditForm({ ...editForm, nameAr: e.target.value })}
                      className={cn(inputClass, "min-w-[160px] flex-1")}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => saveEdit(c.id)}
                      className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="text-espresso-300 hover:text-espresso-600"
                      aria-label="إلغاء"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50 text-lg">
                      {c.emoji || <CategoryIcon slug={c.slug} className="h-5 w-5 text-gold-600" />}
                    </span>
                    <div className="text-sm">
                      <p className="font-bold text-espresso-900">{c.nameAr}</p>
                      <p className="text-xs text-espresso-500" dir="ltr">
                        {c.slug} • {toArabicDigits(c.productCount)} منتج
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="rounded-xl bg-cream-200 px-3 py-1.5 text-xs font-bold text-espresso-700 hover:bg-cream-300"
                    >
                      <Pencil className="inline h-3.5 w-3.5" /> تعديل
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        if (c.productCount > 0) {
                          return toast.error(`في ${c.productCount} منتج في القسم — انقليهم لقسم تاني الأول`);
                        }
                        if (confirm(`متأكدة إنك عايزة تمسحي قسم «${c.nameAr}»؟`)) {
                          run(() => deleteCategoryAction(c.id), "اتمسح");
                        }
                      }}
                      className="text-espresso-300 hover:text-rose-500"
                      aria-label="مسح"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
