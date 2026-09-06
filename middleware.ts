import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { locales, defaultLocale } from './i18n/config'
import { draftAccessDenied, hasDraftAccess, privateDraftHeaders } from './lib/drafts/access'
import { bookAccessDenied, hasBookAccess } from './lib/books/access'
import { BOOK_ROOT } from './lib/books/types'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname === BOOK_ROOT || pathname.startsWith(`${BOOK_ROOT}/`)) {
    if (!(await hasBookAccess(request.headers.get('authorization')))) return bookAccessDenied()
    const response = NextResponse.next()
    for (const [name, value] of Object.entries(privateDraftHeaders))
      response.headers.set(name, value)
    return response
  }

  if (pathname === '/drafts' || pathname.startsWith('/drafts/')) {
    if (!(await hasDraftAccess(request.headers.get('authorization')))) return draftAccessDenied()
    const response = NextResponse.next()
    for (const [name, value] of Object.entries(privateDraftHeaders))
      response.headers.set(name, value)
    return response
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return NextResponse.next()

  // Skip locale redirect for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // files like favicon.ico, sitemap.xml, etc.
  ) {
    return NextResponse.next()
  }

  // Redirect to default locale
  const locale = defaultLocale
  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url))
}

export const config = {
  matcher: ['/drafts/:path*', '/((?!_next|api|static|.*\\..*).*)'],
}
