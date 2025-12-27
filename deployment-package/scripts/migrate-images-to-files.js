const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/art-gallery';
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const PAINTINGS_DIR = path.join(UPLOAD_DIR, 'paintings');

// Asigură-te că directoarele există
function ensureUploadDirectories() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  if (!fs.existsSync(PAINTINGS_DIR)) {
    fs.mkdirSync(PAINTINGS_DIR, { recursive: true });
  }
}

// Salvează base64 ca fișier pe disk
function saveBase64ToDisk(base64Data, paintingId, category = 'paintings') {
  ensureUploadDirectories();
  
  // Extrage datele din base64
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 data');
  }
  
  const mimeType = matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64');
  
  // Determină extensia din MIME type
  let extension = '.jpg';
  if (mimeType.includes('png')) extension = '.png';
  else if (mimeType.includes('gif')) extension = '.gif';
  else if (mimeType.includes('webp')) extension = '.webp';
  
  // Generează nume unic
  const fileName = `migrated_${paintingId}_${Date.now()}${extension}`;
  
  let filePath;
  let publicUrl;
  
  if (category === 'paintings') {
    filePath = path.join(PAINTINGS_DIR, fileName);
    publicUrl = `/uploads/paintings/${fileName}`;
  } else {
    filePath = path.join(UPLOAD_DIR, fileName);
    publicUrl = `/uploads/${fileName}`;
  }
  
  // Salvează fișierul
  fs.writeFileSync(filePath, buffer);
  
  return publicUrl;
}

async function migratePaintingsImages() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('art-gallery');
    const paintingsCollection = db.collection('paintings');
    
    // Găsește toate picturile cu imagini base64
    const paintings = await paintingsCollection.find({
      $or: [
        { image: { $regex: '^data:image' } },
        { 'images.0': { $regex: '^data:image' } }
      ]
    }).toArray();
    
    console.log(`Found ${paintings.length} paintings with base64 images to migrate`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const painting of paintings) {
      try {
        console.log(`\nMigrating painting: ${painting.title?.en || painting.title || painting._id}`);
        
        const updates = {};
        
        // Migrează imaginea principală
        if (painting.image && painting.image.startsWith('data:image')) {
          console.log('  - Migrating main image...');
          const newUrl = saveBase64ToDisk(painting.image, painting._id.toString(), 'paintings');
          updates.image = newUrl;
          console.log(`  - Main image migrated to: ${newUrl}`);
        }
        
        // Migrează imaginile suplimentare
        if (painting.images && Array.isArray(painting.images)) {
          const newImages = [];
          let hasBase64Images = false;
          
          for (let i = 0; i < painting.images.length; i++) {
            const img = painting.images[i];
            if (img && img.startsWith('data:image')) {
              console.log(`  - Migrating additional image ${i + 1}...`);
              const newUrl = saveBase64ToDisk(img, `${painting._id.toString()}_${i}`, 'paintings');
              newImages.push(newUrl);
              hasBase64Images = true;
              console.log(`  - Additional image ${i + 1} migrated to: ${newUrl}`);
            } else {
              newImages.push(img); // Păstrează imaginile care nu sunt base64
            }
          }
          
          if (hasBase64Images) {
            updates.images = newImages;
          }
        }
        
        // Actualizează documentul în MongoDB
        if (Object.keys(updates).length > 0) {
          await paintingsCollection.updateOne(
            { _id: painting._id },
            { $set: updates }
          );
          migratedCount++;
          console.log(`  ✓ Painting updated successfully`);
        } else {
          console.log(`  - No base64 images found to migrate`);
        }
        
      } catch (error) {
        console.error(`  ✗ Error migrating painting ${painting._id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n=== Migration Summary ===`);
    console.log(`Total paintings processed: ${paintings.length}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

async function migratePublicImages() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('\nMigrating public images...');
    
    const db = client.db('art-gallery');
    const publicImagesCollection = db.collection('public_images');
    
    // Găsește toate imaginile publice cu date base64
    const publicImages = await publicImagesCollection.find({
      data: { $exists: true, $ne: null }
    }).toArray();
    
    console.log(`Found ${publicImages.length} public images with base64 data to migrate`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const image of publicImages) {
      try {
        console.log(`\nMigrating public image: ${image.filename}`);
        
        // Convertește base64 la fișier
        const base64Data = `data:${image.mimeType};base64,${image.data}`;
        const newUrl = saveBase64ToDisk(base64Data, image._id.toString(), 'general');
        
        // Actualizează documentul
        await publicImagesCollection.updateOne(
          { _id: image._id },
          { 
            $set: { url: newUrl },
            $unset: { data: "" } // Șterge datele base64
          }
        );
        
        migratedCount++;
        console.log(`  ✓ Public image migrated to: ${newUrl}`);
        
      } catch (error) {
        console.error(`  ✗ Error migrating public image ${image._id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n=== Public Images Migration Summary ===`);
    console.log(`Total public images processed: ${publicImages.length}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('Public images migration failed:', error);
  } finally {
    await client.close();
  }
}

// Rulează migrarea
async function runMigration() {
  console.log('Starting image migration from base64 to files...\n');
  
  try {
    await migratePaintingsImages();
    await migratePublicImages();
    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test image loading on the website');
    console.log('2. Verify that new uploads use file storage');
    console.log('3. Monitor server disk space usage');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Rulează doar dacă scriptul este apelat direct
if (require.main === module) {
  runMigration();
}

module.exports = { migratePaintingsImages, migratePublicImages, runMigration };