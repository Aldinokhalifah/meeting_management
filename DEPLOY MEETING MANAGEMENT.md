# 🚀 Deployment Guide — Meeting Management App (Windows VM)

Panduan deploy aplikasi Meeting Management ke Windows Server VM menggunakan GUI (Remote Desktop / UltraViewer), NSSM sebagai process manager, dan IIS sebagai reverse proxy.

---

## 📋 Arsitektur Deployment

```
Browser (LAN Kantor)
       │
       ├──► IIS (port 80) — Reverse Proxy
       │        ├── /api/*  → Backend Express.js (localhost:5000)
       │        └── /*      → Frontend Next.js   (localhost:3000)
       │
       └──► MinIO/Silo (port 9000) — langsung, TIDAK lewat IIS
                (upload & unduh dokumen pendukung memakai presigned URL)

Backend Express.js (localhost:5000)
       │
       ├── PostgreSQL (localhost:5432)
       ├── MinIO/Silo (localhost:9000)
       └── Python AI Agent (localhost:8000) — dipanggil internal, tidak lewat IIS

Python AI Agent (localhost:8000)
       │
       ├── PostgreSQL (localhost:5432)
       └── MinIO/Silo (localhost:9000) — hanya untuk menghapus file saat meeting dihapus
```

Keempat service (backend, frontend, AI agent, dan MinIO/Silo untuk penyimpanan dokumen) dijalankan sebagai **Windows Service** via NSSM, sehingga otomatis jalan tanpa perlu terminal manual dan auto-start saat VM restart.

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
6B. Setup & test MinIO (Silo) untuk dokumen pendukung
7.  Install & konfigurasi NSSM (ubah 4 service jadi Windows Service)
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

> ⚠️ Jalankan **semua** file di folder `migrations/` secara berurutan (001, 002, 003, dst). Migrasi `003_create_meeting_attachments.sql` membuat tabel `meeting_attachments` untuk fitur dokumen pendukung. Tanpa tabel ini, fitur dokumen tidak berfungsi dan file di MinIO tidak ikut terhapus saat meeting dihapus.

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

# MinIO (Silo) — penyimpanan dokumen pendukung (lihat bagian 6B)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=meeting-backend
MINIO_SECRET_KEY=<secret_user_backend>
MINIO_BUCKET=meeting-attachments
MINIO_REGION=us-east-1
# Alamat yang dibuka BROWSER untuk upload/unduh (bukan localhost!)
MINIO_PUBLIC_ENDPOINT=<ip-vm>
MINIO_PUBLIC_PORT=9000
MINIO_PUBLIC_USE_SSL=false
MAX_FILE_SIZE=10485760
MAX_ATTACHMENTS_PER_MEETING=5
PRESIGN_UPLOAD_EXPIRY=300
PRESIGN_VIEW_EXPIRY=600
PENDING_ATTACHMENT_TTL_MINUTES=15
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

# MinIO (Silo) — hanya untuk menghapus file saat meeting dihapus (lihat bagian 6B)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=meeting-agent
MINIO_SECRET_KEY=<secret_user_agent>
MINIO_BUCKET=meeting-attachments
MINIO_REGION=us-east-1
```

> ⚠️ `DATABASE_URL` agent harus menunjuk ke **database yang sama** dengan backend. Agent membaca dan menghapus data meeting (termasuk daftar dokumen) langsung dari database.

Test jalan manual:
```cmd
python main.py
```

Cek `http://localhost:8000/health` di browser VM.

✅ **Checkpoint:** Pastikan ketiga service sudah bisa jalan manual bersamaan (3 terminal terbuka) dan aplikasi bisa dipakai end-to-end sebelum lanjut ke NSSM.

---

## 6️⃣B Setup & Test MinIO (Silo) — Penyimpanan Dokumen Pendukung

Dokumen pendukung meeting disimpan di MinIO. MinIO resmi sudah tidak menyediakan binary, jadi dipakai **Silo**: fork komunitas yang kompatibel dengan MinIO (API S3, variabel `MINIO_*`, dan format data sama). Halaman rilis: `https://github.com/pgsty/silo/releases`

