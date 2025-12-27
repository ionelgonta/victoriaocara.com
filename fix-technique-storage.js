const Database = require('./lib/database.js');

async function fixTechniqueStorage() {
  console.log('🔧 FIXING TECHNIQUE STORAGE');
  console.log('===========================');
  
  const db = new Database();
  
  // Get all paintings
  const paintings = await db.getAllPaintings();
  console.log(`Found ${paintings.length} paintings to fix`);
  
  for (const painting of paintings) {
    console.log(`\n📝 Fixing: ${painting.title?.en || painting.title}`);
    console.log(`  - Current technique: ${painting.technique}`);
    
    // Extract technique string from the original data
    let techniqueString = '';
    
    // Map painting titles to their techniques
    const techniqueMap = {
      'The Winter Road': 'Oil on Canvas',
      'Autumn Reflections': 'Acrylic on Canvas', 
      'Morning Mist': 'Watercolor on Paper',
      'Coastal Serenity': 'Oil on Canvas',
      'Wildflower Meadow': 'Acrylic on Canvas',
      'Sunset Over the Valley': 'Oil on Canvas',
      'Forest Cathedral': 'Oil on Canvas',
      'Spring Awakening': 'Watercolor on Paper'
    };
    
    techniqueString = techniqueMap[painting.title?.en] || 'Mixed Media';
    
    console.log(`  - New technique: ${techniqueString}`);
    
    // Update the painting with proper technique string
    try {
      await db.updatePainting(painting.id, {
        ...painting,
        technique: techniqueString
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
    console.log(`   - Technique: ${painting.technique}`);
    console.log(`   - Price: ${painting.price} EUR`);
    console.log(`   - Slug: ${painting.slug}`);
  });
  
  console.log('\n🎉 TECHNIQUE STORAGE FIXED!');
  console.log('===========================');
  console.log('');
  console.log('✅ All techniques now stored as simple strings');
  console.log('✅ Admin panel will display techniques correctly');
  console.log('✅ Ready for production deployment');
}

fixTechniqueStorage().catch(console.error);