/**
 * محرّك ردود شات بوت زُغْرُوطَة — ماتشينج ذكي بالعربي (تطبيع + مرادفات + سكورينج)
 * بيشتغل على الكلاينت والسيرفر (مفيش server-only). مصدر الأسعار: الكتالوج نفسه.
 */
import { getAllProducts, CATEGORIES, formatPrice } from "@/data/catalog";
import { KB_ENTRIES, KB_GREETING, KB_SUGGESTIONS, type KbEntry } from "@/data/chat-kb";

export { KB_GREETING, KB_SUGGESTIONS };

// علامات التشكيل + التطويل فقط (تشكيل عربي وقرآني) — من غير ما نلمس حروف العربية U+0621–U+064A
const AR_MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

/** تطبيع النص العربي: شيل التشكيل، وحّد الألف والياء والتاء المربوطة، شيل علامات الترقيم */
export function normalizeAr(input: string): string {
  return (input || "")
    .toLowerCase()
    .replace(AR_MARKS, "")
    .replace(/[أإآا]/g, "ا") // أ إ آ ا → ا
    .replace(/ى/g, "ي") // ى → ي
    .replace(/ؤ/g, "و") // ؤ → و
    .replace(/ئ/g, "ي") // ئ → ي
    .replace(/ة/g, "ه") // ة → ه
    .replace(/[^؀-ۿ0-9a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP = new Set([
  "في", "من", "عن", "علي", "الي", "ال", "يا", "هو", "هي", "ده", "دي", "ايه",
  "اي", "انا", "احنا", "انتو", "هل", "ممكن", "عايز", "عايزه", "عاوز", "عاوزه",
  "عندكو", "عندكم", "بتاع", "مع", "او", "كده", "كدا", "ولا", "بس", "كمان",
  "ان", "اللي", "علشان", "عشان",
]);

function toks(s: string): string[] {
  return normalizeAr(s)
    .split(" ")
    .filter((t) => t.length > 1 && !STOP.has(t));
}

type Indexed = { entry: KbEntry; tokens: Set<string> };

function indexEntry(e: KbEntry): Indexed {
  const set = new Set<string>();
  for (const k of e.keywords) for (const t of toks(k)) set.add(t);
  for (const t of toks(e.question)) set.add(t);
  return { entry: e, tokens: set };
}

const KB_INDEX: Indexed[] = KB_ENTRIES.map(indexEntry);

// فهرس المنتجات من الكتالوج — عشان نرد على أسعار أي منتج تلقائيًا
const PRICE_WORDS = ["سعر", "بكام", "كام", "ثمن", "تمن", "يكلف", "تكلفه", "بكم", "حجز", "اطلب"];
const PRODUCT_INDEX: Indexed[] = getAllProducts().map((p) => {
  const cat = CATEGORIES.find((c) => c.slug === p.categorySlug);
  const nameToks = new Set<string>(toks(p.nameAr));
  if (cat) for (const t of toks(cat.nameAr)) nameToks.add(t);
  const entry: KbEntry = {
    id: `prod-${p.slug}`,
    question: `سعر ${p.nameAr}`,
    keywords: [p.nameAr, cat?.nameAr ?? "", ...PRICE_WORDS],
    answer:
      `**${p.nameAr}** سعره ${formatPrice(p.basePrice)}` +
      (p.oldPrice ? ` (بدل ${formatPrice(p.oldPrice)}) 🎉` : " 🤍") +
      (p.shortAr ? `\n${p.shortAr}` : "") +
      `\n[احجزيه دلوقتي](/book/${p.slug}) • [الصور والتفاصيل](/products/${p.slug})`,
    category: "منتج",
  };
  // للمنتجات بنطلب إن اسم المنتج نفسه يتطابق (مش بس كلمة سعر)
  return { entry, tokens: nameToks };
});

const GREET = /(سلام|مرحب|هلا|اهلا|ازيك|ازيكم|صباح|مساء|hi|hello|hey)/;
const THANKS = /(شكر|متشكر|تسلم|تسلمي|thank|thanks|ثانكس)/;

export type ChatAnswer = {
  kind: "answer" | "fallback";
  text: string;
  confidence: number;
  matchedId?: string;
};

function hitCount(qToks: string[], set: Set<string>): number {
  let n = 0;
  for (const t of qToks) if (set.has(t)) n++;
  return n;
}

/** بيرجّع أحسن رد من قاعدة المعرفة أو fallback (تحويل للواتساب) */
export function answerQuery(raw: string): ChatAnswer {
  const norm = normalizeAr(raw);
  const qToks = toks(raw);
  if (!norm) return { kind: "fallback", text: "", confidence: 0 };

  // 1) سكورينج على قاعدة المعرفة + المنتجات
  let best: { hit: number; ratio: number; entry: KbEntry | null } = { hit: 0, ratio: 0, entry: null };
  const consider = (idx: Indexed) => {
    const hit = hitCount(qToks, idx.tokens);
    if (hit === 0) return;
    const ratio = hit / qToks.length;
    if (hit > best.hit || (hit === best.hit && ratio > best.ratio)) {
      best = { hit, ratio, entry: idx.entry };
    }
  };
  for (const idx of KB_INDEX) consider(idx);
  for (const idx of PRODUCT_INDEX) consider(idx);

  const accept =
    best.entry && (best.hit >= 2 || (qToks.length <= 2 && best.hit >= 1));
  if (accept && best.entry) {
    const confidence = Math.min(1, best.hit / Math.max(2, qToks.length) + (best.ratio >= 0.6 ? 0.2 : 0));
    return { kind: "answer", text: best.entry.answer, confidence, matchedId: best.entry.id };
  }

  // 2) تحية / شكر (لو مفيش تطابق حقيقي)
  if (GREET.test(norm)) return { kind: "answer", text: KB_GREETING, confidence: 0.85, matchedId: "greet" };
  if (THANKS.test(norm))
    return { kind: "answer", text: "العفو يا قمر 🌷 أي خدمة تانية تحبيها؟", confidence: 0.85, matchedId: "thanks" };

  // 3) مفيش إجابة → تحويل للدعم
  return { kind: "fallback", text: "", confidence: best.entry ? best.hit / (qToks.length || 1) : 0 };
}

/** نص مرجعي مضغوط لقاعدة المعرفة — يُستخدم كسياق للـ LLM (اختياري) */
export function knowledgeContext(): string {
  const lines: string[] = [];
  for (const e of KB_ENTRIES) {
    lines.push(`• ${e.question}\n${e.answer}`);
  }
  lines.push("\nالأسعار (جنيه مصري):");
  for (const p of getAllProducts()) {
    lines.push(`- ${p.nameAr}: ${p.basePrice} (/book/${p.slug})`);
  }
  return lines.join("\n");
}
