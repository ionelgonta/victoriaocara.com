require('dotenv').config();
const { MongoClient } = require('mongodb');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

async function migrateToSQLite() {
  console.log('🔄 MIGRATING FROM MONGODB TO SQLITE');
  console.log('==================================');
  
  // Create database directory
  const dbDir = 'database';
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('✅ Created database directory');
  }
  
  // Initialize SQLite database
  const dbPath = path.join(dbDir, 'victoriaocara.db');
  const db = new sqlite3.Database(dbPath);
  
  console.log('📊 Creating SQLite tables...');
  
  // Create tables
  await new Promise((resolve, reject) => {
    db.serialize(() => {
      // Paintings table
      db.run(`CREATE TABLE IF NOT EXISTS paintings (
        id TEXT PRIMARY KEY,
        title_en TEXT,
        title_ro TEXT,
        description_en TEXT,
        description_ro TEXT,
        price REAL,
        dimensions TEXT,
        medium TEXT,
        year INTEGER,
        available BOOLEAN DEFAULT 1,
        featured BOOLEAN DEFAULT 0,
        category TEXT DEFAULT 'painting',
        slug TEXT UNIQUE,
        images TEXT, -- JSON string
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      // Public images table
      db.run(`CREATE TABLE IF NOT EXISTS public_images (
        id TEXT PRIMARY KEY,
        filename TEXT,
        original_name TEXT,
        mimetype TEXT,
        size INTEGER,
        url TEXT,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      // Contact info table
      db.run(`CREATE TABLE IF NOT EXISTS contact_info (
        id TEXT PRIMARY KEY,
        email TEXT,
        phone TEXT,
        address TEXT,
        working_hours TEXT,
        social_media TEXT, -- JSON string
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
  
  console.log('✅ SQLite tables created');
  
  // Connect to MongoDB to extract data
  console.log('📡 Connecting to MongoDB...');
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const mongodb = client.db('art-gallery');
  
  // Migrate paintings
  console.log('📊 Migrating paintings...');
  const paintings = await mongodb.collection('paintings').find({}).toArray();
  
  for (const painting of paintings) {
    await new Promise((resolve, reject) => {
      db.run(`INSERT OR REPLACE INTO paintings (
        id, title_en, title_ro, description_en, description_ro,
        price, dimensions, medium, year, available, featured, category, images
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        painting._id.toString(),
        painting.title?.en || null,
        painting.title?.ro || null,
        painting.description?.en || null,
        painting.description?.ro || null,
        painting.price || null,
        painting.dimensions || null,
        painting.medium || null,
        painting.year || null,
        painting.available !== false ? 1 : 0,
        painting.featured ? 1 : 0,
        painting.category || 'painting',
        JSON.stringify(painting.images || [])
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  
  console.log(`✅ Migrated ${paintings.length} paintings`);
  
  // Migrate public images
  console.log('📊 Migrating public images...');
  const publicImages = await mongodb.collection('publicImages').find({}).toArray();
  
  for (const img of publicImages) {
    await new Promise((resolve, reject) => {
      db.run(`INSERT OR REPLACE INTO public_images (
        id, filename, original_name, mimetype, size, url
      ) VALUES (?, ?, ?, ?, ?, ?)`, [
        img._id.toString(),
        img.filename || null,
        img.originalName || null,
        img.mimetype || null,
        img.size || null,
        img.url || null
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  
  console.log(`✅ Migrated ${publicImages.length} public images`);
  
  // Migrate contact info
  console.log('📊 Migrating contact info...');
  const contactInfo = await mongodb.collection('contactInfo').findOne({});
  
  if (contactInfo) {
    await new Promise((resolve, reject) => {
      db.run(`INSERT OR REPLACE INTO contact_info (
        id, email, phone, address, social_media
      ) VALUES (?, ?, ?, ?, ?)`, [
        contactInfo._id.toString(),
        contactInfo.email || null,
        contactInfo.phone || null,
        contactInfo.address || null,
        JSON.stringify(contactInfo.socialMedia || {})
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ Migrated contact info');
  }
  
  // Close connections
  await client.close();
  db.close();
  
  console.log('');
  console.log('🎉 MIGRATION TO SQLITE COMPLETED!');
  console.log('=================================');
  console.log('');
  console.log('📁 Database created: database/victoriaocara.db');
  console.log('');
  console.log('🔧 Next steps:');
  console.log('  1. Install sqlite3: npm install sqlite3');
  console.log('  2. Update API routes to use SQLite');
  console.log('  3. Update .env file');
  console.log('  4. Test the application');
  console.log('  5. Stop MongoDB service');
}

migrateToSQLite().catch(console.error);