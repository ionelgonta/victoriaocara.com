#!/bin/bash

echo "🧪 TESTING SQLITE DEPLOYMENT"
echo "============================"

echo ""
echo "📊 Testing API performance..."
API_SIZE=$(curl -s https://victoriaocara.com/api/paintings | wc -c)
echo "API response size: $API_SIZE bytes"

if [ "$API_SIZE" -lt 10000 ]; then
    echo "✅ API size is optimal (under 10KB)"
else
    echo "❌ API size is still large"
fi

echo ""
echo "🔗 Testing painting URLs..."
SLUGS=("the-winter-road" "fluid-horizon" "tulips")

for slug in "${SLUGS[@]}"; do
    echo "Testing: https://victoriaocara.com/tablou/$slug"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://victoriaocara.com/tablou/$slug")
    if [ "$STATUS" = "200" ]; then
        echo "✅ $slug - OK"
    else
        echo "❌ $slug - Status: $STATUS"
    fi
done

echo ""
echo "🖼️ Testing image URLs..."
IMAGE_URL=$(curl -s https://victoriaocara.com/api/paintings | grep -o '"/uploads/paintings/[^"]*"' | head -1 | tr -d '"')
if [ ! -z "$IMAGE_URL" ]; then
    echo "Testing image: https://victoriaocara.com$IMAGE_URL"
    IMG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://victoriaocara.com$IMAGE_URL")
    if [ "$IMG_STATUS" = "200" ]; then
        echo "✅ Images are accessible"
    else
        echo "❌ Image not accessible - Status: $IMG_STATUS"
    fi
else
    echo "❌ No image URLs found in API"
fi

echo ""
echo "📊 Database status..."
echo "SQLite database size: $(ls -lh database/victoriaocara.db | awk '{print $5}')"
echo "Images directory size: $(du -sh public/uploads/paintings/ | awk '{print $1}')"

echo ""
echo "🎉 SQLITE DEPLOYMENT TEST COMPLETE!"
echo "=================================="