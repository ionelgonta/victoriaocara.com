#!/bin/bash

echo "🧪 Testing image loading performance..."
echo "====================================="

# Verifică dacă serverul rulează
echo "🔍 Checking if server is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Server is running on localhost:3000"
else
    echo "❌ Server is not running. Please start it with 'npm run dev'"
    exit 1
fi

echo ""
echo "📊 Testing API endpoints..."

# Test upload endpoint
echo "1. Testing admin upload endpoint..."
echo "   (This requires admin authentication - test manually in admin panel)"

# Test paintings API
echo "2. Testing paintings API..."
response=$(curl -s -w "%{http_code}" http://localhost:3000/api/paintings)
http_code="${response: -3}"
if [ "$http_code" = "200" ]; then
    echo "   ✅ Paintings API responding (HTTP $http_code)"
    
    # Verifică dacă răspunsul conține URL-uri de fișiere în loc de base64
    if echo "$response" | grep -q "/uploads/"; then
        echo "   ✅ Found file URLs in response (new system working)"
    elif echo "$response" | grep -q "data:image"; then
        echo "   ⚠️  Still found base64 data - migration may be needed"
    else
        echo "   ℹ️  No images found in response"
    fi
else
    echo "   ❌ Paintings API error (HTTP $http_code)"
fi

echo ""
echo "📁 Checking upload directories..."
if [ -d "public/uploads" ]; then
    echo "✅ Upload directory exists"
    
    if [ -d "public/uploads/paintings" ]; then
        echo "✅ Paintings directory exists"
        
        # Contează fișierele
        file_count=$(find public/uploads -type f | wc -l)
        echo "📊 Total files in uploads: $file_count"
        
        if [ $file_count -gt 0 ]; then
            echo "✅ Files found in upload directory"
            echo "📋 Recent files:"
            find public/uploads -type f -name "*.jpg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" | head -5
        else
            echo "ℹ️  No files in upload directory yet"
        fi
    else
        echo "❌ Paintings directory missing"
    fi
else
    echo "❌ Upload directory missing"
fi

echo ""
echo "🎯 Performance recommendations:"
echo "   • Images should load instantly from /uploads/ URLs"
echo "   • Base64 data should be eliminated from database"
echo "   • Monitor disk space usage in public/uploads/"
echo "   • Consider adding image optimization (WebP, compression)"

echo ""
echo "🔧 To test manually:"
echo "   1. Go to admin panel: http://localhost:3000/admin"
echo "   2. Upload a new painting"
echo "   3. Check if image loads quickly on the website"
echo "   4. Verify the image URL starts with /uploads/"