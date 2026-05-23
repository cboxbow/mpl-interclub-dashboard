-- Temporary admin write policies for the current anon-key based admin UI.
-- Replace this with real authenticated admin access when login is added.

ALTER POLICY "admin_write_clubs" ON clubs
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR auth.role() = 'authenticated'
    OR auth.role() = 'anon'
  )
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR auth.role() = 'authenticated'
    OR auth.role() = 'anon'
  );

ALTER POLICY "admin_write_match_pairs" ON match_pairs
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR auth.role() = 'authenticated'
    OR auth.role() = 'anon'
  )
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR auth.role() = 'authenticated'
    OR auth.role() = 'anon'
  );

ALTER POLICY "admin_write_matches" ON matches
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR auth.role() = 'authenticated'
    OR auth.role() = 'anon'
  )
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR auth.role() = 'authenticated'
    OR auth.role() = 'anon'
  );
