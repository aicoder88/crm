
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // if user is not logged in, redirect to /login
  if (!session) {
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } else {
    // if user is logged in, redirect to /dashboard
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
