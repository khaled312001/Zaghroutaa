"use client";

import { buildWhatsappUrl } from "@/lib/whatsapp";

export function WhatsappFab({ number }: { number: string }) {
  const url = buildWhatsappUrl(
    number,
    "السلام عليكم، حابة أستفسر عن منتجات زُغْرُوطَة",
  );

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصلي معانا على واتساب"
      className="group fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_14px_40px_-10px_rgba(37,211,102,0.7)] transition-transform hover:scale-110"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-40" />
      <svg viewBox="0 0 32 32" className="relative h-7 w-7 fill-white" aria-hidden="true">
        <path d="M16.003 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.46 1.73 6.4L3.2 28.8l6.6-1.73a12.74 12.74 0 0 0 6.2 1.6h.01c7.06 0 12.8-5.74 12.8-12.8s-5.74-12.8-12.8-12.8Zm0 23.3h-.01a10.5 10.5 0 0 1-5.36-1.47l-.39-.23-3.92 1.03 1.05-3.82-.25-.4a10.48 10.48 0 0 1-1.6-5.58c0-5.82 4.74-10.56 10.57-10.56 2.82 0 5.47 1.1 7.47 3.1a10.5 10.5 0 0 1 3.1 7.47c0 5.83-4.74 10.56-10.56 10.56Zm5.8-7.9c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.56-1.58-.95-.84-1.59-1.88-1.77-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.54-.71-.55-.18-.01-.4-.01-.61-.01-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.23 3.4 5.4 4.77.75.32 1.34.52 1.8.66.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.26-.74.26-1.38.18-1.51-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
}
