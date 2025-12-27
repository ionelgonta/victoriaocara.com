#!/bin/bash

echo "🧪 VERIFYING IMAGE FIX DEPLOYMENT"
echo "================================="

# Verifică directoarele
echo "1. Checking upload directories..."
if [ -d "public/uploads/paintings" ]; then
    echo "   ✅ public/uploads/paintings exists"
    file_count=$(find public/uploads/paintings -type f 2>/dev/null | wc -l)
    echo "   📊 Files in paintings directory: $file_count"
else
    echo "   ❌ public/uploads/paintings missing"
fi

if [ -d "public/uploads/general" ]; then
    echo "   ✅ public/uploads/general exists"
else
    echo "   ❌ public/uploads/general missing"
fi

# Verifică fișierele de cod
echo ""
echo "2. Checking code files..."
if [ -f "lib/imageStorage.ts" ]; then
    echo "   ✅ lib/imageStorage.ts exists"
else
    echo "   ❌ lib/imageStorage.ts missing"
fi

if [ -f "app/api/upload/route.ts" ]; then
    if grep -q "saveImageToDisk" "app/api/upload/route.ts"; then
        echo "   ✅ Upload API uses file storage"
    else
        echo "   ⚠️  Upload API may still use base64"
    fi
else
    echo "   ❌ Upload API missing"
fi

# Test API response
echo ""
echo "3. Testing API response..."
if command -v curl >/dev/null 2>&1; then
    echo "   🔍 Checking API response size..."
    
    # Test cu timeout
    api_response=$(timeout 10 curl -s https://victoriaocara.com/api/paintings 2>/dev/null)
    api_size=${#api_response}
    
    if [ $api_size -gt 0 ]; then
        echo "   📊 API response size: $api_size characters"
        
        if [ $api_size -lt 50000 ]; then
            echo "   ✅ SUCCESS: API response is small - using file URLs!"
        elif [ $api_size -gt 500000 ]; then
            echo "   ❌ WARNING: API response still very large - may still use base64"
        else
            echo "   ⚠️  API response moderate size - partial migration?"
        fi
        
        # Verifică dacă conține URL-uri de fișiere
        if echo "$api_response" | grep -q "/uploads/"; then
            echo "   ✅ Found file URLs in API response"
        else
            echo "   ⚠️  No file URLs found in API response"
        fi
        
        # Verifică dacă conține încă base64
        if echo "$api_response" | grep -q "data:image"; then
            echo "   ⚠️  Still contains base64 data - migration incomplete"
        else
            echo "   ✅ No base64 data found - migration successful"
        fi
        
    else
        echo "   ❌ Could not fetch API response or response is empty"
    fi
else
    echo "   ⚠️  curl not available, skipping API test"
fi

# Test site-ul live
echo ""
echo "4. Testing live website..."
if command -v curl >/dev/null 2>&1; then
    gallery_response=$(timeout 5 curl -s -I https://victoriaocara.com/galerie 2>/dev/null)
    if echo "$gallery_response" | grep -q "200 OK"; then
        echo "   ✅ Gallery page is accessible"
    else
        echo "   ⚠️  Gallery page may have issues"
    fi
else
    echo "   ⚠️  Cannot test website accessibility"
fi

# Verifică procesele
echo ""
echo "5. Checking server processes..."
if command -v pm2 >/dev/null 2>&1; then
    pm2_status=$(pm2 list 2>/dev/null | grep -c "online")
    if [ $pm2_status -gt 0 ]; then
        echo "   ✅ PM2 processes running: $pm2_status"
    else
        echo "   ⚠️  No PM2 processes found running"
    fi
else
    echo "   ℹ️  PM2 not available"
fi

# Sumar final
echo ""
echo "🎯 VERIFICATION SUMMARY"
echo "======================"

# Calculează scorul
score=0
total=5

# Directoare
if [ -d "public/uploads/paintings" ]; then score=$((score + 1)); fi

# Fișiere cod
if [ -f "lib/imageStorage.ts" ]; then score=$((score + 1)); fi

# API size (estimare)
if [ ${api_size:-0} -lt 50000 ] && [ ${api_size:-0} -gt 0 ]; then score=$((score + 1)); fi

# File URLs
if echo "${api_response:-}" | grep -q "/uploads/"; then score=$((score + 1)); fi

# No base64
if ! echo "${api_response:-}" | grep -q "data:image"; then score=$((score + 1)); fi

echo "📊 Fix Status: $score/$total checks passed"

if [ $score -eq 5 ]; then
    echo "🎉 EXCELLENT: Image fix is working perfectly!"
    echo "   Images should load instantly on the website"
elif [ $score -ge 3 ]; then
    echo "✅ GOOD: Image fix is mostly working"
    echo "   Some minor issues may remain"
else
    echo "⚠️  NEEDS ATTENTION: Image fix may not be working properly"
    echo "   Please check the issues above"
fi

echo ""
echo "🔗 Test manually: https://victoriaocara.com/galerie"
echo "🚀 Images should load instantly without preloader!"

echo ""
echo "📋 Next steps if issues remain:"
echo "   1. Check server logs for errors"
echo "   2. Verify MongoDB connection"
echo "   3. Restart web server completely"
echo "   4. Re-run migration script"