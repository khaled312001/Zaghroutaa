import { Phone, Truck, Instagram, Facebook } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { toArabicDigits } from "@/data/catalog";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M16 3.2C8.94 3.2 3.2 8.94 3.2 16c0 2.26.6 4.46 1.73 6.4L3.2 28.8l6.6-1.73A12.74 12.74 0 0 0 16 28.66c7.06 0 12.8-5.74 12.8-12.8S23.06 3.2 16 3.2Zm5.8 15.4c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.56-1.58-.95-.84-1.59-1.88-1.77-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.54-.71-.55h-.61c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.23 3.4 5.4 4.77.75.32 1.34.52 1.8.66.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.26-.74.26-1.38.18-1.51-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}
function TiktokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M16.5 3c.3 2.1 1.5 3.6 3.5 3.9v2.6c-1.3.1-2.5-.3-3.6-1v5.4c0 3.4-2.6 5.6-5.6 5.6-2.8 0-5-2-5-4.9 0-2.9 2.4-5 5.6-4.7v2.7c-.4-.1-.9-.2-1.3-.1-1.1.1-1.9.9-1.8 2.1.1 1.1 1 1.8 2 1.7 1.2-.1 1.9-1 1.9-2.3V3h3.9Z" />
    </svg>
  );
}

function SocialDot({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-cream-100 transition-colors hover:bg-gold-500 hover:text-white"
    >
      {children}
    </a>
  );
}

export function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  const wa = buildWhatsappUrl(settings.whatsappNumber);

  return (
    <div className="bg-espresso-900 text-cream-100">
      <div className="container-zg flex items-center justify-between gap-3 py-2 text-[13px]">
        {/* الهاتف + شحن */}
        <div className="flex min-w-0 items-center gap-4">
          {settings.phone ? (
            <a href={`tel:${settings.phone}`} dir="ltr" className="flex items-center gap-1.5 font-medium hover:text-gold-300">
              <Phone className="h-3.5 w-3.5 text-gold-300" /> {toArabicDigits(settings.phone)}
            </a>
          ) : (
            <a href={wa} className="flex items-center gap-1.5 font-medium hover:text-gold-300">
              <Phone className="h-3.5 w-3.5 text-gold-300" /> تواصلي معانا
            </a>
          )}
          <span className="hidden items-center gap-1.5 text-cream-200/80 sm:flex">
            <Truck className="h-3.5 w-3.5 text-gold-300" /> بنشحن لكل محافظات مصر
          </span>
        </div>

        {/* السوشيال */}
        <div className="flex items-center gap-1.5">
          <SocialDot href={wa} label="واتساب"><WhatsAppIcon /></SocialDot>
          {settings.instagram && (
            <SocialDot href={settings.instagram} label="انستجرام"><Instagram className="h-4 w-4" /></SocialDot>
          )}
          {settings.facebook && (
            <SocialDot href={settings.facebook} label="فيسبوك"><Facebook className="h-4 w-4" /></SocialDot>
          )}
          {settings.tiktok && (
            <SocialDot href={settings.tiktok} label="تيك توك"><TiktokIcon /></SocialDot>
          )}
        </div>
      </div>
    </div>
  );
}
