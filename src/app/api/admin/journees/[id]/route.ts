import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/adminAuth'
import { getSupabaseAdmin } from '@/lib/supabase'

interface Params {
  params: { id: string }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const journeeId = Number(params.id)
  if (!Number.isFinite(journeeId)) {
    return NextResponse.json({ error: 'Journee invalide' }, { status: 400 })
  }

  const sb = getSupabaseAdmin()
  const { data: matches, error: matchReadError } = await sb.from('matches').select('id').eq('journee_id', journeeId)
  if (matchReadError) return NextResponse.json({ error: matchReadError.message }, { status: 400 })

  const matchIds = (matches ?? []).map(match => match.id)
  if (matchIds.length) {
    const { error: pairsError } = await sb.from('match_pairs').delete().in('match_id', matchIds)
    if (pairsError) return NextResponse.json({ error: pairsError.message }, { status: 400 })

    const { error: matchesError } = await sb.from('matches').delete().in('id', matchIds)
    if (matchesError) return NextResponse.json({ error: matchesError.message }, { status: 400 })
  }

  const { error } = await sb.from('journees').delete().eq('id', journeeId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true, deleted_matches: matchIds.length })
}
