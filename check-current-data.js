const Database = require('./lib/database.js');

async function checkCurrentData() {
  const db = new Database();
  const paintings = await db.getAllPaintings();
  
  console.log('CURRENT PAINTINGS IN DATABASE:');
  console.log('==============================');
  
  paintings.forEach((p, i) => {
    console.log(`${i+1}. Title: ${JSON.stringify(p.title)}`);
    console.log(`   Price: ${p.price} EUR`);
    console.log(`   Technique: ${p.technique}`);
    console.log(`   Dimensions: ${JSON.stringify(p.dimensions)}`);
    console.log(`   Images: ${JSON.stringify(p.images)}`);
    console.log(`   Featured: ${p.featured}`);
    console.log(`   Available: ${p.available}`);
    console.log(`   Created: ${p.createdAt}`);
    console.log('');
  });
  
  console.log(`Total paintings: ${paintings.length}`);
}

checkCurrentData().catch(console.error);