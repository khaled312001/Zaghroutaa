"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { Logo } from "./ui/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "الرئيسية" },
  { href: "/products", label: "المنتجات" },
  { href: "/packages", label: "الباكدجات" },
  { href: "/gallery", label: "معرض الأعمال" },
  { href: "/reviews", label: "آراء العملاء" },
  { href: "/about", label: "عننا" },
  { href: "/contact", label: "تواصلي" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-gold-200/50 bg-pearl/90 shadow-soft backdrop-blur-lg"
          : "bg-cream-100/40 backdrop-blur-sm",
      )}
    >
      <div className="container-zg flex h-[72px] items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-full px-4 py-2 text-[15px] font-semibold transition-colors",
                isActive(item.href)
                  ? "text-gold-700"
                  : "text-espresso-700 hover:text-gold-700",
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold-shine"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/packages" className="btn-gold hidden px-5 py-2.5 text-sm sm:inline-flex">
            <Sparkles className="h-4 w-4" />
            احجزي باكدجك
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold-200 bg-pearl text-espresso-800 lg:hidden"
            aria-label="القائمة"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-gold-200/50 bg-pearl/95 backdrop-blur-lg lg:hidden"
          >
            <nav className="container-zg flex flex-col gap-1 py-4">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-base font-semibold transition-colors",
                    isActive(item.href)
                      ? "bg-gold-50 text-gold-700"
                      : "text-espresso-700 hover:bg-cream-200",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/packages" className="btn-gold mt-2 w-full">
                <Sparkles className="h-4 w-4" />
                احجزي باكدجك دلوقتي
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
