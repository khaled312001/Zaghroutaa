"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  BellRing, RefreshCw, Send, ShoppingCart, Plus, Trash2, Check, MessageCircle,
  Calendar, Star, AlarmClock, AlertTriangle, Wifi, WifiOff, QrCode, ChevronDown, Link2, LogOut, Loader2,
} from "lucide-react";
import { URGENCY_META, type UrgencyLevel } from "@/lib/alerts";
import { ORDER_STATUS, type OrderStatusKey } from "@/lib/orderStatus";
import { normalizeWhatsappNumber } from "@/lib/whatsapp";
import {
  setOrderReadyByAction, setOrderPriorityAction, toggleOrderRemindersAction,
  addShoppingItemAction, toggleShoppingItemAction, deleteShoppingItemAction,
  regenerateRemindersAction, sendTestReminderAction, clearSentRemindersAction,
} from "@/app/admin/alert-actions";
import { cn, toArabicDigits } from "@/lib/utils";

export type AlertOrder = {
  id: number;
  productName: string;
  variantName: string | null;
  customerName: string;
  brideName: string | null;
  groomName: string | null;
  phone: string;
  governorate: string;
  status: OrderStatusKey;
  eventDate: string | null;
  eventType: string | null;
  readyByDate: string | null;
  priorityBump: number;
  remindersOn: boolean;
  createdAt: string;
  shopping: { id: number; name: string; qty: string | null; bought: boolean }[];
  level: UrgencyLevel;
  levelLabel: string;
  dueInDays: number | null;
  dueText: string;
  needsFollowup: boolean;
};

export type ReminderRow = {
  id: number;
  kind: string;
  title: string;
  status: string;
  scheduledAt: string;
  sentAt: string | null;
  error: string | null;
};

const PRIORITY_LABEL = ["عادي", "مهم", "مهم جدًا", "قصوى"];

function relTime(iso: string): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "دلوقتي";
  if (m < 60) return `من ${toArabicDigits(m)} دقيقة`;
  const h = Math.round(m / 60);
  if (h < 24) return `من ${toArabicDigits(h)} ساعة`;
  return `من ${toArabicDigits(Math.round(h / 24))} يوم`;
}

