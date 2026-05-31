import "server-only";
import { cache } from "react";
import { prisma } from "./prisma";
import { GALLERY_IMAGES } from "@/data/catalog";

export type GalleryImage = { id: number | string; url: string; title?: string };

export const getGalleryImages = cache(async (): Promise<GalleryImage[]> => {
  try {
    const rows = await prisma.galleryItem.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { id: "asc" }],
    });
    if (rows.length) {
      return rows.map((r) => ({ id: r.id, url: r.imageUrl, title: r.title ?? undefined }));
    }
  } catch {
    // فولباك للصور الثابتة
  }
  return GALLERY_IMAGES.map((url, i) => ({ id: `static-${i}`, url }));
});
