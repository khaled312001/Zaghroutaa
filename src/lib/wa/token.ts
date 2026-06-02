import "server-only";
import { prisma } from "@/lib/prisma";

/** توكن الواتساب — من الداتابيز (waCronToken) أو من البيئة، عشان نقدر نغيّره بدون restart */
export async function getWaToken(): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key: "waCronToken" } }).catch(() => null);
  return (row?.value || process.env.WA_WORKER_TOKEN || "").trim() || null;
}

export function tokenFromReq(req: Request): string {
  const header = req.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  return bearer || new URL(req.url).searchParams.get("token") || "";
}
