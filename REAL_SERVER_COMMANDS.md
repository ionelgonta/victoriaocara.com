# 🚨 COMENZI REALE PENTRU SERVER

## Problema
API-ul încă returnează 20MB+ de date, ceea ce înseamnă că imaginile sunt încă stocate ca base64.

## Soluția - Comenzi de rulat pe serverul real

### 1. Conectează-te la server
```bash
ssh user@victoriaocara.com
# SAU
ssh user@your-server-ip
```

### 2. Navighează la directorul proiectului
```bash
cd /var/www/victoriaocara.com
# SAU
cd /home/user/victoriaocara.com
# SAU găsește directorul:
find / -name "package.json" -path "*victoriaocara*" 2>/dev/null
```

### 3. Creează directoarele pentru imagini
```bash
mkdir -p public/uploads/paintings
mkdir -p public/uploads/general
chmod 755 public/uploads -R
```

### 4. Instalează dependențele
```bash
npm install --save-dev @types/uuid
```

### 5. Creează scriptul de migrare pe server
```bash
cat > migrate_images_production.js << 'EOF'
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI;
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const PAINTINGS_DIR = path.join(UPLOAD_DIR, 'paintings');

console.log('🚀 Starting production image migration...');

function ensureDirectories() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  if (!fs.existsSync(PAINTINGS_DIR)) {
    fs.mkdirSync(PAINTINGS_DIR, { recursive: true });
  }
}

function saveBase64ToDisk(base64Data, paintingId) {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 data');
  }
  
  const mimeType = matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64');
  
  let extension = '.jpg';
  if (mimeType.includes('png')) extension = '.png';
  else if (mimeType.includes('gif')) extension = '.gif';
  else if (mimeType.includes('webp')) extension = '.webp';
  
  const fileName = `migrated_${paintingId}_${Date.now()}${extension}`;
  const filePath = path.join(PAINTINGS_DIR, fileName);
  const publicUrl = `/uploads/paintings/${fileName}`;
  
  fs.writeFileSync(filePath, buffer);
  console.log(`  ✅ Saved: ${fileName} (${Math.round(buffer.length / 1024)}KB)`);
  
  return publicUrl;
}

async function migrate() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment');
    console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO')));
    process.exit(1);
  }

  console.log('Using MongoDB URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
  
  ensureDirectories();
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to production database');
    
    const db = client.db('art-gallery');
    const paintingsCollection = db.collection('paintings');
    
    const totalPaintings = await paintingsCollection.countDocuments();
    console.log(`📊 Total paintings in database: ${totalPaintings}`);
    
    const paintings = await paintingsCollection.find({
      $or: [
        { image: { $regex: '^data:image' } },
        { 'images.0': { $regex: '^data:image' } }
      ]
    }).toArray();
    
    console.log(`📊 Found ${paintings.length} paintings with base64 images to migrate`);
    
    if (paintings.length === 0) {
      console.log('✅ No base64 images found - migration already complete!');
      return;
    }
    
    let migrated = 0;
    
    for (const painting of paintings) {
      try {
        const title = painting.title?.en || painting.title || painting._id;
        console.log(`\n🖼️  Migrating: ${title}`);
        
        const updates = {};
        
        if (painting.image && painting.image.startsWith('data:image')) {
          console.log('  📸 Converting main image...');
          const newUrl = saveBase64ToDisk(painting.image, painting._id.toString());
          updates.image = newUrl;
        }
        
        if (painting.images && Array.isArray(painting.images)) {
          const newImages = [];
          let hasChanges = false;
          
          for (let i = 0; i < painting.images.length; i++) {
            const img = painting.images[i];
            if (typeof img === 'string' && img.startsWith('data:image')) {
              console.log(`  📸 Converting image ${i + 1}...`);
              const newUrl = saveBase64ToDisk(img, `${painting._id}_${i}`);
              newImages.push({ url: newUrl, alt: '' });
              hasChanges = true;
            } else if (img && typeof img === 'object' && img.url && img.url.startsWith('data:image')) {
              console.log(`  📸 Converting image object ${i + 1}...`);
              const newUrl = saveBase64ToDisk(img.url, `${painting._id}_${i}`);
              newImages.push({ url: newUrl, alt: img.alt || '' });
              hasChanges = true;
            } else {
              newImages.push(img);
            }
          }
          
          if (hasChanges) {
            updates.images = newImages;
          }
        }
        
        if (Object.keys(updates).length > 0) {
          await paintingsCollection.updateOne(
            { _id: painting._id },
            { $set: updates }
          );
          migrated++;
          console.log('  ✅ Database updated');
        }
        
      } catch (error) {
        console.error(`  ❌ Error migrating ${painting._id}: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 MIGRATION COMPLETE!`);
    console.log(`📊 Successfully migrated: ${migrated} paintings`);
    console.log(`🚀 Images should now load instantly!`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate().catch(console.error);
EOF
```

### 6. Rulează migrarea
```bash
# Încarcă variabilele de mediu
source .env 2>/dev/null || export $(cat .env | grep -v '^#' | xargs) 2>/dev/null

# Rulează migrarea
node migrate_images_production.js
```

### 7. Restart serverul
```bash
# Dacă folosești PM2:
pm2 restart all

# Dacă folosești systemctl:
sudo systemctl restart nginx
sudo systemctl restart your-app-name

# Sau restart manual
```

### 8. Verifică rezultatul
```bash
# Testează mărimea API-ului
curl -s https://victoriaocara.com/api/paintings | wc -c

# Ar trebui să fie <100KB în loc de 20MB+
```

## Rezultatul așteptat
- ✅ Imaginile se încarcă instantaneu pe https://victoriaocara.com/galerie
- ✅ Nu mai este preloader
- ✅ API-ul returnează <100KB
- ✅ Experiență fluidă de navigare

---

**Aceste comenzi trebuie rulate pe serverul real pentru a fixa problema!** 🚀