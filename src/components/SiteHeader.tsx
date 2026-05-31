"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu, X, Sparkles, Home, ShoppingBag, Crown, Images, Star, Info, Phone, MessageCircle,
} from "lucide-react";
import { Logo } from "./ui/Logo";
import { cn } from "@/lib/utils";
import { buildWhatsappUrl } from "@/lib/whatsapp";

const NAV = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/products", label: "المنتجات", icon: ShoppingBag },
  { href: "/packages", label: "الباكدجات", icon: Crown },
  { href: "/gallery", label: "معرض الأعمال", icon: Images },
  { href: "/reviews", label: "آراء العملاء", icon: Star },
  { href: "/about", label: "عننا", icon: Info },
  { href: "/contact", label: "تواصلي", icon: Phone },
];

export function SiteHeader({ whatsappNumber }: { whatsappNumber: string }) {
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
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const wa = buildWhatsappUrl(whatsappNumber, "السلام عليكم 🌷 حابة أستفسر عن منتجات زُغْرُوطَة");

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
        <Logo showText={false} />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-full px-4 py-2 text-[15px] font-semibold transition-colors",
                isActive(item.href) ? "text-gold-700" : "text-espresso-700 hover:text-gold-700",
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
            onClick={() => setOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold-200 bg-pearl text-espresso-800 lg:hidden"
            aria-label="القائمة"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* درج الموبايل */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-espresso-900/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 z-50 flex h-[100dvh] w-[300px] max-w-[85vw] flex-col bg-pearl shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-gold-100 p-5">
                <Logo showText={false} />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-200 text-espresso-700"
                  aria-label="إغلاق"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4">
                {NAV.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "mb-1 flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-semibold transition-colors",
                        isActive(item.href)
                          ? "bg-gold-50 text-gold-700"
                          : "text-espresso-700 hover:bg-cream-200",
                      )}
                    >
                      <item.icon className="h-5 w-5 text-gold-500" />
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="space-y-2 border-t border-gold-100 p-4">
                <Link href="/packages" className="btn-gold w-full">
                  <Sparkles className="h-4 w-4" /> احجزي باكدجك
                </Link>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full">
                  <MessageCircle className="h-4 w-4" /> كلّمينا على واتساب
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
