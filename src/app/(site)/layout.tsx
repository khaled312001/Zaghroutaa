import { getSettings } from "@/lib/settings";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsappFab } from "@/components/WhatsappFab";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo";

// الموقع بيقرا من الداتابيز (سعر/ظهور/إعدادات) عشان تعديلات الأدمن تظهر فورًا
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
      <AnnouncementBar text="بنشحن لكل محافظات مصر بأمان وسرعة" />
      <SiteHeader whatsappNumber={settings.whatsappNumber} />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter settings={settings} />
      <WhatsappFab number={settings.whatsappNumber} />
    </>
  );
}
