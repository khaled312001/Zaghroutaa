import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/lib/validation";

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

    const order = await prisma.order.create({
      data: {
        productId,
        productName: d.productName,
        variantName: d.variantName || null,
        price: d.price ?? null,
        customerName: d.customerName,
        phone: d.phone,
        governorate: d.governorate,
        address: d.address,
        groomName: d.groomName || null,
        brideName: d.brideName || null,
        eventType: d.eventType || null,
        eventDate: d.eventDate ? new Date(d.eventDate) : null,
        notes: d.notes || null,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: order.id });
  } catch (error) {
    console.error("order create error", error);
    return NextResponse.json(
      { ok: false, error: "حصل خطأ، حاولي تاني أو كلّمينا على واتساب" },
      { status: 500 },
    );
  }
}
