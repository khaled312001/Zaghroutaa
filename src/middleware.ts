import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getAuthSecret } from "./lib/secret";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // كل صفحات /admin محميّة ما عدا صفحة الدخول
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get("zg_admin")?.value;
    let valid = false;
    if (token) {
      try {
        await jwtVerify(token, getAuthSecret());
        valid = true;
      } catch {
        valid = false;
      }
    }
    if (!valid) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
