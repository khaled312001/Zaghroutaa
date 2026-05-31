"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { updateContentAction, type ContentState } from "@/app/admin/cms-actions";
import type { ContentField } from "@/lib/content";

const inputClass =
  "w-full rounded-2xl border border-gold-200 bg-cream-50 px-4 py-3 text-espresso-800 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-200";

export function ContentManager({
  fields,
  values,
}: {
  fields: ContentField[];
  values: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState<ContentState, FormData>(
    updateContentAction,
    {},
  );

  const imageKeys = useMemo(
    () => fields.filter((f) => f.type === "image").map((f) => f.key),
    [fields],
  );
  const [images, setImages] = useState<Record<string, string>>(() =>
    Object.fromEntries(imageKeys.map((k) => [k, values[k] ?? ""])),
  );

  useEffect(() => {
    if (state.ok) toast.success("اتحفظ المحتوى وظهر على الموقع");
  }, [state]);

  const groups = useMemo(() => {
    const map = new Map<string, ContentField[]>();
    for (const f of fields) {
      if (!map.has(f.groupAr)) map.set(f.groupAr, []);
      map.get(f.groupAr)!.push(f);
    }
    return [...map.entries()];
  }, [fields]);

  return (
    <form action={formAction} className="space-y-6">
      {groups.map(([groupName, gfields]) => (
        <div key={groupName} className="card-zg p-6">
          <h3 className="mb-4 border-b border-gold-100 pb-3 font-display text-lg font-bold text-espresso-900">
            {groupName}
          </h3>
          <div className="grid gap-5">
            {gfields.map((f) => (
              <div key={f.key}>
                <label className="mb-1.5 block text-sm font-semibold text-espresso-700">
                  {f.labelAr}
                </label>
                {f.type === "image" ? (
                  <>
                    <input type="hidden" name={f.key} value={images[f.key] ?? ""} />
                    <ImageUpload
                      value={images[f.key]}
                      onChange={(url) => setImages((s) => ({ ...s, [f.key]: url }))}
                      aspect="aspect-[16/9]"
                      className="max-w-md"
                    />
                  </>
                ) : f.type === "longtext" ? (
                  <textarea name={f.key} defaultValue={values[f.key] ?? ""} rows={3} className={inputClass} />
                ) : (
                  <input name={f.key} defaultValue={values[f.key] ?? ""} className={inputClass} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-4 z-10">
        <button type="submit" disabled={pending} className="btn-gold w-full shadow-glow sm:w-auto">
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          حفظ كل المحتوى
        </button>
      </div>
    </form>
  );
}
