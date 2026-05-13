# Meeting Management API Documentation

**Base URL:** `http://localhost:5000/api`  
**Auth:** Semua endpoint (kecuali register & login) membutuhkan header:
```
Authorization: Bearer <token>
```

---

## Response Format

**Success:**
```json
{ "message": "...", "data": {} }
```

**Error:**
```json
{ "message": "..." }
```

---

## 1. Auth

### POST `/auth/register`
Registrasi user baru.

**Body:**
```json
{
  "name": "Aldino",
  "email": "aldino@test.com",
  "password": "123456"
}
```

**Response `201`:**
```json
{
  "message": "Registrasi berhasil",
  "data": {
    "id": "uuid",
    "name": "Aldino",
    "email": "aldino@test.com",
    "created_at": "2025-05-01T09:00:00"
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | Format email tidak valid |
| 400 | Password minimal 6 karakter |
| 400 | Nama tidak boleh kosong |
| 409 | Email sudah terdaftar |

---

### POST `/auth/login`
Login dan dapatkan token JWT.

**Body:**
```json
{
  "email": "aldino@test.com",
  "password": "123456"
}
```

**Response `200`:**
```json
{
  "message": "Login berhasil",
  "data": {
    "token": "jwt_token",
    "user": {
      "id": "uuid",
      "name": "Aldino",
      "email": "aldino@test.com"
    }
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | Email dan password wajib diisi |
| 401 | Email atau password salah |

---

### GET `/auth/me`
Ambil data user yang sedang login.

**Response `200`:**
```json
{
  "message": "Berhasil mendapatkan data",
  "data": {
    "id": "uuid",
    "name": "Aldino",
    "email": "aldino@test.com",
    "avatar_url": null,
    "created_at": "2025-05-01T09:00:00"
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| 401 | Token tidak ada / tidak valid |
| 404 | User tidak ditemukan |

---

## 2. Users

### GET `/users/search?q=<keyword>`
Cari user berdasarkan nama atau email (minimal 2 karakter).

**Query Params:**
| Param | Required | Keterangan |
|-------|----------|------------|
| q | ✅ | Keyword pencarian (min 2 karakter) |

**Response `200`:**
```json
{
  "message": "Berhasil mencari user",
  "data": [
    {
      "id": "uuid",
      "name": "Aldino",
      "email": "aldino@test.com",
      "avatar_url": null
    }
  ]
}
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | Query parameter q wajib diisi |
| 400 | Keyword pencarian minimal 2 karakter |

---

## 3. Meetings

### POST `/meetings`
Buat meeting baru. Host otomatis ditambahkan sebagai peserta.

**Body:**
```json
{
  "title": "Sprint Planning",
  "description": "...",
  "scheduled_at": "2025-05-01T09:00:00",
  "end_time": "2025-05-01T10:00:00",
  "location": "Ruang Rapat A",
  "participant_ids": ["uuid_user_1", "uuid_user_2"]
}
```

> `end_time`, `location`, `description`, `participant_ids` opsional.

**Response `201`:**
```json
{
  "message": "Meeting berhasil dibuat",
  "data": {
    "id": "uuid",
    "title": "Sprint Planning",
    "description": "...",
    "scheduled_at": "2025-05-01T09:00:00",
    "end_time": "2025-05-01T10:00:00",
    "location": "Ruang Rapat A",
    "status": "scheduled",
    "created_by": "uuid",
    "previous_meeting_id": null,
    "created_at": "...",
    "participants": [...]
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | Title dan jadwal wajib diisi |
| 400 | Jadwal meeting tidak boleh di masa lalu |
| 400 | Waktu selesai harus lebih besar dari waktu mulai |
| 400 | Format datetime tidak valid |
| 409 | Terdapat jadwal meeting yang bentrok |

---

### GET `/meetings`
Ambil semua meeting yang diikuti user yang login.

**Response `200`:**
```json
{
  "message": "Berhasil mengambil data meeting",
  "data": [
    {
      "id": "uuid",
      "title": "Sprint Planning",
      "scheduled_at": "2025-05-01T09:00:00",
      "end_time": "2025-05-01T10:00:00",
      "location": "Ruang Rapat A",
      "status": "scheduled",
      "my_role": "host"
    }
  ]
}
```

---

### GET `/meetings/:id`
Ambil detail meeting. Hanya peserta yang bisa akses.

**Response `200`:**
```json
{
  "message": "Berhasil mengambil detail meeting",
  "data": {
    "id": "uuid",
    "title": "Sprint Planning",
    "scheduled_at": "2025-05-01T09:00:00",
    "end_time": "2025-05-01T10:00:00",
    "location": "Ruang Rapat A",
    "status": "scheduled",
    "previous_meeting_id": null,
    "participants": [
      { "id": "uuid", "name": "Aldino", "email": "...", "role": "host" }
    ]
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| 403 | Kamu tidak memiliki akses ke meeting ini |
| 404 | Meeting tidak ditemukan |

---

### PATCH `/meetings/:id`
Update meeting. Hanya host yang bisa akses.

**Body** (semua opsional):
```json
{
  "title": "Sprint Planning Updated",
  "description": "...",
  "scheduled_at": "2025-05-01T09:00:00",
  "end_time": "2025-05-01T10:00:00",
  "location": "Ruang Rapat B",
  "status": "ongoing"
}
```

> `status` valid: `scheduled` `ongoing` `done` `cancelled`

**Response `200`:**
```json
{
  "message": "Meeting berhasil diupdate",
  "data": { ...meeting }
}
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | Waktu selesai harus lebih besar dari waktu mulai |
| 403 | Hanya host yang dapat mengubah meeting |
| 404 | Meeting tidak ditemukan |

---

### DELETE `/meetings/:id`
Hapus meeting. Hanya host yang bisa akses.

**Response `200`:**
```json
{ "message": "Meeting berhasil dihapus" }
```

**Errors:**
| Code | Message |
|------|---------|
| 403 | Hanya host yang dapat menghapus meeting |
| 404 | Meeting tidak ditemukan |

---

## 4. Participants

### POST `/meetings/:id/participants`
Tambah peserta ke meeting. Hanya host yang bisa akses.

**Body:**
```json
{ "user_id": "uuid" }
```

**Response `201`:**
```json
{
  "message": "Peserta berhasil ditambahkan",
  "data": {
    "meeting_id": "uuid",
    "user_id": "uuid",
    "role": "participant"
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | user_id wajib diisi |
| 403 | Hanya host yang dapat menambah peserta |
| 404 | Meeting tidak ditemukan |
| 404 | User tidak ditemukan |
| 409 | User sudah menjadi peserta |
| 409 | Terdapat jadwal meeting yang bentrok |

---

### PATCH `/meetings/:id/participants/:userId`
Update role peserta. Hanya host yang bisa akses.

**Body:**
```json
{ "role": "secretary" }
```

> `role` valid: `secretary` `participant` (host tidak bisa diubah)

**Response `200`:**
```json
{
  "message": "Role peserta berhasil diupdate",
  "data": {
    "meeting_id": "uuid",
    "user_id": "uuid",
    "role": "secretary"
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | Role tidak valid, gunakan secretary atau participant |
| 400 | Host tidak dapat mengubah role diri sendiri |
| 403 | Hanya host yang dapat mengubah role peserta |
| 404 | Meeting tidak ditemukan |
| 404 | User bukan peserta meeting ini |

---

### DELETE `/meetings/:id/participants/:userId`
Hapus peserta dari meeting. Hanya host yang bisa akses.

**Response `200`:**
```json
{ "message": "Peserta berhasil dihapus" }
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | Host tidak dapat menghapus diri sendiri |
| 403 | Hanya host yang dapat menghapus peserta |
| 404 | Meeting tidak ditemukan |

---

## 5. Notes

### POST `/meetings/:id/notes`
Buat notulen meeting. Hanya host & secretary yang bisa akses. 1 meeting = 1 notulen.

**Body:**
```json
{
  "content": {
    "text": "Isi notulen meeting..."
  }
}
```

**Response `201`:**
```json
{
  "message": "Notulen berhasil dibuat",
  "data": {
    "id": "uuid",
    "meeting_id": "uuid",
    "content": { "text": "..." },
    "created_by": "uuid",
    "created_by_name": "Aldino",
    "updated_at": "..."
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | Content wajib diisi |
| 403 | Kamu tidak memiliki akses ke meeting ini |
| 403 | Hanya host dan secretary yang dapat membuat notulen |
| 404 | Meeting tidak ditemukan |
| 409 | Notulen sudah ada, gunakan endpoint edit |

---

### GET `/meetings/:id/notes`
Ambil notulen meeting. Hanya peserta yang bisa akses.

**Response `200`:**
```json
{
  "message": "Berhasil mengambil notulen",
  "data": {
    "id": "uuid",
    "meeting_id": "uuid",
    "content": { "text": "..." },
    "created_by_name": "Aldino",
    "updated_at": "..."
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| 403 | Kamu tidak memiliki akses ke meeting ini |
| 404 | Meeting tidak ditemukan |
| 404 | Notulen belum dibuat |

---

### PATCH `/meetings/:id/notes`
Edit notulen meeting. Hanya host & secretary yang bisa akses.

**Body:**
```json
{
  "content": {
    "text": "Isi notulen yang diupdate..."
  }
}
```

**Response `200`:**
```json
{
  "message": "Notulen berhasil diupdate",
  "data": { ...note }
}
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | Content wajib diisi |
| 403 | Hanya host dan secretary yang dapat mengedit notulen |
| 404 | Meeting tidak ditemukan |
| 404 | Notulen belum dibuat |

---

## 6. Action Items

### POST `/meetings/:id/action-items`
Buat action item. Hanya host & secretary yang bisa akses.

**Body:**
```json
{
  "description": "Buat desain landing page",
  "assigned_to": "uuid_user",
  "due_date": "2025-05-07"
}
```

> `assigned_to` dan `due_date` opsional. `assigned_to` harus peserta meeting.

**Response `201`:**
```json
{
  "message": "Action item berhasil dibuat",
  "data": {
    "id": "uuid",
    "meeting_id": "uuid",
    "description": "Buat desain landing page",
    "assigned_to": "uuid",
    "assigned_to_name": "Aldino",
    "due_date": "2025-05-07",
    "status": "open",
    "carried_from_id": null,
    "created_at": "..."
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | Deskripsi action item tidak boleh kosong |
| 400 | Due date tidak boleh di masa lalu |
| 400 | Assignee harus merupakan peserta meeting |
| 403 | Hanya host dan secretary yang dapat membuat action item |
| 404 | Meeting tidak ditemukan |

---

### GET `/meetings/:id/action-items?status=<status>`
Ambil action items. Hanya peserta yang bisa akses.

**Query Params:**
| Param | Required | Keterangan |
|-------|----------|------------|
| status | ❌ | Filter: `open` `done` `carried_over` |

**Response `200`:**
```json
{
  "message": "Berhasil mengambil action items",
  "data": [
    {
      "id": "uuid",
      "description": "Buat desain landing page",
      "assigned_to_name": "Aldino",
      "due_date": "2025-05-07",
      "status": "open",
      "carried_from_id": null
    }
  ]
}
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | Status filter tidak valid |
| 403 | Kamu tidak memiliki akses ke meeting ini |
| 404 | Meeting tidak ditemukan |

---

### PATCH `/meetings/:id/action-items/:itemId`
Update action item. Hanya host & secretary yang bisa akses.

**Body** (semua opsional):
```json
{
  "description": "...",
  "assigned_to": "uuid",
  "due_date": "2025-05-10",
  "status": "done"
}
```

> `status` valid: `open` `done` `carried_over`

**Response `200`:**
```json
{
  "message": "Action item berhasil diupdate",
  "data": { ...action_item }
}
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | Status tidak valid |
| 403 | Hanya host dan secretary yang dapat mengedit action item |
| 404 | Meeting / Action item tidak ditemukan |

---

### DELETE `/meetings/:id/action-items/:itemId`
Hapus action item. Hanya host & secretary yang bisa akses.

**Response `200`:**
```json
{ "message": "Action item berhasil dihapus" }
```

**Errors:**
| Code | Message |
|------|---------|
| 403 | Hanya host dan secretary yang dapat menghapus action item |
| 404 | Meeting / Action item tidak ditemukan |

---

## 7. Meeting Continuation

### POST `/meetings/:id/continue`
Buat meeting lanjutan. Hanya host meeting sebelumnya yang bisa akses.  
Action items yang masih `open` otomatis di-carry over ke meeting baru.

**Body:**
```json
{
  "title": "Sprint Planning Lanjutan",
  "description": "...",
  "scheduled_at": "2025-05-08T09:00:00",
  "end_time": "2025-05-08T10:00:00",
  "location": "Ruang Rapat A",
  "participant_ids": [
    { "user_id": "uuid_lama", "role": "participant" },
    { "user_id": "uuid_baru", "role": "participant", "access_level": "summary_only" }
  ]
}
```

> **`access_level`** untuk peserta baru (tidak ikut meeting lama):
> - `full` → lihat semua detail meeting lama
> - `summary_only` → hanya lihat title, jadwal, status, deskripsi
> - `none` → tidak bisa lihat (default)
>
> Peserta lama otomatis mendapat `full` access.

**Response `201`:**
```json
{
  "message": "Meeting lanjutan berhasil dibuat",
  "data": {
    "id": "uuid",
    "title": "Sprint Planning Lanjutan",
    "previous_meeting_id": "uuid_meeting_lama",
    "participants": [...],
    "carried_action_items": [
      {
        "id": "uuid_baru",
        "description": "Action item yang belum selesai",
        "status": "open",
        "carried_from_id": "uuid_lama"
      }
    ]
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| 400 | Title dan jadwal wajib diisi |
| 400 | Access level tidak valid |
| 400 | Waktu selesai harus lebih besar dari waktu mulai |
| 403 | Hanya host yang dapat membuat meeting lanjutan |
| 404 | Meeting sebelumnya tidak ditemukan |
| 409 | Terdapat jadwal meeting yang bentrok |

---

### GET `/meetings/:id/continue/previous`
Ambil detail meeting sebelumnya. Response berbeda tergantung `access_level` user.

**Response `200` — Full Access:**
```json
{
  "message": "Berhasil mengambil meeting sebelumnya",
  "data": {
    "access_level": "full",
    "meeting": {
      "id": "uuid",
      "title": "Sprint Planning",
      "scheduled_at": "...",
      "status": "done",
      "participants": [...]
    }
  }
}
```

**Response `200` — Summary Only:**
```json
{
  "message": "Berhasil mengambil meeting sebelumnya",
  "data": {
    "access_level": "summary_only",
    "meeting": {
      "id": "uuid",
      "title": "Sprint Planning",
      "scheduled_at": "...",
      "status": "done",
      "description": "..."
    }
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| 403 | Kamu tidak memiliki akses ke meeting ini |
| 403 | Kamu tidak memiliki akses ke meeting sebelumnya |
| 404 | Meeting tidak ditemukan |
| 404 | Meeting ini tidak memiliki meeting sebelumnya |

---

## 8. AI Summary (Meeting)

Ringkasan meeting dihasilkan dari notulen (Tiptap → teks), daftar action item yang belum `done`, metadata meeting, dan peserta, lalu dikirim ke **OpenRouter** (model dari env `OPENROUTER_MODEL`, default `openai/gpt-oss-20b:free`). Hasil disimpan di kolom `ai_summary` pada meeting.

**Base path:** `/api/meetings/:id/ai`  
Semua route di bawah ini membutuhkan **Bearer token** dan user harus **peserta meeting** `:id`.

---

### POST `/meetings/:id/ai/summary`
Generate ringkasan AI untuk meeting (simpan ke database).

**Path params:**
| Param | Keterangan |
|-------|------------|
| id | UUID meeting |

**Body:** tidak ada (gunakan `Content-Type: application/json` dengan body `{}` atau tanpa body sesuai klien).

**Response `201`:**
```json
{
  "message": "AI summary berhasil dibuat",
  "data": {
    "summary": "Teks ringkasan dari model..."
  }
}
```

**Errors:**  
Middleware error global mengembalikan `status` dari `err.status` jika ada, selain itu **500** dengan body `{ "message": "<teks Error.message>" }`.  
Dari `aiService`, `message` umumnya berupa salah satu kode berikut:

| Kode `message` | Arti (kondisi bisnis) |
|----------------|------------------------|
| `MEETING_NOT_FOUND` | Meeting tidak ada |
| `ACCESS_FORBIDDEN` | User bukan peserta meeting |
| `MEETING_NOT_DONE` | Status meeting bukan `done` |
| `NOTE_EMPTY` | Tidak ada notulen / teks notulen kosong |
| `AI_RESPONSE_EMPTY` | Model tidak mengembalikan konten ringkasan |
| *(lain)* | Kegagalan jaringan/SDK OpenRouter, dll. |

> Pastikan variabel lingkungan untuk OpenRouter (mis. kunci API di konfigurasi `openrouter`) sudah benar agar pemanggilan model berhasil.

---

### GET `/meetings/:id/ai/summary`
Ambil ringkasan AI yang sudah pernah disimpan untuk meeting ini.

**Path params:** sama seperti POST.

**Response `200`:**
```json
{
  "message": "Berhasil mengambil AI summary",
  "data": {
    "summary": "Teks ringkasan yang tersimpan..."
  }
}
```
**Errors:**  
Sama seperti POST: umumnya **500** dengan `message` berupa kode, misalnya:

| Kode `message` | Arti |
|----------------|------|
| `MEETING_NOT_FOUND` | Meeting tidak ada |
| `ACCESS_FORBIDDEN` | Bukan peserta |
| `AI_SUMMARY_NOT_FOUND` | Belum pernah generate ringkasan / kolom kosong |

---

## 9. Agent (Chat)

Meneruskan percakapan ke **layanan agent eksternal** (URL dasar dari env `AGENT_URL`, endpoint `POST {AGENT_URL}/chat`). Backend Node hanya memvalidasi input, menambahkan `user_id` dari JWT, dan mengembalikan JSON dari agent ke klien.

**Base path:** `/api/agent`  
Semua route membutuhkan **Bearer token**.

---

### POST `/agent/chat`
Kirim pesan ke agent.

**Body:**
```json
{
  "message": "Apa saja action item terbuka untuk meeting saya?",
  "conversation_history": []
}
```

| Field | Required | Keterangan |
|-------|----------|------------|
| message | ✅ | Teks pertanyaan / perintah (tidak boleh kosong atau hanya spasi) |
| conversation_history | ❌ | Array riwayat percakapan; dikirim ke agent sebagai `conversation_history` (format mengikuti kontrak layanan Python/agent) |

**Response `200`:**
```json
{
  "message": "Data berhasil dikirm",
  "data": { }
}
```

Objek `data` adalah **body JSON respons** dari layanan agent (struktur tergantung implementasi agent, mis. `reply`, `sources`, dll.).

**Errors:**
| HTTP | `message` (contoh) |
|------|---------------------|
| 400 | `Pesan tidak boleh kosong` (validasi di controller) |
| 500 | `AI_AGENT_ERROR` (agent tidak jalan, koneksi ditolak, timeout, dll.) |
| 500 | Teks dari `Error.message` lain (mis. `detail` dari body error agent jika `response.ok` false) |

> Agent harus berjalan dan `AGENT_URL` harus mengarah ke service yang benar (mis. `http://localhost:8000`).

---

## 10. Error Umum

| Code | Kondisi |
|------|---------|
| 401 | Token tidak ada atau tidak valid |
| 500 | Internal Server Error |