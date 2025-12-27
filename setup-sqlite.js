const fs = require('fs');
const path = require('path');

console.log('🔧 SETTING UP SQLITE FOR VICTORIAOCARA.COM');
console.log('==========================================');

// 1. Update package.json to include sqlite3
console.log('📦 Updating package.json...');
const packageJsonPath = 'package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add sqlite3 dependency
if (!packageJson.dependencies.sqlite3) {
  packageJson.dependencies.sqlite3 = '^5.1.6';
  console.log('✅ Added sqlite3 dependency');
}

// Remove mongodb dependency
if (packageJson.dependencies.mongodb) {
  delete packageJson.dependencies.mongodb;
  console.log('✅ Removed mongodb dependency');
}

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// 2. Update .env file
console.log('🔧 Updating .env file...');
const envPath = '.env';
let envContent = fs.readFileSync(envPath, 'utf8');

// Comment out MongoDB URI
envContent = envContent.replace(
  /^MONGODB_URI=/m, 
  '# MONGODB_URI='
);

// Add SQLite database path
if (!envContent.includes('DATABASE_PATH')) {
  envContent += '\n# SQLite Database\nDATABASE_PATH=./database/victoriaocara.db\n';
  console.log('✅ Added DATABASE_PATH to .env');
}

fs.writeFileSync(envPath, envContent);

// 3. Create database directory
const dbDir = 'database';
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('✅ Created database directory');
}

// 4. Create deployment script for server
console.log('📝 Creating deployment script...');
const deployScript = `#!/bin/bash

echo "🚀 DEPLOYING SQLITE MIGRATION TO SERVER"
echo "======================================"

# Install sqlite3
echo "📦 Installing sqlite3..."
npm install sqlite3

# Run migration from MongoDB to SQLite
echo "🔄 Running migration..."
node migrate-to-sqlite.js

# Update environment
echo "🔧 Updating environment..."
sed -i 's/^MONGODB_URI=/#MONGODB_URI=/' .env
echo "DATABASE_PATH=./database/victoriaocara.db" >> .env

# Restart application
echo "🔄 Restarting application..."
pm2 restart victoriaocara

echo ""
echo "🎉 SQLITE MIGRATION COMPLETED!"
echo "============================="
echo ""
echo "✅ MongoDB replaced with SQLite"
echo "✅ Database file: ./database/victoriaocara.db"
echo "✅ Application restarted"
echo ""
echo "🔗 Test the site: https://victoriaocara.com"
echo "📊 Database size is now much smaller!"
`;

fs.writeFileSync('deploy-sqlite-migration.sh', deployScript);
fs.chmodSync('deploy-sqlite-migration.sh', '755');
console.log('✅ Created deploy-sqlite-migration.sh');

console.log('');
console.log('🎉 SQLITE SETUP COMPLETED!');
console.log('=========================');
console.log('');
console.log('📁 Files created/updated:');
console.log('  ✅ package.json - added sqlite3, removed mongodb');
console.log('  ✅ .env - commented MongoDB, added SQLite path');
console.log('  ✅ lib/database.js - SQLite database class');
console.log('  ✅ migrate-to-sqlite.js - migration script');
console.log('  ✅ deploy-sqlite-migration.sh - server deployment');
console.log('');
console.log('🔧 Next steps:');
console.log('  1. Run: npm install sqlite3');
console.log('  2. Test locally: node migrate-to-sqlite.js');
console.log('  3. Update API routes to use new Database class');
console.log('  4. Deploy to server: ./deploy-sqlite-migration.sh');
console.log('');
console.log('💡 Benefits of SQLite:');
console.log('  ✅ No separate database server needed');
console.log('  ✅ Much smaller and faster');
console.log('  ✅ Single file database');
console.log('  ✅ Better performance for small/medium sites');
console.log('  ✅ Easier backups and deployment');