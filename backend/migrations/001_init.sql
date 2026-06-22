CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_phone VARCHAR(32);

-- 1. Indexing untuk Tabel Users
-- Email sudah otomatis di-index karena UNIQUE constraint.
-- Index pada 'name' berguna jika ada fitur search user berdasarkan nama.
CREATE INDEX idx_users_name ON users (name);

CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'done', 'cancelled')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    previous_meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE meetings ADD COLUMN ai_summary TEXT;

-- 2. Indexing untuk Tabel Meetings
-- Mempercepat pencarian meeting berdasarkan pembuat atau status (misal: cari meeting 'ongoing').
CREATE INDEX idx_meetings_created_by ON meetings (created_by);
CREATE INDEX idx_meetings_status ON meetings (status);
-- Penting untuk sorting berdasarkan waktu meeting.
CREATE INDEX idx_meetings_scheduled_at ON meetings (scheduled_at);
-- Untuk mempermudah tracking histori meeting (self-reference).
CREATE INDEX idx_meetings_previous_id ON meetings (previous_meeting_id);
CREATE INDEX idx_meetings_title ON meetings (title);

-- Tambah di tabel meetings
ALTER TABLE meetings ADD COLUMN end_time TIMESTAMP;
ALTER TABLE meetings ADD COLUMN location VARCHAR(255);

-- Index untuk end_time (berguna untuk query cek bentrok)
CREATE INDEX idx_meetings_end_time ON meetings (end_time);
CREATE INDEX idx_meetings_location ON meetings (location);

CREATE TABLE meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'participant' CHECK (role IN ('host', 'secretary', 'participant')),
    UNIQUE(meeting_id, user_id)
);

-- 3. Indexing untuk Tabel Meeting Participants
-- Meskipun sudah ada UNIQUE(meeting_id, user_id), eksplisit index pada user_id 
-- sangat membantu query "tampilkan semua meeting yang diikuti oleh User X".
CREATE INDEX idx_participants_user_id ON meeting_participants (user_id);

CREATE TABLE meeting_continuation_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    continuation_meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    source_meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    access_level VARCHAR(20) DEFAULT 'none' CHECK (access_level IN ('full', 'summary_only', 'none')),
    UNIQUE(continuation_meeting_id, source_meeting_id, user_id)
);

-- 4. Indexing untuk Tabel Meeting Continuation Access
CREATE INDEX idx_mca_user_id ON meeting_continuation_access (user_id);
CREATE INDEX idx_mca_source_meeting ON meeting_continuation_access (source_meeting_id);

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    content JSONB,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Indexing untuk Tabel Notes
-- Foreign key indexing wajib agar join meeting -> notes cepat.
CREATE INDEX idx_notes_meeting_id ON notes (meeting_id);
-- Index GIN pada JSONB sangat powerful jika kamu sering melakukan filter/search di dalam isi content.
CREATE INDEX idx_notes_content_gin ON notes USING GIN (content);

CREATE TABLE action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    carried_from_id UUID REFERENCES action_items(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'done', 'carried_over')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Indexing untuk Tabel Action Items
-- Foreign keys
CREATE INDEX idx_action_items_meeting_id ON action_items (meeting_id);
CREATE INDEX idx_action_items_assigned_to ON action_items (assigned_to);
-- Mempercepat query "tugas yang deadline-nya sudah dekat" atau "tugas yang masih open".
CREATE INDEX idx_action_items_due_date ON action_items (due_date);
CREATE INDEX idx_action_items_status ON action_items (status);
-- Tracking item yang dibawa dari meeting sebelumnya.
CREATE INDEX idx_action_items_carried_from ON action_items (carried_from_id);
