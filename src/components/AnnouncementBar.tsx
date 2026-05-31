import { Truck, Clock, ShieldCheck } from "lucide-react";

export function AnnouncementBar({ text }: { text: string }) {
  return (
    <div className="bg-espresso-900 text-cream-100">
      <div className="container-zg flex items-center justify-center gap-6 py-2 text-center text-[13px] font-medium">
        <span className="hidden items-center gap-1.5 sm:flex">
          <Clock className="h-3.5 w-3.5 text-gold-300" /> بننقذ العرايس في الوقت الضيّق
        </span>
        <span className="flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5 text-gold-300" /> {text}
        </span>
        <span className="hidden items-center gap-1.5 md:flex">
          <ShieldCheck className="h-3.5 w-3.5 text-gold-300" /> شغل هاند ميد بأعلى جودة
        </span>
      </div>
    </div>
  );
}
