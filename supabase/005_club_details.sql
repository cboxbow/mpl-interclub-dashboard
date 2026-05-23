-- Club venue/contact details for Admin > Clubs.

ALTER TABLE clubs ADD COLUMN IF NOT EXISTS venue_details TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS contact_email TEXT;

NOTIFY pgrst, 'reload schema';
