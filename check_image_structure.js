const axios = require('axios');

async function checkImageStructure() {
  console.log('🔍 CHECKING IMAGE STRUCTURE IN API');
  console.log('==================================');
  
  try {
    const response = await axios.get('https://victoriaocara.com/api/paintings');
    
    console.log(`✅ Found ${response.data.length} paintings`);
    
    const painting = response.data[0];
    console.log('\n📋 First painting image structure:');
    console.log('Title:', painting.title.en);
    console.log('Images array:', JSON.stringify(painting.images, null, 2));
    console.log('Images type:', typeof painting.images);
    console.log('First image:', painting.images[0]);
    console.log('First image type:', typeof painting.images[0]);
    
    if (painting.images[0] && typeof painting.images[0] === 'object') {
      console.log('Image has .url property:', painting.images[0].url);
    } else {
      console.log('Image is a simple string:', painting.images[0]);
    }
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
  }
}

checkImageStructure();