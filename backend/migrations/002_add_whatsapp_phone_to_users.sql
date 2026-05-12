ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_phone VARCHAR(32);

COMMENT ON COLUMN users.whatsapp_phone IS 'Nomor WhatsApp tanpa + (disarankan format E.164, mis. 6281234567890)';
