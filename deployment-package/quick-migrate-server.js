// Quick migration script for live server
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Configurare pentru server
const MONGODB_URI = process.env.MONGODB_URI;
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const PAINTINGS_DIR = path.join(UPLOAD_DIR, 'paintings');

console.log('🚀 Quick Image Migration for Live Server');
console.log('========================================');

// Creează directoarele
function ensureDirectories() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log('✅ Created public/uploads/');
  }
  if (!fs.existsSync(PAINTINGS_DIR)) {
    fs.mkdirSync(PAINTINGS_DIR, { recursive: true });
    console.log('✅ Created public/uploads/paintings/');
  }
}

// Salvează base64 ca fișier
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

async function quickMigration() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in environment variables');
    process.exit(1);
  }

  ensureDirectories();

  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to database');
    
    const db = client.db('art-gallery');
    const paintingsCollection = db.collection('paintings');
    
    // Găsește picturi cu base64
    console.log('🔍 Finding paintings with base64 images...');
    const paintings = await paintingsCollection.find({
      $or: [
        { image: { $regex: '^data:image' } },
        { 'images.0': { $regex: '^data:image' } }
      ]
    }).toArray();
    
    console.log(`📊 Found ${paintings.length} paintings to migrate`);
    
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
        
        // Migrează imaginea principală
        if (painting.image && painting.image.startsWith('data:image')) {
          console.log('  📸 Converting main image...');
          const newUrl = saveBase64ToDisk(painting.image, painting._id.toString());
          updates.image = newUrl;
        }
        
        // Migrează imaginile din array
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
        
        // Actualizează în baza de date
        if (Object.keys(updates).length > 0) {
          await paintingsCollection.updateOne(
            { _id: painting._id },
            { $set: updates }
          );
          migrated++;
          console.log('  ✅ Database updated');
        }
        
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 Migration Complete!`);
    console.log(`📊 Migrated ${migrated} paintings`);
    console.log(`\n🚀 Images should now load instantly!`);
    console.log(`🔗 Test: https://victoriaocara.com/galerie`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Rulează migrarea
quickMigration().catch(console.error);