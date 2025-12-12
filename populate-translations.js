const { MongoClient } = require('mongodb');

const uri = 'mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery';

async function populateTranslations() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('art-gallery');
    const collection = db.collection('translations');
    
    // Check if translations exist
    const count = await collection.countDocuments();
    console.log(`Found ${count} existing translations`);
    
    if (count === 0) {
      console.log('Populating with sample translations...');
      
      const sampleTranslations = [
        {
          key: 'nav.home',
          en: 'Home',
          ro: 'Acasă',
          updatedAt: new Date()
        },
        {
          key: 'nav.gallery',
          en: 'Gallery',
          ro: 'Galerie',
          updatedAt: new Date()
        },
        {
          key: 'nav.about',
          en: 'About',
          ro: 'Despre',
          updatedAt: new Date()
        },
        {
          key: 'nav.contact',
          en: 'Contact',
          ro: 'Contact',
          updatedAt: new Date()
        },
        {
          key: 'home.hero.title',
          en: 'Original Art',
          ro: 'Artă Originală',
          updatedAt: new Date()
        }
      ];
      
      await collection.insertMany(sampleTranslations);
      console.log(`✅ Inserted ${sampleTranslations.length} sample translations`);
    } else {
      console.log('✅ Translations already exist in database');
    }
    
    // Show some translations
    const translations = await collection.find({}).limit(5).toArray();
    console.log('\nSample translations:');
    translations.forEach(t => {
      console.log(`  ${t.key}: EN="${t.en}" RO="${t.ro}"`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

populateTranslations();