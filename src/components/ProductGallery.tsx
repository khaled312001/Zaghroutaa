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

  const list = images.length ? images : [{ url: "/logo.png", alt: name }];
  const current = list[Math.min(active, list.length - 1)];
  const go = (dir: number) =>
    setActive((a) => (a + dir + list.length) % list.length);

  return (
    <div className="w-full">
      {/* الصورة الرئيسية — مربّع، عمره ما يبقى أطول من الشاشة */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block aspect-square w-full overflow-hidden rounded-2xl border border-gold-200 bg-cream-100 shadow-card sm:rounded-3xl"
      >
        <Image
          src={current.url}
          alt={current.alt ?? name}
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
        <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-espresso-900/65 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
          <ZoomIn className="h-3.5 w-3.5" /> اضغطي للتكبير
        </span>
      </button>

      {/* الصور المصغّرة */}
      {list.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl border-2 transition sm:w-20",
                i === active
                  ? "border-gold-500 ring-2 ring-gold-300"
                  : "border-gold-100 opacity-70 hover:opacity-100",
              )}
            >
              <Image src={img.url} alt={img.alt ?? name} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* التكبير */}
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
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
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
              className="relative flex max-h-[85vh] w-full max-w-2xl items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={current.url}
                alt={current.alt ?? name}
                width={900}
                height={900}
                className="max-h-[85vh] w-auto rounded-2xl object-contain"
              />
            </motion.div>

            {list.length > 1 && (
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