export function AlertsBoard({
  orders, reminders, counts, followups, materialsCount, alertNumber, alertsEnabled, worker,
}: {
  orders: AlertOrder[];
  reminders: ReminderRow[];
  counts: Record<UrgencyLevel, number>;
  followups: number;
  materialsCount: number;
  alertNumber: string;
  alertsEnabled: boolean;
  worker: { state: string; lastSeen: string; qr: string };
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showLog, setShowLog] = useState(false);

  const run = (fn: () => Promise<unknown>, okMsg?: string) =>
    start(async () => {
      try {
        await fn();
        if (okMsg) toast.success(okMsg);
        router.refresh();
      } catch {
        toast.error("حصل خطأ، حاولي تاني");
      }
    });

  const allMaterials = orders.flatMap((o) =>
    o.shopping.filter((s) => !s.bought).map((s) => ({ ...s, order: o })),
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-espresso-900 sm:text-3xl">
            <BellRing className="h-7 w-7 text-gold-600" /> مركز التنبيهات الذكي
          </h1>
          <p className="mt-1 text-sm text-espresso-500">
            رتّبي شغلك بالأولوية، اعرفي اللي وقته قرب، واشتري الخامات في وقتها — والتذكير بيوصل واتساب لوحده.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(async () => {
                const r = await regenerateRemindersAction();
                toast.success(`اتولّد ${toArabicDigits(r.created)} تنبيه جديد`);
              })
            }
            className="btn-outline px-4 py-2 text-sm"
          >
            <RefreshCw className={cn("h-4 w-4", pending && "animate-spin")} /> حدّثي التنبيهات
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(async () => {
                const r = await sendTestReminderAction();
                if (!r.ok) throw new Error(r.error);
                toast.success("اتبعتت رسالة التجربة للطابور");
              })
            }
            className="btn-gold px-4 py-2 text-sm"
          >
            <Send className="h-4 w-4" /> رسالة تجربة
          </button>
        </div>
      </header>

      {/* تنبيهات الإعداد */}
      {!alertNumber && (
        <Banner tone="warn">
          لازم تحطّي <b>رقم استقبال التنبيهات</b> (رقم الشغل) في{" "}
          <Link href="/admin/settings" className="underline">الإعدادات</Link> عشان التذكير يشتغل.
        </Banner>
      )}
      {alertNumber && !alertsEnabled && (
        <Banner tone="warn">
          نظام التنبيهات متوقّف حاليًا — فعّليه من{" "}
          <Link href="/admin/settings" className="underline">الإعدادات</Link>.
        </Banner>
      )}

      {/* حالة الاتصال بالواتساب */}
      <WorkerStatus initial={worker} />

      {/* ملخص الأولويات */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryCard label="فات ميعادهم" value={counts.overdue} hex={URGENCY_META.overdue.hex} icon={AlertTriangle} />
        <SummaryCard label="عاجل جدًا" value={counts.critical} hex={URGENCY_META.critical.hex} icon={AlarmClock} />
        <SummaryCard label="عاجل" value={counts.soon} hex={URGENCY_META.soon.hex} icon={AlarmClock} />
        <SummaryCard label="قريّب" value={counts.upcoming} hex={URGENCY_META.upcoming.hex} icon={Calendar} />
        <SummaryCard label="محتاج متابعة" value={followups} hex="#0EA5E9" icon={MessageCircle} />
        <SummaryCard label="خامات للشراء" value={materialsCount} hex="#A4762F" icon={ShoppingCart} />
      </div>

      {/* قائمة المشتريات المجمّعة */}
      {allMaterials.length > 0 && (
        <section className="card-zg overflow-hidden">
          <div className="flex items-center gap-2 border-b border-gold-100 bg-cream-50 px-5 py-3.5">
            <ShoppingCart className="h-5 w-5 text-gold-600" />
            <h2 className="font-display text-lg font-bold text-espresso-900">قائمة المشتريات</h2>
            <span className="chip bg-gold-50 text-gold-700">{toArabicDigits(allMaterials.length)}</span>
          </div>
          <ul className="divide-y divide-gold-50">
            {allMaterials.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => toggleShoppingItemAction(m.id, true), "اتشطب من القايمة")}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-gold-300 text-transparent hover:border-gold-500 hover:text-gold-500"
                  aria-label="تم الشراء"
                >
                  <Check className="h-4 w-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-espresso-800">
                    {m.name}
                    {m.qty ? <span className="text-espresso-500"> — {m.qty}</span> : null}
                  </p>
                  <p className="truncate text-xs text-espresso-500">
                    لأوردر: {m.order.customerName} — {m.order.productName}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* لوحة الأولويات */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-espresso-900">الأوردرات بالأولوية</h2>
        {orders.length === 0 ? (
          <div className="card-zg p-12 text-center text-espresso-400">مفيش أوردرات شغّالة دلوقتي.</div>
        ) : (
          orders.map((o) => <OrderCard key={o.id} o={o} pending={pending} run={run} />)
        )}
      </section>

      {/* سجل التنبيهات */}
      <section className="card-zg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowLog((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-3.5"
        >
          <span className="flex items-center gap-2 font-display text-lg font-bold text-espresso-900">
            <BellRing className="h-5 w-5 text-gold-600" /> سجل التنبيهات الأخيرة
          </span>
          <ChevronDown className={cn("h-5 w-5 text-espresso-400 transition", showLog && "rotate-180")} />
        </button>
        {showLog && (
          <div className="border-t border-gold-100">
            {reminders.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-espresso-400">لسه مفيش تنبيهات.</p>
            ) : (
              <ul className="divide-y divide-gold-50">
                {reminders.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-espresso-800">{r.title}</p>
                      <p className="text-xs text-espresso-400">
                        {r.sentAt ? `اتبعت ${relTime(r.sentAt)}` : `في الطابور ${relTime(r.scheduledAt)}`}
                        {r.error ? ` • ${r.error}` : ""}
                      </p>
                    </div>
                    <ReminderStatus status={r.status} />
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-gold-100 px-5 py-3 text-end">
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => clearSentRemindersAction(), "اتنضّف السجل")}
                className="text-xs font-semibold text-espresso-500 hover:text-rose-600"
              >
                مسح المتبعت والقديم
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------- أجزاء ---------- */

function Banner({ tone, children }: { tone: "warn" | "info"; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        tone === "warn"
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-blue-200 bg-blue-50 text-blue-800",
      )}
    >
      {children}
    </div>
  );
}

function WorkerStatus({ initial }: { initial: { state: string; lastSeen: string; qr: string } }) {
  const [state, setState] = useState(initial.state || "");
  const [qr, setQr] = useState(initial.qr || "");
  const [busy, setBusy] = useState(false);

  // متابعة الحالة الحيّة من السيرفر
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try {
        const r = await fetch("/api/wa/state");
        const d = await r.json();
        if (!stop && d.ok) {
          setState(d.state);
          setQr(d.qr || "");
        }
      } catch {
        /* تجاهل */
      }
    };
    tick();
    const id = setInterval(tick, 4000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, []);

  const connected = state === "connected";
  const needsQr = state === "qr";
  const connecting = state === "connecting";

  const connect = async () => {
    setBusy(true);
    try {
      await fetch("/api/wa/connect", { method: "POST" });
      toast.success("بنبدأ الاتصال... هيظهر الكود خلال ثواني");
    } catch {
      toast.error("حصل خطأ");
    } finally {
      setBusy(false);
    }
  };
  const logout = async () => {
    if (!window.confirm("متأكدة عايزة تفصلي الواتساب؟ هتحتاجي تمسحي الكود تاني.")) return;
    setBusy(true);
    try {
      await fetch("/api/wa/logout", { method: "POST" });
      setState("disconnected");
      setQr("");
      toast.success("اتفصل الواتساب");
    } catch {
      toast.error("حصل خطأ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card-zg p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {connected ? (
            <Wifi className="h-5 w-5 text-emerald-600" />
          ) : needsQr ? (
            <QrCode className="h-5 w-5 text-amber-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-rose-500" />
          )}
          <div>
            <p className="font-semibold text-espresso-800">
              {connected ? "الواتساب متصل وجاهز للإرسال" : needsQr ? "امسحي كود الربط تحت" : connecting ? "بنتصل..." : "المحرّك مش شغّال"}
            </p>
            <p className="text-xs text-espresso-400">
              {connected ? "بيبعت التنبيهات تلقائيًا" : "المحرّك بيشتغل لوحده على السيرفر عبر الكرون"}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "chip",
            connected ? "bg-emerald-100 text-emerald-700" : needsQr || connecting ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700",
          )}
        >
          {connected ? "متصل" : needsQr ? "ربط مطلوب" : connecting ? "جاري" : "مش شغّال"}
        </span>
      </div>

      {needsQr && qr && (
        <div className="mt-4 flex flex-col items-center gap-3 border-t border-gold-100 pt-4 sm:flex-row sm:items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="كود ربط الواتساب" className="h-48 w-48 rounded-xl border border-gold-200 bg-white p-2" />
          <div className="text-sm text-espresso-600">
            <p className="font-semibold text-espresso-800">اربطي رقم الإرسال:</p>
            <ol className="mt-1 list-decimal space-y-1 pr-4">
              <li>افتحي واتساب على رقم التنبيهات (رقم الإرسال).</li>
              <li>الإعدادات ← الأجهزة المرتبطة ← ربط جهاز.</li>
              <li>امسحي الكود ده، وخلال ثواني الحالة تبقى «متصل».</li>
            </ol>
          </div>
        </div>
      )}

      {!connected && !needsQr && (
        <div className="mt-4 border-t border-gold-100 pt-4 text-sm text-espresso-600">
          <p className="font-semibold text-espresso-800">عشان الإرسال يشتغل:</p>
          <ol className="mt-1 list-decimal space-y-1 pr-4">
            <li>حطّي <b>رقم استقبال التنبيهات</b> في <Link href="/admin/settings" className="text-gold-700 underline">الإعدادات</Link>.</li>
            <li>تأكدي إن <b>الكرون مضاف</b> على hPanel (الخطوات في ملف WHATSAPP.md).</li>
            <li>أول ما المحرّك يشتغل، <b>كود الـ QR هيظهر هنا</b> — امسحيه برقم الإرسال.</li>
          </ol>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label, value, hex, icon: Icon,
}: {
  label: string;
  value: number;
  hex: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="card-zg p-4">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: hex + "1A", color: hex }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-2 font-display text-2xl font-extrabold text-espresso-900">{toArabicDigits(value)}</div>
      <div className="text-xs text-espresso-500">{label}</div>
    </div>
  );
}

