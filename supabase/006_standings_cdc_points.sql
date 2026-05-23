-- CDC v2.0 standings points:
-- 3-0 = winner 3 pts / loser 0 pt
-- 2-1 = winner 2 pts / loser 1 pt

CREATE OR REPLACE VIEW standings AS
WITH pair_agg AS (
  SELECT
    mp.match_id,
    SUM(CASE WHEN mp.winner='home' THEN 1 ELSE 0 END)::INT AS home_pw,
    SUM(CASE WHEN mp.winner='away' THEN 1 ELSE 0 END)::INT AS away_pw,
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
    SUM(COALESCE(mp.home_s1,0)+COALESCE(mp.home_s2,0)+COALESCE(mp.home_s3,0)) AS home_games,
    SUM(COALESCE(mp.away_s1,0)+COALESCE(mp.away_s2,0)+COALESCE(mp.away_s3,0)) AS away_games,
    COUNT(*) FILTER (WHERE mp.winner IS NOT NULL) AS pairs_played
  FROM match_pairs mp
  GROUP BY mp.match_id
),
all_club_results AS (
  SELECT
    m.division_id, m.home_club_id AS club_id,
    1 AS mp,
    CASE WHEN pa.home_pw > pa.away_pw THEN 1 ELSE 0 END AS wins,
    CASE WHEN pa.home_pw < pa.away_pw THEN 1 ELSE 0 END AS losses,
    CASE
      WHEN pa.home_pw > pa.away_pw THEN CASE WHEN pa.home_pw = 3 THEN 3 ELSE 2 END
      WHEN pa.home_pw < pa.away_pw THEN CASE WHEN pa.home_pw = 1 THEN 1 ELSE 0 END
      ELSE 0
    END AS pts,
    pa.home_pw AS pw, pa.away_pw AS pl,
    pa.home_sets_won AS sw, pa.away_sets_won AS sl,
    pa.home_games AS gw, pa.away_games AS gl
  FROM matches m
  JOIN pair_agg pa ON pa.match_id = m.id
  WHERE m.status = 'completed' AND pa.pairs_played = 3
  UNION ALL
  SELECT
    m.division_id, m.away_club_id AS club_id,
    1,
    CASE WHEN pa.away_pw > pa.home_pw THEN 1 ELSE 0 END,
    CASE WHEN pa.away_pw < pa.home_pw THEN 1 ELSE 0 END,
    CASE
      WHEN pa.away_pw > pa.home_pw THEN CASE WHEN pa.away_pw = 3 THEN 3 ELSE 2 END
      WHEN pa.away_pw < pa.home_pw THEN CASE WHEN pa.away_pw = 1 THEN 1 ELSE 0 END
      ELSE 0
    END,
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
      COALESCE(a.v,0) DESC,
      COALESCE(a.pw,0) DESC,
      COALESCE(a.set_diff,0) DESC,
      COALESCE(a.game_diff,0) DESC,
      c.name
  ) AS rank
FROM clubs c
LEFT JOIN agg a ON a.club_id = c.id AND a.division_id = c.division_id
ORDER BY c.division_id, rank;

NOTIFY pgrst, 'reload schema';
