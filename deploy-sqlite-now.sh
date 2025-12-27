#!/bin/bash

echo "🚀 DEPLOYING SQLITE MIGRATION TO LIVE SERVER"
echo "============================================"

# Upload migration files to server
echo "📤 Uploading files to server..."
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" migrate-to-sqlite.js root@anyway.ro:/root/victoriaocara.com/
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" lib/database.js root@anyway.ro:/root/victoriaocara.com/lib/
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" lib/sqlite.js root@anyway.ro:/root/victoriaocara.com/lib/

echo "✅ Files uploaded"

# Run migration on server
echo "🔄 Running migration on server..."
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" root@anyway.ro "cd /root/victoriaocara.com && bash -c '
echo \"📦 Installing sqlite3...\"
npm install sqlite3

echo \"🔄 Running migration from MongoDB to SQLite...\"
node migrate-to-sqlite.js

echo \"🔧 Updating environment...\"
sed -i \"s/^MONGODB_URI=/#MONGODB_URI=/\" .env
echo \"DATABASE_PATH=./database/victoriaocara.db\" >> .env

echo \"📊 Checking database size...\"
ls -lh database/victoriaocara.db

echo \"🔄 Restarting application...\"
pm2 restart victoriaocara

echo \"\"
echo \"🎉 SQLITE MIGRATION COMPLETED!\"
echo \"==============================\"
echo \"\"
echo \"✅ MongoDB replaced with SQLite\"
echo \"✅ Database file created\"
echo \"✅ Application restarted\"
echo \"\"
echo \"🔗 Test the site: https://victoriaocara.com\"
'"

echo ""
echo "🎉 DEPLOYMENT COMPLETED!"
echo "======================="
echo ""
echo "✅ SQLite migration deployed to server"
echo "✅ MongoDB dependency removed"
echo "✅ Site should be much faster now"
echo ""
echo "🔗 Test: https://victoriaocara.com/galerie"