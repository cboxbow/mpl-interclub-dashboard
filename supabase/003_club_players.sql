-- Club player lists for Admin > Equipes
-- Run this after 001_schema.sql and 002_seed.sql.

CREATE TABLE IF NOT EXISTS club_players (
  id           SERIAL PRIMARY KEY,
  club_id      INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  last_name    TEXT    NOT NULL DEFAULT '',
  first_name   TEXT    NOT NULL DEFAULT '',
  ranking      INTEGER,
  ranking_points NUMERIC,
  ranking_gender TEXT CHECK (ranking_gender IN ('H', 'F')),
  ranking_source_id INTEGER REFERENCES player_rankings(id) ON DELETE SET NULL,
  ranking_source_club TEXT,
  player_status TEXT NOT NULL DEFAULT 'NvEQ'
    CHECK (player_status IN ('EQ','NvEQ','INVIT')),
  is_unranked  BOOLEAN NOT NULL DEFAULT false,
  player_confirmed BOOLEAN NOT NULL DEFAULT false,
  club_validated BOOLEAN NOT NULL DEFAULT false,
  license_number TEXT,
  category     TEXT,
  phone        TEXT,
  email        TEXT,
  notes        TEXT,
  player_order INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_club_players_club_id ON club_players(club_id);

CREATE OR REPLACE FUNCTION sync_club_players_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS trg_sync_club_players_updated_at ON club_players;
CREATE TRIGGER trg_sync_club_players_updated_at
  BEFORE UPDATE ON club_players
  FOR EACH ROW EXECUTE FUNCTION sync_club_players_updated_at();

ALTER TABLE club_players ENABLE ROW LEVEL SECURITY;

ALTER TABLE club_players ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE club_players ADD COLUMN IF NOT EXISTS player_status TEXT NOT NULL DEFAULT 'NvEQ';
ALTER TABLE club_players ADD COLUMN IF NOT EXISTS is_unranked BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE club_players ADD COLUMN IF NOT EXISTS player_confirmed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE club_players ADD COLUMN IF NOT EXISTS club_validated BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE club_players ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE club_players ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE club_players ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE club_players ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE club_players ADD COLUMN IF NOT EXISTS ranking_points NUMERIC;
ALTER TABLE club_players ADD COLUMN IF NOT EXISTS ranking_gender TEXT;
ALTER TABLE club_players ADD COLUMN IF NOT EXISTS ranking_source_id INTEGER;
ALTER TABLE club_players ADD COLUMN IF NOT EXISTS ranking_source_club TEXT;

DROP POLICY IF EXISTS "public_read_club_players" ON club_players;
CREATE POLICY "public_read_club_players" ON club_players
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_write_club_players" ON club_players;
CREATE POLICY "admin_write_club_players" ON club_players
  FOR ALL USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR auth.role() = 'authenticated'
    OR auth.role() = 'anon'
  )
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR auth.role() = 'authenticated'
    OR auth.role() = 'anon'
  );

NOTIFY pgrst, 'reload schema';
