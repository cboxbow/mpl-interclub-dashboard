-- CDC Interclub 2026 v3.0 calendar alignment.
-- Keeps J1-J9 only and removes generated placeholder matches after J9.

delete from match_pairs where match_id in (select id from matches where journee_id >= 10);
delete from matches where journee_id >= 10;
delete from journees where number >= 10;

update journees set date = '2026-09-18', label = 'J1 - Coup d''envoi', status = 'upcoming' where number = 1;
update journees set date = '2026-10-16', label = 'J2 - Phase reguliere', status = 'upcoming' where number = 2;
update journees set date = '2026-11-20', label = 'J3 - Phase reguliere', status = 'upcoming' where number = 3;
update journees set date = '2026-12-18', label = 'J4 - Finale D2 Dames', status = 'upcoming' where number = 4;
update journees set date = '2027-01-15', label = 'J5 - Finale D3 Dames', status = 'upcoming' where number = 5;
update journees set date = '2027-02-19', label = 'J6 - Fin poules D1 Dames', status = 'upcoming' where number = 6;
update journees set date = '2027-03-19', label = 'J7 - Demi-finales D1 Hommes / Finale D1 Dames', status = 'upcoming' where number = 7;
update journees set date = '2027-04-16', label = 'J8 - Finale D1 Hommes / Finales D3-D4 Hommes', status = 'upcoming' where number = 8;
update journees set date = '2027-05-21', label = 'J9 - Finale D2 Hommes / Cloture saison', status = 'upcoming' where number = 9;
