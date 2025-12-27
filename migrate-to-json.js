require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function migrateToJSON() {
  console.log('🔄 MIGRATING FROM MONGODB TO JSON FILES');
  console.log('======================================');
  
  // Connect to MongoDB to extract data
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('art-gallery');
  
  // Create data directory
  const dataDir = 'data';
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Created data directory');
  }
  
  // Extract paintings
  console.log('📊 Extracting paintings...');
  const paintings = await db.collection('paintings').find({}).toArray();
  
  // Convert ObjectId to string and clean data
  const cleanPaintings = paintings.map(painting => ({
    id: painting._id.toString(),
    title: painting.title,
    description: painting.description,
    price: painting.price,
    dimensions: painting.dimensions,
    medium: painting.medium,
    year: painting.year,
    available: painting.available !== false,
    featured: painting.featured || false,
    category: painting.category || 'painting',
    images: painting.images || [],
    createdAt: painting.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
  
  // Save paintings to JSON
  fs.writeFileSync(
    path.join(dataDir, 'paintings.json'), 
    JSON.stringify(cleanPaintings, null, 2)
  );
  console.log(`✅ Saved ${cleanPaintings.length} paintings to data/paintings.json`);
  
  // Extract public images
  console.log('📊 Extracting public images...');
  const publicImages = await db.collection('publicImages').find({}).toArray();
  
  const cleanPublicImages = publicImages.map(img => ({
    id: img._id.toString(),
    filename: img.filename,
    originalName: img.originalName,
    mimetype: img.mimetype,
    size: img.size,
    url: img.url,
    uploadedAt: img.uploadedAt || new Date().toISOString()
  }));
  
  fs.writeFileSync(
    path.join(dataDir, 'public-images.json'), 
    JSON.stringify(cleanPublicImages, null, 2)
  );
  console.log(`✅ Saved ${cleanPublicImages.length} public images to data/public-images.json`);
  
  // Extract contact info
  console.log('📊 Extracting contact info...');
  const contactInfo = await db.collection('contactInfo').findOne({});
  
  if (contactInfo) {
    const cleanContactInfo = {
      id: contactInfo._id.toString(),
      email: contactInfo.email,
      phone: contactInfo.phone,
      address: contactInfo.address,
      socialMedia: contactInfo.socialMedia || {},
      updatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(dataDir, 'contact-info.json'), 
      JSON.stringify(cleanContactInfo, null, 2)
    );
    console.log('✅ Saved contact info to data/contact-info.json');
  }
  
  await client.close();
  
  console.log('');
  console.log('🎉 MIGRATION TO JSON COMPLETED!');
  console.log('===============================');
  console.log('');
  console.log('📁 Data files created:');
  console.log('  - data/paintings.json');
  console.log('  - data/public-images.json');
  console.log('  - data/contact-info.json');
  console.log('');
  console.log('🔧 Next steps:');
  console.log('  1. Update API routes to use JSON files');
  console.log('  2. Remove MongoDB dependency');
  console.log('  3. Test the application');
  console.log('  4. Stop MongoDB service');
}

migrateToJSON().catch(console.error);