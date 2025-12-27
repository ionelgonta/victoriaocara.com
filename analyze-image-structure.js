const Database = require('./lib/database.js');

async function analyzeImageStructure() {
  const db = new Database();
  const paintings = await db.getAllPaintings();
  
  console.log('IMAGE STRUCTURE ANALYSIS:');
  console.log('========================');
  
  paintings.forEach((p, i) => {
    console.log(`${i+1}. ${p.title?.en || p.title}`);
    console.log('   Images type:', typeof p.images);
    console.log('   Images array:', Array.isArray(p.images));
    
    if (p.images && p.images.length > 0) {
      console.log('   First image type:', typeof p.images[0]);
      console.log('   First image value:', JSON.stringify(p.images[0]));
      
      // Check if any images are objects with url property
      p.images.forEach((img, idx) => {
        if (typeof img === 'object' && img !== null) {
          console.log(`   Image ${idx} is object with keys:`, Object.keys(img));
        }
      });
    }
    console.log('');
  });
  
  console.log('SUMMARY:');
  console.log('========');
  console.log(`Total paintings: ${paintings.length}`);
  
  let stringImages = 0;
  let objectImages = 0;
  
  paintings.forEach(p => {
    if (p.images && p.images.length > 0) {
      p.images.forEach(img => {
        if (typeof img === 'string') stringImages++;
        else if (typeof img === 'object') objectImages++;
      });
    }
  });
  
  console.log(`String images: ${stringImages}`);
  console.log(`Object images: ${objectImages}`);
}

analyzeImageStructure().catch(console.error);