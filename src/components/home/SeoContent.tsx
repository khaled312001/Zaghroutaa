import Link from "next/link";
import { ChevronDown, BadgeCheck } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";

const KEYWORDS: { label: string; href: string }[] = [
  { label: "منديل كتب الكتاب المطرّز", href: "/products?cat=handkerchiefs" },
  { label: "منديل كتب كتاب بالاستراس", href: "/products?cat=handkerchiefs" },
  { label: "تابلوه بصمة كتب الكتاب", href: "/products?cat=fingerprints" },
  { label: "تابلوه بصمة بالبرواز", href: "/products?cat=fingerprints" },
  { label: "مراية العروسة باللؤلؤ", href: "/products?cat=mirrors" },
  { label: "بوكيه برايد هاند ميد", href: "/products?cat=bouquets" },
  { label: "نظارة برايد", href: "/products?cat=accessories" },
  { label: "روب وبجامة العروسة", href: "/products?cat=sleepwear" },
  { label: "أقلام كتب الكتاب", href: "/products?cat=accessories" },
  { label: "مراوح الفوتوسيشن بالريش", href: "/products?cat=photoshoot" },
  { label: "كروكس عروسة مرصّع لؤلؤ", href: "/products?cat=footwear" },
  { label: "سليبر العريس والعروسة", href: "/products?cat=footwear" },
  { label: "ديكور ومكرامية هاند ميد", href: "/products" },
  { label: "باكدج العروسة الكامل", href: "/packages" },
  { label: "صممي باكدجك بنفسك", href: "/build" },
  { label: "باكدج كتب كتاب مستعجل", href: "/packages" },
];

const FAQ = [
  {
    q: "زُغْرُوطَة بتقدّم إيه للعروسة؟",
    a: "زُغْرُوطَة هي أول براند مصري وعربي متخصص في إكسسوارات العرايس الهاند ميد لكتب الكتاب والفرح. بنعمل مناديل كتب الكتاب المطرّزة بالاسم والتاريخ، تابلوهات البصمة بالأكريليك والزجاج والخشب، مرايات العروسة المرصّعة باللؤلؤ والكريستال، بوكيهات البرايد، نظارات وأقلام وروب العروسة، وكل تجهيزات العروسة بشغل هاند ميد متقن.",
  },
  {
    q: "بتشحنوا لكل محافظات مصر؟",
    a: "أيوه، بنشحن لكل محافظات مصر بأمان وسرعة لحد عندك، سواء كنتي في القاهرة، الإسكندرية، الجيزة أو أي محافظة تانية.",
  },
  {
    q: "بتعملوا أوردرات مستعجلة في الوقت الضيّق؟",
    a: "آه، ده أكتر حاجة بتميّزنا. لو فرحك أو كتب كتابك بعد يومين ومستعجلة، بنسهر بعد ساعات الشغل ونخلّص أوردرك بالملي وبأعلى جودة في الوقت المناسب.",
  },
  {
    q: "إزاي أحجز أوردر من الموقع؟",
    a: "اختاري المنتج أو الباكدج اللي عجبك واضغطي «احجزي»، املي بياناتك واسم العروسين وتاريخ المناسبة، والموقع هيحوّلك على الواتساب فورًا بكل التفاصيل عشان تأكّدي الحجز وتدفعي ديبوزت بسيط.",
  },
  {
    q: "بتكتبوا اسم العروسين والتاريخ على الشغل؟",
    a: "طبعًا، بنطرّز ونكتب اسم العروسين وتاريخ كتب الكتاب أو الفرح على المناديل والبصمات والمرايات وباقي القطع عشان تبقى ذكرى خاصة بيكم.",
  },
  {
    q: "بتعملوا تصميمات وقطع حسب الطلب؟",
    a: "أيوه، بنعمل قطع منفردة متميزة حسب طلب العروسة والمقاس والذوق اللي تحبه، زي مرايات العروسة الهاند ميد المطرّزة بالاستراس واللؤلؤ ومراوح الفوتوسيشن بالريش.",
  },
  {
    q: "أسعار باكدجات وإكسسوارات العروسة كام؟",
    a: "عندنا باكدج العروسة الكامل وقطع منفردة بأسعار تناسب الجميع، وكل منتج مكتوب سعره على صفحته. تقدري تتصفّحي كل المنتجات والأسعار من صفحة المنتجات.",
  },
];

export function SeoContent() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section className="bg-gradient-to-b from-cream-100 to-cream-50 py-16 sm:py-20">
      <JsonLd data={faqLd} />
      <div className="container-zg">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="chip mx-auto border border-gold-200 bg-pearl text-gold-700">
            <BadgeCheck className="h-4 w-4" /> الأول في مصر والوطن العربي
          </span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            زُغْرُوطَة — إكسسوارات العرايس الهاند ميد لكتب الكتاب والفرح
          </h2>
          <div className="mt-4 space-y-3 text-right leading-relaxed text-espresso-600">
            <p>
              <strong className="text-espresso-800">زُغْرُوطَة</strong> هي أول
              وأكبر براند مصري وعربي متخصص في تقديم{" "}
              <strong className="text-espresso-800">إكسسوارات العرايس الهاند ميد</strong>{" "}
              لكتب الكتاب والفرح. بنجمّع لكل عروسة كل اللي محتاجاه في يومها من
              منديل كتب كتاب مطرّز بالاسم والتاريخ، تابلوه بصمة شيك، مراية عروسة
              مرصّعة باللؤلؤ والكريستال، بوكيه برايد هاند ميد، نظارة برايد، أقلام
              كتب الكتاب، وروب وبجامة العروسة — كله بشغل هاند ميد وتقفيل وتشطيب
              نضيف مفيش زيه في مصر.
            </p>
            <p>
              سواء بتدوّري على{" "}
              <strong className="text-espresso-800">تجهيزات العروسة</strong>،
              هدايا الفرح، مستلزمات كتب الكتاب، أو قطع فوتوسيشن راقية زي مراوح
              الريش وطوق اللؤلؤ — هتلاقي عندنا تشكيلة متكاملة بأسعار تناسب الجميع،
              مع إمكانية تفصيل أي قطعة حسب طلبك، وشحن لكل محافظات مصر بأمان وسرعة.
            </p>
          </div>
        </Reveal>

        {/* كلمات مفتاحية كروابط داخلية */}
        <Reveal delay={0.1} className="mt-8 flex flex-wrap justify-center gap-2">
          {KEYWORDS.map((k) => (
            <Link
              key={k.label}
              href={k.href}
              className="rounded-full border border-gold-200 bg-pearl px-4 py-2 text-sm font-medium text-espresso-700 transition-colors hover:border-gold-300 hover:bg-gold-50 hover:text-gold-700"
            >
              {k.label}
            </Link>
          ))}
        </Reveal>

        {/* الأسئلة الشائعة */}
        <div className="mx-auto mt-14 max-w-3xl">
          <SectionHeading eyebrow="أسئلة شائعة" title="أكتر أسئلة العرايس" />
          <div className="mt-8 space-y-3">
            {FAQ.map((f) => (
              <details
                key={f.q}
                className="group card-zg overflow-hidden p-0"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4 font-bold text-espresso-900 marker:content-none">
                  {f.q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-gold-500 transition-transform group-open:rotate-180" />
                </summary>
                <p className="border-t border-gold-100 px-5 py-4 leading-relaxed text-espresso-600">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
