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

/* ---------------- المنتجات (إضافة / تعديل كامل / حذف) ---------------- */
export type ProductInput = {
  nameAr: string;
  categorySlug: string;
  basePrice: number;
  oldPrice?: number | null;
  badge?: string | null;
  shortAr?: string;
  descriptionAr?: string;
  coverImage: string;
  images?: string[];
  variants?: { nameAr: string; price: number; oldPrice?: number | null }[];
  isActive?: boolean;
  isFeatured?: boolean;
};

function makeSlug(name: string): string {
  const ascii = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const rand = Math.random().toString(36).slice(2, 7);
  return ascii ? `${ascii.slice(0, 28)}-${rand}` : `prod-${rand}`;
}

function cleanVariants(variants?: ProductInput["variants"]) {
  return (variants ?? [])
    .filter((v) => v.nameAr?.trim() && v.price > 0)
    .map((v, i) => ({
      nameAr: v.nameAr.trim(),
      price: v.price,
      oldPrice: v.oldPrice || null,
      order: i,
    }));
}

export async function createProductAction(data: ProductInput): Promise<number> {
  await assertAdmin();
  if (!data.nameAr?.trim()) throw new Error("لازم تكتبي اسم المنتج");
  if (!data.coverImage) throw new Error("لازم ترفعي صورة للمنتج");
  const cat = await prisma.category.findUnique({
    where: { slug: data.categorySlug },
    select: { id: true },
  });
  const max = await prisma.product.aggregate({ _max: { order: true } });
  const imgs = data.images?.length ? data.images : [data.coverImage];
  const p = await prisma.product.create({
    data: {
      slug: makeSlug(data.nameAr),
      nameAr: data.nameAr.trim(),
      shortAr: data.shortAr?.trim() || null,
      descriptionAr: data.descriptionAr?.trim() || null,
      basePrice: data.basePrice || 0,
      oldPrice: data.oldPrice || null,
      categoryId: cat?.id ?? null,
      coverImage: data.coverImage,
      badge: data.badge?.trim() || null,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
      order: (max._max.order ?? 0) + 1,
      images: { create: imgs.map((url, i) => ({ url, alt: data.nameAr.trim(), order: i })) },
      variants: { create: cleanVariants(data.variants) },
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return p.id;
}

export async function updateProductFullAction(id: number, data: ProductInput) {
  await assertAdmin();
  if (!data.nameAr?.trim()) throw new Error("لازم تكتبي اسم المنتج");
  const cat = await prisma.category.findUnique({
    where: { slug: data.categorySlug },
    select: { id: true },
  });
  const imgs = data.images?.length ? data.images : [data.coverImage];
  await prisma.product.update({
    where: { id },
    data: {
      nameAr: data.nameAr.trim(),
      shortAr: data.shortAr?.trim() || null,
      descriptionAr: data.descriptionAr?.trim() || null,
      basePrice: data.basePrice || 0,
      oldPrice: data.oldPrice || null,
      categoryId: cat?.id ?? null,
      coverImage: data.coverImage,
      badge: data.badge?.trim() || null,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
    },
  });
  await prisma.productImage.deleteMany({ where: { productId: id } });
  await prisma.productImage.createMany({
    data: imgs.map((url, i) => ({ productId: id, url, alt: data.nameAr.trim(), order: i })),
  });
  await prisma.productVariant.deleteMany({ where: { productId: id } });
  const vs = cleanVariants(data.variants);
  if (vs.length) {
    await prisma.productVariant.createMany({
      data: vs.map((v) => ({ productId: id, ...v })),
    });
  }
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function deleteProductFullAction(id: number) {
  await assertAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/products");
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
