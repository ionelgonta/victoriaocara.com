const { MongoClient } = require('mongodb');

async function removeSiteNouContent() {
  const client = new MongoClient('mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('art-gallery');
    
    // Verifică colecția de conținut admin
    const contentCollection = db.collection('contents');
    const contents = await contentCollection.find({}).toArray();
    
    console.log('Found content entries:', contents.length);
    
    // Caută și afișează conținutul homepage
    const homepageContent = contents.find(c => c.key === 'homepage');
    if (homepageContent) {
      console.log('\nFound homepage content:');
      console.log(JSON.stringify(homepageContent.content, null, 2));
      
      // Verifică dacă conține "site nou"
      const contentStr = JSON.stringify(homepageContent.content).toLowerCase();
      if (contentStr.includes('site nou')) {
        console.log('\n⚠️  Found "site nou" in homepage content!');
        
        // Șterge conținutul homepage pentru a reveni la traducerile implicite
        await contentCollection.deleteOne({ key: 'homepage' });
        console.log('✅ Deleted homepage content - site will now use default translations');
      } else {
        console.log('\n✅ No "site nou" found in homepage content');
      }
    } else {
      console.log('\n✅ No homepage content found - site uses default translations');
    }
    
    // Verifică și colecția de traduceri
    const translationsCollection = db.collection('translations');
    const translations = await translationsCollection.find({}).toArray();
    
    console.log('\nFound translations:', translations.length);
    
    // Caută traduceri care conțin "site nou"
    const siteNouTranslations = translations.filter(t => 
      (t.en && t.en.toLowerCase().includes('site nou')) || 
      (t.ro && t.ro.toLowerCase().includes('site nou'))
    );
    
    if (siteNouTranslations.length > 0) {
      console.log('\n⚠️  Found "site nou" translations:');
      for (const t of siteNouTranslations) {
        console.log(`Key: ${t.key}`);
        console.log(`EN: ${t.en}`);
        console.log(`RO: ${t.ro}`);
        
        // Șterge traducerea
        await translationsCollection.deleteOne({ _id: t._id });
        console.log(`✅ Deleted translation: ${t.key}`);
        console.log('---');
      }
    } else {
      console.log('\n✅ No "site nou" translations found');
    }
    
    console.log('\n🎉 Cleanup complete! Site should now show proper titles.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

removeSiteNouContent();