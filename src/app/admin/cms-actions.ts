"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CONTENT_FIELDS } from "@/lib/content";

async function assertAdmin() {
  const session = await getSession();
  if (!session) throw new Error("غير مصرّح");
}

/* ---------------- معرض الأعمال (Portfolio) ---------------- */
export async function addGalleryItemAction(imageUrl: string, title?: string) {
  await assertAdmin();
  const url = imageUrl.trim();
  if (!url) throw new Error("لازم ترفعي صورة الأول");
  const max = await prisma.galleryItem.aggregate({ _max: { order: true } });
  await prisma.galleryItem.create({
    data: {
      imageUrl: url,
      title: title?.trim() || null,
      isActive: true,
      order: (max._max.order ?? 0) + 1,
    },
  });
  revalidatePath("/admin/portfolio");
  revalidatePath("/gallery");
  revalidatePath("/");
}

export async function toggleGalleryItemAction(id: number, isActive: boolean) {
  await assertAdmin();
  await prisma.galleryItem.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/portfolio");
  revalidatePath("/gallery");
  revalidatePath("/");
}

export async function deleteGalleryItemAction(id: number) {
  await assertAdmin();
  await prisma.galleryItem.delete({ where: { id } });
  revalidatePath("/admin/portfolio");
  revalidatePath("/gallery");
  revalidatePath("/");
}

/* ---------------- محتوى الصفحات (CMS) ---------------- */
export type ContentState = { ok?: boolean };

export async function updateContentAction(
  _prev: ContentState,
  formData: FormData,
): Promise<ContentState> {
  await assertAdmin();
  for (const f of CONTENT_FIELDS) {
    const value = String(formData.get(f.key) ?? "");
    await prisma.content.upsert({
      where: { key: f.key },
      update: { value, type: f.type, groupAr: f.groupAr, labelAr: f.labelAr, order: f.order },
      create: { key: f.key, value, type: f.type, groupAr: f.groupAr, labelAr: f.labelAr, order: f.order },
    });
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
