export interface Division {
  id: number
  name: string
  short_name: string
  category: 'H' | 'F'
  level: number
  n_clubs: number
  format: 'aller' | 'aller-retour'
  color: string
  display_order: number
}

export interface Club {
  id: number
  division_id: number
  name: string
  short_name: string
  logo_url?: string
}

export interface ClubPlayer {
  id?: number
  club_id: number
  last_name: string
  first_name: string
  ranking: number | null
  license_number?: string | null
  category?: string | null
  phone?: string | null
  email?: string | null
  notes?: string | null
  player_order?: number
  created_at?: string
  updated_at?: string
}

export interface Journee {
  id: number
  number: number
  date: string
  label: string
  status: 'upcoming' | 'active' | 'completed'
}

export interface Match {
  id: number
  journee_id: number
  division_id: number
  home_club_id: number
  away_club_id: number
  phase: 'aller' | 'retour'
  round_number: number
  status: 'scheduled' | 'completed' | 'forfeit'
  created_at: string
  // joined
  home_club?: Club
  away_club?: Club
  journee?: Journee
  division?: Division
  pairs?: MatchPair[]
}

export interface MatchPair {
  id: number
  match_id: number
  pair_number: 1 | 2 | 3
  home_s1: number | null; away_s1: number | null
  home_s2: number | null; away_s2: number | null
  home_s3: number | null; away_s3: number | null
  winner: 'home' | 'away' | null
}

export interface Standing {
  club_id: number
  club_name: string
  club_short: string
  division_id: number
  mj: number; v: number; d: number; pts: number
  pw: number; pl: number
  sw: number; sl: number; set_diff: number
  gw: number; gl: number; game_diff: number
  rank: number
}
