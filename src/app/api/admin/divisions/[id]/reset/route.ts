import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/adminAuth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const divisionId = Number(params.id)
  const sb = getSupabaseAdmin()

  const { data: matches, error: matchError } = await sb.from('matches').select('id').eq('division_id', divisionId)
  if (matchError) return NextResponse.json({ error: matchError.message }, { status: 400 })
  const matchIds = (matches ?? []).map((match: { id: number }) => match.id)
  if (matchIds.length) {
    const { error: pairError } = await sb.from('match_pairs').delete().in('match_id', matchIds)
    if (pairError) return NextResponse.json({ error: pairError.message }, { status: 400 })
    const { error: deleteMatchesError } = await sb.from('matches').delete().in('id', matchIds)
    if (deleteMatchesError) return NextResponse.json({ error: deleteMatchesError.message }, { status: 400 })
  }

  const { data: clubs, error: clubReadError } = await sb.from('clubs').select('id').eq('division_id', divisionId)
  if (clubReadError) return NextResponse.json({ error: clubReadError.message }, { status: 400 })
  const clubIds = (clubs ?? []).map((club: { id: number }) => club.id)
  if (clubIds.length) {
    const { error: playerError } = await sb.from('club_players').delete().in('club_id', clubIds)
    if (playerError) return NextResponse.json({ error: playerError.message }, { status: 400 })
    const { error: deleteClubsError } = await sb.from('clubs').delete().in('id', clubIds)
    if (deleteClubsError) return NextResponse.json({ error: deleteClubsError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, deleted_clubs: clubIds.length, deleted_matches: matchIds.length })
}
