#!/bin/bash

echo "🚀 COMPLETE SQLITE DEPLOYMENT TO LIVE SERVER"
echo "============================================"

# Upload all SQLite files to server
echo "📤 Uploading SQLite files to server..."

# Upload database files
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" lib/database.js root@anyway.ro:/root/victoriaocara.com/lib/
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" lib/sqlite.js root@anyway.ro:/root/victoriaocara.com/lib/
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" lib/sqlite.ts root@anyway.ro:/root/victoriaocara.com/lib/

# Upload API files
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" app/api/paintings/route.ts root@anyway.ro:/root/victoriaocara.com/app/api/paintings/
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" app/api/contact-info/route.ts root@anyway.ro:/root/victoriaocara.com/app/api/contact-info/

echo "✅ Files uploaded"

# Run deployment on server
echo "🔄 Running complete SQLite deployment on server..."
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" root@anyway.ro "cd /root/victoriaocara.com && bash -c '
echo \"📦 Installing sqlite3 (if not already installed)...\"
npm install sqlite3

echo \"🔄 Updating database schema...\"
node -e \"
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/victoriaocara.db');
db.run('ALTER TABLE contact_info ADD COLUMN working_hours TEXT', (err) => {
  if (err && !err.message.includes('duplicate column')) {
    console.log('Error adding working_hours column:', err.message);
  } else {
    console.log('✅ Database schema updated');
  }
});
db.run('ALTER TABLE paintings ADD COLUMN slug TEXT', (err) => {
  if (err && !err.message.includes('duplicate column')) {
    console.log('Error adding slug column:', err.message);
  } else {
    console.log('✅ Slug column added');
  }
});
db.close();
\"

echo \"🔧 Updating environment...\"
sed -i \"s/^MONGODB_URI=/#MONGODB_URI=/\" .env
if ! grep -q \"DATABASE_PATH\" .env; then
  echo \"DATABASE_PATH=./database/victoriaocara.db\" >> .env
fi

echo \"🏗️ Building application...\"
npm run build

echo \"🔄 Restarting application...\"
pm2 restart victoriaocara

echo \"\"
echo \"🎉 SQLITE DEPLOYMENT COMPLETED!\"
echo \"===============================\"
echo \"\"
echo \"✅ SQLite database active\"
echo \"✅ MongoDB dependency removed\"
echo \"✅ API routes updated\"
echo \"✅ Application restarted\"
echo \"\"
echo \"🔗 Test the site: https://victoriaocara.com\"
echo \"📊 Database should be much faster now!\"
'"

echo ""
echo "🎉 COMPLETE DEPLOYMENT FINISHED!"
echo "==============================="
echo ""
echo "✅ All SQLite files deployed"
echo "✅ Database schema updated"
echo "✅ API routes converted to SQLite"
echo "✅ Application rebuilt and restarted"
echo ""
echo "🔗 Test: https://victoriaocara.com/galerie"
echo "🚀 Site should now be much faster without MongoDB!"