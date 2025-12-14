#!/bin/bash

echo "🎯 MASTER FIX SCRIPT - VICTORIA OCARA COMPLETE REPAIR"
echo "===================================================="
echo "This script will run all necessary fixes in the correct order"
echo ""

# Make all scripts executable
chmod +x ultimate-site-fix.sh
chmod +x remove-maintenance-page.sh
chmod +x find-and-fix-blocking-content.sh
chmod +x identify-and-fix-web-server.sh

echo "📋 REPAIR SEQUENCE:"
echo "1. Remove maintenance pages and blocking content"
echo "2. Identify and fix web server configuration"
echo "3. Run comprehensive site fix"
echo "4. Verify everything is working"
echo ""

read -p "Press Enter to start the repair sequence..."

echo ""
echo "🧹 PHASE 1: REMOVE BLOCKING CONTENT"
echo "=================================="
./remove-maintenance-page.sh

echo ""
echo "🔍 PHASE 2: FIND SPECIFIC BLOCKING CONTENT"
echo "========================================="
./find-and-fix-blocking-content.sh

echo ""
echo "🌐 PHASE 3: IDENTIFY AND FIX WEB SERVER"
echo "======================================"
./identify-and-fix-web-server.sh

echo ""
echo "🚀 PHASE 4: COMPREHENSIVE SITE FIX"
echo "================================="
./ultimate-site-fix.sh

echo ""
echo "🧪 PHASE 5: FINAL VERIFICATION"
echo "============================="

echo "Waiting 30 seconds for all services to stabilize..."
sleep 30

echo ""
echo "Final status check:"

# Check PM2
echo "PM2 Status:"
pm2 status

echo ""
echo "Service Status:"
systemctl is-active nginx && echo "✅ Nginx: Running" || echo "❌ Nginx: Not running"
systemctl is-active mongod && echo "✅ MongoDB: Running" || echo "❌ MongoDB: Not running"

echo ""
echo "Site Tests:"

# Test Next.js directly
NEXTJS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
echo "Next.js (port 3000): HTTP $NEXTJS_STATUS"

# Test through domain
DOMAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://victoriaocara.com 2>/dev/null || echo "000")
echo "Domain (victoriaocara.com): HTTP $DOMAIN_STATUS"

# Test HTTPS if available
if [ -f "/etc/letsencrypt/live/victoriaocara.com/fullchain.pem" ]; then
    HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://victoriaocara.com 2>/dev/null || echo "000")
    echo "HTTPS (victoriaocara.com): HTTP $HTTPS_STATUS"
fi

echo ""
echo "Content Verification:"
if [ "$DOMAIN_STATUS" = "200" ]; then
    echo "Getting page title..."
    PAGE_TITLE=$(curl -s http://victoriaocara.com | grep -o '<title>[^<]*</title>' | sed 's/<[^>]*>//g')
    echo "Page title: '$PAGE_TITLE'"
    
    if echo "$PAGE_TITLE" | grep -q -i "victoria"; then
        echo "✅ Correct site is being served"
    else
        echo "⚠️  Site title doesn't contain 'Victoria' - might be wrong content"
    fi
fi

echo ""
echo "===================================================="

if [ "$NEXTJS_STATUS" = "200" ] && [ "$DOMAIN_STATUS" = "200" ]; then
    echo "🎉 COMPLETE SUCCESS!"
    echo ""
    echo "✅ ALL SYSTEMS WORKING:"
    echo "   • Next.js application: ✅"
    echo "   • Nginx proxy: ✅"
    echo "   • Domain access: ✅"
    if [ -f "/etc/letsencrypt/live/victoriaocara.com/fullchain.pem" ]; then
        echo "   • SSL certificate: ✅"
    fi
    echo ""
    echo "🌐 WORKING URLS:"
    echo "   • http://victoriaocara.com"
    if [ -f "/etc/letsencrypt/live/victoriaocara.com/fullchain.pem" ]; then
        echo "   • https://victoriaocara.com"
    fi
    echo ""
    echo "🔧 ADMIN ACCESS:"
    echo "   • Admin panel: https://victoriaocara.com/admin"
    echo "   • Username: admin@victoriaocara.com"
    echo "   • Password: AdminVictoria2024!"
    echo ""
    echo "📱 SITE FEATURES:"
    echo "   • Homepage with gallery preview"
    echo "   • Full gallery: /galerie"
    echo "   • About page: /despre"
    echo "   • Contact form: /contact"
    echo "   • Custom painting orders: /comanda-pictura"
    echo "   • Shopping cart and checkout"
    echo "   • Testimonials section"
    echo ""
    echo "🔍 MONITORING COMMANDS:"
    echo "   • pm2 logs victoriaocara"
    echo "   • tail -f /var/log/nginx/error.log"
    echo "   • systemctl status nginx"
    echo "   • systemctl status mongod"
    echo ""
    echo "💡 BROWSER CACHE:"
    echo "   If you still see old content:"
    echo "   • Press Ctrl+Shift+R (hard refresh)"
    echo "   • Use incognito/private mode"
    echo "   • Clear browser cache for victoriaocara.com"
    
elif [ "$NEXTJS_STATUS" = "200" ]; then
    echo "⚠️  PARTIAL SUCCESS"
    echo ""
    echo "✅ Next.js application is working"
    echo "❌ Domain access through Nginx has issues"
    echo ""
    echo "🔧 MANUAL STEPS NEEDED:"
    echo "   1. Check Nginx configuration: nginx -t"
    echo "   2. Check Nginx error logs: tail -f /var/log/nginx/error.log"
    echo "   3. Verify domain DNS points to this server"
    echo "   4. Check firewall settings for ports 80/443"
    
else
    echo "❌ REPAIR INCOMPLETE"
    echo ""
    echo "🔍 ISSUES FOUND:"
    if [ "$NEXTJS_STATUS" != "200" ]; then
        echo "   • Next.js application not responding"
    fi
    if [ "$DOMAIN_STATUS" != "200" ]; then
        echo "   • Domain not accessible through Nginx"
    fi
    echo ""
    echo "🔧 DEBUGGING STEPS:"
    echo "   1. Check PM2 logs: pm2 logs victoriaocara"
    echo "   2. Check application errors: cd /opt/victoriaocara && npm start"
    echo "   3. Check Nginx status: systemctl status nginx"
    echo "   4. Check MongoDB status: systemctl status mongod"
    echo "   5. Check port conflicts: netstat -tulpn | grep -E ':(80|443|3000)'"
fi

echo ""
echo "📊 SYSTEM SUMMARY:"
echo "   • Server IP: 23.88.113.154"
echo "   • Domain: victoriaocara.com"
echo "   • Application: Next.js 14 Art Gallery"
echo "   • Database: MongoDB (local)"
echo "   • Web Server: Nginx"
echo "   • Process Manager: PM2"
echo "   • SSL: Let's Encrypt (if configured)"
echo ""
echo "===================================================="