-- Fitur lupa password via WhatsApp.
-- Untuk mencopot fitur ini:
--   DROP TABLE IF EXISTS password_reset_tokens;
--   ALTER TABLE users DROP COLUMN IF EXISTS password_changed_at;
-- (Catatan: password_changed_at juga dipakai authMiddleware setelah Langkah 3)

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_created
    ON password_reset_tokens (user_id, created_at);