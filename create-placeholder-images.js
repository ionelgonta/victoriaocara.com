const fs = require('fs');
const path = require('path');

// Create placeholder images for the real paintings
const paintings = [
  'winter-road-main.jpg',
  'autumn-reflections-main.jpg', 
  'morning-mist-main.jpg',
  'coastal-serenity-main.jpg',
  'wildflower-meadow-main.jpg',
  'sunset-valley-main.jpg',
  'forest-cathedral-main.jpg',
  'spring-awakening-main.jpg'
];

const uploadsDir = path.join('public', 'uploads', 'paintings');

// Create a simple placeholder image content (1x1 pixel transparent PNG)
const placeholderContent = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
  0x0B, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
]);

console.log('🖼️ CREATING PLACEHOLDER IMAGES');
console.log('==============================');

paintings.forEach(filename => {
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, placeholderContent);
  console.log(`✅ Created: ${filename}`);
});

console.log('\n🎉 PLACEHOLDER IMAGES CREATED!');
console.log('==============================');
console.log('');
console.log('✅ All painting images have placeholders');
console.log('✅ Gallery will load without broken images');
console.log('✅ Ready for production deployment');
console.log('');
console.log('📝 Note: Replace these with actual painting photos later');