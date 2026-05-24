-- MPL INTERCLUB CHAMPIONSHIP 2026 — Seed Data
-- Run AFTER 001_schema.sql

-- DIVISIONS
INSERT INTO divisions (id,name,short_name,category,level,n_clubs,format,color,display_order) VALUES
  (1,'D1 HOMMES — MASTERS','D1H','H',1,8,'aller-retour','01D0FB',1),
  (2,'D2 HOMMES — CHALLENGER','D2H','H',2,5,'aller-retour','3B82F6',3),
  (3,'D3 HOMMES — OPEN','D3H','H',3,6,'aller','8B5CF6',5),
  (4,'D4 HOMMES — RISING','D4H','H',4,6,'aller','6B7280',7),
  (5,'D1 DAMES — MASTERS','D1F','F',1,4,'aller-retour','EC4899',2),
  (6,'D2 DAMES — CHALLENGER','D2F','F',2,4,'aller-retour','F97316',4),
  (7,'D3 DAMES — OPEN','D3F','F',3,5,'aller','10B981',6);

-- JOURNEES (15 dates — 3e vendredi de chaque mois)
INSERT INTO journees (id,number,date,label,status) VALUES
  (1,1,'2026-09-18','Ven. 18 sep. 2026','upcoming'),
  (2,2,'2026-10-16','Ven. 16 oct. 2026','upcoming'),
  (3,3,'2026-11-20','Ven. 20 nov. 2026','upcoming'),
  (4,4,'2026-12-18','Ven. 18 déc. 2026','upcoming'),
  (5,5,'2027-01-15','Ven. 15 jan. 2027','upcoming'),
  (6,6,'2027-02-19','Ven. 19 fév. 2027','upcoming'),
  (7,7,'2027-03-19','Ven. 19 mar. 2027','upcoming'),
  (8,8,'2027-04-16','Ven. 16 avr. 2027','upcoming'),
  (9,9,'2027-05-21','Ven. 21 mai 2027','upcoming'),
  (10,10,'2027-06-18','Ven. 18 juin 2027','upcoming'),
  (11,11,'2027-07-16','Ven. 16 juil. 2027','upcoming'),
  (12,12,'2027-08-20','Ven. 20 août 2027','upcoming'),
  (13,13,'2027-09-17','Ven. 17 sep. 2027','upcoming'),
  (14,14,'2027-10-15','Ven. 15 oct. 2027','upcoming'),
  (15,15,'2027-11-19','Ven. 19 nov. 2027','upcoming');

-- CLUBS (placeholder names — edit via Admin > Clubs)
INSERT INTO clubs (division_id,name,short_name) VALUES
  (1,'Club A (D1H)','D1A'),
  (1,'Club B (D1H)','D1B'),
  (1,'Club C (D1H)','D1C'),
  (1,'Club D (D1H)','D1D'),
  (1,'Club E (D1H)','D1E'),
  (1,'Club F (D1H)','D1F'),
  (1,'Club G (D1H)','D1G'),
  (1,'Club H (D1H)','D1H'),
  (2,'Club A (D2H)','D2A'),
  (2,'Club B (D2H)','D2B'),
  (2,'Club C (D2H)','D2C'),
  (2,'Club D (D2H)','D2D'),
  (2,'Club E (D2H)','D2E'),
  (3,'Club A (D3H)','D3A'),
  (3,'Club B (D3H)','D3B'),
  (3,'Club C (D3H)','D3C'),
  (3,'Club D (D3H)','D3D'),
  (3,'Club E (D3H)','D3E'),
  (3,'Club F (D3H)','D3F'),
  (4,'Club A (D4H)','D4A'),
  (4,'Club B (D4H)','D4B'),
  (4,'Club C (D4H)','D4C'),
  (4,'Club D (D4H)','D4D'),
  (4,'Club E (D4H)','D4E'),
  (4,'Club F (D4H)','D4F'),
  (5,'Club A (D1F)','D1A'),
  (5,'Club B (D1F)','D1B'),
  (5,'Club C (D1F)','D1C'),
  (5,'Club D (D1F)','D1D'),
  (6,'Club A (D2F)','D2A'),
  (6,'Club B (D2F)','D2B'),
  (6,'Club C (D2F)','D2C'),
  (6,'Club D (D2F)','D2D'),
  (7,'Club A (D3F)','D3A'),
  (7,'Club B (D3F)','D3B'),
  (7,'Club C (D3F)','D3C'),
  (7,'Club D (D3F)','D3D'),
  (7,'Club E (D3F)','D3E');

