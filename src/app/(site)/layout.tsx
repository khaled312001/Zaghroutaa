import { getSettings } from "@/lib/settings";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsappFab } from "@/components/WhatsappFab";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo";

// رندر ديناميكي وقت الطلب (مش وقت الـ build) — كدا:
// 1) الـ build على الاستضافة المشتركة مش بيشغّل استعلامات الداتابيز في عامل البناء (كان بيعمل crash).
// 2) تعديلات الأدمن بتظهر فورًا. الصفحات لسه بتترندر كاملة من السيرفر (SEO زي ما هو).
export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <>
      <JsonLd
        data={[
          organizationSchema({
            whatsappNumber: settings.whatsappNumber,
            instagram: settings.instagram,
            facebook: settings.facebook,
            tiktok: settings.tiktok,
          }),
          websiteSchema(),
        ]}
      />
      <AnnouncementBar settings={settings} />
      <SiteHeader whatsappNumber={settings.whatsappNumber} logoUrl={settings.logoUrl} />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter settings={settings} />
      <WhatsappFab number={settings.whatsappNumber} />
      <ChatWidget whatsappNumber={settings.whatsappNumber} />
    </>
  );
}
