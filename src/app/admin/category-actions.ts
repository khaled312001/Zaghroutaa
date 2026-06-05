"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function assertAdmin() {
  const session = await getSession();
  if (!session) throw new Error("غير مصرّح");
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

// رابط فريد للقسم (لو الاسم عربي بنولّد رابط تلقائي)
async function uniqueSlug(seed: string): Promise<string> {
  const base = slugify(seed) || `cat-${Math.random().toString(36).slice(2, 6)}`;
  let slug = base;
  let i = 2;
  while (await prisma.category.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

function revalidateAll() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}

export type CategoryInput = { nameAr: string; emoji?: string | null; slug?: string | null };

export async function createCategoryAction(input: CategoryInput) {
  await assertAdmin();
  const nameAr = input.nameAr?.trim();
  if (!nameAr) throw new Error("اكتبي اسم القسم");

  const slug = await uniqueSlug(input.slug?.trim() || nameAr);
  const max = await prisma.category.aggregate({ _max: { order: true } });
  await prisma.category.create({
    data: {
      slug,
      nameAr,
      emoji: input.emoji?.trim() || null,
      order: (max._max.order ?? 0) + 1,
    },
  });
  revalidateAll();
}

export async function updateCategoryAction(id: number, input: CategoryInput) {
  await assertAdmin();
  const nameAr = input.nameAr?.trim();
  if (!nameAr) throw new Error("اكتبي اسم القسم");
  await prisma.category.update({
    where: { id },
    data: { nameAr, emoji: input.emoji?.trim() || null },
  });
  revalidateAll();
}

export async function deleteCategoryAction(id: number) {
  await assertAdmin();
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new Error(`في ${count} منتج في القسم ده — انقليهم لقسم تاني الأول قبل ما تمسحيه`);
  }
  await prisma.category.delete({ where: { id } });
  revalidateAll();
}
