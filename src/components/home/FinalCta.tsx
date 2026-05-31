import Link from "next/link";
import { Sparkles, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export function FinalCta({ whatsappNumber }: { whatsappNumber: string }) {
  const wa = buildWhatsappUrl(
    whatsappNumber,
    "السلام عليكم 🌷 حابة أحجز مع زُغْرُوطَة",
  );

  return (
    <section className="container-zg py-16">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gold-shine px-6 py-14 text-center shadow-glow sm:px-12">
          <div className="pointer-events-none absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,#fff,transparent_40%),radial-gradient(circle_at_80%_80%,#fff,transparent_40%)]" />
          <Sparkles className="mx-auto h-10 w-10 text-white/90" />
          <h2 className="mt-4 font-display text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
            جاهزة تكوني أحلى عروسة؟
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">
            خلّينا نعملك حاجة مختلفة تشرّفك في يومك. احجزي دلوقتي وسيبي الباقي علينا 💛
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/products" className="btn bg-white px-7 text-gold-700 hover:bg-cream-100">
              <Sparkles className="h-5 w-5" /> اتفرجي واحجزي
            </Link>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp px-7">
              <MessageCircle className="h-5 w-5" /> كلّمينا على واتساب
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
