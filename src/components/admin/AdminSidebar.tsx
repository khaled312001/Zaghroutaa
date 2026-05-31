"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Images,
  LayoutTemplate,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/portfolio", label: "معرض الأعمال", icon: Images },
  { href: "/admin/reviews", label: "آراء العملاء", icon: Star },
  { href: "/admin/content", label: "محتوى الموقع", icon: LayoutTemplate },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const NavList = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
            isActive(item.href)
              ? "bg-gold-shine text-white shadow-glow"
              : "text-espresso-700 hover:bg-cream-200",
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  const Bottom = (
    <div className="mt-auto space-y-2 border-t border-gold-100 pt-3">
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-espresso-600 hover:bg-cream-200"
      >
        <ExternalLink className="h-4 w-4" /> زيارة الموقع
      </Link>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4" /> تسجيل الخروج
        </button>
      </form>
    </div>
  );

  const Header = (
    <div className="mb-5 flex items-center gap-3 border-b border-gold-100 pb-4">
      <Image src="/logo.png" alt="زُغْرُوطَة" width={44} height={44} className="rounded-full ring-1 ring-gold-200" />
      <div>
        <p className="font-display text-base font-bold text-espresso-900">زُغْرُوطَة</p>
        <p className="text-xs text-gold-600">أهلاً {adminName}</p>
      </div>
    </div>
  );

  return (
    <>
      {/* ديسكتوب */}
      <aside className="fixed right-0 top-0 z-30 hidden h-screen w-[260px] flex-col border-l border-gold-200/60 bg-pearl p-5 lg:flex">
        {Header}
        {NavList}
        {Bottom}
      </aside>

      {/* موبايل: توب بار */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gold-200/60 bg-pearl/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="زُغْرُوطَة" width={36} height={36} className="rounded-full ring-1 ring-gold-200" />
          <span className="font-display font-bold text-espresso-900">لوحة التحكم</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-200 text-espresso-800"
          aria-label="القائمة"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* موبايل: درج */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-espresso-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 z-50 flex h-screen w-[260px] flex-col bg-pearl p-5 shadow-2xl lg:hidden"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute left-4 top-4 text-espresso-500"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
              {Header}
              {NavList}
              {Bottom}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
