import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsAdminPage() {
  const rows = await prisma.setting.findMany();
  const values = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-espresso-900 sm:text-3xl">الإعدادات</h1>
        <p className="mt-1 text-sm text-espresso-500">رقم الواتساب وبيانات التواصل والسوشيال ميديا.</p>
      </header>
      <SettingsForm values={values} />
    </div>
  );
}
