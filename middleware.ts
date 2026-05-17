import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['th', 'en'],
  defaultLocale: 'th',
});

const ALLOWED_PATHS = ['/pos', '/dashboard'];

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const userAgent = req.headers.get('user-agent') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  const segments = pathname.split('/');
  const locale = (segments[1] === 'th' || segments[1] === 'en') ? segments[1] : 'th';
  
  if (isMobile) {
    const isAllowedPath = ALLOWED_PATHS.some(path => pathname.startsWith(`/${locale}${path}`));
    if (!isAllowedPath) {
      return NextResponse.redirect(new URL(`/${locale}/pos`, req.url));
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/', '/(th|en)/:path*']
};