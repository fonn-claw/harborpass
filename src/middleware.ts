import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("harborpass-session");
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isPublicPath =
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/assets") ||
    request.nextUrl.pathname === "/favicon.ico";

  if (isPublicPath) return NextResponse.next();

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|assets|favicon.ico).*)"],
};
