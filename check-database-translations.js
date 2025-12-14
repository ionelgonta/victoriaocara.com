const { MongoClient } = require('mongodb');

async function checkTranslations() {
  const client = new MongoClient('mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('art-gallery');
    const translations = await db.collection('translations').find({}).toArray();
    
    console.log('Found translations:', translations.length);
    
    // Caută traduceri care conțin "site nou"
    const siteNouTranslations = translations.filter(t => 
      (t.en && t.en.toLowerCase().includes('site nou')) || 
      (t.ro && t.ro.toLowerCase().includes('site nou'))
    );
    
    if (siteNouTranslations.length > 0) {
      console.log('\nFound "site nou" translations:');
      siteNouTranslations.forEach(t => {
        console.log(`Key: ${t.key}`);
        console.log(`EN: ${t.en}`);
        console.log(`RO: ${t.ro}`);
        console.log('---');
      });
    } else {
      console.log('\nNo "site nou" translations found in database');
    }
    
    // Afișează toate traducerile pentru home.hero.title
    const heroTitle = translations.find(t => t.key === 'home.hero.title');
    if (heroTitle) {
      console.log('\nCurrent home.hero.title:');
      console.log(`EN: ${heroTitle.en}`);
      console.log(`RO: ${heroTitle.ro}`);
    } else {
      console.log('\nNo home.hero.title found in database - using default from LanguageContext');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkTranslations();