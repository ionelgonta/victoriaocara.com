# Deployment Rapid pe Server

## Conectare la Server
```bash
ssh root@23.88.113.154
# Password: FlightSchedule2024!
```

## Deployment Automat (Recomandat)
```bash
# Descarcă și rulează script-ul de deployment
curl -sSL https://raw.githubusercontent.com/ionelgonta/victoriaocara.com/main/deploy.sh | bash
```

## Sau Manual:
```bash
# 1. Backup și curățare
mv /opt/flight-schedule /opt/flight-schedule-backup-$(date +%Y%m%d)

# 2. Clonează proiectul
mkdir -p /opt/victoriaocara
cd /opt/victoriaocara
git clone https://github.com/ionelgonta/victoriaocara.com.git .

# 3. Instalează Node.js (dacă nu e instalat)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 4. Instalează dependențele și build
npm install
npm run build

# 5. Configurează environment
cp .env.example .env
nano .env  # Editează cu configurațiile tale

# 6. Instalează și configurează PM2
npm install -g pm2
pm2 start npm --name "victoriaocara" -- start
pm2 save
pm2 startup

# 7. Configurează Nginx
apt install -y nginx
# Copiază configurația din DEPLOYMENT_GUIDE.md

# 8. SSL cu Let's Encrypt
apt install -y certbot python3-certbot-nginx
certbot --nginx -d victoriaocara.com -d www.victoriaocara.com
```

## Verificare
```bash
pm2 status
curl -I http://localhost:3000
curl -I https://victoriaocara.com
```

## Update Viitor
```bash
cd /opt/victoriaocara
git pull origin main
npm install
npm run build
pm2 restart victoriaocara
```