> ⚠️ **Pasang versi tertentu** (bukan "latest") dan selalu cek checksum. Versi yang sudah diuji dengan aplikasi ini: `RELEASE.2026-09-16T00-00-00Z`. Pantau halaman rilis untuk patch keamanan, dan uji versi baru di laptop dulu sebelum upgrade di VM.

### Download & Ekstrak
```
Dari halaman rilis RELEASE.2026-09-16T00-00-00Z, download:
  silo_20260916000000.0.0_windows_amd64.tar.gz
  silo_20260916000000.0.0_checksums.txt
```
Cek hash (Command Prompt):
```cmd
certutil -hashfile silo_20260916000000.0.0_windows_amd64.tar.gz SHA256
```
Hasilnya harus sama dengan baris `windows_amd64.tar.gz` di file checksums:
```
f99f4c376754aeea50c982afdd7aa3fd62ee9393e0ad603be570055c2342ee41
```
Ekstrak dan siapkan folder data:
```cmd
mkdir C:\minio
tar -xzf silo_20260916000000.0.0_windows_amd64.tar.gz -C C:\minio
mkdir D:\minio-data
```
> Folder data (`D:\minio-data`) taruh di disk yang ruangnya cukup, **di luar** folder aplikasi dan folder IIS. Boleh di disk C: kalau tidak ada disk lain.

### Test Jalan Manual
```cmd
set MINIO_ROOT_USER=<admin_minio>
set MINIO_ROOT_PASSWORD=<password_panjang_dan_kuat>
C:\minio\silo.exe server --address ":9000" --console-address ":9001" D:\minio-data
```
> Hindari karakter `& ^ %` di password karena bermasalah di Command Prompt.

Buka `http://localhost:9001` di browser VM dan login dengan user/password di atas.

### Buat Bucket, Policy, dan Access Key

Akun root hanya untuk administrasi. Backend dan agent memakai user sendiri dengan hak akses minimal.

```
1. Buat bucket: meeting-attachments
   → biarkan PRIVATE (jangan diberi anonymous/public access)

2. Buat 2 policy (menu Administrator → Policies → Create Policy):
   a. Nama: meeting-backend-policy  → isi JSON di bawah (a)
   b. Nama: meeting-agent-policy    → isi JSON di bawah (b)

3. Buat 2 user (menu Identity → Users → Create User):
   - Username (= access key): meeting-backend
     Password (= secret key): <secret_user_backend>
     Policy: meeting-backend-policy
   - Username (= access key): meeting-agent
     Password (= secret key): <secret_user_agent>
     Policy: meeting-agent-policy
```
> Nama menu di Console bisa sedikit berbeda antar versi.

