import { NextResponse, type NextRequest } from "next/server";
import { readSessionToken, SESSION_COOKIE } from "@/lib/session";

const PUBLIC = new Set(["/kapi/giris", "/yonetim/giris"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.has(pathname)) return NextResponse.next();

  const session = await readSessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  const isAdminArea = pathname.startsWith("/yonetim");
  const allowed = isAdminArea ? session?.role === "admin" : session !== null; // kapı: görevli veya yönetici

  if (allowed) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.redirect(new URL(isAdminArea ? "/yonetim/giris" : "/kapi/giris", req.url));
}

export const config = {
  matcher: ["/kapi/:path*", "/yonetim/:path*", "/api/checkin/:path*"],
};
