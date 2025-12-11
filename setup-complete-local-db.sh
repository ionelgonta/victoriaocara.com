#!/bin/bash

# Script complet pentru configurarea MongoDB local și migrarea datelor
set -e

echo "🗄️ CONFIGURARE COMPLETĂ MONGODB LOCAL"
echo "======================================"

# 1. Instalează MongoDB local
echo ""
echo "📦 PASUL 1: Instalez MongoDB local..."
./setup-local-mongodb.sh

# 2. Așteaptă ca MongoDB să pornească complet
echo ""
echo "⏳ Aștept ca MongoDB să pornească complet..."
sleep 10

# 3. Migrează datele de la Atlas
echo ""
echo "🔄 PASUL 2: Migrez datele de la MongoDB Atlas..."
./migrate-data.sh

# 4. Actualizează configurația aplicației
echo ""
echo "⚙️ PASUL 3: Actualizez configurația aplicației..."

# Backup .env existent
if [ -f "/opt/victoriaocara/.env" ]; then
    cp /opt/victoriaocara/.env /opt/victoriaocara/.env.backup
    echo "💾 Backup .env creat: .env.backup"
fi

# Actualizează .env
cd /opt/victoriaocara
sed -i 's|MONGODB_URI=.*|MONGODB_URI=mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery|g' .env

# Verifică dacă MONGODB_URI există în .env, dacă nu, adaugă-l
if ! grep -q "MONGODB_URI" .env; then
    echo "MONGODB_URI=mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery" >> .env
fi

echo "✅ Fișierul .env actualizat"

# 5. Restart aplicația
echo ""
echo "🚀 PASUL 4: Restart aplicația..."
pm2 restart victoriaocara

# 6. Verifică conexiunea
echo ""
echo "🔍 PASUL 5: Verific conexiunea..."
sleep 5

# Test conexiunea la MongoDB
mongosh mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery --eval "
print('🔗 Testez conexiunea la MongoDB local...');
print('📊 Baza de date: ' + db.getName());
print('📋 Colecții disponibile:');
db.runCommand('listCollections').cursor.firstBatch.forEach(
    function(collection) {
        var count = db[collection.name].countDocuments();
        print('   📄 ' + collection.name + ': ' + count + ' documente');
    }
);
"

# Test aplicația
echo ""
echo "🌐 Testez aplicația..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ Aplicația funcționează corect!"
else
    echo "⚠️ Aplicația poate avea probleme. Verifică logs:"
    echo "   pm2 logs victoriaocara"
fi

echo ""
echo "🎉 CONFIGURAREA COMPLETĂ!"
echo "========================"
echo ""
echo "📊 Informații MongoDB local:"
echo "   🔗 URI: mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery"
echo "   👤 User: victoriaocara"
echo "   🔑 Pass: ArtGallery2024!"
echo "   🗄️ DB: art-gallery"
echo ""
echo "🌐 Site disponibil la:"
echo "   🔗 https://victoriaocara.com"
echo ""
echo "📝 Comenzi utile:"
echo "   mongosh mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery"
echo "   pm2 logs victoriaocara"
echo "   pm2 restart victoriaocara"
echo "   /opt/backup-mongodb.sh"
echo ""
echo "✅ Acum folosești MongoDB local în loc de Atlas!"
echo ""