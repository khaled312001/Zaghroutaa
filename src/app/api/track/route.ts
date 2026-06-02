import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** الأرقام المهمة من الموبايل (بدون 0 أو مفتاح الدولة) للمطابقة المرنة */
function core(phone: string): string {
  let d = (phone || "").replace(/\D/g, "");
  if (d.startsWith("0020")) d = d.slice(4);
  if (d.startsWith("20")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  return d;
}

export async function POST(req: Request) {
  try {
    const { phone } = await req.json().catch(() => ({}));
    const c = core(String(phone || ""));
    if (c.length < 7) return NextResponse.json({ ok: false, error: "اكتبي رقم موبايل صحيح" });

    const orders = await prisma.order.findMany({
      where: { phone: { contains: c } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true, productName: true, variantName: true, status: true,
        eventDate: true, createdAt: true, brideName: true,
      },
    });

    return NextResponse.json({
      ok: true,
      orders: orders.map((o) => ({
        id: o.id,
        productName: o.productName,
        variantName: o.variantName,
        status: o.status,
        eventDate: o.eventDate ? o.eventDate.toISOString() : null,
        createdAt: o.createdAt.toISOString(),
        brideName: o.brideName,
      })),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "حصل خطأ، حاولي تاني" }, { status: 500 });
  }
}
