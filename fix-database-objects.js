// Script pentru a converti toate obiectele {en, ro} la string-uri în baza de date
const { MongoClient } = require('mongodb');

const uri = 'mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery';

async function fixDatabaseObjects() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('art-gallery');
    
    console.log('🔧 Fixing database objects...');
    
    // Fix paintings collection
    const paintings = await db.collection('paintings').find({}).toArray();
    
    for (const painting of paintings) {
      const updates = {};
      
      // Fix title
      if (painting.title && typeof painting.title === 'object') {
        updates.title = painting.title.en || painting.title.ro || 'Untitled';
      }
      
      // Fix technique
      if (painting.technique && typeof painting.technique === 'object') {
        updates.technique = painting.technique.en || painting.technique.ro || 'Unknown';
      }
      
      // Fix description
      if (painting.description && typeof painting.description === 'object') {
        updates.description = painting.description.en || painting.description.ro || '';
      }
      
      if (Object.keys(updates).length > 0) {
        await db.collection('paintings').updateOne(
          { _id: painting._id },
          { $set: updates }
        );
        console.log(`✅ Fixed painting: ${painting._id}`);
      }
    }
    
    // Fix other collections if needed
    console.log('🎉 Database objects fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

fixDatabaseObjects();