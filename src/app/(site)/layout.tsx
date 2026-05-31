import { getSettings } from "@/lib/settings";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsappFab } from "@/components/WhatsappFab";

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
      <AnnouncementBar text="بنشحن لكل محافظات مصر بأمان وسرعة" />
      <SiteHeader />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter settings={settings} />
      <WhatsappFab number={settings.whatsappNumber} />
    </>
  );
}
