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

/** يطهّر رقم الواتساب ويبني رابط wa.me */
export function buildWhatsappUrl(rawNumber: string, message?: string): string {
  const n = (rawNumber || "").replace(/\D/g, "");
  const base = `https://wa.me/${n}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
