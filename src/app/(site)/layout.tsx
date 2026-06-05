import { getSettings } from "@/lib/settings";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsappFab } from "@/components/WhatsappFab";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo";

// ISR: الصفحات بتتخزن في الكاش وبتتجدد كل 60 ثانية —
// كدا تعديلات الأدمن بتظهر خلال دقيقة، والسيرفر مش بيتحمل فوق طاقته.
export const revalidate = 60;

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
