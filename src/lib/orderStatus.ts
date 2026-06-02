export type OrderStatusKey =
  | "NEW"
  | "CONTACTED"
  | "CONFIRMED"
  | "EMBROIDERING"
  | "PACKING"
  | "SHIPPING"
  | "DONE"
  | "CANCELLED";

export const ORDER_STATUS: Record<
  OrderStatusKey,
  { label: string; badge: string; dot: string }
> = {
  NEW: {
    label: "جديد",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  CONTACTED: {
    label: "تم التواصل",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  CONFIRMED: {
    label: "مؤكّد",
    badge: "bg-violet-100 text-violet-700",
    dot: "bg-violet-500",
  },
  EMBROIDERING: {
    label: "جاري التطريز",
    badge: "bg-indigo-100 text-indigo-700",
    dot: "bg-indigo-500",
  },
  PACKING: {
    label: "جاري التغليف",
    badge: "bg-cyan-100 text-cyan-700",
    dot: "bg-cyan-500",
  },
  SHIPPING: {
    label: "مع الشحن",
    badge: "bg-teal-100 text-teal-700",
    dot: "bg-teal-500",
  },
  DONE: {
    label: "تم التسليم",
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
  CANCELLED: {
    label: "ملغي",
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
  },
};

export const ORDER_STATUS_KEYS: OrderStatusKey[] = [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "EMBROIDERING",
  "PACKING",
  "SHIPPING",
  "DONE",
  "CANCELLED",
];

/** مراحل التتبع اللي بتظهر للعروسة */
export const TRACK_STAGES = [
  { label: "تأكيد الحجز", icon: "check" },
  { label: "جاري التطريز", icon: "needle" },
  { label: "جاري التغليف", icon: "gift" },
  { label: "مع الشحن", icon: "truck" },
  { label: "تم التسليم", icon: "home" },
] as const;

/** مرحلة التتبع الحالية حسب حالة الأوردر (−2 = ملغي، −1 = لسه بنراجع) */
export function trackStageIndex(status: OrderStatusKey): number {
  switch (status) {
    case "CANCELLED":
      return -2;
    case "NEW":
    case "CONTACTED":
      return -1;
    case "CONFIRMED":
      return 0;
    case "EMBROIDERING":
      return 1;
    case "PACKING":
      return 2;
    case "SHIPPING":
      return 3;
    case "DONE":
      return 4;
    default:
      return -1;
  }
}
