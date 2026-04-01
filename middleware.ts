import { NextResponse, type NextRequest } from "next/server";

import { applySecurityHeaders } from "@/lib/security/headers";
import { updateSession } from "@/lib/supabase/middleware";

const LOGIN_ROUTE = "/login";
const MFA_ROUTE = "/mfa";
const HTML_ROUTE = "/index.html";
const PUBLIC_ROUTES = new Set(["/privacy"]);
const HTML_ALIASES = new Set(["/", "/dashboard", "/contacts", "/deals", "/tasks", "/security", "/compliance"]);

function redirectWithSession(request: NextRequest, baseResponse: NextResponse, pathname: string) {
  const response = NextResponse.redirect(new URL(pathname, request.url));

  for (const cookie of baseResponse.cookies.getAll()) {
    response.cookies.set(cookie);
  }

  return applySecurityHeaders(response);
}

export async function middleware(request: NextRequest) {
  const { response, user, assuranceLevel } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api/") || PUBLIC_ROUTES.has(pathname)) {
    return applySecurityHeaders(response);
  }

  if (pathname === LOGIN_ROUTE) {
    if (!user) {
      return applySecurityHeaders(response);
    }

    return redirectWithSession(request, response, assuranceLevel === "aal2" ? HTML_ROUTE : MFA_ROUTE);
  }

  if (pathname === MFA_ROUTE) {
    if (!user) {
      return redirectWithSession(request, response, LOGIN_ROUTE);
    }

    if (assuranceLevel === "aal2") {
      return redirectWithSession(request, response, HTML_ROUTE);
    }

    return applySecurityHeaders(response);
  }

  if (pathname === HTML_ROUTE || HTML_ALIASES.has(pathname)) {
    if (!user) {
      return redirectWithSession(request, response, LOGIN_ROUTE);
    }

    if (assuranceLevel !== "aal2") {
      return redirectWithSession(request, response, MFA_ROUTE);
    }

    if (pathname !== HTML_ROUTE) {
      return redirectWithSession(request, response, HTML_ROUTE);
    }
  }

  return applySecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

