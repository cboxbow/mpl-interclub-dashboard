-- Link Admin club player entries with the official imported ranking source.

ALTER TABLE club_players ADD COLUMN IF NOT EXISTS ranking_points NUMERIC;
ALTER TABLE club_players ADD COLUMN IF NOT EXISTS ranking_gender TEXT;
ALTER TABLE club_players ADD COLUMN IF NOT EXISTS ranking_source_id INTEGER;
ALTER TABLE club_players ADD COLUMN IF NOT EXISTS ranking_source_club TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'club_players_ranking_gender_check'
  ) THEN
    ALTER TABLE club_players
      ADD CONSTRAINT club_players_ranking_gender_check
      CHECK (ranking_gender IS NULL OR ranking_gender IN ('H', 'F'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'club_players_ranking_source_id_fkey'
  ) THEN
    ALTER TABLE club_players
      ADD CONSTRAINT club_players_ranking_source_id_fkey
      FOREIGN KEY (ranking_source_id)
      REFERENCES player_rankings(id)
      ON DELETE SET NULL;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
