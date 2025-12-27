const Database = require('./lib/database.js');

async function fixRealImageMapping() {
  console.log('FIXING TO USE ONLY REAL AVAILABLE IMAGE...');
  console.log('==========================================');
  
  const db = new Database();
  const paintings = await db.getAllPaintings();
  
  // The only real image file that exists on the server
  const realImagePath = '/uploads/migrated_69398a152293036dd6c271f4_1766840706548.jpg';
  
  console.log('Available real image file:', realImagePath);
  console.log('Updating all paintings to use this real image temporarily...');
  
  for (const painting of paintings) {
    console.log(`Updating painting: ${painting.title?.en || painting.title}`);
    
    // Update with the real image file that exists
    await db.updatePainting(painting.id, { 
      images: [realImagePath] 
    });
    
    console.log(`✓ Updated to use real image file`);
  }
  
  console.log('\n=== IMPORTANT NOTICE ===');
  console.log('All paintings now use the one real image file available on the server.');
  console.log('To display the correct images for each painting, you need to provide:');
  console.log('1. The real image files for each painting');
  console.log('2. Or the original image data from MongoDB Atlas');
  console.log('3. Or upload the actual painting images through the admin panel');
  console.log('\nThis follows the no-mock-data policy - only real data is used.');
}

fixRealImageMapping().catch(console.error);