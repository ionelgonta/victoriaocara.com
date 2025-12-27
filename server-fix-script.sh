#!/bin/bash
echo "ðŸ”§ Starting image fix on Hetzner server..."

cd /var/www/victoriaocara.com || cd /home/*/victoriaocara.com || { echo "Project not found"; exit 1; }

echo "ðŸ“ Creating directories..."
mkdir -p public/uploads/paintings
chmod 755 public/uploads -R

echo "ðŸ”„ Creating migration script..."
cat > fix_images_now.js << 'EOF'
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function fixImages() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery';
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('âœ… Connected to database');
    
    const db = client.db('art-gallery');
    const paintings = await db.collection('paintings').find({
      $or: [
        { image: { $regex: '^data:image' } },
        { 'images.0': { $regex: '^data:image' } }
      ]
    }).toArray();
    
    console.log(`ðŸ“Š Found ${paintings.length} paintings with base64 images`);
    
    let fixed = 0;
    
    for (const painting of paintings) {
      try {
        const title = painting.title?.en || painting.title || painting._id;
        console.log(`ðŸ–¼ï¸  Processing: ${title}`);
        
        const updates = {};
        
        // Fix main image
        if (painting.image && painting.image.startsWith('data:image')) {
          const base64Data = painting.image.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          const fileName = `migrated_${painting._id}_${Date.now()}.jpg`;
          const filePath = path.join('public/uploads/paintings', fileName);
          
          fs.writeFileSync(filePath, buffer);
          updates.image = `/uploads/paintings/${fileName}`;
          console.log(`    âœ… Main image saved: ${fileName}`);
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
              console.log(`    âœ… Image ${i+1} saved: ${fileName}`);
              
            } else if (img && typeof img === 'object' && img.url && img.url.startsWith('data:image')) {
              const base64Data = img.url.split(',')[1];
              const buffer = Buffer.from(base64Data, 'base64');
              const fileName = `migrated_${painting._id}_${i}_${Date.now()}.jpg`;
              const filePath = path.join('public/uploads/paintings', fileName);
              
              fs.writeFileSync(filePath, buffer);
              newImages.push({ url: `/uploads/paintings/${fileName}`, alt: img.alt || '' });
              console.log(`    âœ… Image object ${i+1} saved: ${fileName}`);
              
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
          console.log(`    âœ… Database updated`);
        }
        
      } catch (error) {
        console.error(`    âŒ Error processing ${painting._id}: ${error.message}`);
      }
    }
    
    console.log(`\nðŸŽ‰ MIGRATION COMPLETE!`);
    console.log(`ðŸ“Š Fixed ${fixed} paintings`);
    console.log(`ðŸš€ Images should now load instantly!`);
    
  } catch (error) {
    console.error('âŒ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

fixImages().catch(console.error);
EOF

echo "ðŸ”„ Loading environment and running migration..."
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

node fix_images_now.js

if [ $? -eq 0 ]; then
    echo "ðŸ”„ Restarting server..."
    pm2 restart victoriaocara
    
    echo ""
    echo "ðŸŽ‰ SUCCESS! Image fix completed!"
    echo "ðŸ”— Test: https://victoriaocara.com/galerie"
    echo "Images should now load instantly!"
else
    echo "âŒ Fix failed"
    exit 1
fi
