import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/adminAuth'
import { getSupabaseAdmin } from '@/lib/supabase'

const clean = (value: unknown) => String(value ?? '').trim()
const numberOrNull = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const payload = {
    gender: clean(body.gender).toUpperCase().startsWith('F') ? 'F' : 'H',
    rank: numberOrNull(body.rank),
    previous_rank: numberOrNull(body.previous_rank),
    player_name: clean(body.player_name),
    total_points: numberOrNull(body.total_points) ?? 0,
    club_name: clean(body.club_name),
    source_club_name: clean(body.source_club_name),
    mobile: clean(body.mobile),
    email: clean(body.email),
    level: clean(body.level),
    source: clean(body.source) || 'Admin',
    updated_at: new Date().toISOString(),
  }
  const sb = getSupabaseAdmin()
  const { data, error } = await sb.from('player_rankings').update(payload).eq('id', params.id).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sb = getSupabaseAdmin()
  const { error } = await sb.from('player_rankings').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
