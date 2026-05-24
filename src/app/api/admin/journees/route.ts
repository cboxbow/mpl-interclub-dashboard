import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/adminAuth'
import { getSupabaseAdmin } from '@/lib/supabase'

const clean = (value: unknown) => String(value ?? '').trim()
const num = (value: unknown) => Number(value) || null

function rowPayload(row: Record<string, unknown>) {
  const number = num(row.number || row.numero || row.journee || row.J)
  const date = clean(row.date)
  const status = clean(row.status).toLowerCase()
  return {
    id: num(row.id) ?? number,
    number,
    date,
    label: clean(row.label || row.libelle) || (number && date ? `J${number} - ${date}` : ''),
    status: ['upcoming', 'active', 'completed'].includes(status) ? status : 'upcoming',
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const rows: Record<string, unknown>[] = Array.isArray(body.rows) ? body.rows : [body]
  const payload = rows.map(rowPayload).filter(row => row.number && row.date)
  if (!payload.length) return NextResponse.json({ error: 'Aucune journee valide' }, { status: 400 })
  const sb = getSupabaseAdmin()
  const { data, error } = await sb.from('journees').upsert(payload, { onConflict: 'id' }).select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function DELETE() {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sb = getSupabaseAdmin()

  const { data: matches, error: matchReadError } = await sb.from('matches').select('id')
  if (matchReadError) return NextResponse.json({ error: matchReadError.message }, { status: 400 })

  const matchIds = (matches ?? []).map(match => match.id)
  if (matchIds.length) {
    const { error: pairsError } = await sb.from('match_pairs').delete().in('match_id', matchIds)
    if (pairsError) return NextResponse.json({ error: pairsError.message }, { status: 400 })

    const { error: matchesError } = await sb.from('matches').delete().in('id', matchIds)
    if (matchesError) return NextResponse.json({ error: matchesError.message }, { status: 400 })
  }

  const { error } = await sb.from('journees').delete().neq('id', -1)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, deleted_matches: matchIds.length })
}
