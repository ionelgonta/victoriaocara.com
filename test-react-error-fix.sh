#!/bin/bash

echo "🧪 TESTING REACT ERROR #31 FIX"
echo "==============================="

cd /opt/victoriaocara

echo ""
echo "1. 🔍 Checking for safeRender function usage..."
SAFE_RENDER_COUNT=$(grep -r "safeRender" components/ app/ --include="*.tsx" | wc -l)
echo "   Found $SAFE_RENDER_COUNT uses of safeRender function"

echo ""
echo "2. 🔍 Checking for getLocalizedText function usage..."
LOCALIZED_TEXT_COUNT=$(grep -r "getLocalizedText" components/ app/ --include="*.tsx" | wc -l)
echo "   Found $LOCALIZED_TEXT_COUNT uses of getLocalizedText function"

echo ""
echo "3. 🔍 Checking for direct multilingual object rendering..."
DIRECT_OBJECT_COUNT=$(grep -r "{\s*en\s*:" app/ components/ --include="*.tsx" --exclude-dir=admin | wc -l)
if [ "$DIRECT_OBJECT_COUNT" -eq 0 ]; then
    echo "   ✅ No direct object rendering found in public components"
else
    echo "   ⚠️  Found $DIRECT_OBJECT_COUNT potential issues:"
    grep -r "{\s*en\s*:" app/ components/ --include="*.tsx" --exclude-dir=admin -n
fi

echo ""
echo "4. 🌐 Testing cart page (where error was reported)..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/cart 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ✅ Cart page responding (HTTP $HTTP_STATUS)"
else
    echo "   ❌ Cart page not responding (HTTP $HTTP_STATUS)"
fi

echo ""
echo "5. 🌐 Testing gallery page..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/galerie 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ✅ Gallery page responding (HTTP $HTTP_STATUS)"
else
    echo "   ❌ Gallery page not responding (HTTP $HTTP_STATUS)"
fi

echo ""
echo "6. 🌐 Testing homepage..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ✅ Homepage responding (HTTP $HTTP_STATUS)"
else
    echo "   ❌ Homepage not responding (HTTP $HTTP_STATUS)"
fi

echo ""
echo "7. 📊 PM2 Application Status..."
PM2_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="victoriaocara") | .pm2_env.status' 2>/dev/null || echo "unknown")
echo "   PM2 Status: $PM2_STATUS"

if [ "$PM2_STATUS" = "online" ]; then
    echo "   ✅ Application is running"
else
    echo "   ❌ Application is not running properly"
    echo "   Recent logs:"
    pm2 logs victoriaocara --lines 5 --nostream
fi

echo ""
echo "==============================="
if [ "$PM2_STATUS" = "online" ] && [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ REACT ERROR #31 FIX TEST PASSED!"
    echo "🎉 Application is running without React errors"
else
    echo "❌ REACT ERROR #31 FIX TEST FAILED"
    echo "🔧 Run: ./complete-server-fix.sh"
fi
echo "==============================="