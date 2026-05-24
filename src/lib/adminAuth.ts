import { createHash } from 'crypto'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE = 'mpl_admin_session'

export function adminToken() {
  return createHash('sha256')
    .update(process.env.ADMIN_PASSWORD ?? 'mpl2026admin')
    .digest('hex')
}

export function isAdminRequest() {
  return cookies().get(ADMIN_COOKIE)?.value === adminToken()
}
