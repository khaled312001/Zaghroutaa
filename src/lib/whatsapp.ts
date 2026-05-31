import { formatPriceEGP } from "./utils";

export type BookingInfo = {
  productName: string;
  variantName?: string;
  price?: number;
  customerName: string;
  phone: string;
  governorate: string;
  address: string;
  groomName?: string;
  brideName?: string;
  eventType?: string;
  eventDate?: string;
  notes?: string;
};

/** يبني رسالة الواتساب اللي بتترسل بضغطة واحدة لتأكيد الحجز */
export function buildWhatsappMessage(b: BookingInfo): string {
  const lines = [
    "✨ حجز جديد من موقع زُغْرُوطَة ✨",
    "ـــــــــــــــــــــــــــــــ",
    `🛍️ المنتج: ${b.productName}${b.variantName ? " — " + b.variantName : ""}`,
    b.price ? `💰 السعر: ${formatPriceEGP(b.price)}` : "",
    "",
    `👰🏻 اسم العروسة: ${b.brideName || "—"}`,
    `🤵🏻 اسم العريس: ${b.groomName || "—"}`,
    b.eventType ? `📜 المناسبة: ${b.eventType}` : "",
    b.eventDate ? `📅 التاريخ: ${b.eventDate}` : "",
    "ـــــــــــــــــــــــــــــــ",
    `🙋🏻‍♀️ الاسم: ${b.customerName}`,
    `📞 الموبايل: ${b.phone}`,
    `📍 المحافظة: ${b.governorate}`,
    `🏠 العنوان: ${b.address}`,
    b.notes ? `📝 ملاحظات: ${b.notes}` : "",
    "ـــــــــــــــــــــــــــــــ",
    "حابة أأكّد الحجز وأدفع الديبوزت 💕",
  ].filter(Boolean);
  return lines.join("\n");
}

/**
 * يطبّع رقم الواتساب للصيغة الدولية اللي wa.me بيفهمها.
 * بيحوّل الرقم المصري المحلي (مثال 01224244401) لـ 201224244401 تلقائيًا.
 */
export function normalizeWhatsappNumber(raw: string): string {
  let d = (raw || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2); // 00201... → 201...
  if (d.startsWith("0")) d = "20" + d.slice(1); // 01224244401 → 201224244401 (مصر)
  return d;
}

/** يبني رابط wa.me برقم متظبّط ورسالة جاهزة */
export function buildWhatsappUrl(rawNumber: string, message?: string): string {
  const n = normalizeWhatsappNumber(rawNumber);
  const base = `https://wa.me/${n}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
