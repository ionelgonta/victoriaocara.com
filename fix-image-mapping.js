const Database = require('./lib/database.js');

async function fixImageMapping() {
  console.log('FIXING IMAGE MAPPING...');
  console.log('======================');
  
  const db = new Database();
  const paintings = await db.getAllPaintings();
  
  // Map of expected filenames to actual server files
  const imageMapping = {
    'winter-road-main.jpg': 'migrated_694fb9d30cfebc795ecc6229_0_1766840945646.jpg',
    'autumn-reflections-main.jpg': 'migrated_694fbc90bdbe1402153b90f9_0_1766841389684.jpg', 
    'morning-mist-main.jpg': 'migrated_694fbe675363b947394b0d47_0_1766841389718.jpg',
    'coastal-serenity-main.jpg': 'migrated_694fc32f8b616406f99e1ee4_0_1766841389763.jpg',
    'wildflower-meadow-main.jpg': 'migrated_694fc83f6e48e7001f240dfe_0_1766841389797.jpg',
    'sunset-valley-main.jpg': 'migrated_694fca16f48b6e4ce06e03ae_0_1766841389822.jpg',
    'forest-cathedral-main.jpg': 'migrated_694fb9d30cfebc795ecc6229_0_1766841389637.jpg',
    'spring-awakening-main.jpg': 'migrated_694fb9d30cfebc795ecc6229_0_1766840945646.jpg'
  };
  
  console.log('Current paintings and their images:');
  paintings.forEach((painting, i) => {
    console.log(`${i+1}. ${painting.title?.en || painting.title}`);
    console.log('   Current images:', painting.images);
    
    if (painting.images && painting.images.length > 0) {
      const updatedImages = painting.images.map(imagePath => {
        if (typeof imagePath === 'string') {
          const filename = imagePath.split('/').pop();
          if (imageMapping[filename]) {
            const newPath = `/uploads/paintings/${imageMapping[filename]}`;
            console.log(`   Mapping: ${imagePath} -> ${newPath}`);
            return newPath;
          }
        }
        return imagePath;
      });
      
      // Update the painting in database
      if (JSON.stringify(updatedImages) !== JSON.stringify(painting.images)) {
        console.log(`   Updating painting ${painting.id} with new images:`, updatedImages);
        // Update the painting
        db.updatePainting(painting.id, { images: updatedImages });
      }
    }
    console.log('');
  });
  
  console.log('Image mapping completed!');
}

fixImageMapping().catch(console.error);