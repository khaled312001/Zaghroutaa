import Image from "next/image";
import { Quote } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { toArabicDigits } from "@/data/catalog";

const STATS = [
  { value: "+٥٠٠", label: "عروسة سعيدة" },
  { value: "٢٧", label: "محافظة بنشحن لها" },
  { value: "٢٤/٧", label: "بنرد على استفساراتك" },
];

export function WhyUs() {
  return (
    <section className="container-zg py-14 sm:py-16">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <div className="relative">
            <div className="relative aspect-[5/6] overflow-hidden rounded-[2rem] border-4 border-pearl shadow-glow">
              <Image
                src="/products/katb-ketab-handkerchief/katb-ketab-handkerchief-01.jpg"
                alt="شغل زُغْرُوطَة الهاند ميد"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 right-6 hidden max-w-[16rem] rounded-2xl border border-gold-200 bg-pearl/95 p-4 shadow-card backdrop-blur sm:block">
              <Quote className="h-6 w-6 text-gold-400" />
              <p className="mt-2 text-sm font-medium leading-relaxed text-espresso-700">
                "جميلة تسلم إيدك، الشغل تمام والتوتر راح بفضل زُغْرُوطَة"
              </p>
              <span className="mt-1 block text-xs text-gold-600">— عروسة من عرايسنا</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <span className="divider-ornament justify-start">
            <span className="text-sm font-bold text-gold-600">قصتنا</span>
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            شغل من القلب، لعروسة <span className="text-gold-gradient">مميزة</span>
          </h2>
          <div className="mt-4 space-y-3 leading-relaxed text-espresso-600">
            <p>
              زُغْرُوطَة متخصصة في كل حاجة تخص العروسة في كتب الكتاب والفرح. بنعمل
              قطع هاند ميد مميزة جدًا ومعمولة بدقة ونضافة تقفيل مفيش زيها في مصر،
              عشان العروسة تكون مختلفة في يومها وتشرّف قدام الناس.
            </p>
            <p>
              وأهم حاجة بتميّزنا إننا بننقذ العرايس في الوقت الضيّق — لو فرحك بعد
              يومين ومستعجلة وخايفة تطلبي أونلاين، بنسهر بعد ساعات الشغل ونخلّصلك
              الأوردر بالملي وبأعلى جودة، وبنشحن لكل المحافظات بأمان وسرعة.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="card-zg p-4 text-center">
                <div className="font-display text-2xl font-extrabold text-gold-gradient sm:text-3xl">
                  {toArabicDigits(s.value)}
                </div>
                <div className="mt-1 text-xs text-espresso-600">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
