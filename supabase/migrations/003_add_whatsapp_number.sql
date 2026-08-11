-- supabase/migrations/003_add_whatsapp_number.sql
INSERT INTO settings (key, value)
VALUES ('whatsapp_number', '"6281234567890"')
ON CONFLICT (key) DO NOTHING;