function ReminderStatus({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "في الطابور", cls: "bg-blue-100 text-blue-700" },
    SENT: { label: "اتبعت", cls: "bg-emerald-100 text-emerald-700" },
    FAILED: { label: "فشل", cls: "bg-rose-100 text-rose-700" },
    CANCELLED: { label: "ملغي", cls: "bg-espresso-100 text-espresso-500" },
  };
  const m = map[status] || map.PENDING;
  return <span className={cn("chip shrink-0", m.cls)}>{m.label}</span>;
}

function OrderCard({
  o, pending, run,
}: {
  o: AlertOrder;
  pending: boolean;
  run: (fn: () => Promise<unknown>, okMsg?: string) => void;
}) {
  const meta = URGENCY_META[o.level];
  const st = ORDER_STATUS[o.status];
  const [newItem, setNewItem] = useState("");
  const wa = `https://wa.me/${normalizeWhatsappNumber(o.phone)}`;

  return (
    <div className="card-zg overflow-hidden">
      <div className="flex items-stretch">
        <span className={cn("w-1.5 shrink-0", meta.dot)} />
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("chip", meta.chip)}>{o.levelLabel}</span>
                <span className="text-sm font-bold text-espresso-700">{o.dueText}</span>
                {o.needsFollowup && <span className="chip bg-sky-100 text-sky-700">محتاج متابعة</span>}
              </div>
              <h3 className="mt-1.5 font-bold text-espresso-900">
                {o.productName}
                {o.variantName ? <span className="text-espresso-500"> — {o.variantName}</span> : null}
              </h3>
              <p className="text-xs text-espresso-500">
                {o.customerName} • {o.governorate}
                {o.brideName || o.groomName ? ` • ${o.brideName || "-"} و ${o.groomName || "-"}` : ""}
              </p>
            </div>
            <span className={cn("chip", st.badge)}>{st.label}</span>
          </div>

          {/* أدوات */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 rounded-xl border border-gold-200 bg-pearl px-2.5 py-1.5 text-xs text-espresso-600">
              <Calendar className="h-3.5 w-3.5 text-gold-500" />
              يخلص قبل:
              <input
                type="date"
                defaultValue={o.readyByDate ? o.readyByDate.slice(0, 10) : ""}
                disabled={pending}
                onChange={(e) =>
                  run(
                    () =>
                      setOrderReadyByAction(
                        o.id,
                        e.target.value ? new Date(e.target.value + "T12:00:00").toISOString() : null,
                      ),
                    "اتظبط الميعاد",
                  )
                }
                className="bg-transparent text-xs outline-none"
              />
            </label>

            <label className="flex items-center gap-1.5 rounded-xl border border-gold-200 bg-pearl px-2.5 py-1.5 text-xs text-espresso-600">
              <Star className="h-3.5 w-3.5 text-gold-500" />
              الأولوية:
              <select
                value={o.priorityBump}
                disabled={pending}
                onChange={(e) => run(() => setOrderPriorityAction(o.id, Number(e.target.value)), "اتظبطت الأولوية")}
                className="bg-transparent text-xs font-semibold outline-none"
              >
                {PRIORITY_LABEL.map((l, i) => (
                  <option key={i} value={i}>{l}</option>
                ))}
              </select>
            </label>

            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => toggleOrderRemindersAction(o.id, !o.remindersOn), o.remindersOn ? "اتوقف التذكير" : "اتفعّل التذكير")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold",
                o.remindersOn
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-espresso-200 bg-espresso-50 text-espresso-500",
              )}
            >
              <BellRing className="h-3.5 w-3.5" /> {o.remindersOn ? "التذكير شغّال" : "التذكير موقوف"}
            </button>

            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp px-3 py-1.5 text-xs">
              <MessageCircle className="h-3.5 w-3.5" /> كلّميها
            </a>
          </div>

          {/* خامات الأوردر */}
          <div className="mt-3 rounded-xl bg-cream-50 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-espresso-600">
              <ShoppingCart className="h-3.5 w-3.5 text-gold-500" /> خامات الأوردر
            </div>
            {o.shopping.length > 0 && (
              <ul className="mb-2 space-y-1">
                {o.shopping.map((s) => (
                  <li key={s.id} className="flex items-center gap-2 text-sm">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => toggleShoppingItemAction(s.id, !s.bought))}
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2",
                        s.bought ? "border-emerald-500 bg-emerald-500 text-white" : "border-gold-300 text-transparent",
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <span className={cn("flex-1", s.bought && "text-espresso-400 line-through")}>
                      {s.name}
                      {s.qty ? <span className="text-espresso-400"> — {s.qty}</span> : null}
                    </span>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => deleteShoppingItemAction(s.id))}
                      className="text-espresso-300 hover:text-rose-500"
                      aria-label="مسح"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const v = newItem.trim();
                if (!v) return;
                setNewItem("");
                run(() => addShoppingItemAction(o.id, v));
              }}
              className="flex gap-2"
            >
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="ضيفي خامة... (مثلاً: لؤلؤ ٢ علبة)"
                className="flex-1 rounded-lg border border-gold-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-gold-400"
              />
              <button type="submit" disabled={pending} className="btn-outline px-3 py-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> ضيفي
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
