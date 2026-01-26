import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // allow the login page + login API
  if (pathname.startsWith('/login') || pathname.startsWith('/api/login')) {
    return NextResponse.next()
  }

  // protect /scribe (and optionally /)
  const authed = req.cookies.get('psych_auth')?.value === '1'

  if (!authed && (pathname === '/' || pathname.startsWith('/scribe'))) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/scribe/:path*', '/login', '/api/login'],
}