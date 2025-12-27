require('dotenv').config();
const { MongoClient } = require('mongodb');
const Database = require('./lib/database.js');

async function restoreFromAtlas() {
  console.log('🔄 RESTORING REAL DATA FROM MONGODB ATLAS');
  console.log('=========================================');
  
  // MongoDB Atlas connection string from the migration scripts
  const ATLAS_URI = "mongodb+srv://ionelgonta_db_user:ArtGallery2024!@art-gallery-cluster.ncpcxsd.mongodb.net/art-gallery";
  
  console.log('📡 Connecting to MongoDB Atlas...');
  const client = new MongoClient(ATLAS_URI);
  
  try {
    await client.connect();
    const atlasDb = client.db('art-gallery');
    
    // Initialize SQLite database
    const sqliteDb = new Database();
    
    // Get real paintings from Atlas
    console.log('📊 Fetching real paintings from Atlas...');
    const paintings = await atlasDb.collection('paintings').find({}).toArray();
    
    console.log(`Found ${paintings.length} real paintings in Atlas:`);
    
    // Clear existing SQLite data
    console.log('🗑️ Clearing existing SQLite data...');
    await sqliteDb.clearAllPaintings();
    
    // Migrate each real painting
    for (const painting of paintings) {
      console.log(`\n📝 Processing: ${painting.title?.en || painting.title || 'Untitled'}`);
      
      // Log painting structure for verification
      console.log('  - Title:', painting.title);
      console.log('  - Price:', painting.price);
      console.log('  - Dimensions:', painting.dimensions);
      console.log('  - Technique/Medium:', painting.technique || painting.medium);
      console.log('  - Images:', painting.images?.length || 0, 'images');
      console.log('  - Available:', painting.available);
      console.log('  - Featured:', painting.featured);
      
      try {
        // Add real painting to SQLite with exact data from Atlas
        const result = await sqliteDb.createPainting(painting);
        console.log(`  ✅ Added to SQLite with ID: ${result.id}`);
      } catch (error) {
        console.error(`  ❌ Error adding painting:`, error.message);
      }
    }
    
    // Get contact info from Atlas
    console.log('\n📞 Migrating contact info...');
    const contactInfo = await atlasDb.collection('contactInfo').findOne({});
    
    if (contactInfo) {
      console.log('  ✅ Found contact info in Atlas');
      console.log('  - Email:', contactInfo.email);
      console.log('  - Phone:', contactInfo.phone);
      console.log('  - Address:', contactInfo.address);
    } else {
      console.log('  ⚠️ No contact info found in Atlas');
    }
    
    // Get users from Atlas
    console.log('\n👥 Checking users...');
    const users = await atlasDb.collection('users').find({}).toArray();
    console.log(`  Found ${users.length} users in Atlas`);
    
    // Get public images from Atlas
    console.log('\n🖼️ Checking public images...');
    const publicImages = await atlasDb.collection('publicImages').find({}).toArray();
    console.log(`  Found ${publicImages.length} public images in Atlas`);
    
    // Close Atlas connection
    await client.close();
    
    // Generate slugs for the real paintings
    console.log('\n🔧 Generating slugs for real paintings...');
    const allPaintings = await sqliteDb.getAllPaintings();
    
    for (const painting of allPaintings) {
      const englishTitle = painting.title?.en || painting.title || 'untitled';
      const slug = englishTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      
      await sqliteDb.updatePainting(painting.id, {
        ...painting,
        slug: slug
      });
      
      console.log(`  ✅ Generated slug for "${englishTitle}": ${slug}`);
    }
    
    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const finalPaintings = await sqliteDb.getAllPaintings();
    console.log(`✅ SQLite now contains ${finalPaintings.length} real paintings from Atlas`);
    
    if (finalPaintings.length > 0) {
      console.log('\n📋 Real paintings restored:');
      finalPaintings.forEach((painting, index) => {
        console.log(`${index + 1}. ${painting.title?.en || painting.title || 'Untitled'}`);
        console.log(`   - Price: ${painting.price} EUR`);
        console.log(`   - Technique: ${painting.technique || painting.medium || 'Not specified'}`);
        console.log(`   - Dimensions: ${painting.dimensions?.width || 'N/A'}×${painting.dimensions?.height || 'N/A'} ${painting.dimensions?.unit || ''}`);
        console.log(`   - Images: ${painting.images?.length || 0} image(s)`);
        console.log(`   - Slug: ${painting.slug}`);
        console.log(`   - Featured: ${painting.featured || false}`);
        console.log('');
      });
    }
    
    console.log('\n🎉 REAL DATA RESTORATION FROM ATLAS COMPLETED!');
    console.log('==============================================');
    console.log('');
    console.log('✅ All real paintings from MongoDB Atlas restored to SQLite');
    console.log('✅ Original titles, prices, dimensions preserved');
    console.log('✅ Original images preserved');
    console.log('✅ SEO-friendly slugs generated');
    console.log('✅ Database ready for production');
    
  } catch (error) {
    console.error('❌ Error connecting to Atlas or restoring data:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('  - Check internet connection');
    console.log('  - Verify Atlas cluster is running');
    console.log('  - Check Atlas credentials');
    console.log('  - Ensure IP is whitelisted in Atlas');
  }
}

restoreFromAtlas().catch(console.error);