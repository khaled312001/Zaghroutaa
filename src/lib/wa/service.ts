import "server-only";
import path from "path";
import { prisma } from "@/lib/prisma";

/**
 * خدمة واتساب بمكتبة Baileys — بتشتغل جوّا تطبيق الموقع نفسه على نفس السيرفر،
 * من غير أي متصفح (مش زي wppconnect). بتحفظ الجلسة على القرص فمش بتطلب QR كل مرة.
 */

type WaState = "idle" | "connecting" | "qr" | "connected" | "disconnected";

const AUTH_DIR =
  process.env.WA_AUTH_DIR ||
  (process.env.UPLOAD_DIR
    ? path.join(path.dirname(process.env.UPLOAD_DIR), "wa-auth")
    : path.join(process.cwd(), ".wa-auth"));

type WaSingleton = {
  state: WaState;
  qr: string; // data URL
  sock: { sendMessage: (jid: string, c: { text: string }) => Promise<unknown>; logout: () => Promise<void>; ev: { on: (e: string, cb: (a: unknown) => void) => void } } | null;
  starting: boolean;
};

const g = globalThis as unknown as { __waSvc?: WaSingleton };
const wa: WaSingleton = (g.__waSvc ??= { state: "idle", qr: "", sock: null, starting: false });

/* لوجر صامت عشان Baileys ما يطبعش حاجة */
const silentLogger = {
  level: "silent",
  trace() {}, debug() {}, info() {}, warn() {}, error() {}, fatal() {},
  child() { return silentLogger; },
} as unknown;

async function persist(state: WaState, qr = "") {
  wa.state = state;
  wa.qr = qr;
  const set = (key: string, value: string) =>
    prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } }).catch(() => {});
  await set("waWorkerState", state);
  await set("waWorkerLastSeen", new Date().toISOString());
  await set("waWorkerQr", state === "qr" ? qr : "");
}

/** يبدأ/يستأنف اتصال الواتساب (بيطلّع QR لو أول مرة) */
export async function startWa(): Promise<void> {
  if (wa.sock || wa.starting) return;
  wa.starting = true;
  try {
    const mod = (await import("@whiskeysockets/baileys")) as Record<string, unknown>;
    const lib = ("makeWASocket" in mod ? mod : ((mod.default as Record<string, unknown>) ?? mod)) as Record<string, unknown>;
    const makeWASocket = (lib.makeWASocket ?? lib.default) as (cfg: unknown) => WaSingleton["sock"] & { ev: { on: (e: string, cb: (a: unknown) => void) => void } };
    const useMultiFileAuthState = lib.useMultiFileAuthState as (dir: string) => Promise<{ state: unknown; saveCreds: () => Promise<void> }>;
    const DisconnectReason = lib.DisconnectReason as Record<string, number>;
    const fetchLatestBaileysVersion = lib.fetchLatestBaileysVersion as (() => Promise<{ version: number[] }>) | undefined;

    const qrMod = (await import("qrcode")) as Record<string, unknown>;
    const QRCode = (qrMod.default ?? qrMod) as { toDataURL: (s: string, o?: unknown) => Promise<string> };

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    let version: number[] | undefined;
    try {
      if (fetchLatestBaileysVersion) ({ version } = await fetchLatestBaileysVersion());
    } catch {
      /* نسخة افتراضية */
    }

    const sock = makeWASocket({
      auth: state,
      version,
      logger: silentLogger,
      browser: ["زُغْرُوطَة", "Chrome", "1.0"],
      markOnlineOnConnect: false,
      syncFullHistory: false,
    });
    wa.sock = sock;
    await persist("connecting");

    sock.ev.on("creds.update", () => {
      saveCreds().catch(() => {});
    });

    sock.ev.on("connection.update", async (raw: unknown) => {
      const u = raw as { connection?: string; lastDisconnect?: { error?: { output?: { statusCode?: number } } }; qr?: string };
      if (u.qr) {
        try {
          const dataUrl = await QRCode.toDataURL(u.qr, { margin: 1, width: 300 });
          await persist("qr", dataUrl);
        } catch {
          /* تجاهل */
        }
      }
      if (u.connection === "open") await persist("connected");
      if (u.connection === "close") {
        wa.sock = null;
        const code = u.lastDisconnect?.error?.output?.statusCode;
        await persist("disconnected");
        if (code !== DisconnectReason.loggedOut) {
          // قطع مؤقت → نحاول نرجع نتصل بعد شوية
          setTimeout(() => {
            startWa().catch(() => {});
          }, 4000);
        }
      }
    });
  } catch (e) {
    wa.sock = null;
    await persist("disconnected");
    throw e;
  } finally {
    wa.starting = false;
  }
}

export function waState(): { state: WaState; qr: string } {
  return { state: wa.state, qr: wa.qr };
}

export function waConnected(): boolean {
  return wa.state === "connected" && !!wa.sock;
}

/** يبعت رسالة نصية لرقم (بصيغة دولية بدون +) */
export async function waSend(number: string, text: string): Promise<void> {
  if (!wa.sock || wa.state !== "connected") throw new Error("WhatsApp not connected");
  const jid = `${String(number).replace(/\D/g, "")}@s.whatsapp.net`;
  await wa.sock.sendMessage(jid, { text });
}

/** يسجّل خروج ويمسح الجلسة (هيطلب QR تاني) */
export async function waLogout(): Promise<void> {
  try {
    if (wa.sock) await wa.sock.logout();
  } catch {
    /* تجاهل */
  }
  wa.sock = null;
  try {
    const fs = await import("fs/promises");
    await fs.rm(AUTH_DIR, { recursive: true, force: true });
  } catch {
    /* تجاهل */
  }
  await persist("disconnected");
}
