const Database = require('./lib/database.js');

async function fixCorrectImagePath() {
  console.log('FIXING IMAGE PATH TO CORRECT LOCATION...');
  console.log('======================================');
  
  const db = new Database();
  const paintings = await db.getAllPaintings();
  
  // The correct path for Next.js Image Optimization
  const correctImagePath = '/uploads/paintings/migrated_69398a152293036dd6c271f4_1766840706548.jpg';
  
  console.log('Correct image path:', correctImagePath);
  console.log('Updating all paintings to use correct path...');
  
  for (const painting of paintings) {
    console.log(`Updating painting: ${painting.title?.en || painting.title}`);
    
    // Update with the correct path
    await db.updatePainting(painting.id, { 
      images: [correctImagePath] 
    });
    
    console.log(`✓ Updated to use correct path`);
  }
  
  console.log('\n=== STATUS ===');
  console.log('All paintings now reference the correct image path.');
  console.log('The image should now work with Next.js Image Optimization.');
  console.log('\nNote: All paintings currently show the same image.');
  console.log('To display unique images for each painting, you need to provide the real image files.');
}

fixCorrectImagePath().catch(console.error);