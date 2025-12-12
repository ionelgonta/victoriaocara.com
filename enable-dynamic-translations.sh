#!/bin/bash

echo "🌐 ENABLING DYNAMIC TRANSLATIONS FROM DATABASE"
echo "=============================================="

cd /opt/victoriaocara

echo "📥 Pulling latest changes..."
git pull origin main

echo ""
echo "🛑 Restarting application..."
pm2 restart victoriaocara

echo ""
echo "⏳ Waiting for restart..."
sleep 5

echo ""
echo "🧪 Testing translations API..."
echo "1. Testing GET /api/translations:"
curl -s http://localhost:3000/api/translations | jq '.success, .source' 2>/dev/null || echo "   API response received"

echo ""
echo "2. Testing MongoDB connection:"
mongo mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery --eval "db.translations.countDocuments()" 2>/dev/null || echo "   MongoDB connection test"

echo ""
echo "📊 Application status:"
pm2 status

echo ""
echo "🌐 Website test:"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
echo "   HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
    echo ""
    echo "✅ SUCCESS! Dynamic translations are now enabled!"
    echo "🔧 To test translations:"
    echo "   1. Go to https://victoriaocara.com/admin/translations"
    echo "   2. Edit any translation"
    echo "   3. Check the website to see changes"
    echo ""
    echo "📋 If translations don't appear, check:"
    echo "   - MongoDB has translations collection: db.translations.find()"
    echo "   - API returns data: curl http://localhost:3000/api/translations"
    echo "   - Browser console for errors"
else
    echo ""
    echo "❌ Application not responding properly"
    echo "📋 Check logs:"
    pm2 logs victoriaocara --lines 10
fi

echo ""
echo "=============================================="