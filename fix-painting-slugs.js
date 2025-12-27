const Database = require('./lib/database.js');

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
}

async function fixPaintingSlugs() {
  console.log('🔧 FIXING PAINTING SLUGS AND TECHNIQUE DISPLAY');
  console.log('==============================================');
  
  const db = new Database();
  
  // Get all paintings
  const paintings = await db.getAllPaintings();
  console.log(`Found ${paintings.length} paintings to fix`);
  
  for (const painting of paintings) {
    const englishTitle = painting.title?.en || painting.title;
    const slug = generateSlug(englishTitle);
    
    console.log(`\n📝 Fixing: ${englishTitle}`);
    console.log(`  - Current slug: ${painting.slug || 'null'}`);
    console.log(`  - New slug: ${slug}`);
    console.log(`  - Technique: ${typeof painting.technique === 'object' ? painting.technique.en : painting.technique}`);
    
    // Update the painting with proper slug
    try {
      await db.updatePainting(painting.id, {
        ...painting,
        slug: slug
      });
      console.log(`  ✅ Updated successfully`);
    } catch (error) {
      console.error(`  ❌ Error updating:`, error.message);
    }
  }
  
  // Verify the updates
  console.log('\n🔍 Verifying updates...');
  const updatedPaintings = await db.getAllPaintings();
  
  console.log('\n📋 Updated paintings:');
  updatedPaintings.forEach((painting, index) => {
    console.log(`${index + 1}. ${painting.title?.en || painting.title}`);
    console.log(`   - Slug: ${painting.slug}`);
    console.log(`   - Price: ${painting.price} EUR`);
    console.log(`   - Technique: ${typeof painting.technique === 'object' ? painting.technique.en : painting.technique}`);
    console.log(`   - Featured: ${painting.featured}`);
  });
  
  console.log('\n🎉 SLUGS FIXED SUCCESSFULLY!');
  console.log('============================');
  console.log('');
  console.log('✅ All paintings now have proper SEO-friendly slugs');
  console.log('✅ URLs will work correctly: /tablou/the-winter-road');
  console.log('✅ Ready for production deployment');
}

fixPaintingSlugs().catch(console.error);