CREATE TABLE IF NOT EXISTS meeting_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    object_key VARCHAR(500) NOT NULL UNIQUE,
    file_size INTEGER NOT NULL CHECK (file_size > 0),
    file_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'uploaded')),
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Mempercepat list attachment per meeting.
CREATE INDEX IF NOT EXISTS idx_attachments_meeting_id ON meeting_attachments (meeting_id);
-- Mempercepat pembersihan record 'pending' yang sudah kedaluwarsa.
CREATE INDEX IF NOT EXISTS idx_attachments_status_created ON meeting_attachments (status, created_at);

COMMENT ON COLUMN meeting_attachments.object_key IS 'Key objek di MinIO: {meeting_id}/{id}.{ext}. Tidak pernah dikirim ke client.';
COMMENT ON COLUMN meeting_attachments.status IS 'pending = URL upload sudah dibuat, belum dikonfirmasi; uploaded = objek sudah diverifikasi di MinIO';