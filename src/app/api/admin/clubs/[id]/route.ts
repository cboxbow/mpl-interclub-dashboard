import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/adminAuth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const clubId = Number(params.id)
  const sb = getSupabaseAdmin()

  const { data: matches, error: matchError } = await sb
    .from('matches')
    .select('id')
    .or(`home_club_id.eq.${clubId},away_club_id.eq.${clubId}`)
  if (matchError) return NextResponse.json({ error: matchError.message }, { status: 400 })

  const matchIds = (matches ?? []).map((match: { id: number }) => match.id)
  if (matchIds.length) {
    const { error: pairError } = await sb.from('match_pairs').delete().in('match_id', matchIds)
    if (pairError) return NextResponse.json({ error: pairError.message }, { status: 400 })
    const { error: deleteMatchesError } = await sb.from('matches').delete().in('id', matchIds)
    if (deleteMatchesError) return NextResponse.json({ error: deleteMatchesError.message }, { status: 400 })
  }

  const { error: playersError } = await sb.from('club_players').delete().eq('club_id', clubId)
  if (playersError) return NextResponse.json({ error: playersError.message }, { status: 400 })

  const { error } = await sb.from('clubs').delete().eq('id', clubId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, deleted_matches: matchIds.length })
}
