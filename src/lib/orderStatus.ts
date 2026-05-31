export type OrderStatusKey =
  | "NEW"
  | "CONTACTED"
  | "CONFIRMED"
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
  "DONE",
  "CANCELLED",
];
