"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MessagesSquare, X, Send, Sparkles } from "lucide-react";
import { answerQuery, KB_GREETING, KB_SUGGESTIONS } from "@/lib/chat/engine";
import { buildWhatsappUrl } from "@/lib/whatsapp";

type ChatMsg = {
  id: number;
  role: "user" | "bot";
  text: string;
  fallback?: boolean;
  q?: string;
};

const STORAGE_KEY = "zg_chat_v1";
const LINK_TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

function WaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.003 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.46 1.73 6.4L3.2 28.8l6.6-1.73a12.74 12.74 0 0 0 6.2 1.6h.01c7.06 0 12.8-5.74 12.8-12.8s-5.74-12.8-12.8-12.8Zm0 23.3h-.01a10.5 10.5 0 0 1-5.36-1.47l-.39-.23-3.92 1.03 1.05-3.82-.25-.4a10.48 10.48 0 0 1-1.6-5.58c0-5.82 4.74-10.56 10.57-10.56 2.82 0 5.47 1.1 7.47 3.1a10.5 10.5 0 0 1 3.1 7.47c0 5.83-4.74 10.56-10.56 10.56Zm5.8-7.9c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.56-1.58-.95-.84-1.59-1.88-1.77-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.54-.71-.55-.18-.01-.4-.01-.61-.01-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.23 3.4 5.4 4.77.75.32 1.34.52 1.8.66.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.26-.74.26-1.38.18-1.51-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

