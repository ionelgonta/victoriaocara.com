const Database = require('./lib/database.js');

async function checkCurrentPaintings() {
  const db = new Database();
  const paintings = await db.getAllPaintings();
  
  console.log('📋 CURRENT PAINTINGS:');
  console.log('==================');
  
  paintings.forEach((p, i) => {
    console.log(`${i+1}. ${p.title?.en || p.title}`);
    console.log(`   💰 Price: ${p.price} EUR`);
    console.log(`   🎨 Technique: ${p.technique}`);
    console.log(`   📐 Size: ${p.dimensions?.width}×${p.dimensions?.height} ${p.dimensions?.unit}`);
    console.log(`   🔗 Slug: ${p.slug}`);
    console.log(`   ⭐ Featured: ${p.featured}`);
    console.log('');
  });
  
  console.log(`✅ Total: ${paintings.length} authentic Victoria Ocara paintings`);
}

checkCurrentPaintings().catch(console.error);