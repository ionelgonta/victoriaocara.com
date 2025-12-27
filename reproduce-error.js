// Reproduce the exact error scenario

console.log('🔍 REPRODUCING THE EXACT ERROR SCENARIO');
console.log('======================================');

// Simulate the exact data structure from the database
const paintingFromDB = {
  _id: 'test123',
  title: { en: 'Test Painting', ro: 'Tablou Test' },
  images: ['/uploads/paintings/sunset.jpg'], // This is a string array
  price: 1000,
  dimensions: { width: 50, height: 70, unit: 'cm' },
  technique: 'Oil on Canvas'
};

console.log('1. Original painting from DB:');
console.log('   Images:', paintingFromDB.images);
console.log('   Image types:', paintingFromDB.images.map(img => typeof img));

// Simulate handleEdit conversion
console.log('\n2. HandleEdit conversion:');
const convertedImages = paintingFromDB.images && paintingFromDB.images.length > 0 ? 
  paintingFromDB.images.map(img => {
    if (typeof img === 'string') {
      return { url: img, alt: '' };
    } else if (img && typeof img === 'object' && img.url) {
      return { url: img.url, alt: img.alt || '' };
    } else {
      return { url: '', alt: '' };
    }
  }) : [{ url: '', alt: '' }];

console.log('   Converted images:', convertedImages);
console.log('   Converted types:', convertedImages.map(img => typeof img));

// Simulate formData state
const formData = {
  images: convertedImages
};

console.log('\n3. FormData state:');
console.log('   formData.images:', formData.images);
console.log('   Types:', formData.images.map(img => typeof img));

// Now simulate what happens in updateImage when called
console.log('\n4. Simulating updateImage call:');
const index = 0;
const field = 'url';
const value = '/uploads/paintings/new-sunset.jpg';

// This is the OLD problematic code that might still be running
console.log('   OLD CODE SIMULATION (problematic):');
try {
  const oldNewImages = [...formData.images];
  console.log('   Before assignment - oldNewImages[0]:', oldNewImages[0]);
  console.log('   Type:', typeof oldNewImages[0]);
  
  // This would cause the error if oldNewImages[0] is a string
  if (typeof oldNewImages[0] === 'string') {
    console.log('   ❌ FOUND THE PROBLEM! Trying to set property on string');
    console.log('   This would cause: Cannot create property \'url\' on string');
    // oldNewImages[0][field] = value; // This would fail
  } else {
    oldNewImages[0][field] = value;
    console.log('   ✅ Old code would work');
  }
} catch (error) {
  console.log('   ❌ Old code error:', error.message);
}

// Test the NEW code
console.log('\n   NEW CODE SIMULATION (fixed):');
try {
  const currentImages = formData.images || [];
  const newImages = [];
  
  for (let i = 0; i < currentImages.length; i++) {
    if (i === index) {
      let imageObj;
      if (typeof currentImages[i] === 'string') {
        imageObj = { url: currentImages[i], alt: '' };
      } else if (currentImages[i] && typeof currentImages[i] === 'object') {
        imageObj = { ...currentImages[i] };
      } else {
        imageObj = { url: '', alt: '' };
      }
      
      if (field === 'url') {
        imageObj.url = value;
      }
      
      newImages.push(imageObj);
    } else {
      if (typeof currentImages[i] === 'string') {
        newImages.push({ url: currentImages[i], alt: '' });
      } else if (currentImages[i] && typeof currentImages[i] === 'object') {
        newImages.push({ ...currentImages[i] });
      } else {
        newImages.push({ url: '', alt: '' });
      }
    }
  }
  
  console.log('   ✅ New code result:', newImages);
  console.log('   ✅ New code works perfectly');
} catch (error) {
  console.log('   ❌ New code error:', error.message);
}

console.log('\n🎯 CONCLUSION:');
console.log('===============');
console.log('The error occurs when the OLD code tries to set properties directly on strings.');
console.log('The NEW code should prevent this by explicit object creation.');
console.log('If the error persists, the server is still running the OLD code.');