Write-Host "🚀 CONNECTING TO HETZNER SERVER AND FIXING IMAGES" -ForegroundColor Green

# Creez scriptul care va fi rulat pe server
$serverScript = @'
#!/bin/bash
echo "🔧 Starting image fix on Hetzner server..."

cd /var/www/victoriaocara.com || cd /home/*/victoriaocara.com || { echo "Project not found"; exit 1; }

echo "📁 Creating directories..."
mkdir -p public/uploads/paintings
chmod 755 public/uploads -R

echo "🔄 Creating migration script..."
cat > fix_images_now.js << 'EOF'
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function fixImages() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery';
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    const db = client.db('art-gallery');
    const paintings = await db.collection('paintings').find({
      $or: [
        { image: { $regex: '^data:image' } },
        { 'images.0': { $regex: '^data:image' } }
      ]
    }).toArray();
    
    console.log(`📊 Found ${paintings.length} paintings with base64 images`);
    
    let fixed = 0;
    
    for (const painting of paintings) {
      try {
        const title = painting.title?.en || painting.title || painting._id;
        console.log(`🖼️  Processing: ${title}`);
        
        const updates = {};
        
        // Fix main image
        if (painting.image && painting.image.startsWith('data:image')) {
          const base64Data = painting.image.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          const fileName = `migrated_${painting._id}_${Date.now()}.jpg`;
          const filePath = path.join('public/uploads/paintings', fileName);
          
          fs.writeFileSync(filePath, buffer);
          updates.image = `/uploads/paintings/${fileName}`;
          console.log(`    ✅ Main image saved: ${fileName}`);
        }
        
        // Fix images array
        if (painting.images && Array.isArray(painting.images)) {
          const newImages = [];
          
          for (let i = 0; i < painting.images.length; i++) {
            const img = painting.images[i];
            
            if (typeof img === 'string' && img.startsWith('data:image')) {
              const base64Data = img.split(',')[1];
              const buffer = Buffer.from(base64Data, 'base64');
              const fileName = `migrated_${painting._id}_${i}_${Date.now()}.jpg`;
              const filePath = path.join('public/uploads/paintings', fileName);
              
              fs.writeFileSync(filePath, buffer);
              newImages.push({ url: `/uploads/paintings/${fileName}`, alt: '' });
              console.log(`    ✅ Image ${i+1} saved: ${fileName}`);
              
            } else if (img && typeof img === 'object' && img.url && img.url.startsWith('data:image')) {
              const base64Data = img.url.split(',')[1];
              const buffer = Buffer.from(base64Data, 'base64');
              const fileName = `migrated_${painting._id}_${i}_${Date.now()}.jpg`;
              const filePath = path.join('public/uploads/paintings', fileName);
              
              fs.writeFileSync(filePath, buffer);
              newImages.push({ url: `/uploads/paintings/${fileName}`, alt: img.alt || '' });
              console.log(`    ✅ Image object ${i+1} saved: ${fileName}`);
              
            } else {
              newImages.push(img);
            }
          }
          
          if (newImages.length > 0) {
            updates.images = newImages;
          }
        }
        
        // Update database
        if (Object.keys(updates).length > 0) {
          await db.collection('paintings').updateOne(
            { _id: painting._id },
            { $set: updates }
          );
          fixed++;
          console.log(`    ✅ Database updated`);
        }
        
      } catch (error) {
        console.error(`    ❌ Error processing ${painting._id}: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 MIGRATION COMPLETE!`);
    console.log(`📊 Fixed ${fixed} paintings`);
    console.log(`🚀 Images should now load instantly!`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

fixImages().catch(console.error);
EOF

echo "🔄 Loading environment and running migration..."
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

node fix_images_now.js

if [ $? -eq 0 ]; then
    echo "🔄 Restarting server..."
    pm2 restart victoriaocara
    
    echo ""
    echo "🎉 SUCCESS! Image fix completed!"
    echo "🔗 Test: https://victoriaocara.com/galerie"
    echo "Images should now load instantly!"
else
    echo "❌ Fix failed"
    exit 1
fi
'@

# Salvez scriptul local
$serverScript | Out-File -FilePath "server-fix-script.sh" -Encoding UTF8

Write-Host "📝 Script created: server-fix-script.sh" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔗 To run on your Hetzner server:" -ForegroundColor Cyan
Write-Host "1. Connect to server: ssh root@your-server-ip" -ForegroundColor White
Write-Host "2. Upload and run the script:" -ForegroundColor White
Write-Host "   scp server-fix-script.sh root@your-server:/tmp/" -ForegroundColor Gray
Write-Host "   ssh root@your-server 'chmod +x /tmp/server-fix-script.sh && /tmp/server-fix-script.sh'" -ForegroundColor Gray
Write-Host ""
Write-Host "OR copy the content of server-fix-script.sh and paste it in your server terminal" -ForegroundColor Yellow