import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_COOKIE = 'mpl_admin_session'

async function sha256(value: string) {
  const data = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!pathname.startsWith('/admin')) return NextResponse.next()
  if (pathname.startsWith('/admin/login')) return NextResponse.next()

  const expected = await sha256(process.env.ADMIN_PASSWORD ?? 'mpl2026admin')
  if (request.cookies.get(ADMIN_COOKIE)?.value === expected) return NextResponse.next()

  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/admin/login'
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*'],
}
