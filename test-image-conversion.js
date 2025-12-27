// Test to reproduce the image conversion error

function testImageConversion() {
  console.log('TESTING IMAGE CONVERSION LOGIC');
  console.log('==============================');
  
  // Simulate painting data from database (images as strings)
  const painting = {
    _id: 'test123',
    title: { en: 'Test Painting', ro: 'Tablou Test' },
    images: ['/uploads/paintings/sunset.jpg', '/uploads/paintings/sunset2.jpg']
  };
  
  console.log('Original painting images:', painting.images);
  console.log('Image types:', painting.images.map(img => typeof img));
  
  // Test the conversion logic from handleEdit
  const convertedImages = painting.images && painting.images.length > 0 ? 
    painting.images.map(img => {
      if (typeof img === 'string') {
        return { url: img, alt: '' };
      } else if (img && typeof img === 'object' && img.url) {
        return { url: img.url, alt: img.alt || '' };
      } else {
        return { url: '', alt: '' };
      }
    }) : [{ url: '', alt: '' }];
  
  console.log('Converted images:', convertedImages);
  console.log('Converted image types:', convertedImages.map(img => typeof img));
  
  // Test the updateImage logic
  console.log('\nTesting updateImage logic:');
  const formImages = [...convertedImages];
  
  // Simulate what happens in updateImage
  const index = 0;
  const field = 'url';
  const value = '/uploads/paintings/new-sunset.jpg';
  
  console.log('Before updateImage:');
  console.log('  formImages[0]:', formImages[0]);
  console.log('  Type:', typeof formImages[0]);
  
  // This is the logic from updateImage function
  if (typeof formImages[index] === 'string') {
    console.log('  Converting string to object...');
    formImages[index] = { url: formImages[index], alt: '' };
  }
  
  console.log('After conversion check:');
  console.log('  formImages[0]:', formImages[0]);
  console.log('  Type:', typeof formImages[0]);
  
  // This should work now
  try {
    formImages[index][field] = value;
    console.log('✅ Successfully set property');
    console.log('  Final result:', formImages[0]);
  } catch (error) {
    console.log('❌ Error setting property:', error.message);
  }
}

testImageConversion();