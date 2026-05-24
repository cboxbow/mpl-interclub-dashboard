import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/adminAuth'
import { getSupabaseAdmin } from '@/lib/supabase'

const clean = (value: unknown) => String(value ?? '').trim()
const numberOrNull = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function payloadFromRow(row: Record<string, unknown>) {
  return {
    gender: clean(row.gender || row.sexe || row.category).toUpperCase().startsWith('F') ? 'F' : 'H',
    rank: numberOrNull(row.rank || row.rang),
    previous_rank: numberOrNull(row.previous_rank || row.prev || row.ancien_rang),
    player_name: clean(row.player_name || row.player || row.joueur || row.nom),
    total_points: numberOrNull(row.total_points || row.points || row.total) ?? 0,
    club_name: clean(row.club_name || row.club),
    source_club_name: clean(row.source_club_name || row.club_source),
    mobile: clean(row.mobile || row.phone || row.telephone || row.tel),
    email: clean(row.email || row.mail),
    level: clean(row.level || row.niveau),
    source: clean(row.source) || 'Admin',
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const rows: Record<string, unknown>[] = Array.isArray(body.rows) ? body.rows : [body]
  const payload = rows.map(payloadFromRow).filter((row: ReturnType<typeof payloadFromRow>) => row.player_name)
  if (!payload.length) return NextResponse.json({ error: 'Aucune ligne valide' }, { status: 400 })

  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('player_rankings')
    .upsert(payload, { onConflict: 'gender,player_name' })
    .select('*')

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function DELETE() {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sb = getSupabaseAdmin()
  const { error } = await sb.from('player_rankings').delete().neq('player_name', '__never__')
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
