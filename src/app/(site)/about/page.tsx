import type { Metadata } from "next";
import Image from "next/image";
import { Gem, HeartHandshake, Sparkles } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ValueProps } from "@/components/home/ValueProps";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "عننا — أول براند مصري وعربي لإكسسوارات العرايس الهاند ميد",
  description:
    "زُغْرُوطَة — قصة شغف بتفاصيل العروسة. أول وأكبر براند مصري وعربي متخصص في إكسسوارات العرايس الهاند ميد لكتب الكتاب والفرح، بشغل متقن وتقفيل نضيف وشحن لكل المحافظات.",
  keywords: [
    "زغروطة", "عن زغروطة", "براند اكسسوارات العرايس", "هاند ميد مصر",
    "اكسسوارات العروسة", "كتب الكتاب", "العروسة المصرية",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    title: "عن زُغْرُوطَة",
    images: [{ url: "/pages/about.png", alt: "تشكيلة زُغْرُوطَة الهاند ميد للعروسة" }],
  },
};

const OFFERS = [
  {
    icon: Gem,
    title: "قطع هاند ميد فاخرة",
    text: "مناديل كتب الكتاب المطرّزة، تابلوهات البصمة، المرايات المرصّعة باللؤلؤ والبوكيهات — كلها معمولة بإيدينا.",
  },
  {
    icon: Sparkles,
    title: "تفصيل حسب طلبك",
    text: "بنعمل قطع منفردة متميزة حسب طلب العروسة والمقاس اللي تحبه، مع تطريز الاسم والتاريخ.",
  },
  {
    icon: HeartHandshake,
    title: "إنقاذ في الوقت الضيّق",
    text: "بننقذ العرايس المستعجلة، بنسهر بعد ساعات الشغل ونخلّص الأوردر بالملي ونشحن لكل المحافظات.",
  },
];

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHeader
        eyebrow="اتعرّفي علينا"
        title="مين زُغْرُوطَة؟"
        subtitle="براند مصري متخصص في كل حاجة تخص العروسة في كتب الكتاب والفرح."
      />

      <section className="container-zg py-14 sm:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="relative">
              <div className="pointer-events-none absolute -inset-3 rounded-[2.5rem] border border-gold-200/50" />
              <div className="relative overflow-hidden rounded-[2rem] border-4 border-pearl shadow-glow">
                <div className="relative aspect-[3/2]">
                  <Image
                    src="/pages/about.png"
                    alt="تشكيلة زُغْرُوطَة الهاند ميد للعروسة — بصمة ومراية ومنديل وبوكيه وأقلام"
                    fill
                    sizes="(max-width:1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <span className="divider-ornament justify-start">
              <span className="text-sm font-bold text-gold-600">حكايتنا</span>
            </span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              عشان العروسة تكون <span className="text-gold-gradient">مختلفة</span> في يومها
            </h2>
            <div className="mt-4 space-y-3 leading-relaxed text-espresso-600">
              <p>
                زُغْرُوطَة اتولدت من شغف بتفاصيل العروسة الصغيرة اللي بتعمل فرق كبير
                في يوم العمر. بنعمل قطع هاند ميد مميزة جدًا ومعمولة بدقة ونضافة تقفيل
                مفيش زيها في مصر.
              </p>
              <p>
                بنعمل باكدجات متكاملة لكتب الكتاب والفرح، وكمان قطع منفردة متميزة
                حسب طلب العروسة — زي مرايات العروسة الهاند ميد المطرّزة بالاستراس
                واللؤلؤ، ومراوح الفوتوسيشن بالريش والدانتيل اللي بتخطف العين.
              </p>
              <p>
                وأهم حاجة بتميّزنا إننا بننقذ العرايس في الوقت الضيّق، وبنشحن لكل
                المحافظات بأمان وسرعة، والعملاء دايمًا بيبعتولنا ريفيوهات تفرح القلب
                بعد الاستلام.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-zg pb-4">
        <SectionHeading eyebrow="بنقدّم إيه؟" title="كل اللي العروسة محتاجاه" />
        <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:gap-6">
          {OFFERS.map((o, i) => (
            <Reveal key={o.title} delay={i * 0.08}>
              <div className="card-zg h-full p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-600">
                  <o.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-espresso-900">{o.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-espresso-600">{o.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <ValueProps />
      <FinalCta whatsappNumber={settings.whatsappNumber} />
    </>
  );
}
