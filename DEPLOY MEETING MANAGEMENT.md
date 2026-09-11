# 🚀 Deployment Guide — Meeting Management App (Windows VM)

Panduan deploy aplikasi Meeting Management ke Windows Server VM menggunakan GUI (Remote Desktop / UltraViewer), NSSM sebagai process manager, dan IIS sebagai reverse proxy.

---

## 📋 Arsitektur Deployment

```
Browser (LAN Kantor)
       │
       ▼
IIS (port 80) — Reverse Proxy
       ├── /api/*  → Backend Express.js (localhost:5000)
       └── /*      → Frontend Next.js   (localhost:3000)

Backend Express.js (localhost:5000)
       │
       ├── PostgreSQL (localhost:5432)
       └── Python AI Agent (localhost:8000) — dipanggil internal, tidak lewat IIS
```

Ketiga service (backend, frontend, AI agent) dijalankan sebagai **Windows Service** via NSSM, sehingga otomatis jalan tanpa perlu terminal manual dan auto-start saat VM restart.

---

## 📦 Prerequisites

- Akses Remote Desktop / UltraViewer ke VM
- VM Windows (Server atau Windows 10/11) dengan koneksi internet
- Repository Git (backend + frontend jadi satu repo, Python agent repo terpisah)
- Environment variables yang sudah disiapkan (lihat bagian [Environment Variables](#-environment-variables))

---

## 🗂️ Urutan Langkah Deploy

```
1.  Install dependencies dasar (Node.js, Python, PostgreSQL, Git)
2.  Setup database via pgAdmin
3.  Clone repository
4.  Setup & test Backend (Express) secara manual
5.  Setup & test Frontend (Next.js) secara manual
6.  Setup & test Python AI Agent secara manual
7.  Install & konfigurasi NSSM (ubah 3 service jadi Windows Service)
8.  Install & konfigurasi IIS (reverse proxy)
9.  Update environment variables sesuai IP VM
10. Testing end-to-end
```

---

## 1️⃣ Install Dependencies Dasar

### Node.js
```
Download installer LTS dari nodejs.org
Install seperti biasa (Next → Next → Finish)
Pastikan "Add to PATH" tercentang

Verifikasi (buka Command Prompt):
node -v
npm -v
```

### Python
```
Download installer dari python.org (versi 3.10+)
⚠️ WAJIB centang "Add Python to PATH" di halaman awal installer
Klik "Install Now"

Verifikasi:
python --version
```

### PostgreSQL
```
Download installer dari postgresql.org (EnterpriseDB installer)
Installer ini sudah include pgAdmin (GUI database)
Saat instalasi, set & catat password untuk user 'postgres'
```

### Git for Windows
```
Download dari git-scm.com
Install dengan opsi default
```

> ⚠️ **Catatan PowerShell:** Kalau muncul error `npm.ps1 cannot be loaded because running scripts is disabled`, jalankan ini di PowerShell **as Administrator**:
> ```powershell
> Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```
> Ketik `Y` untuk konfirmasi, lalu buka PowerShell baru.

---

## 2️⃣ Setup Database via pgAdmin

```
Buka pgAdmin dari Start Menu
→ Klik kanan "Databases" → Create → Database
→ Nama: meeting_app

Jalankan migration:
→ Klik database meeting_app → Query Tool
→ Copy-paste isi file migrations/001_init.sql
→ Klik Execute (▶)
→ Ulangi untuk file ALTER TABLE tambahan (end_time, location, 
   ai_summary, index, dll) jika terpisah
```

---

## 3️⃣ Clone Repository

```cmd
cd C:\Users\<username>\Downloads
git clone <url-repo-meeting-management>
git clone <url-repo-ai-meeting-management>
```

Struktur folder hasil clone:
```
meeting_management/
├── backend/
└── frontend/

ai_meeting_management/
└── (Python FastAPI project)
```

---

## 4️⃣ Setup & Test Backend (Express)

```cmd
cd meeting_management\backend
npm install
```

Buat file `.env`:
```cmd
notepad .env
```

```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/meeting_management
JWT_SECRET=<random_string_panjang>
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://<ip-vm>
OPENROUTER_API_KEY=<your_key>
OPENROUTER_MODEL=openai/gpt-oss-120b:free
AGENT_URL=http://localhost:8000
```

Test jalan manual:
```cmd
node src\app.js
```

Pastikan muncul `Server running on port 5000` dan `PostgreSQL: connected`. Tekan `Ctrl+C` untuk stop.

---

## 5️⃣ Setup & Test Frontend (Next.js)

```cmd
cd ..\frontend
npm install
```

Buat file `.env.local`:
```cmd
notepad .env.local
```

```env
NEXT_PUBLIC_API_URL=http://<ip-vm>/api
```

Build untuk production:
```cmd
npm run build
```

Test jalan manual:
```cmd
npm run start
```

Buka `http://localhost:3000` di browser VM — pastikan halaman login muncul.

---

## 6️⃣ Setup & Test Python AI Agent

```cmd
cd C:\Users\<username>\Downloads\ai_meeting_management
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Buat file `.env`:
```cmd
notepad .env
```

```env
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/meeting_app
OPENROUTER_API_KEY=<your_key>
OPENROUTER_MODEL=openai/gpt-oss-120b:free
APP_HOST=0.0.0.0
APP_PORT=8000
```

Test jalan manual:
```cmd
python main.py
```

Cek `http://localhost:8000/health` di browser VM.

✅ **Checkpoint:** Pastikan ketiga service sudah bisa jalan manual bersamaan (3 terminal terbuka) dan aplikasi bisa dipakai end-to-end sebelum lanjut ke NSSM.

---

## 7️⃣ Setup NSSM (Windows Service)

### Download & Extract
```
Download dari nssm.cc
Extract ke: C:\nssm
```

Buka **Command Prompt as Administrator** untuk semua langkah di bawah.

### Install Service — Backend
```cmd
C:\nssm\win64\nssm.exe install meeting-backend
```
Isi di jendela GUI NSSM:
```
Path              : C:\Program Files\nodejs\node.exe
Startup directory : C:\Users\<username>\Downloads\meeting_management\backend
Arguments         : app.js
```
Tab **I/O** (opsional, untuk debugging):
```
Output (stdout) : C:\logs\meeting-backend-out.log
Error (stderr)  : C:\logs\meeting-backend-err.log
```
Klik **Install service**.

### Install Service — Frontend
```cmd
C:\nssm\win64\nssm.exe install meeting-frontend
```
```
Path              : C:\Program Files\nodejs\npm.cmd
Startup directory : C:\Users\<username>\Downloads\meeting_management\frontend
Arguments         : start
```

### Install Service — Python Agent
```cmd
C:\nssm\win64\nssm.exe install meeting-agent
```
```
Path              : C:\Users\<username>\Downloads\ai_meeting_management\venv\Scripts\python.exe
Startup directory : C:\Users\<username>\Downloads\ai_meeting_management
Arguments         : app/main.py
```

### Aktifkan Auto-Start & Jalankan

```
Buka services.msc
Untuk masing-masing service (meeting-backend, meeting-frontend, meeting-agent):
→ Klik kanan → Properties → Startup type: Automatic → OK
→ Klik kanan → Start
```

> ⚠️ Sebelum start, pastikan tidak ada proses manual (`node.exe`, `python.exe`) yang masih jalan dari testing sebelumnya (cek Task Manager) — bisa bentrok port.

---

## 8️⃣ Setup IIS Reverse Proxy

### Install IIS
```
Control Panel → Programs → Turn Windows features on or off
→ Centang "Internet Information Services"
→ OK, tunggu instalasi
```

### Install Modul Tambahan
```
Download & install:
- URL Rewrite Module      (iis.net/downloads/microsoft/url-rewrite)
- Application Request Routing (iis.net/downloads/microsoft/application-request-routing)
```

### Enable Proxy di ARR
```
IIS Manager → klik nama SERVER (panel kiri, paling atas)
→ Double click "Application Request Routing Cache"
→ Panel kanan: "Server Proxy Settings..."
→ Centang "Enable proxy" → Apply
```

### Buat Website Baru

```
⚠️ Jangan taruh physical path di folder Downloads/Desktop — 
   IIS_IUSRS tidak punya izin akses, akan error 500.19

Buat folder dummy: C:\inetpub\meeting-app

IIS Manager → klik kanan "Sites" → "Add Website"
Site name       : meeting-app
Physical path   : C:\inetpub\meeting-app
Binding         : Type: http, Port: 80
```

> Kalau "Default Web Site" bawaan IIS masih pakai port 80, klik kanan → Stop dulu untuk menghindari konflik.

### Setup URL Rewrite Rules

Klik site **meeting-app** → buka **URL Rewrite** di panel tengah.

**Rule 1 — API ke Backend:**
```
Add Rule(s) → Reverse Proxy → Server name: localhost:5000

Edit rule tersebut:
Pattern (regex) : ^api/(.*)
Rewrite URL     : http://localhost:5000/api/{R:1}
```

**Rule 2 — Sisanya ke Frontend:**
```
Add Rule(s) → Reverse Proxy → Server name: localhost:3000

Edit rule tersebut:
Pattern (regex) : (.*)
Rewrite URL     : http://localhost:3000/{R:1}
```

> ⚠️ **Urutan rule penting!** Rule `/api/*` harus di atas rule catch-all `(.*)`. Cek & atur pakai klik kanan rule → **Move Up/Move Down**.

### Buka Port 80 di Firewall
```
Windows Defender Firewall with Advanced Security
→ Inbound Rules → New Rule → Port → TCP → 80 → Allow
→ Name: "IIS HTTP" → Finish
```

---

## 9️⃣ Update Environment Variables Sesuai IP VM

Setelah IIS aktif, update `.env` agar konsisten pakai IP VM tanpa port:

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://<ip-vm>/api
```

**Backend `.env`:**
```env
FRONTEND_URL=http://<ip-vm>
```

Setelah ubah `.env`:
```cmd
:: Build ulang frontend WAJIB setelah ubah env
cd meeting_management\frontend
npm run build
```

Restart kedua service via `services.msc` (meeting-backend & meeting-frontend).

---

## 🔟 Testing End-to-End

```
Dari browser VM maupun laptop lain di jaringan yang sama:
http://<ip-vm>

Checklist:
□ Halaman login muncul tanpa perlu sebut port
□ Login berhasil
□ Dashboard tampil dengan data meeting
□ CRUD meeting berfungsi
□ AI Agent (floating chat) merespon
□ Pindah-pindah halaman lancar
```

> 💡 Kalau AI Agent sempat error "not valid JSON" / muncul DOCTYPE HTML tepat setelah restart service — ini biasanya race condition sesaat karena service belum fully ready. Tunggu beberapa detik dan coba lagi; kalau berlanjut terus-menerus baru perlu digali lebih dalam.

---

## 🔄 Cara Deploy Ulang (Update Kode / Environment Variables)

### Kalau Ada Perubahan Kode Backend

```cmd
cd C:\Users\<username>\Downloads\meeting_management
git pull

cd backend
npm install          :: hanya jika ada package baru ditambahkan
```

Restart service:
```
services.msc → meeting-backend → Restart
```

> Backend membaca file `.js` langsung tiap dijalankan — tidak perlu build.

---

### Kalau Ada Perubahan Kode Frontend

```cmd
cd C:\Users\<username>\Downloads\meeting_management
git pull

cd frontend
npm install           :: hanya jika ada package baru
npm run build          :: ⚠️ WAJIB, jangan sampai lupa
```

Restart service:
```
services.msc → meeting-frontend → Restart
```

> ⚠️ **Ini yang paling sering kelupaan.** Next.js production meng-compile kode saat build — restart service tanpa build ulang akan tetap menjalankan versi build yang lama, meskipun kode sumber sudah ter-update dari `git pull`.

---

### Kalau Ada Perubahan Kode Python AI Agent

```cmd
cd C:\Users\<username>\Downloads\ai_meeting_management
git pull

venv\Scripts\activate
pip install -r requirements.txt   :: hanya jika ada library baru
```

Restart service:
```
services.msc → meeting-agent → Restart
```

---

### Kalau Ada Perubahan Environment Variables (.env)

```cmd
:: Edit file .env yang relevan
notepad backend\.env
notepad frontend\.env.local
notepad ai_meeting_management\.env
```

**Backend / Python Agent:** cukup restart service — env langsung terbaca ulang.

**Frontend:** environment variable `NEXT_PUBLIC_*` di-*inline* ke dalam bundle saat build. Jadi:
```cmd
cd frontend
npm run build   :: WAJIB build ulang setelah ubah .env.local
```
Baru restart service.

---

### Ringkasan Cepat

| Yang Berubah | `npm/pip install`? | Build Ulang? | Restart Service |
|---|---|---|---|
| Backend (kode) | Jika ada package baru | ❌ Tidak perlu | ✅ |
| Backend (`.env`) | ❌ | ❌ | ✅ |
| Frontend (kode) | Jika ada package baru | ✅ Selalu wajib | ✅ |
| Frontend (`.env.local`) | ❌ | ✅ Selalu wajib | ✅ |
| Python Agent (kode) | Jika ada library baru | ❌ Tidak perlu | ✅ |
| Python Agent (`.env`) | ❌ | ❌ | ✅ |

---

## 🛠️ Troubleshooting Umum

### Service gagal start — "Service did not return an error"
```
1. Cek Task Manager, pastikan tidak ada proses manual (node.exe/
   python.exe) yang masih jalan dan bentrok port
2. Buka NSSM edit (nssm edit <nama-service>), cek ulang Path dan 
   Startup directory pakai path lengkap (bukan relatif)
3. Aktifkan logging di tab I/O NSSM, cek isi file log error-nya
```

### Service Python Agent — "error code 3"
```
Biasanya path python.exe di dalam venv salah/tidak ditemukan.
Cek file benar-benar ada di: <folder-agent>\venv\Scripts\python.exe
```

### IIS — HTTP Error 500.19 "Cannot read configuration file"
```
Physical path website ada di folder user (Downloads/Desktop) yang 
tidak bisa diakses IIS_IUSRS. Pindahkan physical path ke 
C:\inetpub\<nama-app> atau berikan permission Read & execute ke 
IIS_IUSRS pada folder tersebut.
```

### Perubahan kode frontend tidak muncul di browser
```
Lupa jalankan `npm run build` setelah git pull atau ubah .env.local. 
Build ulang, lalu restart service meeting-frontend.
```

### AI Agent tidak merespon / "not valid JSON"
```
1. Cek service meeting-agent statusnya Running di services.msc
2. Cek langsung http://localhost:8000/health di browser VM
3. Kalau baru saja restart beberapa service berurutan, tunggu 
   beberapa detik — bisa jadi race condition sesaat sampai semua 
   service settle
```

---

## 📌 Catatan Tambahan

- Python AI Agent (port 8000) **tidak perlu** rule IIS — dipanggil langsung oleh backend secara internal via `AGENT_URL=http://localhost:8000` di server yang sama.
- Simpan kredensial (`JWT_SECRET`, password PostgreSQL, API key) dengan aman, jangan commit `.env` ke Git.
- Selama masih tahap testing intensif dengan perubahan kode sering, disarankan tetap jalankan service secara manual di terminal (bukan via NSSM) untuk mempermudah debugging — baru pindah ke NSSM + IIS ketika kode sudah dirasa stabil untuk dipakai/didemokan ke orang lain.