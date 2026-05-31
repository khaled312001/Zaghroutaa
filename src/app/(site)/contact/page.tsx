import type { Metadata } from "next";
import Image from "next/image";
import { MessageCircle, Phone, Mail, MapPin, Clock, Instagram, Facebook } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getContentMap } from "@/lib/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/ContactForm";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { toArabicDigits } from "@/data/catalog";

export const metadata: Metadata = {
  title: "تواصلي معانا — زُغْرُوطَة لإكسسوارات العرايس",
  description:
    "كلّمي زُغْرُوطَة على واتساب أو ابعتيلنا رسالة لحجز إكسسوارات العروسة الهاند ميد وتجهيزات كتب الكتاب والفرح — إحنا في خدمتك على مدار اليوم وبنشحن لكل المحافظات.",
  keywords: ["تواصل زغروطة", "حجز اكسسوارات العروسة", "واتساب زغروطة", "تجهيزات العروسة"],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "تواصلي مع زُغْرُوطَة",
    images: [{ url: "/pages/contact.png", alt: "تواصلي مع زُغْرُوطَة" }],
  },
};

export default async function ContactPage() {
  const settings = await getSettings();
  const content = await getContentMap();
  const wa = buildWhatsappUrl(
    settings.whatsappNumber,
    "السلام عليكم، حابة أستفسر عن منتجات زُغْرُوطَة",
  );

  return (
    <>
      <PageHeader
        eyebrow="إحنا في خدمتك"
        title="تواصلي معانا"
        subtitle="أي استفسار أو طلب خاص؟ كلّمينا على واتساب على طول، أو ابعتيلنا رسالة."
      />

      <div className="container-zg pt-8">
        <Reveal>
          <div className="mx-auto max-w-md overflow-hidden rounded-[2rem] border-4 border-pearl shadow-glow">
            <div className="relative aspect-square">
              <Image
                src={content.contact_image}
                alt="تواصلي مع زُغْرُوطَة على واتساب"
                fill
                sizes="(max-width:768px) 100vw, 448px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </Reveal>
      </div>

      <div className="container-zg grid gap-8 py-10 lg:grid-cols-2">
        <Reveal>
          <div className="space-y-4">
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="card-zg flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25D366] text-white">
                <MessageCircle className="h-7 w-7" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-espresso-900">واتساب</h3>
                <p className="text-sm text-espresso-600">أسرع طريقة للرد على استفساراتك وحجزك</p>
              </div>
            </a>

            {settings.phone && (
              <a href={`tel:${settings.phone}`} className="card-zg flex items-center gap-4 p-5">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-600">
                  <Phone className="h-7 w-7" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-espresso-900">اتصال</h3>
                  <p dir="ltr" className="text-sm text-espresso-600">{toArabicDigits(settings.phone)}</p>
                </div>
              </a>
            )}

            {settings.email && (
              <a href={`mailto:${settings.email}`} className="card-zg flex items-center gap-4 p-5">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-600">
                  <Mail className="h-7 w-7" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-espresso-900">إيميل</h3>
                  <p dir="ltr" className="text-sm text-espresso-600">{settings.email}</p>
                </div>
              </a>
            )}

            <div className="card-zg flex items-center gap-4 p-5">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-600">
                <MapPin className="h-7 w-7" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-espresso-900">الشحن</h3>
                <p className="text-sm text-espresso-600">بنشحن لكل محافظات مصر بأمان وسرعة</p>
              </div>
            </div>

            <div className="card-zg flex items-center gap-4 p-5">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-600">
                <Clock className="h-7 w-7" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-espresso-900">مواعيد الرد</h3>
                <p className="text-sm text-espresso-600">بنرد على مدار اليوم، وبنسهر للأوردرات المستعجلة</p>
              </div>
            </div>

            {(settings.instagram || settings.facebook) && (
              <div className="flex items-center gap-3 pt-1">
                {settings.instagram && (
                  <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="انستجرام" className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold-200 bg-pearl text-gold-600 hover:bg-gold-50">
                    <Instagram className="h-6 w-6" />
                  </a>
                )}
                {settings.facebook && (
                  <a href={settings.facebook} target="_blank" rel="noopener noreferrer" aria-label="فيسبوك" className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold-200 bg-pearl text-gold-600 hover:bg-gold-50">
                    <Facebook className="h-6 w-6" />
                  </a>
                )}
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ContactForm whatsappNumber={settings.whatsappNumber} />
        </Reveal>
      </div>
    </>
  );
}
