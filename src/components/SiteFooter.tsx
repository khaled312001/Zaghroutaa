import Link from "next/link";
import { Instagram, Facebook, Phone, Mail, MapPin, Heart } from "lucide-react";
import { Logo } from "./ui/Logo";
import { CATEGORIES, toArabicDigits } from "@/data/catalog";
import type { SiteSettings } from "@/lib/settings";
import { buildWhatsappUrl } from "@/lib/whatsapp";

const QUICK = [
  { href: "/products", label: "كل المنتجات" },
  { href: "/packages", label: "الباكدجات" },
  { href: "/gallery", label: "معرض الأعمال" },
  { href: "/reviews", label: "آراء العملاء" },
  { href: "/about", label: "عننا" },
  { href: "/contact", label: "تواصلي معانا" },
];

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const wa = buildWhatsappUrl(settings.whatsappNumber);
  const year = toArabicDigits(new Date().getFullYear());

  return (
    <footer className="mt-20 border-t border-gold-200/60 bg-espresso-900 text-cream-200">
      <div className="container-zg grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-200/80">
            كل حاجة تخص العروسة في كتب الكتاب والفرح — قطع هاند ميد مميزة ومعمولة
            بدقة ونظافة تقفيل مفيش زيها، عشان العروسة تكون مختلفة في يومها.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <SocialIcon href={wa} label="واتساب">
              <svg viewBox="0 0 32 32" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M16 3.2C8.94 3.2 3.2 8.94 3.2 16c0 2.26.6 4.46 1.73 6.4L3.2 28.8l6.6-1.73A12.74 12.74 0 0 0 16 28.66c7.06 0 12.8-5.74 12.8-12.8S23.06 3.2 16 3.2Zm5.8 15.4c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.56-1.58-.95-.84-1.59-1.88-1.77-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.54-.71-.55h-.61c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.23 3.4 5.4 4.77.75.32 1.34.52 1.8.66.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.26-.74.26-1.38.18-1.51-.08-.13-.29-.21-.61-.37Z" />
              </svg>
            </SocialIcon>
            {settings.instagram && (
              <SocialIcon href={settings.instagram} label="انستجرام">
                <Instagram className="h-5 w-5" />
              </SocialIcon>
            )}
            {settings.facebook && (
              <SocialIcon href={settings.facebook} label="فيسبوك">
                <Facebook className="h-5 w-5" />
              </SocialIcon>
            )}
            {settings.tiktok && (
              <SocialIcon href={settings.tiktok} label="تيك توك">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M16.5 3c.3 2.1 1.5 3.6 3.5 3.9v2.6c-1.3.1-2.5-.3-3.6-1v5.4c0 3.4-2.6 5.6-5.6 5.6-2.8 0-5-2-5-4.9 0-2.9 2.4-5 5.6-4.7v2.7c-.4-.1-.9-.2-1.3-.1-1.1.1-1.9.9-1.8 2.1.1 1.1 1 1.8 2 1.7 1.2-.1 1.9-1 1.9-2.3V3h3.9Z" />
                </svg>
              </SocialIcon>
            )}
          </div>
        </div>

        <FooterCol title="روابط سريعة">
          {QUICK.map((l) => (
            <FooterLink key={l.href} href={l.href}>
              {l.label}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="أقسامنا">
          {CATEGORIES.slice(0, 6).map((c) => (
            <FooterLink key={c.slug} href={`/products?cat=${c.slug}`}>
              {c.emoji} {c.nameAr}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="تواصلي معانا">
          <a href={wa} className="flex items-center gap-2 py-1.5 text-sm hover:text-gold-300">
            <Phone className="h-4 w-4 text-gold-400" /> واتساب وأوردراتك
          </a>
          {settings.phone && (
            <a href={`tel:${settings.phone}`} className="flex items-center gap-2 py-1.5 text-sm hover:text-gold-300">
              <Phone className="h-4 w-4 text-gold-400" /> {toArabicDigits(settings.phone)}
            </a>
          )}
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="flex items-center gap-2 py-1.5 text-sm hover:text-gold-300">
              <Mail className="h-4 w-4 text-gold-400" /> {settings.email}
            </a>
          )}
          <span className="flex items-center gap-2 py-1.5 text-sm text-cream-200/80">
            <MapPin className="h-4 w-4 text-gold-400" /> بنشحن لكل محافظات مصر
          </span>
        </FooterCol>
      </div>

      <div className="border-t border-white/10">
        <div className="container-zg flex flex-col items-center justify-between gap-2 py-5 text-center text-xs text-cream-200/70 sm:flex-row">
          <p>© {year} زُغْرُوطَة — جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-1.5">
            صُمّم بكل <Heart className="h-3.5 w-3.5 fill-blush-400 text-blush-400" /> لعرايس مصر
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 font-display text-lg font-bold text-cream-100">{title}</h3>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="py-1.5 text-sm text-cream-200/85 transition-colors hover:text-gold-300">
      {children}
    </Link>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-cream-100 transition-colors hover:border-gold-400 hover:bg-gold-500 hover:text-white"
    >
      {children}
    </a>
  );
}
