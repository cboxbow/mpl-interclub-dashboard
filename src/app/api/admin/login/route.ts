import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, adminToken } from '@/lib/adminAuth'

export async function POST(request: NextRequest) {
  const form = await request.formData()
  const password = String(form.get('password') ?? '')
  const next = String(form.get('next') ?? '/admin')

  if (password !== (process.env.ADMIN_PASSWORD ?? 'mpl2026admin')) {
    const url = new URL('/admin/login', request.url)
    url.searchParams.set('error', '1')
    url.searchParams.set('next', next)
    return NextResponse.redirect(url, 303)
  }

  const response = NextResponse.redirect(new URL(next.startsWith('/admin') ? next : '/admin', request.url), 303)
  response.cookies.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
  return response
}
