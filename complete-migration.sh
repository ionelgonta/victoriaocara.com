#!/bin/bash

# Script pentru completarea migrării la MongoDB local
set -e

echo "🔄 COMPLETEZ MIGRAREA LA MONGODB LOCAL"
echo "====================================="

# Variabile
LOCAL_URI="mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery"
BACKUP_DIR="/tmp/mongodb-migration"

echo ""
echo "📥 PASUL 1: Import datele în MongoDB local..."

# Verifică dacă există exportul
if [ ! -d "$BACKUP_DIR/atlas-export/art-gallery" ]; then
    echo "❌ Nu găsesc exportul de la Atlas în $BACKUP_DIR/atlas-export/art-gallery"
    echo "🔄 Încerc să export din nou datele de la Atlas..."
    
    # Creează directorul de backup
    mkdir -p $BACKUP_DIR
    
    # Export de la Atlas
    ATLAS_URI="mongodb+srv://ionelgonta_db_user:ArtGallery2024!@art-gallery-cluster.ncpcxsd.mongodb.net/art-gallery"
    mongodump --uri="$ATLAS_URI" --out="$BACKUP_DIR/atlas-export"
    
    if [ ! -d "$BACKUP_DIR/atlas-export/art-gallery" ]; then
        echo "❌ Exportul de la Atlas a eșuat!"
        exit 1
    fi
    
    echo "✅ Export de la Atlas completat!"
fi

# Import în MongoDB local
echo "📥 Import datele în MongoDB local..."
mongorestore --uri="$LOCAL_URI" --drop "$BACKUP_DIR/atlas-export/art-gallery" --nsFrom="art-gallery.*" --nsTo="art-gallery.*"

echo ""
echo "🔍 PASUL 2: Verific importul..."
mongosh "$LOCAL_URI" --eval "
print('📊 Verificare import:');
db.runCommand('listCollections').cursor.firstBatch.forEach(
    function(collection) {
        var count = db[collection.name].countDocuments();
        print('   📄 ' + collection.name + ': ' + count + ' documente');
    }
);
"

echo ""
echo "⚙️ PASUL 3: Actualizez configurația aplicației..."

# Backup .env existent
if [ -f ".env" ]; then
    cp .env .env.backup
    echo "💾 Backup .env creat: .env.backup"
fi

# Actualizează .env cu MongoDB local
sed -i 's|MONGODB_URI=.*|MONGODB_URI=mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery|g' .env

# Verifică dacă MONGODB_URI există în .env
if ! grep -q "MONGODB_URI" .env; then
    echo "MONGODB_URI=mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery" >> .env
fi

echo "✅ Fișierul .env actualizat cu MongoDB local"

echo ""
echo "🚀 PASUL 4: Restart aplicația..."
pm2 restart victoriaocara || echo "⚠️ PM2 restart failed - aplicația poate să nu fie configurată cu PM2"

echo ""
echo "🔍 PASUL 5: Test final..."
sleep 3

# Test conexiunea la MongoDB
echo "🔗 Testez conexiunea la MongoDB local..."
mongosh "$LOCAL_URI" --eval "
print('✅ Conexiune la MongoDB local reușită!');
print('📊 Baza de date: ' + db.getName());
"

echo ""
echo "🧹 PASUL 6: Curăț fișierele temporare..."
rm -rf $BACKUP_DIR

echo ""
echo "🎉 MIGRAREA COMPLETĂ!"
echo "===================="
echo ""
echo "✅ Aplicația folosește acum MongoDB local în loc de Atlas!"
echo ""
echo "📊 Informații conexiune:"
echo "   🔗 URI: mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery"
echo "   👤 User: victoriaocara"
echo "   🔑 Pass: ArtGallery2024!"
echo ""
echo "🌐 Site disponibil la: https://victoriaocara.com"
echo ""
echo "📝 Comenzi utile:"
echo "   mongosh mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery"
echo "   pm2 logs victoriaocara"
echo "   pm2 restart victoriaocara"
echo ""