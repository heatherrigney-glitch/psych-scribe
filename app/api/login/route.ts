import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const form = await req.formData()
  const password = String(form.get('password') ?? '')

  if (password !== 'mugen2026') {
    return NextResponse.redirect(new URL('/login?e=1', req.url))
  }

  // Redirect to /scribe AND set cookie on the redirect response
  const res = NextResponse.redirect(new URL('/scribe', req.url))

  res.cookies.set({
    name: 'psych_auth',
    value: '1', // don’t store the password in the cookie
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  return res
}