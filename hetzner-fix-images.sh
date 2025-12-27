#!/bin/bash

echo "🚀 FIXING IMAGES ON HETZNER SERVER"
echo "=================================="

# Găsește directorul proiectului
if [ -d "/var/www/victoriaocara.com" ]; then
    cd /var/www/victoriaocara.com
elif [ -d "/home/*/victoriaocara.com" ]; then
    cd /home/*/victoriaocara.com
elif [ -d "~/victoriaocara.com" ]; then
    cd ~/victoriaocara.com
else
    echo "❌ Nu găsesc directorul proiectului"
    echo "Caută manual cu: find / -name 'package.json' -path '*victoriaocara*' 2>/dev/null"
    exit 1
fi

echo "✅ Găsit proiect în: $(pwd)"

# Creează directoarele
echo "📁 Creez directoarele pentru imagini..."
mkdir -p public/uploads/paintings
mkdir -p public/uploads/general
chmod 755 public/uploads -R

# Încarcă variabilele de mediu
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Instalează dependențele
echo "📦 Instalez dependențele..."
npm install --save-dev @types/uuid

# Creează scriptul de migrare direct pe server
echo "🔧 Creez scriptul de migrare..."
cat > fix_images_now.js << 'EOF'
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI;
const PAINTINGS_DIR = path.join(process.cwd(), 'public', 'uploads', 'paintings');

console.log('🚀 Încep migrarea imaginilor...');

function saveBase64ToDisk(base64Data, paintingId) {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches) throw new Error('Date base64 invalide');
  
  const buffer = Buffer.from(matches[2], 'base64');
  const fileName = `migrated_${paintingId}_${Date.now()}.jpg`;
  const filePath = path.join(PAINTINGS_DIR, fileName);
  
  fs.writeFileSync(filePath, buffer);
  console.log(`  ✅ Salvat: ${fileName} (${Math.round(buffer.length / 1024)}KB)`);
  
  return `/uploads/paintings/${fileName}`;
}

async function migrate() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectat la baza de date');
    
    const db = client.db('art-gallery');
    const paintings = await db.collection('paintings').find({
      $or: [
        { image: { $regex: '^data:image' } },
        { 'images.0': { $regex: '^data:image' } }
      ]
    }).toArray();
    
    console.log(`📊 Găsite ${paintings.length} picturi de migrat`);
    
    for (const painting of paintings) {
      const title = painting.title?.en || painting.title || painting._id;
      console.log(`🖼️  Migrez: ${title}`);
      
      const updates = {};
      
      if (painting.image && painting.image.startsWith('data:image')) {
        updates.image = saveBase64ToDisk(painting.image, painting._id);
      }
      
      if (painting.images && Array.isArray(painting.images)) {
        const newImages = [];
        for (let i = 0; i < painting.images.length; i++) {
          const img = painting.images[i];
          if (typeof img === 'string' && img.startsWith('data:image')) {
            newImages.push({ url: saveBase64ToDisk(img, `${painting._id}_${i}`), alt: '' });
          } else if (img?.url?.startsWith('data:image')) {
            newImages.push({ url: saveBase64ToDisk(img.url, `${painting._id}_${i}`), alt: img.alt || '' });
          } else {
            newImages.push(img);
          }
        }
        if (newImages.length > 0) updates.images = newImages;
      }
      
      if (Object.keys(updates).length > 0) {
        await db.collection('paintings').updateOne({ _id: painting._id }, { $set: updates });
        console.log('  ✅ Actualizat în baza de date');
      }
    }
    
    console.log('🎉 MIGRARE COMPLETĂ!');
    
  } finally {
    await client.close();
  }
}

migrate().catch(console.error);
EOF

# Rulează migrarea
echo "🔄 Rulez migrarea..."
node fix_images_now.js

if [ $? -eq 0 ]; then
    echo "✅ Migrare reușită!"
    
    # Restart server
    echo "🔄 Restart server..."
    if command -v pm2 >/dev/null; then
        pm2 restart all
    elif systemctl is-active --quiet nginx; then
        sudo systemctl reload nginx
    fi
    
    echo ""
    echo "🎉 GATA! Imaginile ar trebui să se încarce instant acum!"
    echo "🔗 Testează: https://victoriaocara.com/galerie"
    
else
    echo "❌ Migrarea a eșuat"
fi