import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/lib/validation";
import { validateCoupon } from "@/lib/coupons";
import { RUSH_FEE, isRushDate } from "@/lib/rush";
import { shippingCost } from "@/lib/shipping";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = orderSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "بيانات الحجز غير مكتملة" },
        { status: 400 },
      );
    }
    const d = parsed.data;

    let productId: number | null = null;
    if (d.productSlug) {
      const p = await prisma.product.findUnique({
        where: { slug: d.productSlug },
        select: { id: true },
      });
      productId = p?.id ?? null;
    }

    // كود الخصم — إعادة تحقق على السيرفر وتطبيقه على السعر
    let finalPrice = d.price ?? null;
    let couponCode: string | null = null;
    const rawCoupon = typeof json.couponCode === "string" ? json.couponCode : "";
    if (rawCoupon && finalPrice) {
      const chk = await validateCoupon(rawCoupon);
      if (chk.ok) {
        finalPrice = Math.round(finalPrice * (1 - chk.percent / 100));
        couponCode = chk.code;
      }
    }

    // رسوم الاستعجال — لو المناسبة خلال 3 أيام أو أقل
    const rush = !!d.eventDate && isRushDate(d.eventDate);
    if (rush && finalPrice !== null) finalPrice += RUSH_FEE;

    // الشحن التلقائي حسب المحافظة
    const deliveryType = typeof json.deliveryType === "string" ? json.deliveryType : "";
    const shipping = shippingCost(d.governorate, deliveryType);
    if (finalPrice !== null) finalPrice += shipping;

    // أولوية تلقائية للأوردرات المستعجلة (الفرح قريب)
    let priorityBump = 0;
    if (d.eventDate) {
      const target = new Date(d.eventDate);
      target.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const days = Math.round((target.getTime() - today.getTime()) / 86_400_000);
      if (days >= 0 && days <= 3) priorityBump = 3;
      else if (days <= 7) priorityBump = 2;
      else if (days <= 10) priorityBump = 1;
    }

    const order = await prisma.order.create({
      data: {
        productId,
        productName: d.productName,
        variantName: d.variantName || null,
        customerName: d.customerName,
        phone: d.phone,
        governorate: d.governorate,
        address: d.address,
        groomName: d.groomName || null,
        brideName: d.brideName || null,
        eventType: d.eventType || null,
        eventDate: d.eventDate ? new Date(d.eventDate) : null,
        notes: d.notes || null,
        priorityBump,
        price: finalPrice,
        couponCode,
      },
      select: { id: true },
    });

    if (couponCode) {
      await prisma.coupon
        .update({ where: { code: couponCode }, data: { usedCount: { increment: 1 } } })
        .catch(() => {});
    }

    if (d.referenceImage) {
      try {
        await prisma.orderImage.create({
          data: { orderId: order.id, url: d.referenceImage },
        });
      } catch {
        // مش بنوقف الأوردر لو صورة المرجع فشلت
      }
    }

    return NextResponse.json({ ok: true, id: order.id });
  } catch (error) {
    console.error("order create error", error);
    return NextResponse.json(
      { ok: false, error: "حصل خطأ، حاولي تاني أو كلّمينا على واتساب" },
      { status: 500 },
    );
  }
}
