/**
 * حساب الشحن التلقائي حسب المحافظة — أسعار زُغْرُوطَة.
 */

// القاهرة الكبرى — فيها اختيار نوع التوصيل
export const CAIRO_AREA = ["القاهرة", "الجيزة", "القليوبية"];

export const DELIVERY_OPTIONS = [
  { key: "metro", label: "محطة مترو / استلام قريب", price: 60 },
  { key: "home", label: "توصيل لحد البيت", price: 100 },
  { key: "newcity", label: "المدن الجديدة (التجمّع/أكتوبر/زايد/الشروق/العبور)", price: 120 },
] as const;

const SHIP_150 = [
  "الإسكندرية", "الدقهلية", "الشرقية", "الغربية", "المنوفية", "كفر الشيخ",
  "البحيرة", "دمياط", "بورسعيد", "الإسماعيلية", "السويس",
  "الفيوم", "بني سويف", "المنيا", "أسيوط",
];

const SHIP_200 = [
  "سوهاج", "قنا", "الأقصر", "أسوان",
  "شمال سيناء", "جنوب سيناء", "البحر الأحمر", "الوادي الجديد", "مطروح",
];

export function isCairoArea(gov?: string | null): boolean {
  return !!gov && CAIRO_AREA.includes(gov);
}

/** سعر الشحن حسب المحافظة (وللقاهرة الكبرى حسب نوع التوصيل) */
export function shippingCost(gov?: string | null, deliveryType?: string | null): number {
  if (!gov) return 0;
  if (isCairoArea(gov)) {
    const opt = DELIVERY_OPTIONS.find((o) => o.key === deliveryType) || DELIVERY_OPTIONS[0];
    return opt.price;
  }
  if (SHIP_150.includes(gov)) return 150;
  if (SHIP_200.includes(gov)) return 200;
  return 150; // افتراضي آمن لأي محافظة مش متغطّاة
}
