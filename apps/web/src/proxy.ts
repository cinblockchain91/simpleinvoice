import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing, type Locale } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const AUTH_PATHS = ["/login"];

function getLocaleFromPathname(pathname: string): Locale {
  for (const locale of routing.locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale as Locale;
    }
  }
  return routing.defaultLocale as Locale;
}

function stripLocalePrefix(pathname: string, locale: Locale): string {
  if (pathname.startsWith(`/${locale}/`))
    return pathname.slice(`/${locale}`.length);
  if (pathname === `/${locale}`) return "/";
  return pathname;
}

async function authProxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const locale = getLocaleFromPathname(pathname);
  const path = stripLocalePrefix(pathname, locale);

  const hasToken = request.cookies.has("access_token");

  const isAuthRoute = AUTH_PATHS.some((p) => path === p);
  const isRoot = path === "/";

  // Root always redirects — to invoices if authenticated, to login if not
  if (isRoot) {
    return NextResponse.redirect(
      new URL(
        hasToken ? `/${locale}/invoices` : `/${locale}/login`,
        request.url,
      ),
    );
  }

  // Any non-auth path requires authentication
  if (!hasToken && !isAuthRoute) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (isAuthRoute && hasToken) {
    return NextResponse.redirect(new URL(`/${locale}/invoices`, request.url));
  }

  return intlMiddleware(request) as NextResponse;
}

export const proxy = authProxy;

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