-- MATCHES (pre-generated round-robin schedule)
-- NOTE: club IDs are sequential starting from 1 per division
-- Adjust if your auto-increment starts differently

DO $$
DECLARE
  v_club_ids INT[];
  v_home_id INT; v_away_id INT;
  v_journee_id INT;
BEGIN

  -- D1 HOMMES — MASTERS
  -- J1 aller round 1
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (1,1,1,8,'aller',1);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (1,1,2,7,'aller',1);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (1,1,3,6,'aller',1);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (1,1,4,5,'aller',1);
  -- J2 aller round 2
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (2,1,1,7,'aller',2);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (2,1,8,6,'aller',2);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (2,1,2,5,'aller',2);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (2,1,3,4,'aller',2);
  -- J3 aller round 3
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (3,1,1,6,'aller',3);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (3,1,7,5,'aller',3);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (3,1,8,4,'aller',3);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (3,1,2,3,'aller',3);
  -- J4 aller round 4
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (4,1,1,5,'aller',4);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (4,1,6,4,'aller',4);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (4,1,7,3,'aller',4);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (4,1,8,2,'aller',4);
  -- J5 aller round 5
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (5,1,1,4,'aller',5);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (5,1,5,3,'aller',5);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (5,1,6,2,'aller',5);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (5,1,7,8,'aller',5);
  -- J6 aller round 6
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (6,1,1,3,'aller',6);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (6,1,4,2,'aller',6);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (6,1,5,8,'aller',6);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (6,1,6,7,'aller',6);
  -- J7 aller round 7
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (7,1,1,2,'aller',7);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (7,1,3,8,'aller',7);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (7,1,4,7,'aller',7);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (7,1,5,6,'aller',7);
  -- J8 retour round 1
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (8,1,8,1,'retour',1);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (8,1,7,2,'retour',1);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (8,1,6,3,'retour',1);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (8,1,5,4,'retour',1);
  -- J9 retour round 2
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (9,1,7,1,'retour',2);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (9,1,6,8,'retour',2);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (9,1,5,2,'retour',2);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (9,1,4,3,'retour',2);
  -- J10 retour round 3
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (10,1,6,1,'retour',3);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (10,1,5,7,'retour',3);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (10,1,4,8,'retour',3);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (10,1,3,2,'retour',3);
  -- J11 retour round 4
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (11,1,5,1,'retour',4);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (11,1,4,6,'retour',4);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (11,1,3,7,'retour',4);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (11,1,2,8,'retour',4);
  -- J12 retour round 5
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (12,1,4,1,'retour',5);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (12,1,3,5,'retour',5);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (12,1,2,6,'retour',5);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (12,1,8,7,'retour',5);
  -- J13 retour round 6
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (13,1,3,1,'retour',6);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (13,1,2,4,'retour',6);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (13,1,8,5,'retour',6);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (13,1,7,6,'retour',6);
  -- J14 retour round 7
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (14,1,2,1,'retour',7);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (14,1,8,3,'retour',7);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (14,1,7,4,'retour',7);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (14,1,6,5,'retour',7);

  -- D2 HOMMES — CHALLENGER
  -- J1 aller round 1
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (1,2,10,13,'aller',1);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (1,2,11,12,'aller',1);
  -- J2 aller round 2
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (2,2,9,13,'aller',2);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (2,2,10,11,'aller',2);
  -- J3 aller round 3
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (3,2,9,12,'aller',3);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (3,2,13,11,'aller',3);
  -- J4 aller round 4
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (4,2,9,11,'aller',4);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (4,2,12,10,'aller',4);
  -- J5 aller round 5
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (5,2,9,10,'aller',5);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (5,2,12,13,'aller',5);
  -- J6 retour round 1
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (6,2,13,10,'retour',1);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (6,2,12,11,'retour',1);
  -- J7 retour round 2
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (7,2,13,9,'retour',2);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (7,2,11,10,'retour',2);
  -- J8 retour round 3
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (8,2,12,9,'retour',3);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (8,2,11,13,'retour',3);
  -- J9 retour round 4
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (9,2,11,9,'retour',4);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (9,2,10,12,'retour',4);
  -- J10 retour round 5
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (10,2,10,9,'retour',5);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (10,2,13,12,'retour',5);

  -- D3 HOMMES — OPEN
  -- J1 aller round 1
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (1,3,14,19,'aller',1);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (1,3,15,18,'aller',1);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (1,3,16,17,'aller',1);
  -- J2 aller round 2
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (2,3,14,18,'aller',2);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (2,3,19,17,'aller',2);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (2,3,15,16,'aller',2);
  -- J3 aller round 3
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (3,3,14,17,'aller',3);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (3,3,18,16,'aller',3);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (3,3,19,15,'aller',3);
  -- J4 aller round 4
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (4,3,14,16,'aller',4);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (4,3,17,15,'aller',4);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (4,3,18,19,'aller',4);
  -- J5 aller round 5
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (5,3,14,15,'aller',5);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (5,3,16,19,'aller',5);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (5,3,17,18,'aller',5);

  -- D4 HOMMES — RISING
  -- J1 aller round 1
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (1,4,20,25,'aller',1);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (1,4,21,24,'aller',1);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (1,4,22,23,'aller',1);
  -- J2 aller round 2
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (2,4,20,24,'aller',2);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (2,4,25,23,'aller',2);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (2,4,21,22,'aller',2);
  -- J3 aller round 3
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (3,4,20,23,'aller',3);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (3,4,24,22,'aller',3);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (3,4,25,21,'aller',3);
  -- J4 aller round 4
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (4,4,20,22,'aller',4);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (4,4,23,21,'aller',4);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (4,4,24,25,'aller',4);
  -- J5 aller round 5
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (5,4,20,21,'aller',5);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (5,4,22,25,'aller',5);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (5,4,23,24,'aller',5);

  -- D1 DAMES — MASTERS
  -- J1 aller round 1
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (1,5,26,29,'aller',1);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (1,5,27,28,'aller',1);
  -- J2 aller round 2
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (2,5,26,28,'aller',2);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (2,5,29,27,'aller',2);
  -- J3 aller round 3
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (3,5,26,27,'aller',3);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (3,5,28,29,'aller',3);
  -- J4 retour round 1
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (4,5,29,26,'retour',1);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (4,5,28,27,'retour',1);
  -- J5 retour round 2
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (5,5,28,26,'retour',2);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (5,5,27,29,'retour',2);
  -- J6 retour round 3
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (6,5,27,26,'retour',3);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (6,5,29,28,'retour',3);

  -- D2 DAMES — CHALLENGER
  -- J1 aller round 1
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (1,6,30,33,'aller',1);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (1,6,31,32,'aller',1);
  -- J2 aller round 2
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (2,6,30,32,'aller',2);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (2,6,33,31,'aller',2);
  -- J3 aller round 3
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (3,6,30,31,'aller',3);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (3,6,32,33,'aller',3);
  -- J4 retour round 1
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (4,6,33,30,'retour',1);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (4,6,32,31,'retour',1);
  -- J5 retour round 2
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (5,6,32,30,'retour',2);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (5,6,31,33,'retour',2);
  -- J6 retour round 3
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (6,6,31,30,'retour',3);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (6,6,33,32,'retour',3);

  -- D3 DAMES — OPEN
  -- J1 aller round 1
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (1,7,35,38,'aller',1);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (1,7,36,37,'aller',1);
  -- J2 aller round 2
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (2,7,34,38,'aller',2);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (2,7,35,36,'aller',2);
  -- J3 aller round 3
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (3,7,34,37,'aller',3);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (3,7,38,36,'aller',3);
  -- J4 aller round 4
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (4,7,34,36,'aller',4);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (4,7,37,35,'aller',4);
  -- J5 aller round 5
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (5,7,34,35,'aller',5);
  INSERT INTO matches (journee_id,division_id,home_club_id,away_club_id,phase,round_number)
    VALUES (5,7,37,38,'aller',5);

END $$;
