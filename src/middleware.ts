import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("pixelcode_token")?.value;
  const { pathname } = request.nextUrl;

  // Protected routes requiring authentication before accessing
  const protectedRoutes = ["/profile", "/editor", "/collaborate"];

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/editor/:path*",
    "/collaborate/:path*",
  ],
};
