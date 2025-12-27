#!/bin/bash

echo "=== CHECKING MIGRATION STATUS ON SERVER ==="

# Conectează-te la server și verifică statusul
ssh root@23.88.113.154 << 'EOF'
echo "1. Checking if auto-pull has run..."
cd /opt/victoriaocara

# Verifică dacă scriptul de migrare există
if [ -f "migrate-all-translations-to-admin.sh" ]; then
    echo "✅ Migration script found on server"
    ls -la migrate-all-translations-to-admin.sh
else
    echo "❌ Migration script not found - auto-pull hasn't run yet"
fi

echo ""
echo "2. Checking auto-pull log..."
tail -20 /var/log/auto-pull.log

echo ""
echo "3. Checking current git status..."
git log --oneline -5

echo ""
echo "4. Testing if translations are in database..."
mongo mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery --eval "
db.translations.find().count()
" 2>/dev/null || echo "Could not connect to MongoDB"

echo ""
echo "5. Testing current site response..."
curl -s http://localhost:3000 | grep -o "<h1[^>]*>[^<]*</h1>" || echo "Could not extract H1"

echo ""
echo "6. Checking PM2 status..."
pm2 status

EOF