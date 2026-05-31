"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./ui/Reveal";

export function MediaGrid({
  images,
  variant = "grid",
}: {
  images: string[];
  variant?: "grid" | "masonry";
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const show = (i: number) => {
    setActive(i);
    setOpen(true);
  };
  const go = (dir: number) =>
    setActive((a) => (a + dir + images.length) % images.length);

  if (!images.length) {
    return <p className="py-16 text-center text-espresso-500">لا توجد صور حاليًا.</p>;
  }

  return (
    <>
      {variant === "masonry" ? (
        <div className="columns-2 gap-4 [column-fill:_balance] sm:columns-3 lg:columns-4">
          {images.map((src, i) => (
            <Reveal key={src} delay={(i % 4) * 0.05} className="mb-4 break-inside-avoid">
              <button
                type="button"
                onClick={() => show(i)}
                className="block w-full overflow-hidden rounded-2xl border-2 border-pearl bg-cream-200 shadow-card shine-on-hover"
              >
                <Image
                  src={src}
                  alt="رأي عميلة عن زُغْرُوطَة"
                  width={500}
                  height={700}
                  className="h-auto w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
              </button>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {images.map((src, i) => (
            <Reveal key={src} delay={(i % 4) * 0.05}>
              <button
                type="button"
                onClick={() => show(i)}
                className="relative block aspect-square w-full overflow-hidden rounded-2xl border-2 border-pearl bg-cream-200 shadow-card shine-on-hover"
              >
                <Image
                  src={src}
                  alt="من أعمال زُغْرُوطَة"
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </button>
            </Reveal>
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
              className="relative flex max-h-[86vh] w-full max-w-2xl items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[active]}
                alt="صورة مكبّرة"
                width={900}
                height={1200}
                className="max-h-[86vh] w-auto rounded-2xl object-contain"
              />
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
    </>
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
