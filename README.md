# 📋 Meeting Management App

Aplikasi manajemen meeting internal berbasis web yang dibangun untuk PT. Probesco Disatama. Dirancang untuk memudahkan pengelolaan jadwal meeting, notulen, action items, dan dilengkapi dengan fitur AI Assistant.

---

## 📑 Daftar Isi

- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Arsitektur](#arsitektur)
- [Struktur Project](#struktur-project)
- [Prerequisites](#prerequisites)
- [Instalasi & Setup](#instalasi--setup)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [API Documentation](#api-documentation)
- [AI Agent](#ai-agent)
- [Fitur Notifikasi](#fitur-notifikasi)
- [Deployment](#deployment)

---

## ✨ Fitur

### Core Features
- **Autentikasi** — Register, login, dan manajemen profil user
- **Manajemen Meeting** — Buat, edit, hapus, dan kelola jadwal meeting
- **Peserta Meeting** — Undang peserta, atur role (Host, Secretary, Participant)
- **Notulen** — Rich text editor (Tiptap) untuk mencatat notulen meeting
- **Action Items** — Buat dan kelola tugas dari hasil meeting dengan assignee dan deadline
- **Meeting Continuation** — Sambungkan meeting ke meeting berikutnya dengan carry-over action items
- **Access Control** — Peserta yang tidak diundang tidak bisa melihat detail meeting

### Advanced Features
- **AI Insight** — Ringkasan otomatis meeting menggunakan LLM setelah meeting selesai
- **Email Notification** — Kirim undangan meeting dan ringkasan otomatis via email ⚠️ *(saat ini dinonaktifkan — lihat [Fitur Notifikasi](#fitur-notifikasi))*
- **WhatsApp Notification** — Kirim notifikasi via WhatsApp Business API 🚧 *(belum aktif — menunggu WA Business API key)*
- **AI Agent (Chatbot)** — Asisten floating chat untuk mengelola meeting menggunakan bahasa natural
- **Room Management** — Tampilan status ketersediaan ruang rapat secara real-time
- **Cek Jadwal Bentrok** — Validasi otomatis jadwal meeting yang bertabrakan

---

## 🛠️ Tech Stack

### Frontend
| Teknologi | Versi | Fungsi |
|---|---|---|
| Next.js | 14+ | React framework (App Router) |
| React | 19 | UI library |
| Tailwind CSS | 4 | Styling |
| TanStack React Query | 5 | Data fetching & caching |
| Tiptap | Latest | Rich text editor |
| Lucide React | Latest | Icon library |
| React Hot Toast | Latest | Notifikasi |
| React Markdown | Latest | Render markdown |

### Backend (Express)
| Teknologi | Versi | Fungsi |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express.js | Latest | HTTP framework |
| PostgreSQL | 14+ | Database |
| node-postgres (pg) | Latest | PostgreSQL client |
| bcryptjs | Latest | Password hashing |
| jsonwebtoken | Latest | JWT authentication |
| openai | Latest | OpenRouter API client |
| resend | Latest | Email service |
| helmet | Latest | Security headers |
| cors | Latest | Cross-origin requests |

### AI Agent (Python)
| Teknologi | Versi | Fungsi |
|---|---|---|
| Python | 3.10+ | Runtime |
| FastAPI | 0.115.0 | HTTP framework |
| psycopg2 | 2.9.9 | PostgreSQL client |
| openai | 1.51.0 | OpenRouter API client |
| uvicorn | 0.30.6 | ASGI server |
| pydantic | 2.9.2 | Data validation |

---

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  Dashboard │ Meeting │ Profile │ Floating Chat (AI)     │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP REST
┌──────────────────────▼──────────────────────────────────┐
│                  Backend (Express.js)                    │
│   Auth │ Meetings │ Notes │ Action Items │ AI Routes    │
└──────────┬───────────────────────────┬───────────────────┘
           │ PostgreSQL                │ HTTP
┌──────────▼──────────┐   ┌───────────▼───────────────────┐
│     PostgreSQL      │   │      AI Agent (FastAPI)        │
│     Database        │   │  Tools: Meeting, Participants  │
└─────────────────────┘   │  Action Items, Notes, Info     │
                          └───────────┬───────────────────┘
                                      │ API Call
                          ┌───────────▼───────────────────┐
                          │    OpenRouter API              │
                          │  (deepseek/gpt-oss model)     │
                          └───────────────────────────────┘
```

---

## 📁 Struktur Project

```
meeting-management/
├── frontend/                      # Next.js App
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── Login/         # Halaman login
│   │   │   │   └── Register/      # Halaman register
│   │   │   ├── (pages)/
│   │   │   │   ├── layout.jsx     # Layout dengan sidebar
│   │   │   │   ├── dashboard/     # Halaman dashboard
│   │   │   │   ├── meeting/       # Halaman list & detail meeting
│   │   │   │   └── profile/       # Halaman profil user
│   │   │   ├── layout.js
│   │   │   └── page.js
│   │   ├── components/
│   │   │   ├── agent/             # Floating chat components
│   │   │   ├── dashboard/         # Dashboard section components
│   │   │   ├── layout/            # Sidebar, Navbar
│   │   │   ├── meeting/           # Meeting components & modals
│   │   │   ├── profile/           # Profile components
│   │   │   └── ui/                # Reusable UI components
│   │   ├── hooks/                 # React Query hooks
│   │   ├── lib/                   # Utilities & helpers
│   │   ├── providers/             # React Query provider
│   │   └── services/              # API service functions
│   ├── .env.local
│   └── package.json
│
├── backend/                       # Express.js API
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # PostgreSQL connection
│   │   │   ├── openrouter.js      # OpenRouter AI client
│   │   │   └── resend.js          # Resend email client
│   │   ├── controllers/           # Request handlers
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification
│   │   │   └── errorHandler.js    # Centralized error handling
│   │   ├── repositories/          # Database queries
│   │   ├── routes/                # API routes
│   │   ├── services/              # Business logic
│   │   └── utils/
│   │       ├── emailTemplates.js  # HTML email templates
│   │       ├── tiptapToText.js    # Tiptap JSON to plain text
│   │       └── prompt.js          # AI prompt template
│   ├── migrations/
│   │   └── 001_init.sql           # Database schema
│   ├── .env
│   └── package.json
│
└── python-agent/                  # FastAPI AI Agent
    ├── app/
    │   ├── core/
    │   │   └── config.py          # Environment config
    │   ├── db/
    │   │   └── postgres.py        # PostgreSQL connection
    │   ├── schemas/
    │   │   └── chat.py            # Pydantic models
    │   ├── tools/
    │   │   ├── __init__.py        # Tool router
    │   │   ├── meeting_tools.py   # Meeting CRUD tools
    │   │   ├── participant_tools.py
    │   │   ├── action_item_tools.py
    │   │   └── info_tools.py      # Schedule & rooms info
    │   ├── agent.py               # Agent orchestrator
    │   └── main.py                # FastAPI entry point
    ├── .env
    └── requirements.txt
```

---

## 📦 Prerequisites

Pastikan sudah terinstall:

- **Node.js** v18 atau lebih baru
- **npm** v9 atau lebih baru
- **Python** v3.10 atau lebih baru
- **PostgreSQL** v14 atau lebih baru
- **Git**

---

## 🚀 Instalasi & Setup

### 1. Clone Repository & Repository AI Agent

```bash
git clone https://github.com/Aldinokhalifah/meeting_management.git
cd backend
```
```bash
git clone https://github.com/Aldinokhalifah/ai_agent_meeting_management.git
```

### 2. Setup Database

Buat database PostgreSQL baru:

```bash
psql -U postgres
CREATE DATABASE meeting_management;
\q
```

Jalankan migration:

```bash
psql -U postgres -d meeting_management -f backend/migrations/001_init.sql
```

### 3. Setup Backend (Express)

```bash
cd backend
npm install
```

Salin file environment:

```bash
cp .env.example .env
```

Isi file `.env` (lihat bagian [Konfigurasi Environment](#konfigurasi-environment)).

### 4. Setup Frontend (Next.js)

```bash
cd frontend
npm install
```

Salin file environment:

```bash
cp .env.example .env.local
```

### 5. Setup Python AI Agent

```bash
cd python-agent

# Buat virtual environment
python -m venv venv

# Aktivasi venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Salin file environment:

```bash
cp .env.example .env
```

---

## ⚙️ Konfigurasi Environment

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/meeting_app

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Frontend URL (untuk CORS)
FRONTEND_URL=http://localhost:3000

# OpenRouter AI
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-oss-120b:free
APP_URL=http://localhost:3000

# Resend Email
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com

# Python AI Agent URL
AGENT_URL=http://localhost:8000
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Python Agent `.env`

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/meeting_app
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-oss-120b:free
APP_HOST=0.0.0.0
APP_PORT=8000
```

---

## ▶️ Menjalankan Aplikasi

Jalankan ketiga service secara bersamaan di terminal yang berbeda:

### Terminal 1 — Backend (Express)

```bash
cd backend
npm run dev
# Server berjalan di http://localhost:5000
```

### Terminal 2 — Frontend (Next.js)

```bash
cd frontend
npm run dev
# Aplikasi berjalan di http://localhost:3000
```

### Terminal 3 — Python AI Agent

```bash
cd python-agent

# Aktivasi venv dulu
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

python main.py
# Agent berjalan di http://localhost:8000
```

Buka browser dan akses `http://localhost:3000`.

---

## 📚 API Documentation

Base URL: `http://localhost:5000/api`

Semua endpoint (kecuali register & login) membutuhkan header:
```
Authorization: Bearer <token>
```

### Auth Endpoints
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/auth/register` | Registrasi user baru |
| POST | `/auth/login` | Login dan dapatkan token |
| GET | `/auth/me` | Data user yang sedang login |

### User Endpoints
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/users/search?q=keyword` | Cari user by nama/email |
| PATCH | `/users/profile` | Update profil |
| PATCH | `/users/password` | Ganti password |

### Meeting Endpoints
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/meetings` | Buat meeting baru |
| GET | `/meetings` | List semua meeting user |
| GET | `/meetings/:id` | Detail meeting |
| PATCH | `/meetings/:id` | Update meeting |
| DELETE | `/meetings/:id` | Hapus meeting |

### Participant Endpoints
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/meetings/:id/participants` | Tambah peserta |
| PATCH | `/meetings/:id/participants/:userId` | Update role peserta |
| DELETE | `/meetings/:id/participants/:userId` | Hapus peserta |

### Notes Endpoints
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/meetings/:id/notes` | Buat notulen |
| GET | `/meetings/:id/notes` | Ambil notulen |
| PATCH | `/meetings/:id/notes` | Update notulen |

### Action Items Endpoints
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/meetings/:id/action-items` | Buat action item |
| GET | `/meetings/:id/action-items` | List action items |
| PATCH | `/meetings/:id/action-items/:itemId` | Update action item |
| DELETE | `/meetings/:id/action-items/:itemId` | Hapus action item |

### Meeting Continuation Endpoints
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/meetings/:id/continue` | Buat meeting lanjutan |
| GET | `/meetings/:id/continue/previous` | Lihat meeting sebelumnya |

### AI Endpoints
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/meetings/:id/ai/summary` | Generate AI summary |
| GET | `/meetings/:id/ai/summary` | Ambil AI summary |
| POST | `/agent/chat` | Chat dengan AI Agent |

---

## 🤖 AI Agent

AI Agent adalah asisten meeting berbasis LLM yang bisa menerima perintah dalam bahasa natural.

### Cara Akses

Klik tombol 🤖 di pojok kanan bawah aplikasi untuk membuka floating chat.

### Kemampuan AI Agent

```
Meeting:
• Buat meeting baru
• Lihat daftar meeting
• Cari meeting berdasarkan judul
• Lihat detail meeting
• Ubah status meeting (mulai/selesai/batalkan)
• Hapus meeting

Peserta:
• Cari user berdasarkan nama/email
• Tambahkan peserta ke meeting
• Hapus peserta dari meeting
• Update role peserta

Action Items:
• Lihat action items saya
• Lihat action items per meeting
• Buat action item baru
• Update status action item
• Hapus action item

Informasi:
• Jadwal hari ini
• Status ketersediaan ruangan
• Notulen meeting
• AI Summary meeting
• Meeting minggu ini
```

### Contoh Perintah

```
"Buatkan meeting Sprint Planning besok jam 9 pagi di Ruang Rapat A"
"Jadwal meeting aku hari ini apa aja?"
"Tambahkan Budi ke meeting Sprint Planning"
"Action items aku yang belum selesai?"
"Ruangan mana yang available sekarang?"
"Bacakan summary meeting Design Review"
```

---

## 🔔 Fitur Notifikasi

Aplikasi mendukung 2 channel notifikasi — **Email** dan **WhatsApp**. Keduanya mengirimkan notifikasi pada event yang sama.

---

### 📧 Email (via Resend)

> ⚠️ **Status: Dinonaktifkan sementara**
> Fitur email sudah diimplementasikan dan teruji, namun saat ini dinonaktifkan. Untuk mengaktifkan kembali, uncomment kode email di `meetingService.js` dan pastikan environment variable `RESEND_API_KEY` dan `FROM_EMAIL` sudah terisi.

**Event yang memicu email:**

**1. Undangan Meeting**
Dikirim ketika host menambahkan peserta baru ke meeting.

Isi email:
- Judul meeting
- Tanggal dan waktu
- Lokasi
- Nama host

**2. Ringkasan Meeting**
Dikirim ke semua peserta ketika host mengakhiri meeting (status → done).

Isi email:
- AI Summary (jika tersedia)
- Notulen meeting
- Action items yang di-assign ke penerima email

**Catatan development:**
Untuk development, gunakan `FROM_EMAIL=onboarding@resend.dev` — email hanya bisa dikirim ke email yang terdaftar di akun Resend. Untuk production, daftarkan dan verifikasi custom domain di [resend.com/domains](https://resend.com/domains).

**Environment variables yang dibutuhkan:**
```env
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
```

---

### 💬 WhatsApp (via WhatsApp Business API)

> 🚧 **Status: Belum aktif — menunggu WhatsApp Business API key**
> Fitur WhatsApp sudah dirancang untuk mengirimkan notifikasi yang sama seperti email, namun implementasinya menunggu akses WhatsApp Business API.

**Provider yang direkomendasikan:**

| Provider | Keterangan |
|---|---|
| **Meta Cloud API** | Langsung dari Meta, gratis 1000 conversation/bulan. Daftar di [developers.facebook.com](https://developers.facebook.com) |
| **Fonnte** | Provider lokal Indonesia, harga terjangkau |
| **Wablas** | Provider lokal Indonesia |
| **Twilio** | Populer & reliable, berbayar |

**Event yang akan memicu WA:**
- Undangan meeting → pesan WA ke peserta baru
- Meeting selesai → pesan WA ringkasan ke semua peserta
- Action item → pesan WA ke user yang di-assign

**Cara mengaktifkan nanti:**
1. Daftarkan WhatsApp Business Account
2. Dapatkan API key dari provider pilihan
3. Tambahkan environment variable:
```env
WA_API_KEY=your_wa_api_key
WA_PHONE_NUMBER_ID=your_phone_number_id
```
4. Uncomment kode WA di `meetingService.js`

> **Catatan:** Migrasi dari email ke WA tidak memerlukan perubahan logic trigger — hanya ganti implementasi pengiriman pesan di `emailService.js` atau buat `waService.js` terpisah.

---

## 🗄️ Database Schema

```
users
meetings (→ users)
meeting_participants (→ meetings, users)
meeting_continuation_access (→ meetings, users)
notes (→ meetings, users)
action_items (→ meetings, users, action_items)
```

Kolom penting:
- `meetings.status`: `scheduled | ongoing | done | cancelled`
- `meetings.previous_meeting_id`: FK untuk meeting continuation
- `meetings.ai_summary`: Hasil ringkasan AI
- `meeting_participants.role`: `host | secretary | participant`
- `meeting_continuation_access.access_level`: `full | summary_only | none`
- `action_items.status`: `open | done | carried_over`
- `action_items.carried_from_id`: FK untuk carry-over action items

---

## 🚢 Deployment

### Build Frontend

```bash
cd frontend
npm run build
npm run start
```

### Backend Production

```bash
cd backend
NODE_ENV=production npm start
```

### Python Agent Production

```bash
cd python-agent
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
```

### Rekomendasi Stack Deployment

| Service | Rekomendasi |
|---|---|
| Frontend | Vercel |
| Backend | Railway / VPS |
| Python Agent | VPS / Server Kantor |
| Database | Supabase / Neon / VPS |
| Email | Resend (custom domain) |

---

## 👤 Peran & Akses

| Fitur | Host | Secretary | Participant |
|---|---|---|---|
| Lihat detail meeting | ✅ | ✅ | ✅ |
| Edit meeting | ✅ | ❌ | ❌ |
| Hapus meeting | ✅ | ❌ | ❌ |
| Start/End meeting | ✅ | ❌ | ❌ |
| Tambah/hapus peserta | ✅ | ❌ | ❌ |
| Update role peserta | ✅ | ❌ | ❌ |
| Buat/edit notulen | ✅ | ✅ | ❌ |
| Buat/hapus action item | ✅ | ✅ | ❌ |
| Update status action item | ✅ | ✅ | ❌ |
| Buat meeting lanjutan | ✅ | ❌ | ❌ |

---

## 🔒 Keamanan

- Password di-hash menggunakan bcrypt (salt rounds: 10)
- Autentikasi menggunakan JWT dengan expiry 1 hari
- Semua endpoint dilindungi middleware JWT
- CORS dikonfigurasi hanya untuk origin frontend
- Helmet.js untuk security headers
- Parameterized queries untuk mencegah SQL injection
- Validasi input di level service

---

## 📝 Catatan Pengembangan

Dikembangkan sebagai project magang di PT. Probesco Disatama oleh **Aldino** — Mahasiswa Teknik Informatika STT Nurul Fikri.

**Periode pengembangan:** 2026
