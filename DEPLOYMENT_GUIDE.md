# Ghid Deployment Server Propriu

## Informații Server
- **IP**: 23.88.113.154
- **Username**: root
- **Password**: FlightSchedule2024!
- **Domeniu**: victoriaocara.com
- **Director actual**: /opt/flight-schedule (va fi înlocuit)

## Pași pentru Deployment

### 1. Conectare la Server
```bash
ssh root@23.88.113.154
# Password: FlightSchedule2024!
```

### 2. Backup și Curățare
```bash
# Backup proiect existent (opțional)
mv /opt/flight-schedule /opt/flight-schedule-backup-$(date +%Y%m%d)

# Creează directorul pentru noul proiect
mkdir -p /opt/victoriaocara
cd /opt/victoriaocara
```

### 3. Clonare Proiect
```bash
# Clonează repository-ul
git clone https://github.com/ionelgonta/victoriaocara.com.git .

# Sau dacă ai acces SSH
# git clone git@github.com:ionelgonta/victoriaocara.com.git .
```

### 4. Instalare Dependențe
```bash
# Instalează Node.js (dacă nu e instalat)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verifică versiunea
node --version
npm --version

# Instalează dependențele proiectului
npm install
```

### 5. Configurare Environment
```bash
# Copiază fișierul de environment
cp .env.example .env

# Editează variabilele de environment
nano .env
```

### 6. Build Proiect
```bash
# Build pentru producție
npm run build

# Verifică că build-ul a reușit
ls -la .next/
```

### 7. Configurare PM2 (Process Manager)
```bash
# Instalează PM2 global
npm install -g pm2

# Creează fișier de configurare PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'victoriaocara',
    script: 'npm',
    args: 'start',
    cwd: '/opt/victoriaocara',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Pornește aplicația cu PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Configurare Nginx
```bash
# Instalează Nginx (dacă nu e instalat)
apt update
apt install -y nginx

# Creează configurația pentru site
cat > /etc/nginx/sites-available/victoriaocara.com << 'EOF'
server {
    listen 80;
    server_name victoriaocara.com www.victoriaocara.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Activează site-ul
ln -s /etc/nginx/sites-available/victoriaocara.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 9. Configurare SSL cu Let's Encrypt
```bash
# Instalează Certbot
apt install -y certbot python3-certbot-nginx

# Obține certificat SSL
certbot --nginx -d victoriaocara.com -d www.victoriaocara.com

# Verifică auto-renewal
certbot renew --dry-run
```

### 10. Configurare Firewall
```bash
# Configurează UFW
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
```

## Comenzi Utile pentru Mentenanță

### Verificare Status
```bash
# Status PM2
pm2 status
pm2 logs victoriaocara

# Status Nginx
systemctl status nginx
nginx -t

# Status aplicație
curl -I http://localhost:3000
```

### Update Proiect
```bash
cd /opt/victoriaocara

# Pull ultimele modificări
git pull origin main

# Reinstalează dependențele (dacă e necesar)
npm install

# Rebuild
npm run build

# Restart aplicația
pm2 restart victoriaocara
```

### Backup Database
```bash
# Dacă folosești MongoDB local
mongodump --db art-gallery --out /opt/backups/$(date +%Y%m%d)

# Sau pentru MongoDB Atlas (nu e necesar backup local)
```

## Troubleshooting

### Probleme comune:
1. **Port 3000 ocupat**: `lsof -i :3000` și `kill -9 PID`
2. **Nginx erori**: `tail -f /var/log/nginx/error.log`
3. **PM2 nu pornește**: `pm2 delete all && pm2 start ecosystem.config.js`
4. **SSL probleme**: `certbot renew --force-renewal`

## Monitorizare
```bash
# Logs în timp real
pm2 logs victoriaocara --lines 100

# Monitoring
pm2 monit

# Restart automat la reboot
pm2 startup
pm2 save
```

## Notă Importantă
Acest deployment va înlocui complet proiectul flight-schedule existent. Asigură-te că ai backup-uri dacă e necesar.