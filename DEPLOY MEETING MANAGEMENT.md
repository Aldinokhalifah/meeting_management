# Deploy Meeting Management

## Persiapan Sebelum Deploy

### Yang Harus Disiapkan
- ✅ Akses SSH ke server kantor (IP, username, password/SSH key)
- ✅ Domain atau subdomain (opsional, bisa pakai IP saja dulu)
- ✅ Source code di Git repository (GitHub/GitLab)
- ✅ Environment variables (.env) untuk ketiga service
- ✅ OpenRouter API key, Resend API key (kalau email diaktifkan)

## Urutan Langkah Deploy
1. Setup server dasar (update, firewall, user)
2. Install dependencies (Node.js, Python, PostgreSQL, Nginx)
3. Setup database
4. Clone & setup backend (Express)
5. Clone & setup frontend (Next.js)
6. Clone & setup Python AI Agent
7. Setup PM2 untuk process management
8. Setup Nginx reverse proxy
9. Setup SSL (kalau ada domain)
10. Testing & monitoring

## Setup Server Dasar

```bash
# SSH ke server
ssh username@ip-server-kantor

# Update sistem
sudo apt update && sudo apt upgrade -y

# Setup firewall dasar
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Cek status
sudo ufw status
```

## Install Dependencies

### Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # pastikan v20+
npm -v
```

### Python

```bash
sudo apt install -y python3 python3-pip python3-venv
python3 --version   # pastikan 3.10+
```

### PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### PM2 (process manager global)

```bash
sudo npm install -g pm2
```

## Setup Database

```bash
sudo -u postgres psql

-- Di dalam psql:
CREATE DATABASE meeting_app;
CREATE USER meeting_user WITH ENCRYPTED PASSWORD 'password_yang_kuat';
GRANT ALL PRIVILEGES ON DATABASE meeting_app TO meeting_user;
\q

jalankan migration:
psql -U meeting_user -d meeting_app -h localhost -f migrations/001_init.sql
```

## Clone & Setup Backend

```bash
cd /var/www
sudo mkdir meeting-management
sudo chown $USER:$USER meeting-management
cd meeting-management

git clone <repo-url> .
cd backend
npm install
```

### Buat `.env` production

```bash
nano .env
```

Isi file `.env`:

```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://meeting_user:password_yang_kuat@localhost:5432/meeting_app
JWT_SECRET=ganti_dengan_random_string_panjang
JWT_EXPIRES_IN=1d
FRONTEND_URL=https://meeting.namadomain.com
OPENROUTER_API_KEY=your_key
OPENROUTER_MODEL=openai/gpt-oss-120b:free
AGENT_URL=http://localhost:8000
RESEND_API_KEY=your_key
FROM_EMAIL=noreply@namadomain.com
```

### Test manual sebelum PM2

```bash
node src/app.js
# Pastikan tidak error, lalu Ctrl+C
```

## Clone & Setup Frontend

```bash
cd /var/www/meeting-management/frontend
npm install
```

### Buat `.env.local` production

```bash
nano .env.local
```

Isi file `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://meeting.namadomain.com/api
```

### Build untuk production

```bash
npm run build
```

## Setup Python AI Agent

```bash
cd /var/www/meeting-management/python-agent
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Buat `.env`

```bash
nano .env
```

Isi file `.env`:

```env
DATABASE_URL=postgresql://meeting_user:password_yang_kuat@localhost:5432/meeting_app
OPENROUTER_API_KEY=your_key
OPENROUTER_MODEL=openai/gpt-oss-120b:free
APP_HOST=0.0.0.0
APP_PORT=8000
```

### Test manual dulu

```bash
python main.py
# Pastikan tidak error, lalu Ctrl+C
```

## Setup PM2 untuk Semua Service

Buat file konfigurasi PM2 di root project — `ecosystem.config.js`:

```js
module.exports = {
  apps: [
    {
      name: 'meeting-backend',
      cwd: '/var/www/meeting-management/backend',
      script: 'src/app.js',
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
      max_memory_restart: '300M',
    },
    {
      name: 'meeting-frontend',
      cwd: '/var/www/meeting-management/frontend',
      script: 'npm',
      args: 'start',
      env: { NODE_ENV: 'production', PORT: 3000 },
      autorestart: true,
      max_memory_restart: '300M',
    },
    {
      name: 'meeting-agent',
      cwd: '/var/www/meeting-management/python-agent',
      script: 'venv/bin/uvicorn',
      args: 'main:app --host 0.0.0.0 --port 8000',
      interpreter: 'none',
      autorestart: true,
      max_memory_restart: '300M',
    },
  ],
};
```

### Jalankan semua service

```bash
cd /var/www/meeting-management
pm2 start ecosystem.config.js
```

### Cek status

```bash
pm2 status
pm2 logs   # cek log realtime semua service
```

### Setup auto start saat server reboot

```bash
pm2 startup
pm2 save
```

## Setup Nginx Reverse Proxy

Buat file konfigurasi Nginx:

```bash
sudo nano /etc/nginx/sites-available/meeting-app
```

Isi file Nginx:

```nginx
server {
    listen 80;
    server_name meeting.namadomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan konfigurasi:

```bash
sudo ln -s /etc/nginx/sites-available/meeting-app /etc/nginx/sites-enabled/
sudo nginx -t   # test config tidak ada error
sudo systemctl restart nginx
```

## Setup SSL (Kalau Ada Domain)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d meeting.namadomain.com
```

## Testing & Monitoring

```bash
# Cek semua service jalan
pm2 status

# Cek log kalau ada error
pm2 logs meeting-backend
pm2 logs meeting-frontend
pm2 logs meeting-agent

# Cek resource usage
pm2 monit

# Test akses dari browser
curl http://localhost:3000
curl http://localhost:5000/api/health
curl http://localhost:8000/health
```

## Workflow Update Kode ke Depannya

Setiap ada perubahan kode:

```bash
cd /var/www/meeting-management
git pull origin main
```

### Kalau ada perubahan backend

```bash
cd backend && npm install
pm2 restart meeting-backend
```

### Kalau ada perubahan frontend

```bash
cd ../frontend && npm install && npm run build
pm2 restart meeting-frontend
```

### Kalau ada perubahan python agent

```bash
cd ../python-agent && source venv/bin/activate && pip install -r requirements.txt
pm2 restart meeting-agent
```

## Checklist Lengkap

- [ ] Server updated, firewall aktif
- [ ] Node.js, Python, PostgreSQL, Nginx, PM2 terinstall
- [ ] Database dibuat & migration dijalankan
- [ ] Backend .env terisi, test manual jalan
- [ ] Frontend .env.local terisi, build berhasil
- [ ] Python agent .env terisi, test manual jalan
- [ ] ecosystem.config.js dibuat
- [ ] PM2 menjalankan ketiga service + auto-start saat reboot
- [ ] Nginx reverse proxy terkonfigurasi
- [ ] SSL terpasang (kalau ada domain)
- [ ] Testing akses dari browser berhasil
