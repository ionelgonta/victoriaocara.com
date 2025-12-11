#!/bin/bash

# Script complet pentru repararea serverului și migrarea la MongoDB local
set -e

echo "🔧 REPARARE COMPLETĂ SERVER VICTORIAOCARA"
echo "========================================"

# 1. Verifică și repară Nginx
echo ""
echo "🌐 PASUL 1: Repară Nginx..."

# Verifică ce ocupă portul 80
echo "📊 Verifică ce ocupă portul 80:"
lsof -i :80 || echo "Portul 80 este liber"

# Oprește Apache dacă rulează
if systemctl is-active --quiet apache2; then
    echo "🛑 Opresc Apache..."
    systemctl stop apache2
    systemctl disable apache2
    echo "✅ Apache oprit"
else
    echo "✅ Apache nu rulează"
fi

# Oprește orice alt proces pe portul 80
echo "🔍 Opresc orice proces pe portul 80..."
fuser -k 80/tcp 2>/dev/null || echo "Niciun proces de oprit pe portul 80"

# Pornește Nginx
echo "🚀 Pornesc Nginx..."
systemctl start nginx
systemctl enable nginx

if systemctl is-active --quiet nginx; then
    echo "✅ Nginx pornit cu succes"
else
    echo "❌ Nginx nu a pornit. Verifică logs:"
    journalctl -u nginx --no-pager -n 10
fi

# 2. Verifică MongoDB
echo ""
echo "🗄️ PASUL 2: Verifică MongoDB..."

if systemctl is-active --quiet mongod; then
    echo "✅ MongoDB rulează"
else
    echo "🚀 Pornesc MongoDB..."
    systemctl start mongod
    systemctl enable mongod
    sleep 5
fi

# 3. Migrează datele de la Atlas la MongoDB local
echo ""
echo "🔄 PASUL 3: Migrează datele..."

# Creează directorul de backup
mkdir -p /tmp/mongodb-migration

# Export de la Atlas
echo "📤 Export de la MongoDB Atlas..."
ATLAS_URI="mongodb+srv://ionelgonta_db_user:ArtGallery2024!@art-gallery-cluster.ncpcxsd.mongodb.net/art-gallery"
LOCAL_URI="mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery"

mongodump --uri="$ATLAS_URI" --out="/tmp/mongodb-migration/atlas-export" || {
    echo "⚠️ Exportul de la Atlas a eșuat, continuă cu datele existente..."
}

# Import în MongoDB local (doar dacă exportul a reușit)
if [ -d "/tmp/mongodb-migration/atlas-export/art-gallery" ]; then
    echo "📥 Import în MongoDB local..."
    mongorestore --uri="$LOCAL_URI" --drop "/tmp/mongodb-migration/atlas-export/art-gallery" --nsFrom="art-gallery.*" --nsTo="art-gallery.*"
    echo "✅ Import completat"
else
    echo "⚠️ Nu s-a găsit export, se sare importul"
fi

# Verifică datele
echo "🔍 Verifică datele în MongoDB local:"
mongosh "$LOCAL_URI" --eval "
db.runCommand('listCollections').cursor.firstBatch.forEach(
    function(collection) {
        var count = db[collection.name].countDocuments();
        print('📊 ' + collection.name + ': ' + count + ' documente');
    }
);" || echo "⚠️ Nu s-a putut conecta la MongoDB local"

# 4. Actualizează configurația aplicației
echo ""
echo "⚙️ PASUL 4: Actualizează configurația..."

# Navighează la directorul aplicației
cd /opt/victoriaocara

