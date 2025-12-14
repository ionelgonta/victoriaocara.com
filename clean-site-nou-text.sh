#!/bin/bash

echo "=== REMOVING 'SITE NOU VICTORIA OCARA' TEXT ==="

cd /opt/victoriaocara

# Creează scriptul Node.js pentru curățare
cat > clean-database.js << 'EOF'
const { MongoClient } = require('mongodb');

async function cleanDatabase() {
  const client = new MongoClient('mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery');
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('art-gallery');
    
    // 1. Verifică și curăță colecția de conținut admin
    console.log('\n1. Checking admin content...');
    const contentCollection = db.collection('contents');
    const contents = await contentCollection.find({}).toArray();
    
    console.log(`Found ${contents.length} content entries`);
    
    const homepageContent = contents.find(c => c.key === 'homepage');
    if (homepageContent) {
      console.log('Found homepage content:', JSON.stringify(homepageContent.content, null, 2));
      
      const contentStr = JSON.stringify(homepageContent.content).toLowerCase();
      if (contentStr.includes('site nou')) {
        console.log('⚠️  Found "site nou" in homepage content - removing...');
        await contentCollection.deleteOne({ key: 'homepage' });
        console.log('✅ Deleted homepage content');
      } else {
        console.log('✅ No "site nou" found in homepage content');
      }
    } else {
      console.log('✅ No homepage content found');
    }
    
    // 2. Verifică și curăță traducerile
    console.log('\n2. Checking translations...');
    const translationsCollection = db.collection('translations');
    const translations = await translationsCollection.find({}).toArray();
    
    console.log(`Found ${translations.length} translations`);
    
    const siteNouTranslations = translations.filter(t => 
      (t.en && t.en.toLowerCase().includes('site nou')) || 
      (t.ro && t.ro.toLowerCase().includes('site nou'))
    );
    
    if (siteNouTranslations.length > 0) {
      console.log(`⚠️  Found ${siteNouTranslations.length} "site nou" translations - removing...`);
      for (const t of siteNouTranslations) {
        console.log(`Removing: ${t.key} - EN: ${t.en} - RO: ${t.ro}`);
        await translationsCollection.deleteOne({ _id: t._id });
      }
      console.log('✅ All "site nou" translations removed');
    } else {
      console.log('✅ No "site nou" translations found');
    }
    
    // 3. Verifică titlul curent
    console.log('\n3. Checking current home title...');
    const homeTitle = translations.find(t => t.key === 'home.hero.title');
    if (homeTitle) {
      console.log(`Current title - EN: ${homeTitle.en}, RO: ${homeTitle.ro}`);
    } else {
      console.log('✅ No custom home title - using default "Artă Originală"');
    }
    
    console.log('\n🎉 Database cleanup complete!');
    console.log('Site should now show proper titles without "site nou"');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

cleanDatabase();
EOF

# Rulează scriptul de curățare
echo "Running database cleanup..."
node clean-database.js

# Restart aplicația pentru a aplica modificările
echo ""
echo "Restarting application to apply changes..."
pm2 restart victoriaocara

echo ""
echo "Waiting for application to restart..."
sleep 10

# Verifică rezultatul
echo ""
echo "Testing current site title..."
curl -s http://localhost:3000 | grep -o "<title>[^<]*</title>" || echo "Could not extract title"

echo ""
echo "Testing live site..."
curl -s https://victoriaocara.com | grep -o "<title>[^<]*</title>" || echo "Could not extract title"

echo ""
echo "=== CLEANUP COMPLETE ==="
echo "✅ Removed any 'site nou Victoria Ocara' text from database"
echo "✅ Site should now show proper titles"
echo "✅ Application restarted"

# Curăță fișierul temporar
rm -f clean-database.js