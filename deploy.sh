#!/bin/bash

# Script automat pentru deployment pe server propriu
# Rulează acest script pe serverul tău pentru a instala proiectul

set -e

echo "🚀 Începe deployment-ul proiectului Victoria Ocară..."

# Variabile
PROJECT_DIR="/opt/victoriaocara"
BACKUP_DIR="/opt/flight-schedule-backup-$(date +%Y%m%d-%H%M%S)"
REPO_URL="https://github.com/ionelgonta/victoriaocara.com.git"

# 1. Backup proiect existent
echo "📦 Creez backup pentru proiectul existent..."
if [ -d "/opt/flight-schedule" ]; then
    mv /opt/flight-schedule $BACKUP_DIR
    echo "✅ Backup creat: $BACKUP_DIR"
fi

# 2. Creează directorul pentru noul proiect
echo "📁 Creez directorul proiectului..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# 3. Clonează repository-ul
echo "📥 Clonez proiectul din GitHub..."
git clone $REPO_URL .

# 4. Verifică și instalează Node.js
echo "🔧 Verific Node.js..."
if ! command -v node &> /dev/null; then
    echo "📦 Instalez Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
fi

echo "✅ Node.js versiunea: $(node --version)"
echo "✅ NPM versiunea: $(npm --version)"

# 5. Instalează dependențele
echo "📦 Instalez dependențele..."
npm install

# 6. Configurează environment
echo "⚙️ Configurez environment..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️ IMPORTANT: Editează fișierul .env cu configurațiile tale!"
    echo "nano $PROJECT_DIR/.env"
fi

# 7. Build proiectul
echo "🔨 Build proiectul pentru producție..."
npm run build

# 8. Instalează PM2
echo "🔧 Instalez PM2..."
npm install -g pm2

# 9. Creează configurația PM2
echo "⚙️ Configurez PM2..."
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

# 10. Oprește procesele existente și pornește noul proiect
echo "🔄 Restart aplicația..."
pm2 delete victoriaocara 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# 11. Configurează Nginx
echo "🌐 Configurez Nginx..."
apt update
apt install -y nginx

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
ln -sf /etc/nginx/sites-available/victoriaocara.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testează configurația Nginx
nginx -t && systemctl reload nginx

# 12. Configurează SSL
echo "🔒 Configurez SSL..."
apt install -y certbot python3-certbot-nginx
certbot --nginx -d victoriaocara.com -d www.victoriaocara.com --non-interactive --agree-tos --email admin@victoriaocara.com

# 13. Configurează firewall
echo "🛡️ Configurez firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# 14. Configurează auto-startup
echo "🔄 Configurez auto-startup..."
pm2 startup
pm2 save

echo ""
echo "🎉 DEPLOYMENT COMPLET!"
echo ""
echo "📊 Status aplicație:"
pm2 status
echo ""
echo "🌐 Site-ul este disponibil la:"
echo "   http://victoriaocara.com"
echo "   https://victoriaocara.com"
echo ""
echo "📝 Comenzi utile:"
echo "   pm2 logs victoriaocara    # Vezi logs"
echo "   pm2 restart victoriaocara # Restart aplicația"
echo "   pm2 monit                 # Monitoring"
echo ""
echo "⚠️ NU UITA să editezi fișierul .env cu configurațiile tale:"
echo "   nano $PROJECT_DIR/.env"
echo ""