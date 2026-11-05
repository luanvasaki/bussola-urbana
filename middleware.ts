import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, token } from "@/lib/auth";
export async function middleware(req: NextRequest) {
  const t = await token();
  if (!t || req.nextUrl.pathname === "/gestor/login") return NextResponse.next();
  if (req.cookies.get(COOKIE)?.value === t) return NextResponse.next();
  const u = req.nextUrl.clone(); u.pathname = "/gestor/login"; u.search = "";
  return NextResponse.redirect(u);
}
export const config = { matcher: ["/gestor/:path*"] };