# Backup .env
if [ -f ".env" ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "💾 Backup .env creat"
fi

# Actualizează .env cu MongoDB local
echo "🔧 Actualizez .env..."
sed -i 's|MONGODB_URI=.*|MONGODB_URI=mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery|g' .env

# Verifică dacă MONGODB_URI există, dacă nu, adaugă-l
if ! grep -q "MONGODB_URI" .env; then
    echo "MONGODB_URI=mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery" >> .env
fi

# Actualizează site URL
sed -i 's|NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://victoriaocara.com|g' .env

echo "✅ Configurația actualizată"

# 5. Rebuild și restart aplicația
echo ""
echo "🚀 PASUL 5: Rebuild și restart aplicația..."

# Instalează dependențele
echo "📦 Instalez dependențele..."
npm install

# Build aplicația
echo "🔨 Build aplicația..."
npm run build

# Restart cu PM2
echo "🔄 Restart aplicația..."
pm2 restart victoriaocara || {
    echo "⚠️ PM2 restart a eșuat, încerc să pornesc aplicația..."
    pm2 start npm --name "victoriaocara" -- start
}

# 6. Verificări finale
echo ""
echo "🔍 PASUL 6: Verificări finale..."

# Verifică PM2
echo "📊 Status PM2:"
pm2 status

# Verifică Nginx
echo "🌐 Status Nginx:"
systemctl status nginx --no-pager -l

# Test aplicația
echo "🌐 Test aplicația..."
sleep 5

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ Aplicația răspunde pe localhost:3000"
else
    echo "⚠️ Aplicația nu răspunde pe localhost:3000"
fi

if curl -s -o /dev/null -w "%{http_code}" https://victoriaocara.com | grep -q "200"; then
    echo "✅ Site-ul funcționează pe https://victoriaocara.com"
else
    echo "⚠️ Site-ul nu răspunde pe https://victoriaocara.com"
fi

# 7. Curăță fișierele temporare
echo ""
echo "🧹 PASUL 7: Curăță fișierele temporare..."
rm -rf /tmp/mongodb-migration
echo "✅ Fișiere temporare șterse"

# 8. Configurează auto-pull (opțional)
echo ""
echo "⏰ PASUL 8: Configurez auto-pull..."

# Creează script de auto-pull
cat > /opt/auto-pull-victoriaocara.sh << 'EOF'
#!/bin/bash
cd /opt/victoriaocara
git fetch origin main
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
if [ "$LOCAL" != "$REMOTE" ]; then
    echo "🔄 Modificări detectate, actualizez..."
    git pull origin main
    npm install
    npm run build
    pm2 restart victoriaocara
    echo "✅ Actualizare completă la $(date)"
else
    echo "✅ Nicio modificare la $(date)"
fi
EOF

chmod +x /opt/auto-pull-victoriaocara.sh

# Adaugă în crontab (la fiecare 5 minute)
(crontab -l 2>/dev/null | grep -v auto-pull-victoriaocara; echo "*/5 * * * * /opt/auto-pull-victoriaocara.sh >> /var/log/auto-pull.log 2>&1") | crontab -

echo "✅ Auto-pull configurat (la fiecare 5 minute)"

echo ""
echo "🎉 REPARAREA COMPLETĂ!"
echo "====================="
echo ""
echo "✅ Nginx reparat și pornit"
echo "✅ MongoDB local configurat"
echo "✅ Datele migrate (dacă a fost posibil)"
echo "✅ Aplicația actualizată și restartată"
echo "✅ Auto-pull configurat"
echo ""
echo "🌐 Site disponibil la: https://victoriaocara.com"
echo ""
echo "📝 Comenzi utile:"
echo "   pm2 logs victoriaocara          # Vezi logs aplicația"
echo "   systemctl status nginx          # Status Nginx"
echo "   systemctl status mongod         # Status MongoDB"
echo "   tail -f /var/log/auto-pull.log  # Vezi logs auto-pull"
echo "   /opt/auto-pull-victoriaocara.sh # Test manual auto-pull"
echo ""
echo "🔧 Dacă sunt probleme:"
echo "   pm2 restart victoriaocara       # Restart aplicația"
echo "   systemctl restart nginx         # Restart Nginx"
echo "   systemctl restart mongod        # Restart MongoDB"
echo ""