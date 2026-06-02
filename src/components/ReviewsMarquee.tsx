"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

const SPEED = 30; // سرعة الحركة التلقائية (px/ثانية)
const RESUME_AFTER = 1800; // يرجع يتحرك لوحده بعد التحكم (ms)

/**
 * شريط آراء العملاء — بيتحرك لوحده وكمان قابل للتحكم:
 * سحب بالإصبع/الماوس + أسهم، والضغط على الصورة بيفتحها مكبّرة وتقدري تقفليها.
 */
export function ReviewsMarquee({ images }: { images: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const lastInteract = useRef(0);
  const dragging = useRef(false);
  const moved = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const count = images.length;

  const [open, setOpen] = useState<number | null>(null);

  // الحركة التلقائية + اللفّ السلس
  useEffect(() => {
    const el = ref.current;
    if (!el || count === 0) return;
    let raf = 0;
    let last = performance.now();
    const period = () => {
      const kids = el.children;
      if (kids.length <= count) return 0;
      return (kids[count] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft;
    };
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      const idle = now - lastInteract.current > RESUME_AFTER;
      if (idle && !dragging.current && open === null) el.scrollLeft += SPEED * dt;
      const w = period();
      if (w > 0) {
        if (el.scrollLeft >= w) el.scrollLeft -= w;
        else if (el.scrollLeft <= 0) el.scrollLeft = w - 1;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count, open]);

  // قفل بالكيبورد + التنقل وقت الفتح
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      else if (e.key === "ArrowRight") setOpen((o) => (o === null ? o : (o - 1 + count) % count));
      else if (e.key === "ArrowLeft") setOpen((o) => (o === null ? o : (o + 1) % count));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, count]);

  if (!count) return null;

  const loop = [...images, ...images];
  const mark = () => {
    lastInteract.current = performance.now();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    mark();
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    dragging.current = true;
    moved.current = false;
    startX.current = e.clientX;
    startScroll.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const el = ref.current;
    if (!el) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 4) moved.current = true;
    let target = startScroll.current - dx;
    const kids = el.children;
    const w =
      kids.length > count
        ? (kids[count] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft
        : 0;
    if (w > 0) {
      if (target >= w) {
        target -= w;
        startScroll.current -= w;
      } else if (target < 0) {
        target += w;
        startScroll.current += w;
      }
    }
    el.scrollLeft = target;
  };
  const endDrag = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    mark();
    try {
      ref.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* تجاهل */
    }
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (moved.current) {
      e.preventDefault();
      e.stopPropagation();
      moved.current = false;
    }
  };
  const page = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    mark();
    el.scrollBy({ left: dir * Math.max(220, el.clientWidth * 0.8), behavior: "smooth" });
  };
  const go = (dir: number) => setOpen((o) => (o === null ? o : (o + dir + count) % count));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => page(-1)}
        aria-label="تحريك لليسار"
        className="absolute left-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gold-200 bg-white/90 text-espresso-800 shadow-card backdrop-blur transition hover:bg-white sm:left-2 sm:h-11 sm:w-11"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => page(1)}
        aria-label="تحريك لليمين"
        className="absolute right-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gold-200 bg-white/90 text-espresso-800 shadow-card backdrop-blur transition hover:bg-white sm:right-2 sm:h-11 sm:w-11"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        ref={ref}
        dir="ltr"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        onWheel={mark}
        onTouchStart={mark}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        style={{ touchAction: "pan-x" }}
        className="no-scrollbar mask-fade-x flex cursor-grab select-none gap-4 overflow-x-auto px-10 py-2 active:cursor-grabbing sm:px-14"
      >
        {loop.map((src, i) => (
          <button
            type="button"
            key={i}
            onClick={() => setOpen(i % count)}
            aria-hidden={i >= count || undefined}
            tabIndex={i >= count ? -1 : 0}
            aria-label="تكبير صورة الرأي"
            className="card-zg group relative w-52 shrink-0 overflow-hidden sm:w-60"
          >
            <div className="relative aspect-[3/4] bg-cream-200">
              <Image
                src={src}
                alt="رأي عميلة عن زُغْرُوطَة"
                fill
                sizes="240px"
                draggable={false}
                className="object-cover"
              />
              <span className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-espresso-900/65 px-2 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                <ZoomIn className="h-3.5 w-3.5" /> تكبير
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* التكبير */}
      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-espresso-900/90 p-4 backdrop-blur"
            onClick={() => setOpen(null)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={() => setOpen(null)}
              aria-label="إغلاق"
            >
              <X className="h-6 w-6" />
            </button>

            <motion.div
              key={open}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="relative flex max-h-[88vh] w-full max-w-md items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[open]}
                alt="رأي عميلة عن زُغْرُوطَة"
                width={800}
                height={1100}
                className="max-h-[88vh] w-auto rounded-2xl object-contain shadow-glow"
              />
            </motion.div>

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  aria-label="السابق"
                  className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  aria-label="التالي"
                  className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">
                  {open + 1} / {count}
                </span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
