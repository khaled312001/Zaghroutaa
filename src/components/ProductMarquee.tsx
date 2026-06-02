"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/data/catalog";
import { formatPriceEGP } from "@/lib/utils";

const SPEED = 34; // سرعة الحركة التلقائية (px/ثانية)
const RESUME_AFTER = 1800; // يرجع يتحرك لوحده بعد ما تبطّل لمس (ms)

/**
 * شريط منتجات بيتحرك لوحده في حلقة، وكمان تقدري تتحكمي فيه:
 * - سحب بالإصبع على الموبايل، وسحب بالماوس على اللاب
 * - أسهم يمين/شمال
 * - التاتش باد
 * وبيقف عن الحركة التلقائية وانتي بتتحكمي فيه ويرجع لوحده بعدها.
 */
export function ProductMarquee({ products }: { products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const lastInteract = useRef(0);
  const dragging = useRef(false);
  const moved = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const count = products.length;

  useEffect(() => {
    const el = ref.current;
    if (!el || count === 0) return;
    let raf = 0;
    let last = performance.now();

    const period = () => {
      // عرض نسخة واحدة من القطع = المسافة اللي بنلف عندها (مستقلة عن أي padding)
      const kids = el.children;
      if (kids.length <= count) return 0;
      return (kids[count] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft;
    };

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      const idle = now - lastInteract.current > RESUME_AFTER;
      if (idle && !dragging.current) el.scrollLeft += SPEED * dt;

      const w = period();
      if (w > 0) {
        if (el.scrollLeft >= w) el.scrollLeft -= w;
        else if (el.scrollLeft <= 0) el.scrollLeft = w - 1;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count]);

  if (!count) return null;

  // نسختين من القطع عشان اللف يبقى ناعم بلا توقف
  const loop = [...products, ...products];

  const mark = () => {
    lastInteract.current = performance.now();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    mark();
    if (e.pointerType !== "mouse") return; // اللمس بيشتغل بالسكرول الطبيعي
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

  // لو حصل سحب، نلغي فتح لينك المنتج
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
        className="no-scrollbar mask-fade-x flex cursor-grab select-none gap-4 overflow-x-auto px-10 py-3 active:cursor-grabbing sm:gap-5 sm:px-14"
      >
        {loop.map((p, i) => (
          <ProductCard key={i} product={p} isClone={i >= count} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product: p, isClone = false }: { product: Product; isClone?: boolean }) {
  return (
    <Link
      href={`/products/${p.slug}`}
      dir="rtl"
      aria-hidden={isClone || undefined}
      tabIndex={isClone ? -1 : 0}
      draggable={false}
      className="group w-44 shrink-0 overflow-hidden rounded-3xl border border-gold-200/70 bg-pearl shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-glow sm:w-56"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-cream-200 shine-on-hover">
        <Image
          src={p.cover}
          alt={p.nameAr}
          fill
          sizes="224px"
          draggable={false}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {p.badge && (
          <span className="chip absolute right-2 top-2 bg-gold-shine text-white shadow-sm">
            {p.badge}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-bold text-espresso-900">{p.nameAr}</h3>
        <p className="mt-1 text-sm font-extrabold text-gold-700">{formatPriceEGP(p.basePrice)}</p>
      </div>
    </Link>
  );
}
