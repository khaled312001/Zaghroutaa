import "server-only";
import { cache } from "react";
import { prisma } from "./prisma";

export type ContentType = "text" | "longtext" | "image";

export type ContentField = {
  key: string;
  type: ContentType;
  groupAr: string;
  labelAr: string;
  default: string;
  order: number;
};

/**
 * كل المحتوى القابل للتعديل من لوحة الأدمن، مرتّب حسب الصفحة.
 * الأدمن يقدر يغيّر النص أو الصورة، ولو ساب القيمة فاضية بيرجع للافتراضي.
 */
export const CONTENT_FIELDS: ContentField[] = [
  // ===== الصفحة الرئيسية — الهيرو =====
  { key: "hero_badge", type: "text", groupAr: "الرئيسية — الهيرو", labelAr: "الشارة أعلى الهيرو", order: 1, default: "الأول في مصر والوطن العربي لإكسسوارات العرايس الهاند ميد" },
  { key: "hero_title_1", type: "text", groupAr: "الرئيسية — الهيرو", labelAr: "العنوان (سطر ١)", order: 2, default: "عشان العروسة تكون" },
  { key: "hero_title_highlight", type: "text", groupAr: "الرئيسية — الهيرو", labelAr: "الكلمة المميّزة (ذهبي)", order: 3, default: "مختلفة" },
  { key: "hero_title_2", type: "text", groupAr: "الرئيسية — الهيرو", labelAr: "العنوان (سطر ٢)", order: 4, default: "في يوم العمر" },
  { key: "hero_subtitle", type: "longtext", groupAr: "الرئيسية — الهيرو", labelAr: "الوصف تحت العنوان", order: 5, default: "كل حاجة تخص العروسة في كتب الكتاب والفرح — مناديل مطرّزة، بصمات، مرايات وبوكيهات هاند ميد معمولة بدقة ونضافة تقفيل مفيش زيها في مصر." },
  { key: "hero_image", type: "image", groupAr: "الرئيسية — الهيرو", labelAr: "صورة الهيرو", order: 6, default: "/pages/about.png" },

  // ===== صفحة من نحن =====
  { key: "about_title", type: "text", groupAr: "صفحة من نحن", labelAr: "عنوان القصة", order: 1, default: "عشان العروسة تكون مختلفة في يومها" },
  { key: "about_p1", type: "longtext", groupAr: "صفحة من نحن", labelAr: "الفقرة الأولى", order: 2, default: "زُغْرُوطَة اتولدت من شغف بتفاصيل العروسة الصغيرة اللي بتعمل فرق كبير في يوم العمر. بنعمل قطع هاند ميد مميزة جدًا ومعمولة بدقة ونضافة تقفيل مفيش زيها في مصر." },
  { key: "about_p2", type: "longtext", groupAr: "صفحة من نحن", labelAr: "الفقرة الثانية", order: 3, default: "بنعمل باكدجات متكاملة لكتب الكتاب والفرح، وكمان قطع منفردة متميزة حسب طلب العروسة — زي مرايات العروسة الهاند ميد المطرّزة بالاستراس واللؤلؤ، ومراوح الفوتوسيشن بالريش والدانتيل اللي بتخطف العين." },
  { key: "about_p3", type: "longtext", groupAr: "صفحة من نحن", labelAr: "الفقرة الثالثة", order: 4, default: "وأهم حاجة بتميّزنا إننا بننقذ العرايس في الوقت الضيّق، وبنشحن لكل المحافظات بأمان وسرعة، والعملاء دايمًا بيبعتولنا ريفيوهات تفرح القلب بعد الاستلام." },
  { key: "about_image", type: "image", groupAr: "صفحة من نحن", labelAr: "صورة صفحة من نحن", order: 5, default: "/pages/about.png" },

  // ===== صفحة الباكدجات =====
  { key: "package_image", type: "image", groupAr: "صفحة الباكدجات", labelAr: "صورة الباكدج", order: 1, default: "/pages/packages.png" },

  // ===== صفحة تواصل =====
  { key: "contact_image", type: "image", groupAr: "صفحة تواصل", labelAr: "صورة صفحة التواصل", order: 1, default: "/pages/contact.png" },
];

const DEFAULTS = Object.fromEntries(CONTENT_FIELDS.map((f) => [f.key, f.default]));

export type ContentMap = Record<string, string>;

export const getContentMap = cache(async (): Promise<ContentMap> => {
  const map: ContentMap = { ...DEFAULTS };
  try {
    const rows = await prisma.content.findMany();
    for (const r of rows) {
      if (r.value && r.value.trim() !== "") map[r.key] = r.value;
    }
  } catch {
    // فولباك للقيم الافتراضية
  }
  return map;
});

export function contentDefault(key: string): string {
  return DEFAULTS[key] ?? "";
}
