import { NextResponse } from "next/server";
import { answerQuery, knowledgeContext } from "@/lib/chat/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Msg = { role: "user" | "bot"; content: string };

/**
 * شات بوت زُغْرُوطَة:
 * 1) المحرّك المحلي (قاعدة المعرفة) بيرد فورًا على أغلب الأسئلة.
 * 2) لو مفيش إجابة واثقة وفي مفتاح ANTHROPIC_API_KEY → بنسأل Claude بالسياق بتاع الموقع.
 * 3) لو لسه مفيش → fallback عشان الويدجت يحوّل العميلة على واتساب.
 */
export async function POST(req: Request) {
  let messages: Msg[] = [];
  try {
    const body = await req.json();
    messages = Array.isArray(body?.messages) ? body.messages : [];
  } catch {
    return NextResponse.json({ fallback: true });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  if (!lastUser.trim()) return NextResponse.json({ fallback: true });

  // 1) المحرّك المحلي
  const local = answerQuery(lastUser);
  if (local.kind === "answer" && local.confidence >= 0.5) {
    return NextResponse.json({ answer: local.text, source: "kb" });
  }

  // 2) Claude (اختياري — بيشتغل بس لو المفتاح متضاف)
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json(local.kind === "answer" ? { answer: local.text, source: "kb" } : { fallback: true });
  }

  try {
    const system =
      "إنتي مساعدة دعم لطيفة لموقع زُغْرُوطَة (إكسسوارات عرايس هاند ميد مصري لكتب الكتاب والفرح). " +
      "ردّي بالعامية المصرية الدافئة وباختصار (٢-٤ أسطر) واستخدمي روابط الموقع لما تنفع. " +
      "اعتمدي فقط على المعلومات دي، وممنوع تأليف أسعار أو معلومات مش موجودة. " +
      "لو السؤال خارج نطاق المعلومات أو محتاج تفاصيل شخصية (مقاسات/تأكيد حجز/دفع)، ردّي بالنص ده بالظبط: [[NO_ANSWER]]\n\n" +
      "=== معلومات زُغْرُوطَة ===\n" +
      knowledgeContext();

    const apiMessages = messages
      .slice(-8)
      .map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: String(m.content || "") }))
      .filter((m) => m.content.trim());

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.CHAT_MODEL || "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system,
        messages: apiMessages.length ? apiMessages : [{ role: "user", content: lastUser }],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!r.ok) {
      return NextResponse.json(local.kind === "answer" ? { answer: local.text, source: "kb" } : { fallback: true });
    }
    const data = await r.json();
    const text: string = (data?.content || [])
      .map((b: { text?: string }) => b?.text || "")
      .join("\n")
      .trim();

    if (!text || text.includes("[[NO_ANSWER]]")) {
      return NextResponse.json(local.kind === "answer" ? { answer: local.text, source: "kb" } : { fallback: true });
    }
    return NextResponse.json({ answer: text, source: "llm" });
  } catch {
    return NextResponse.json(local.kind === "answer" ? { answer: local.text, source: "kb" } : { fallback: true });
  }
}
