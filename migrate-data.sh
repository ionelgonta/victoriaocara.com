#!/bin/bash

# Script pentru migrarea datelor de la MongoDB Atlas la MongoDB local
set -e

echo "🔄 Migrez datele de la MongoDB Atlas la MongoDB local..."

# Variabile
ATLAS_URI="mongodb+srv://ionelgonta_db_user:ArtGallery2024!@art-gallery-cluster.ncpcxsd.mongodb.net/art-gallery"
LOCAL_URI="mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery"
BACKUP_DIR="/tmp/mongodb-migration"

# 1. Creează directorul de backup temporar
echo "📁 Creez directorul de backup temporar..."
mkdir -p $BACKUP_DIR

# 2. Export datele de la Atlas
echo "📤 Export datele de la MongoDB Atlas..."
mongodump --uri="$ATLAS_URI" --out="$BACKUP_DIR/atlas-export"

# 3. Verifică dacă exportul a reușit
if [ ! -d "$BACKUP_DIR/atlas-export/art-gallery" ]; then
    echo "❌ Exportul de la Atlas a eșuat!"
    exit 1
fi

echo "✅ Export de la Atlas completat cu succes!"

# 4. Listează colecțiile exportate
echo "📋 Colecții exportate:"
ls -la "$BACKUP_DIR/atlas-export/art-gallery/"

# 5. Import datele în MongoDB local
echo "📥 Import datele în MongoDB local..."
mongorestore --uri="$LOCAL_URI" --drop "$BACKUP_DIR/atlas-export/art-gallery" --nsFrom="art-gallery.*" --nsTo="art-gallery.*"

# 6. Verifică importul
echo "🔍 Verifică importul..."
mongosh "$LOCAL_URI" --eval "
db.runCommand('listCollections').cursor.firstBatch.forEach(
    function(collection) {
        var count = db[collection.name].countDocuments();
        print('📊 ' + collection.name + ': ' + count + ' documente');
    }
);
"

# 7. Creează utilizatorul admin pentru aplicație (dacă nu există)
echo "👤 Verific utilizatorul admin..."
mongosh "$LOCAL_URI" --eval "
// Creează utilizatorul admin pentru aplicație
try {
    db.users.findOne({email: 'admin@victoriaocara.com'}) || 
    db.users.insertOne({
        email: 'admin@victoriaocara.com',
        password: '\$2b\$10\$rQZ9QmjlhZKvEd.nYY5zKOqGqGqGqGqGqGqGqGqGqGqGqGqGqGqGq',
        role: 'admin',
        createdAt: new Date()
    });
    print('✅ Utilizator admin verificat/creat');
} catch(e) {
    print('⚠️ Eroare la crearea utilizatorului admin: ' + e);
}
"

# 8. Curăță fișierele temporare
echo "🧹 Curăț fișierele temporare..."
rm -rf $BACKUP_DIR

echo ""
echo "🎉 MIGRAREA COMPLETĂ!"
echo ""
echo "📊 Verifică datele în MongoDB local:"
echo "   mongosh $LOCAL_URI"
echo ""
echo "🔧 Actualizează .env cu noua conexiune:"
echo "   MONGODB_URI=$LOCAL_URI"
echo ""
echo "🚀 Restart aplicația:"
echo "   pm2 restart victoriaocara"
echo ""