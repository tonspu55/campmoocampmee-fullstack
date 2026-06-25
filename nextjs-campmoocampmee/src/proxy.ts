import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistic auth gate for /account (Next 16 `proxy` convention, formerly
// `middleware`): redirect logged-out users (no session cookie) with a clean 307
// BEFORE the page/loading.tsx renders — so there's no loading-flash for the
// common logged-out case. Only checks cookie presence (edge-safe, no DB);
// page.tsx still runs the authoritative getSession check for a
// present-but-invalid/expired cookie.
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/account", "/account/:path*"],
};
