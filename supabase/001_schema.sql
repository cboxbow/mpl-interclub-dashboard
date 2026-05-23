-- MPL INTERCLUB CHAMPIONSHIP 2026 — Supabase Schema
-- Run this in Supabase SQL editor (Database > SQL Editor)

-- ── EXTENSIONS ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── TABLES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS divisions (
  id            INTEGER PRIMARY KEY,
  name          TEXT    NOT NULL,
  short_name    TEXT    NOT NULL,
  category      TEXT    NOT NULL CHECK (category IN ('H','F')),
  level         INTEGER NOT NULL,
  n_clubs       INTEGER NOT NULL,
  format        TEXT    NOT NULL CHECK (format IN ('aller','aller-retour')),
  color         TEXT    NOT NULL DEFAULT '01D0FB',
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS clubs (
  id          SERIAL PRIMARY KEY,
  division_id INTEGER NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
  name        TEXT    NOT NULL,
  short_name  TEXT    NOT NULL,
  logo_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journees (
  id     INTEGER PRIMARY KEY,
  number INTEGER NOT NULL,
  date   DATE    NOT NULL,
  label  TEXT    NOT NULL,
  status TEXT    NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming','active','completed'))
);

CREATE TABLE IF NOT EXISTS matches (
  id           SERIAL PRIMARY KEY,
  journee_id   INTEGER NOT NULL REFERENCES journees(id),
  division_id  INTEGER NOT NULL REFERENCES divisions(id),
  home_club_id INTEGER NOT NULL REFERENCES clubs(id),
  away_club_id INTEGER NOT NULL REFERENCES clubs(id),
  phase        TEXT    NOT NULL CHECK (phase IN ('aller','retour')),
  round_number INTEGER NOT NULL,
  status       TEXT    NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','completed','forfeit')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_pairs (
  id           SERIAL PRIMARY KEY,
  match_id     INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  pair_number  INTEGER NOT NULL CHECK (pair_number BETWEEN 1 AND 3),
  home_s1      INTEGER, away_s1 INTEGER,
  home_s2      INTEGER, away_s2 INTEGER,
  home_s3      INTEGER, away_s3 INTEGER,
  winner       TEXT CHECK (winner IN ('home','away')),
  UNIQUE (match_id, pair_number)
);

-- Initialize pair rows when match is created
CREATE OR REPLACE FUNCTION init_match_pairs()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO match_pairs (match_id, pair_number) VALUES
    (NEW.id, 1), (NEW.id, 2), (NEW.id, 3)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS trg_init_pairs ON matches;
CREATE TRIGGER trg_init_pairs
  AFTER INSERT ON matches
  FOR EACH ROW EXECUTE FUNCTION init_match_pairs();

-- Auto-update match status when all 3 pairs have winners
CREATE OR REPLACE FUNCTION sync_match_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_completed INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_completed
  FROM match_pairs WHERE match_id = NEW.match_id AND winner IS NOT NULL;
  IF v_completed = 3 THEN
    UPDATE matches SET status = 'completed' WHERE id = NEW.match_id;
  END IF;
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS trg_sync_status ON match_pairs;
CREATE TRIGGER trg_sync_status
  AFTER UPDATE OF winner ON match_pairs
  FOR EACH ROW EXECUTE FUNCTION sync_match_status();

-- ── STANDINGS VIEW ────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW standings AS
WITH pair_agg AS (
  SELECT
    mp.match_id,
    SUM(CASE WHEN mp.winner='home' THEN 1 ELSE 0 END)::INT AS home_pw,
    SUM(CASE WHEN mp.winner='away' THEN 1 ELSE 0 END)::INT AS away_pw,
    -- sets won per side
    SUM(
      CASE WHEN COALESCE(mp.home_s1,0) > COALESCE(mp.away_s1,0) THEN 1 ELSE 0 END +
      CASE WHEN COALESCE(mp.home_s2,0) > COALESCE(mp.away_s2,0) THEN 1 ELSE 0 END +
      CASE WHEN COALESCE(mp.home_s3,0) > COALESCE(mp.away_s3,0) THEN 1 ELSE 0 END
    ) AS home_sets_won,
    SUM(
      CASE WHEN COALESCE(mp.away_s1,0) > COALESCE(mp.home_s1,0) THEN 1 ELSE 0 END +
      CASE WHEN COALESCE(mp.away_s2,0) > COALESCE(mp.home_s2,0) THEN 1 ELSE 0 END +
      CASE WHEN COALESCE(mp.away_s3,0) > COALESCE(mp.home_s3,0) THEN 1 ELSE 0 END
    ) AS away_sets_won,
    -- total games
    SUM(COALESCE(mp.home_s1,0)+COALESCE(mp.home_s2,0)+COALESCE(mp.home_s3,0)) AS home_games,
    SUM(COALESCE(mp.away_s1,0)+COALESCE(mp.away_s2,0)+COALESCE(mp.away_s3,0)) AS away_games,
    COUNT(*) FILTER (WHERE mp.winner IS NOT NULL) AS pairs_played
  FROM match_pairs mp
  GROUP BY mp.match_id
),
all_club_results AS (
  -- home perspective
  SELECT
    m.division_id, m.home_club_id AS club_id,
    1 AS mp,
    CASE WHEN pa.home_pw > pa.away_pw THEN 1 ELSE 0 END AS wins,
    CASE WHEN pa.home_pw < pa.away_pw THEN 1 ELSE 0 END AS losses,
    CASE WHEN pa.home_pw > pa.away_pw THEN 3 ELSE 0 END AS pts,
    pa.home_pw AS pw, pa.away_pw AS pl,
    pa.home_sets_won AS sw, pa.away_sets_won AS sl,
    pa.home_games AS gw, pa.away_games AS gl
  FROM matches m
  JOIN pair_agg pa ON pa.match_id = m.id
  WHERE m.status = 'completed' AND pa.pairs_played = 3
  UNION ALL
  -- away perspective
  SELECT
    m.division_id, m.away_club_id AS club_id,
    1, 
    CASE WHEN pa.away_pw > pa.home_pw THEN 1 ELSE 0 END,
    CASE WHEN pa.away_pw < pa.home_pw THEN 1 ELSE 0 END,
    CASE WHEN pa.away_pw > pa.home_pw THEN 3 ELSE 0 END,
    pa.away_pw, pa.home_pw,
    pa.away_sets_won, pa.home_sets_won,
    pa.away_games, pa.home_games
  FROM matches m
  JOIN pair_agg pa ON pa.match_id = m.id
  WHERE m.status = 'completed' AND pa.pairs_played = 3
),
agg AS (
  SELECT
    division_id, club_id,
    SUM(mp) AS mj, SUM(wins) AS v, SUM(losses) AS d,
    SUM(pts) AS pts,
    SUM(pw) AS pw, SUM(pl) AS pl,
    SUM(sw) AS sw, SUM(sl) AS sl, SUM(sw)-SUM(sl) AS set_diff,
    SUM(gw) AS gw, SUM(gl) AS gl, SUM(gw)-SUM(gl) AS game_diff
  FROM all_club_results
  GROUP BY division_id, club_id
)
SELECT
  c.id               AS club_id,
  c.name             AS club_name,
  c.short_name       AS club_short,
  c.division_id,
  COALESCE(a.mj,0)   AS mj,
  COALESCE(a.v,0)    AS v,
  COALESCE(a.d,0)    AS d,
  COALESCE(a.pts,0)  AS pts,
  COALESCE(a.pw,0)   AS pw,
  COALESCE(a.pl,0)   AS pl,
  COALESCE(a.sw,0)   AS sw,
  COALESCE(a.sl,0)   AS sl,
  COALESCE(a.set_diff,0)  AS set_diff,
  COALESCE(a.gw,0)   AS gw,
  COALESCE(a.gl,0)   AS gl,
  COALESCE(a.game_diff,0) AS game_diff,
  RANK() OVER (
    PARTITION BY c.division_id
    ORDER BY
      COALESCE(a.pts,0) DESC,
      COALESCE(a.pw,0) DESC,
      COALESCE(a.set_diff,0) DESC,
      COALESCE(a.game_diff,0) DESC,
      c.name
  ) AS rank
FROM clubs c
LEFT JOIN agg a ON a.club_id = c.id AND a.division_id = c.division_id
ORDER BY c.division_id, rank;

-- ── RLS (Row Level Security) ────────────────────────────────────────────────
ALTER TABLE divisions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE journees    ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches     ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_pairs ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "public_read_divisions"   ON divisions   FOR SELECT USING (true);
CREATE POLICY "public_read_clubs"       ON clubs       FOR SELECT USING (true);
CREATE POLICY "public_read_journees"    ON journees    FOR SELECT USING (true);
CREATE POLICY "public_read_matches"     ON matches     FOR SELECT USING (true);
CREATE POLICY "public_read_match_pairs" ON match_pairs FOR SELECT USING (true);

-- Admin write (using service role key — set via Supabase dashboard or anon with RLS bypass)
-- For clubs: allow update
CREATE POLICY "admin_write_clubs" ON clubs FOR ALL USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  OR auth.role() = 'authenticated'
);
CREATE POLICY "admin_write_match_pairs" ON match_pairs FOR ALL USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  OR auth.role() = 'authenticated'
);
CREATE POLICY "admin_write_matches" ON matches FOR ALL USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  OR auth.role() = 'authenticated'
);
