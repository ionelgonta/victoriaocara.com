#!/bin/bash

echo "🎯 MULTI-DOMAIN ROUTING FIX"
echo "============================"
echo "Problem: anyway.ro serving victoriaocara.com content instead of flight schedule"
echo "Solution: Fix nginx configuration to route domains correctly"
echo ""

# Make all scripts executable
chmod +x diagnose-domain-routing.sh
chmod +x test-applications.sh  
chmod +x fix-multi-domain-routing.sh

echo "📋 FIX SEQUENCE:"
echo "1. Diagnose current routing issue"
echo "2. Test applications on their ports"
echo "3. Apply correct nginx configuration"
echo "4. Verify both domains work correctly"
echo ""

read -p "Press Enter to start the domain routing fix..."

echo ""
echo "🔍 PHASE 1: COMPREHENSIVE DIAGNOSIS"
echo "=================================="
./diagnose-domain-routing.sh

echo ""
echo "🧪 PHASE 2: APPLICATION PORT TESTING"
echo "===================================="
./test-applications.sh

echo ""
echo "🔧 PHASE 3: APPLYING ROUTING FIX"
echo "==============================="
./fix-multi-domain-routing.sh

echo ""
echo "✅ PHASE 4: FINAL VERIFICATION"
echo "=============================="

echo "Waiting 10 seconds for nginx to stabilize..."
sleep 10

echo ""
echo "Testing domain routing:"

echo ""
echo "1. Testing anyway.ro (should show flight schedule):"
ANYWAY_RESPONSE=$(timeout 10 curl -s -H "Host: anyway.ro" http://localhost/ 2>/dev/null)
if echo "$ANYWAY_RESPONSE" | grep -q -i -E "(zbor|flight|orarul)"; then
    echo "✅ anyway.ro correctly serves flight schedule content"
else
    echo "❌ anyway.ro not serving flight schedule content"
    echo "Response preview:"
    echo "$ANYWAY_RESPONSE" | head -5
fi

echo ""
echo "2. Testing victoriaocara.com (should redirect to HTTPS):"
VICTORIA_REDIRECT=$(curl -s -I -H "Host: victoriaocara.com" http://localhost/ | grep -i location)
if echo "$VICTORIA_REDIRECT" | grep -q "https://victoriaocara.com"; then
    echo "✅ victoriaocara.com correctly redirects to HTTPS"
else
    echo "❌ victoriaocara.com redirect not working properly"
    echo "Response:"
    echo "$VICTORIA_REDIRECT"
fi

echo ""
echo "3. Testing HTTPS victoriaocara.com (should show art gallery):"
if [ -f "/etc/letsencrypt/live/victoriaocara.com/fullchain.pem" ]; then
    VICTORIA_HTTPS=$(timeout 10 curl -s -k https://victoriaocara.com/ 2>/dev/null)
    if echo "$VICTORIA_HTTPS" | grep -q -i -E "(victoria|art|gallery)"; then
        echo "✅ https://victoriaocara.com correctly serves art gallery"
    else
        echo "❌ https://victoriaocara.com not serving art gallery content"
        echo "Response preview:"
        echo "$VICTORIA_HTTPS" | head -5
    fi
else
    echo "⚠️  SSL certificate not found - HTTPS not available"
fi

echo ""
echo "============================"
echo "🎉 DOMAIN ROUTING FIX COMPLETE!"
echo ""
echo "🌐 EXPECTED RESULTS:"
echo "   • http://anyway.ro → Flight Schedule App (port 8080)"
echo "   • http://victoriaocara.com → Redirects to HTTPS"
echo "   • https://victoriaocara.com → Art Gallery App (port 3000)"
echo ""
echo "🔍 VERIFICATION COMMANDS:"
echo "   • curl -H 'Host: anyway.ro' http://localhost/"
echo "   • curl -I -H 'Host: victoriaocara.com' http://localhost/"
echo "   • curl -k https://victoriaocara.com/"
echo ""
echo "📱 BROWSER TESTING:"
echo "   • Open http://anyway.ro in browser"
echo "   • Open https://victoriaocara.com in browser"
echo "   • Use incognito mode if you see cached content"
echo ""
echo "============================"