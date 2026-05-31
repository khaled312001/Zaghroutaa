import { Clock, Sparkles, Truck, Heart } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const ITEMS = [
  {
    icon: Clock,
    title: "إنقاذ في الوقت الضيّق",
    text: "فرحك بعد يومين ومستعجلة؟ بنسهر بعد ساعات الشغل ونخلّص أوردرك بالملي وبأعلى جودة.",
  },
  {
    icon: Sparkles,
    title: "هاند ميد بدقة",
    text: "كل قطعة معمولة بإيدينا بدقة ونضافة تقفيل مفيش زيها في مصر عشان تشرّفك قدام الناس.",
  },
  {
    icon: Truck,
    title: "شحن لكل المحافظات",
    text: "بنشحن لكل محافظات مصر بأمان وسرعة لحد عندك، حتى لو إنتي بعيدة.",
  },
  {
    icon: Heart,
    title: "عرايس مبسوطة",
    text: "ريفيوهات بتفرح القلب بتوصلنا كل يوم من عرايس استلمت شغلها وحبّته.",
  },
];

export function ValueProps() {
  return (
    <section className="container-zg py-14 sm:py-16">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {ITEMS.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.08}>
            <div className="card-zg group h-full p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-glow">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-600 transition-colors group-hover:bg-gold-shine group-hover:text-white">
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-espresso-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-espresso-600">{item.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
