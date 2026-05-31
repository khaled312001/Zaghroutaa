"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import type { ProductImage } from "@/data/catalog";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
}: {
  images: ProductImage[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  const go = (dir: number) =>
    setActive((a) => (a + dir + images.length) % images.length);

  return (
    <div>
      <div
        className="group relative h-[40vh] max-h-[520px] min-h-[240px] cursor-zoom-in overflow-hidden rounded-3xl border-4 border-pearl bg-cream-200 shadow-card sm:h-[52vh]"
        onClick={() => setOpen(true)}
      >
        <Image
          src={images[active]?.url}
          alt={images[active]?.alt ?? name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-espresso-900/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
          <ZoomIn className="h-3.5 w-3.5" /> اضغطي للتكبير
        </span>
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all",
                i === active
                  ? "border-gold-500 ring-2 ring-gold-300"
                  : "border-pearl opacity-70 hover:opacity-100",
              )}
            >
              <Image src={img.url} alt={img.alt} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-espresso-900/90 p-4 backdrop-blur"
            onClick={() => setOpen(false)}
          >
            <button
              type="button"
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={() => setOpen(false)}
              aria-label="إغلاق"
            >
              <X className="h-6 w-6" />
            </button>

            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="relative max-h-[85vh] w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mx-auto aspect-[4/5] max-h-[85vh] w-auto">
                <Image
                  src={images[active]?.url}
                  alt={images[active]?.alt ?? name}
                  fill
                  sizes="90vw"
                  className="rounded-2xl object-contain"
                />
              </div>
            </motion.div>

            {images.length > 1 && (
              <>
                <NavBtn side="right" onClick={(e) => { e.stopPropagation(); go(-1); }}>
                  <ChevronRight className="h-7 w-7" />
                </NavBtn>
                <NavBtn side="left" onClick={(e) => { e.stopPropagation(); go(1); }}>
                  <ChevronLeft className="h-7 w-7" />
                </NavBtn>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavBtn({
  side,
  onClick,
  children,
}: {
  side: "left" | "right";
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20",
        side === "right" ? "right-4" : "left-4",
      )}
      aria-label={side === "right" ? "السابق" : "التالي"}
    >
      {children}
    </button>
  );
}
