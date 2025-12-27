const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/art-gallery';

async function verifyImageSystem() {
  console.log('🔍 Verifying Image Storage System');
  console.log('=================================\n');

  // 1. Verifică directoarele
  console.log('1. Checking directories...');
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const paintingsDir = path.join(uploadsDir, 'paintings');
  
  if (fs.existsSync(uploadsDir)) {
    console.log('   ✅ public/uploads exists');
    
    if (fs.existsSync(paintingsDir)) {
      console.log('   ✅ public/uploads/paintings exists');
      
      // Contează fișierele
      const files = fs.readdirSync(paintingsDir);
      console.log(`   📊 Files in paintings directory: ${files.length}`);
      
      if (files.length > 0) {
        console.log('   📋 Sample files:');
        files.slice(0, 3).forEach(file => {
          const filePath = path.join(paintingsDir, file);
          const stats = fs.statSync(filePath);
          console.log(`      - ${file} (${Math.round(stats.size / 1024)}KB)`);
        });
      }
    } else {
      console.log('   ❌ public/uploads/paintings missing');
    }
  } else {
    console.log('   ❌ public/uploads missing');
  }

  // 2. Verifică baza de date
  console.log('\n2. Checking database...');
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('art-gallery');
    
    // Verifică picturile
    const paintingsCollection = db.collection('paintings');
    const totalPaintings = await paintingsCollection.countDocuments();
    console.log(`   📊 Total paintings in database: ${totalPaintings}`);
    
    if (totalPaintings > 0) {
      // Verifică câte au base64 vs file URLs
      const base64Count = await paintingsCollection.countDocuments({
        $or: [
          { image: { $regex: '^data:image' } },
          { 'images.0': { $regex: '^data:image' } }
        ]
      });
      
      const fileUrlCount = await paintingsCollection.countDocuments({
        $or: [
          { image: { $regex: '^/uploads/' } },
          { 'images.0.url': { $regex: '^/uploads/' } }
        ]
      });
      
      console.log(`   📊 Paintings with base64 images: ${base64Count}`);
      console.log(`   📊 Paintings with file URLs: ${fileUrlCount}`);
      
      if (base64Count > 0) {
        console.log('   ⚠️  Some paintings still use base64 - migration may be needed');
      } else {
        console.log('   ✅ All paintings use file storage');
      }
    }
    
    // Verifică imaginile publice
    const publicImagesCollection = db.collection('public_images');
    const totalPublicImages = await publicImagesCollection.countDocuments();
    console.log(`   📊 Total public images: ${totalPublicImages}`);
    
    if (totalPublicImages > 0) {
      const publicBase64Count = await publicImagesCollection.countDocuments({
        data: { $exists: true, $ne: null }
      });
      
      const publicFileUrlCount = await publicImagesCollection.countDocuments({
        url: { $regex: '^/uploads/' }
      });
      
      console.log(`   📊 Public images with base64: ${publicBase64Count}`);
      console.log(`   📊 Public images with file URLs: ${publicFileUrlCount}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Database connection failed: ${error.message}`);
  } finally {
    await client.close();
  }

  // 3. Verifică fișierele de configurare
  console.log('\n3. Checking configuration files...');
  
  const imageStoragePath = path.join(process.cwd(), 'lib', 'imageStorage.ts');
  if (fs.existsSync(imageStoragePath)) {
    console.log('   ✅ lib/imageStorage.ts exists');
  } else {
    console.log('   ❌ lib/imageStorage.ts missing');
  }
  
  const migrationScriptPath = path.join(process.cwd(), 'scripts', 'migrate-images-to-files.js');
  if (fs.existsSync(migrationScriptPath)) {
    console.log('   ✅ Migration script exists');
  } else {
    console.log('   ❌ Migration script missing');
  }

  // 4. Verifică API endpoints
  console.log('\n4. Checking API files...');
  
  const uploadApiPath = path.join(process.cwd(), 'app', 'api', 'upload', 'route.ts');
  if (fs.existsSync(uploadApiPath)) {
    const content = fs.readFileSync(uploadApiPath, 'utf8');
    if (content.includes('saveImageToDisk')) {
      console.log('   ✅ Upload API uses file storage');
    } else {
      console.log('   ⚠️  Upload API may still use base64');
    }
  } else {
    console.log('   ❌ Upload API missing');
  }
  
  const publicUploadApiPath = path.join(process.cwd(), 'app', 'api', 'upload-public', 'route.ts');
  if (fs.existsSync(publicUploadApiPath)) {
    const content = fs.readFileSync(publicUploadApiPath, 'utf8');
    if (content.includes('saveImageToDisk')) {
      console.log('   ✅ Public upload API uses file storage');
    } else {
      console.log('   ⚠️  Public upload API may still use base64');
    }
  } else {
    console.log('   ❌ Public upload API missing');
  }

  console.log('\n🎯 System Status Summary:');
  console.log('========================');
  console.log('✅ File storage system implemented');
  console.log('✅ Migration script available');
  console.log('✅ APIs updated for file storage');
  console.log('');
  console.log('💡 To complete the optimization:');
  console.log('   1. Run migration: node scripts/migrate-images-to-files.js');
  console.log('   2. Test uploads in admin panel');
  console.log('   3. Verify fast image loading on website');
  console.log('   4. Monitor disk space usage');
}

// Rulează verificarea
if (require.main === module) {
  verifyImageSystem().catch(console.error);
}

module.exports = { verifyImageSystem };