**(a) meeting-backend-policy** — backend: upload (via presigned URL), baca, hapus:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": ["arn:aws:s3:::meeting-attachments/*"]
    }
  ]
}
```

**(b) meeting-agent-policy** — agent: hanya boleh menghapus file:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:DeleteObject"],
      "Resource": ["arn:aws:s3:::meeting-attachments/*"]
    }
  ]
}
```
> Kalau nama bucket diganti, ubah di 3 tempat: `MINIO_BUCKET` backend, `MINIO_BUCKET` agent, dan `Resource` di kedua policy.

Alternatif lewat command line (`mcli`, dari `https://github.com/pgsty/mc/releases` versi yang sama), kalau menu Console tidak ketemu:
```cmd
mcli alias set local http://localhost:9000 <admin_minio> <password_panjang_dan_kuat>
mcli admin policy create local meeting-backend-policy backend-policy.json
mcli admin policy create local meeting-agent-policy agent-policy.json
mcli admin user add local meeting-backend <secret_user_backend>
mcli admin user add local meeting-agent <secret_user_agent>
mcli admin policy attach local meeting-backend-policy --user meeting-backend
mcli admin policy attach local meeting-agent-policy --user meeting-agent
```
(`backend-policy.json` dan `agent-policy.json` berisi JSON (a) dan (b) di atas.)

Isi `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` di `.env` backend dan agent dengan user masing-masing (bukan akun root). Tekan `Ctrl+C` untuk menghentikan MinIO manual setelah selesai.

### Buka Port 9000 di Firewall
Browser user mengunggah dan mengunduh file **langsung ke MinIO**, bukan lewat IIS (signature presigned URL mencakup host dan path, jadi tidak boleh dilewatkan proxy dengan prefix).
```
Windows Defender Firewall with Advanced Security
→ Inbound Rules → New Rule → Port → TCP → 9000 → Allow
→ Name: "MinIO API"
→ setelah dibuat: klik kanan rule → Properties → tab Scope
   → Remote IP address → These IP addresses → isi subnet LAN kantor (mis. 192.168.x.0/24)
```
> ⚠️ **Jangan buka port 9001 (Console).** Akses Console cukup dari dalam VM lewat Remote Desktop: `http://localhost:9001`.

### CORS
Browser mengunggah dari alamat aplikasi (`http://<ip-vm>`) ke `http://<ip-vm>:9000`, jadi MinIO harus mengizinkan origin tersebut. Ini diatur lewat environment variable `MINIO_API_CORS_ALLOW_ORIGIN` pada service MinIO (lihat bagian NSSM):
```
MINIO_API_CORS_ALLOW_ORIGIN=http://<ip-vm>
```
Nilainya harus **persis** alamat yang dipakai user untuk membuka aplikasi (skema + host, tanpa port 80). Kalau aplikasi dibuka lewat nama host, pakai nama host itu.

### Backup Data MinIO
Dengan satu disk tidak ada redundansi, jadi folder data (`D:\minio-data`) harus masuk rutinitas backup bersama database PostgreSQL, sebaiknya di waktu yang berdekatan. Cara paling aman: hentikan service `meeting-minio` sebentar, salin folder data, lalu start lagi.

✅ **Checkpoint:** dari **laptop lain** di LAN, buka `http://<ip-vm>:9000/minio/health/live`. Halaman kosong tanpa error berarti MinIO bisa dijangkau dan firewall sudah benar.

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

### Install Service — MinIO (Silo)
```cmd
C:\nssm\win64\nssm.exe install meeting-minio
```
Tab **Application**:
```
Path              : C:\minio\silo.exe
Startup directory : C:\minio
Arguments         : server --address :9000 --console-address :9001 D:\minio-data
```
Tab **Environment** (satu variabel per baris):
```
MINIO_ROOT_USER=<admin_minio>
MINIO_ROOT_PASSWORD=<password_panjang_dan_kuat>
MINIO_API_CORS_ALLOW_ORIGIN=http://<ip-vm>
```
Tab **I/O** (opsional, untuk debugging):
```
Output (stdout) : C:\logs\meeting-minio-out.log
Error (stderr)  : C:\logs\meeting-minio-err.log
```
Klik **Install service**.

### Aktifkan Auto-Start & Jalankan

```
Buka services.msc
Untuk masing-masing service (meeting-minio, meeting-backend, meeting-frontend, meeting-agent):
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
MINIO_PUBLIC_ENDPOINT=<ip-vm>
```

**Service MinIO (NSSM):** pastikan `MINIO_API_CORS_ALLOW_ORIGIN=http://<ip-vm>` (lihat bagian 6B). Ubah lewat `nssm edit meeting-minio` → tab Environment, lalu restart `meeting-minio`.

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

Dokumen pendukung (uji dari laptop lain, BUKAN dari dalam VM):
□ Unggah PDF dan gambar di bagian Dokumen Pendukung → progress jalan, file muncul di daftar
□ Preview PDF/gambar tampil di modal; file Word/Excel bisa diunduh dengan nama yang benar
□ Ganti nama file .exe menjadi .pdf lalu unggah → ditolak "Verifikasi file gagal"
□ Participant biasa tidak melihat tombol unggah dan hapus
□ AI Agent: tanya "dokumen apa saja di meeting X" → menampilkan daftar file
□ Hapus meeting yang punya dokumen (lewat UI dan lewat AI Agent) → objeknya hilang di Console MinIO
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

### Kalau Ada Update MinIO (Silo)

```
1. Baca catatan rilis di github.com/pgsty/silo/releases, uji versi baru di
   laptop dulu (alur dokumen lengkap)
2. Backup folder data MinIO (lihat bagian 6B)
3. services.msc → meeting-minio → Stop
4. Ganti C:\minio\silo.exe dengan versi baru (cek hash SHA256 dulu)
5. Start meeting-minio, cek http://<ip-vm>:9000/minio/health/live,
   lalu unggah satu dokumen uji
```
> Folder data tidak diubah saat upgrade. Environment variable MinIO ada di NSSM: `nssm edit meeting-minio` → tab Environment, lalu restart service.

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
| MinIO (`silo.exe` baru) | ❌ | ❌ | ✅ (`meeting-minio`) |
| MinIO (env di NSSM) | ❌ | ❌ | ✅ (`meeting-minio`) |

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

### Upload dokumen dari browser gagal ("Gagal terhubung ke penyimpanan file")
```
Biasanya Postman berhasil tapi browser gagal. Cek berurutan:
1. Dari laptop user, buka http://<ip-vm>:9000/minio/health/live
   → gagal: port 9000 belum dibuka di firewall (atau scope IP salah)
2. MINIO_PUBLIC_ENDPOINT di .env backend masih localhost / bukan IP VM
   → ubah ke <ip-vm>, restart meeting-backend
3. MINIO_API_CORS_ALLOW_ORIGIN di service meeting-minio tidak sama persis
   dengan alamat yang dipakai membuka aplikasi → perbaiki, restart meeting-minio
   (browser mengirim preflight CORS sebelum upload)
```

### Upload ditolak MinIO (403) / "Izin upload ditolak atau sudah kedaluwarsa"
```
1. Link upload hanya berlaku 5 menit — coba unggah ulang
2. Ukuran file harus persis sama dengan yang dideklarasikan saat presign
   (otomatis dari browser; kalau lewat Postman, isi file_size dengan ukuran byte asli)
3. Tipe file ditentukan dari ekstensi nama file; ekstensi harus sesuai isi file
```

### "Verifikasi file gagal" padahal file valid / "Access Denied" dari MinIO
```
1. Isi file harus benar-benar sesuai ekstensinya (PDF asli, bukan hasil rename)
2. Cek policy user meeting-backend: Action s3:GetObject, s3:PutObject,
   s3:DeleteObject dan Resource arn:aws:s3:::<nama-bucket>/*
3. Nama bucket di .env (MINIO_BUCKET) harus sama dengan bucket di MinIO
   dan dengan Resource di policy
```

### Service meeting-minio gagal start
```
1. Folder data (D:\minio-data) harus sudah ada dan bisa ditulis
2. Port 9000/9001 tidak dipakai proses lain (cek Task Manager: silo.exe manual yang lupa dimatikan)
3. Cek log di C:\logs\meeting-minio-err.log
```

### Preview PDF di modal kosong
```
Klik "Buka di tab baru" — kalau PDF tampil di sana, masalahnya hanya di
tampilan iframe browser. Kalau tetap gagal, cek Network tab browser (F12)
untuk status request ke http://<ip-vm>:9000/...
```

---

## 📌 Catatan Tambahan

- Python AI Agent (port 8000) **tidak perlu** rule IIS — dipanggil langsung oleh backend secara internal via `AGENT_URL=http://localhost:8000` di server yang sama.
- Simpan kredensial (`JWT_SECRET`, password PostgreSQL, API key) dengan aman, jangan commit `.env` ke Git.
- Selama masih tahap testing intensif dengan perubahan kode sering, disarankan tetap jalankan service secara manual di terminal (bukan via NSSM) untuk mempermudah debugging — baru pindah ke NSSM + IIS ketika kode sudah dirasa stabil untuk dipakai/didemokan ke orang lain.
- MinIO/Silo (port 9000) **tidak lewat IIS**: browser berbicara langsung ke port 9000 untuk upload dan unduh dokumen. Port 9001 (Console) tidak dibuka di firewall, akses hanya dari dalam VM.
- Backend dan agent memakai user MinIO terpisah dengan hak akses minimal (lihat bagian 6B). Akun root MinIO hanya untuk administrasi dan tidak dimasukkan ke `.env` aplikasi.
- MinIO resmi tidak lagi menyediakan binary, jadi dipakai fork komunitas Silo. Pasang versi tertentu, verifikasi checksum, dan pantau rilis barunya untuk patch keamanan.