function RichText({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  return (
    <>
      {text.split("\n").map((line, li) => (
        <span key={li} className="block">
          {line
            .split(LINK_TOKEN)
            .filter((p) => p !== "")
            .map((part, i) => {
              const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
              if (link) {
                const [, label, href] = link;
                const external = /^(https?:|tel:|mailto:)/.test(href) || href.includes("wa.me");
                if (external) {
                  return (
                    <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="font-bold text-gold-700 underline decoration-gold-300 underline-offset-2">
                      {label}
                    </a>
                  );
                }
                return (
                  <Link key={i} href={href} onClick={onNavigate} className="font-bold text-gold-700 underline decoration-gold-300 underline-offset-2">
                    {label}
                  </Link>
                );
              }
              const bold = /^\*\*([^*]+)\*\*$/.exec(part);
              if (bold) return <strong key={i} className="font-extrabold text-espresso-900">{bold[1]}</strong>;
              return <span key={i}>{part}</span>;
            })}
        </span>
      ))}
    </>
  );
}

export function ChatWidget({ whatsappNumber }: { whatsappNumber: string }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const idRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // تحميل المحادثة المحفوظة
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ChatMsg[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          setMessages(parsed);
          idRef.current = Math.max(...parsed.map((m) => m.id)) + 1;
        }
      }
    } catch {
      /* تجاهل */
    }
  }, []);

  // حفظ المحادثة (آخر 40 رسالة)
  useEffect(() => {
    if (messages.length) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
      } catch {
        /* تجاهل */
      }
    }
  }, [messages]);

  // أول فتح: رسالة ترحيب
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: idRef.current++, role: "bot", text: KB_GREETING }]);
    }
  }, [open, messages.length]);

  // سكرول لآخر رسالة
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  const pushBot = (text: string, extra?: Partial<ChatMsg>) =>
    setMessages((m) => [...m, { id: idRef.current++, role: "bot", text, ...extra }]);

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || typing) return;
    setInput("");
    const userMsg: ChatMsg = { id: idRef.current++, role: "user", text };
    const history = [...messages, userMsg];
    setMessages(history);
    setTyping(true);

    const local = answerQuery(text);

    // رد واثق من قاعدة المعرفة → فوري
    if (local.kind === "answer" && local.confidence >= 0.5) {
      await wait(450);
      pushBot(local.text);
      setTyping(false);
      return;
    }

    // غير كده: نجرّب الـ API (LLM لو متفعّل)، وإلا تحويل للواتساب
    try {
      const res = await fetchWithTimeout(
        "/api/chat",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: history.slice(-8).map((m) => ({ role: m.role, content: m.text })) }),
        },
        16000,
      );
      const data = await res.json();
      if (data?.answer) {
        pushBot(String(data.answer));
      } else {
        pushBot(fallbackText, { fallback: true, q: text });
      }
    } catch {
      pushBot(fallbackText, { fallback: true, q: text });
    } finally {
      setTyping(false);
    }
  }

  const fallbackText =
    "والله مش لاقية إجابة دقيقة للسؤال ده 😅 بس زُغْرُوطَة هتردّ عليكي على طول — اضغطي تكلّمي الدعم على واتساب 👇";

  const showSuggestions = messages.filter((m) => m.role === "user").length === 0;

  const panel = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-espresso-900/20 backdrop-blur-[2px] sm:bg-transparent sm:backdrop-blur-0"
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            dir="rtl"
            className="fixed bottom-0 right-0 z-[61] flex h-[88dvh] w-full flex-col overflow-hidden rounded-t-[1.6rem] bg-cream-50 shadow-2xl sm:bottom-24 sm:right-5 sm:h-[600px] sm:max-h-[78vh] sm:w-[390px] sm:rounded-[1.6rem] sm:border sm:border-gold-200/70"
          >
            {/* الهيدر */}
            <div className="flex items-center justify-between gap-3 bg-gold-shine px-4 py-3.5 text-white">
              <div className="flex items-center gap-3">
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40">
                  <Image src="/logo.png" alt="زُغْرُوطَة" width={40} height={40} className="rounded-full" />
                  <span className="absolute -bottom-0.5 -left-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
                </span>
                <div className="leading-tight">
                  <p className="font-display text-base font-bold">مساعدة زُغْرُوطَة</p>
                  <p className="flex items-center gap-1 text-[11px] text-white/85">
                    <Sparkles className="h-3 w-3" /> ردّ فوري على مدار اليوم
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* الرسائل */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3.5 py-4">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-start">
                    <div className="max-w-[82%] rounded-2xl rounded-tr-md bg-gold-shine px-3.5 py-2.5 text-sm leading-relaxed text-white shadow-sm">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex items-end justify-end gap-2">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-gold-100 bg-pearl px-3.5 py-2.5 text-sm leading-relaxed text-espresso-700 shadow-sm">
                      <RichText text={m.text} onNavigate={() => setOpen(false)} />
                      {m.fallback && (
                        <a
                          href={buildWhatsappUrl(whatsappNumber, m.q ? `السلام عليكم، سؤالي: ${m.q}` : "السلام عليكم، حابة أستفسر عن منتجات زُغْرُوطَة")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                        >
                          <WaIcon className="h-4 w-4" /> كلّمي الدعم على واتساب
                        </a>
                      )}
                    </div>
                    <span className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-50 ring-1 ring-gold-200">
                      <Image src="/logo.png" alt="" width={24} height={24} className="rounded-full" />
                    </span>
                  </div>
                ),
              )}

              {typing && (
                <div className="flex items-end justify-end gap-2">
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-gold-100 bg-pearl px-4 py-3 shadow-sm">
                    <Dot delay={0} />
                    <Dot delay={0.15} />
                    <Dot delay={0.3} />
                  </div>
                  <span className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-50 ring-1 ring-gold-200">
                    <Image src="/logo.png" alt="" width={24} height={24} className="rounded-full" />
                  </span>
                </div>
              )}

              {/* أسئلة مقترحة */}
              {showSuggestions && !typing && (
                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  {KB_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-full border border-gold-200 bg-pearl px-3 py-1.5 text-xs font-semibold text-espresso-700 transition-colors hover:border-gold-300 hover:bg-gold-50 hover:text-gold-700"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* خانة الكتابة */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-gold-100 bg-cream-50 px-3 py-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتبي سؤالك هنا…"
                className="flex-1 rounded-full border border-gold-200 bg-pearl px-4 py-2.5 text-sm text-espresso-800 outline-none focus:border-gold-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                aria-label="إرسال"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-shine text-white shadow-glow transition-transform hover:scale-105 disabled:opacity-40"
              >
                <Send className="h-5 w-5 -scale-x-100" />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* الزر العائم على اليمين */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="افتحي شات المساعدة"
        className="group fixed bottom-5 right-5 z-[55] flex h-14 w-14 items-center justify-center rounded-full bg-gold-shine shadow-[0_14px_40px_-10px_rgba(193,154,89,0.8)] transition-transform hover:scale-110"
      >
        {!open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-30" />}
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6 text-white" />
            </motion.span>
          ) : (
            <motion.span key="c" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessagesSquare className="relative h-6 w-6 text-white" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {mounted && createPortal(panel, document.body)}
    </>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="h-2 w-2 rounded-full bg-gold-400"
      animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 0.9, repeat: Infinity, delay }}
    />
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithTimeout(url: string, opts: RequestInit, ms: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}
