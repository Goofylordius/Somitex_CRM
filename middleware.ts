import { NextResponse, type NextRequest } from "next/server";

import { applySecurityHeaders } from "@/lib/security/headers";
import { updateSession } from "@/lib/supabase/middleware";

const APP_HTML_PATH = "/index.html";
const LOGIN_PATH = "/login";
const MFA_PATH = "/mfa";
const STATIC_APP_ALIASES = new Set(["/", "/dashboard", "/contacts", "/deals", "/tasks", "/security", "/compliance"]);

function redirectTo(pathname: string, request: NextRequest) {
  return NextResponse.redirect(new URL(pathname, request.url));
}

export async function middleware(request: NextRequest) {
  const { response, user, assuranceLevel } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return applySecurityHeaders(response);
  }

  if (pathname === LOGIN_PATH) {
    if (user && assuranceLevel === "aal2") {
      return applySecurityHeaders(redirectTo(APP_HTML_PATH, request));
    }

    if (user) {
      return applySecurityHeaders(redirectTo(MFA_PATH, request));
    }

    return applySecurityHeaders(response);
  }

  if (pathname === MFA_PATH) {
    if (!user) {
      return applySecurityHeaders(redirectTo(LOGIN_PATH, request));
    }

    if (assuranceLevel === "aal2") {
      return applySecurityHeaders(redirectTo(APP_HTML_PATH, request));
    }

    return applySecurityHeaders(response);
  }

  if (pathname === APP_HTML_PATH || STATIC_APP_ALIASES.has(pathname)) {
    if (!user) {
      return applySecurityHeaders(redirectTo(LOGIN_PATH, request));
    }

    if (assuranceLevel !== "aal2") {
      return applySecurityHeaders(redirectTo(MFA_PATH, request));
    }

    if (pathname !== APP_HTML_PATH) {
      return applySecurityHeaders(redirectTo(APP_HTML_PATH, request));
    }
  }

  return applySecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

