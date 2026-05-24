import { NextResponse } from 'next/server'
import { ADMIN_COOKIE } from '@/lib/adminAuth'

export async function POST() {
  const response = NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'), 303)
  response.cookies.delete(ADMIN_COOKIE)
  return response
}
