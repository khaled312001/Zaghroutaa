import { MousePointerClick, PencilLine, MessageCircleHeart } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { toArabicDigits } from "@/data/catalog";

const STEPS = [
  {
    icon: MousePointerClick,
    title: "اختاري قطعتك",
    text: "اتفرّجي على المنتجات والباكدجات واختاري اللي عجبك واضغطي «احجزي».",
  },
  {
    icon: PencilLine,
    title: "املي بياناتك",
    text: "اكتبي اسمك وموبايلك والمحافظة والعنوان، واسم العريس والعروسة وتاريخ كتب الكتاب أو الفرح.",
  },
  {
    icon: MessageCircleHeart,
    title: "أكّدي على واتساب",
    text: "اضغطي حجز، هنحوّلك على الواتساب فورًا بكل التفاصيل، وتدفعي ديبوزت بسيط نأكّد بيه أوردرك.",
  },
];

export function BookingSteps() {
  return (
    <section className="bg-gradient-to-b from-cream-100 to-cream-200/60 py-16 sm:py-20">
      <div className="container-zg">
        <SectionHeading
          eyebrow="سهلة وسريعة"
          title="إزاي تحجزي؟"
          subtitle="٣ خطوات بس وتكوني أكّدتي أوردرك مع زُغْرُوطَة."
        />
        <div className="relative mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.12}>
              <div className="relative h-full">
                <div className="card-zg h-full p-7 text-center">
                  <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-shine text-white shadow-glow">
                    <s.icon className="h-8 w-8" />
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-pearl bg-espresso-900 text-sm font-bold text-gold-300">
                      {toArabicDigits(i + 1)}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-espresso-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-espresso-600">{s.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
