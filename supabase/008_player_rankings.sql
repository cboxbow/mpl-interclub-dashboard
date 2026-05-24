-- Player rankings imported from:
-- - Padel League - RANKINGS - APR 26.xlsx
-- - LISTE DES JOUEURS CLUBS.xlsx

CREATE TABLE IF NOT EXISTS player_rankings (
  id               SERIAL PRIMARY KEY,
  gender           TEXT NOT NULL CHECK (gender IN ('H', 'F')),
  rank             INTEGER,
  previous_rank    INTEGER,
  player_name      TEXT NOT NULL,
  total_points     NUMERIC NOT NULL DEFAULT 0,
  club_name        TEXT,
  source_club_name TEXT,
  mobile           TEXT,
  email            TEXT,
  level            TEXT,
  source           TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (gender, player_name)
);

ALTER TABLE player_rankings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_player_rankings" ON player_rankings;
DROP POLICY IF EXISTS "admin_write_player_rankings" ON player_rankings;

CREATE POLICY "public_read_player_rankings"
  ON player_rankings FOR SELECT
  USING (true);

CREATE POLICY "admin_write_player_rankings"
  ON player_rankings FOR ALL
  USING (true)
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
