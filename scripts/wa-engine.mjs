/**
 * محرّك واتساب زُغْرُوطَة — سكربت داخلي مستقل على نفس السيرفر.
 *
 * بيشتغل كعملية منفصلة عن الموقع (مش جوّاه) عشان لو حصل أي ضغط مايأثّرش على الموقع نهائيًا.
 * بيعيد استخدام مكتبة Baileys الموجودة في node_modules بتاع الموقع (من غير تثبيت جديد).
 *
 * التشغيل (الكرون بيعمله كل دقيقة لو مش شغّال):
 *   cd /home/USER/domains/zaghroutaa.com && node wa-engine.mjs
 * (لازم يكون فيه symlink: node_modules -> nodejs/node_modules في نفس المجلد)
 */
// نكتم لوج libsignal/Baileys الزحام (بيطبع مفاتيح الجلسة) — بنستخدم _log لرسائلنا بس
const _log = console.log.bind(console);
console.log = () => {};
console.info = () => {};
console.debug = () => {};

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import qrcode from "qrcode";

const SITE_URL = (process.env.SITE_URL || "https://zaghroutaa.com").replace(/\/$/, "");
const TOKEN = process.env.WA_TOKEN || "05073ee44b615fa4212616daa4dda0b56b09b3355c0b8cd7";
const AUTH_DIR = process.env.WA_AUTH_DIR || "/home/u405809647/domains/zaghroutaa.com/wa-auth";
const POLL_MS = Number(process.env.POLL_MS || 30000);

let sock = null;
let connected = false;
let starting = false;
let attempts = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const silentLogger = {
  level: "silent",
  trace() {}, debug() {}, info() {}, warn() {}, error() {}, fatal() {},
  child() { return silentLogger; },
};

async function postStatus(state, qr = "") {
  try {
    await fetch(`${SITE_URL}/api/wa/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify({ state, qr }),
    });
  } catch (e) {
    console.warn("status post failed:", e?.message || e);
  }
}

async function start() {
  if (sock || starting) return;
  starting = true;
  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    let version;
    try { ({ version } = await fetchLatestBaileysVersion()); } catch {}
    sock = makeWASocket({
      auth: state,
      version,
      logger: silentLogger,
      browser: ["زُغْرُوطَة", "Chrome", "1.0"],
      markOnlineOnConnect: false,
      syncFullHistory: false,
      shouldSyncHistoryMessage: () => false,
      generateHighQualityLinkPreview: false,
    });
    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", async (u) => {
      if (u.qr) {
        try {
          const dataUrl = await qrcode.toDataURL(u.qr, { margin: 1, width: 300 });
          await postStatus("qr", dataUrl);
          _log("QR posted — scan it from the dashboard");
        } catch {}
      }
      if (u.connection === "open") {
        connected = true;
        attempts = 0;
        _log("✓ connected");
        await postStatus("connected");
      }
      if (u.connection === "close") {
        connected = false;
        sock = null;
        const code = u.lastDisconnect?.error?.output?.statusCode;
        if (code === DisconnectReason.loggedOut) {
          _log("logged out — needs new QR");
          await postStatus("disconnected");
        } else {
          attempts += 1;
          await postStatus("connecting");
          setTimeout(start, Math.min(3000 * attempts, 30000));
        }
      }
    });
  } catch (e) {
    console.error("start error:", e?.message || e);
    sock = null;
    await postStatus("disconnected");
  } finally {
    starting = false;
  }
}

async function drain() {
  if (!connected || !sock) return;
  try {
    const res = await fetch(`${SITE_URL}/api/wa/outbox?token=${TOKEN}`);
    const data = await res.json().catch(() => ({}));
    const reminders = data?.reminders || [];
    if (!reminders.length) return;
    _log(`→ ${reminders.length} to send`);
    const results = [];
    for (const r of reminders) {
      try {
        const jid = `${String(r.to).replace(/\D/g, "")}@s.whatsapp.net`;
        await sock.sendMessage(jid, { text: r.body });
        results.push({ id: r.id, ok: true });
        _log("  ✓", r.id);
        await sleep(1500 + Math.floor(Math.random() * 1500));
      } catch (e) {
        results.push({ id: r.id, ok: false, error: String(e?.message || e).slice(0, 200) });
        console.warn("  ✗", r.id, e?.message || e);
      }
    }
    await fetch(`${SITE_URL}/api/wa/outbox?token=${TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify({ results }),
    });
  } catch (e) {
    console.error("drain error:", e?.message || e);
  }
}

async function loop() {
  await start();
  if (connected) {
    await postStatus("connected");
    await drain();
  }
  setTimeout(loop, POLL_MS);
}

process.on("unhandledRejection", (e) => console.error("unhandledRejection:", e?.message || e));
process.on("uncaughtException", (e) => console.error("uncaughtException:", e?.message || e));

_log("⏳ starting WhatsApp engine...");
loop();
