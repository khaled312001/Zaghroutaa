import { CONTENT_FIELDS, getContentMap } from "@/lib/content";
import { ContentManager } from "@/components/admin/ContentManager";

export const dynamic = "force-dynamic";

export default async function ContentAdminPage() {
  const values = await getContentMap();

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-espresso-900 sm:text-3xl">محتوى الموقع</h1>
        <p className="mt-1 text-sm text-espresso-500">
          تحكّمي في نصوص وصور صفحات الموقع — أي تعديل بيظهر على طول. سيبي الخانة فاضية عشان ترجع للنص الافتراضي.
        </p>
      </header>
      <ContentManager fields={CONTENT_FIELDS} values={values} />
    </div>
  );
}
