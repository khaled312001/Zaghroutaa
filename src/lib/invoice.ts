export type InvoiceItem = { name: string; qty: number; unit: number };

export type InvoiceData = {
  orderId?: number | string;
  customerName: string;
  phone: string;
  governorate: string;
  address: string;
  brideName?: string;
  groomName?: string;
  eventType?: string;
  eventDate?: string;
  items: InvoiceItem[];
  discountLabel?: string;
  discountAmount?: number;
  rushFee?: number;
  total: number;
  logoUrl?: string;
};

function egp(n: number): string {
  return new Intl.NumberFormat("ar-EG").format(Math.round(n)) + " ج";
}

/**
 * يبني فاتورة PDF منظّمة فيها اللوجو والتفاصيل، وينزّلها تلقائيًا على جهاز العميلة.
 * (بنرسم HTML عربي ونصوّره بـ html2canvas عشان العربي يطلع مظبوط، وبعدين jsPDF)
 */
export async function downloadInvoice(data: InvoiceData): Promise<void> {
  if (typeof window === "undefined") return;
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const date = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  const ref = data.orderId ? String(data.orderId) : Date.now().toString().slice(-6);
  const subtotal = data.items.reduce((s, i) => s + i.unit * i.qty, 0);

  const rows = data.items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;">${i.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center;">${i.qty}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:left;">${egp(i.unit * i.qty)}</td>
      </tr>`,
    )
    .join("");

  const el = document.createElement("div");
  el.setAttribute("dir", "rtl");
  el.style.cssText =
    "position:fixed;left:-99999px;top:0;width:794px;background:#ffffff;font-family:var(--font-body),'Tajawal',Arial,sans-serif;color:#3a2e25;padding:48px;box-sizing:border-box;line-height:1.5;";
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #cda15a;padding-bottom:20px;">
      <div style="display:flex;align-items:center;gap:14px;">
        <img src="${data.logoUrl || "/logo.png"}" crossorigin="anonymous" style="height:64px;width:auto;object-fit:contain;" />
        <div>
          <div style="font-size:26px;font-weight:800;color:#a4762f;">زُغْرُوطَة</div>
          <div style="font-size:13px;color:#9a8b7a;">إكسسوارات العرايس الهاند ميد</div>
        </div>
      </div>
      <div style="text-align:left;">
        <div style="font-size:22px;font-weight:800;color:#a4762f;">فاتورة طلب</div>
        <div style="font-size:13px;color:#6b5d50;">رقم الطلب: ${ref}</div>
        <div style="font-size:13px;color:#6b5d50;">التاريخ: ${date}</div>
      </div>
    </div>

    <div style="display:flex;gap:20px;margin-top:24px;">
      <div style="flex:1;background:#faf6ef;border-radius:14px;padding:16px;">
        <div style="font-weight:700;color:#a4762f;margin-bottom:8px;">بيانات العميلة</div>
        <div style="font-size:14px;line-height:1.95;">
          <div><b>الاسم:</b> ${data.customerName}</div>
          <div><b>الموبايل:</b> ${data.phone}</div>
          <div><b>المحافظة:</b> ${data.governorate}</div>
          <div><b>العنوان:</b> ${data.address}</div>
        </div>
      </div>
      <div style="flex:1;background:#faf6ef;border-radius:14px;padding:16px;">
        <div style="font-weight:700;color:#a4762f;margin-bottom:8px;">تفاصيل المناسبة</div>
        <div style="font-size:14px;line-height:1.95;">
          ${data.brideName || data.groomName ? `<div><b>العروسين:</b> ${data.brideName || "-"} و ${data.groomName || "-"}</div>` : ""}
          ${data.eventType ? `<div><b>المناسبة:</b> ${data.eventType}</div>` : ""}
          ${data.eventDate ? `<div><b>التاريخ:</b> ${data.eventDate}</div>` : ""}
          ${!data.brideName && !data.groomName && !data.eventType && !data.eventDate ? `<div style="color:#9a8b7a;">—</div>` : ""}
        </div>
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-top:24px;font-size:14px;">
      <thead>
        <tr style="background:#cda15a;color:#fff;">
          <th style="padding:12px;text-align:right;">المنتج</th>
          <th style="padding:12px;text-align:center;width:80px;">الكمية</th>
          <th style="padding:12px;text-align:left;width:120px;">السعر</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div style="display:flex;justify-content:flex-start;margin-top:20px;">
      <div style="width:300px;font-size:14px;line-height:2.1;">
        <div style="display:flex;justify-content:space-between;"><span>الإجمالي الفرعي</span><span>${egp(subtotal)}</span></div>
        ${data.discountAmount ? `<div style="display:flex;justify-content:space-between;color:#16a34a;"><span>${data.discountLabel || "خصم"}</span><span>- ${egp(data.discountAmount)}</span></div>` : ""}
        ${data.rushFee ? `<div style="display:flex;justify-content:space-between;color:#e11d48;"><span>رسوم استعجال</span><span>+ ${egp(data.rushFee)}</span></div>` : ""}
        <div style="display:flex;justify-content:space-between;font-weight:800;font-size:18px;color:#a4762f;border-top:2px solid #cda15a;margin-top:8px;padding-top:8px;"><span>الإجمالي</span><span>${egp(data.total)}</span></div>
      </div>
    </div>

    <div style="margin-top:40px;border-top:1px solid #eee;padding-top:16px;text-align:center;color:#9a8b7a;font-size:12px;line-height:1.9;">
      شكراً لاختيارك زُغْرُوطَة 🤍 — بنأكّد الحجز بعد دفع ديبوزت بسيط، والباقي عند الاستلام.<br/>
      للتواصل والاستفسار: واتساب زُغْرُوطَة • zaghroutaa.com
    </div>
  `;
  document.body.appendChild(el);

  // نتأكد إن اللوجو اتحمّل قبل التصوير
  await new Promise<void>((resolve) => {
    const img = el.querySelector("img");
    if (img && !img.complete) {
      img.addEventListener("load", () => resolve());
      img.addEventListener("error", () => resolve());
      setTimeout(resolve, 1500);
    } else {
      resolve();
    }
  });

  try {
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false });
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const imgH = (canvas.height * pageW) / canvas.width;
    pdf.addImage(imgData, "JPEG", 0, 0, pageW, imgH);
    pdf.save(`zaghroutaa-invoice-${ref}.pdf`);
  } finally {
    document.body.removeChild(el);
  }
}
