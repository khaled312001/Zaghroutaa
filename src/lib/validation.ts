import { z } from "zod";

export const orderSchema = z.object({
  productSlug: z.string().optional(),
  productName: z.string().min(1),
  variantName: z.string().optional(),
  price: z.number().int().nonnegative().optional(),
  customerName: z.string().min(2, "اكتبي اسمك من فضلك"),
  phone: z
    .string()
    .min(8, "رقم الموبايل غير صحيح")
    .max(20, "رقم الموبايل غير صحيح")
    .regex(/^[0-9+\-\s]+$/, "الرقم لازم يكون أرقام بس"),
  governorate: z.string().min(2, "اختاري المحافظة"),
  address: z.string().min(3, "اكتبي العنوان بالتفصيل"),
  groomName: z.string().optional(),
  brideName: z.string().optional(),
  eventType: z.string().optional(),
  eventDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;
