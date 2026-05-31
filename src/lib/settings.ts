import "server-only";
import { cache } from "react";
import { prisma } from "./prisma";

export type SiteSettings = {
  whatsappNumber: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  phone: string;
  email: string;
  depositNote: string;
  announcement: string;
  logoUrl: string;
};

export const SETTING_KEYS: (keyof SiteSettings)[] = [
  "whatsappNumber",
  "instagram",
  "tiktok",
  "facebook",
  "phone",
  "email",
  "depositNote",
  "announcement",
  "logoUrl",
];

export const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201000000000",
  instagram: "",
  tiktok: "",
  facebook: "",
  phone: "",
  email: "eman@zaghroutaa.com",
  depositNote: "بنأكّد الحجز بعد دفع ديبوزت بسيط، والباقي عند الاستلام.",
  announcement: "بننقذ العرايس في الوقت الضيّق — وبنشحن لكل المحافظات بأمان وسرعة",
  logoUrl: "/logo.png",
};

export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const rows = await prisma.setting.findMany();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    const result = { ...DEFAULT_SETTINGS };
    for (const key of SETTING_KEYS) {
      if (map[key] !== undefined && map[key] !== "") {
        (result as Record<string, string>)[key] = map[key];
      }
    }
    return result;
  } catch {
    return DEFAULT_SETTINGS;
  }
});
