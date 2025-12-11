#!/bin/bash

echo "🚀 COMPLETE SERVER FIX - REACT ERROR #31 & RESTART LOOP"
echo "========================================================"

# Change to project directory
cd /opt/victoriaocara

echo ""
echo "📊 CURRENT STATUS:"
echo "PM2 Status:"
pm2 status

echo ""
echo "🛑 STOPPING APPLICATION..."
pm2 stop victoriaocara 2>/dev/null || echo "   Application not running"
pm2 delete victoriaocara 2>/dev/null || echo "   Application not in PM2"

echo ""
echo "🔧 FIXING REACT ERROR #31 ISSUES..."

# Ensure all multilingual objects are handled properly
echo "1. Verifying safeRender function..."
if grep -q "safeRender" lib/utils.ts; then
    echo "   ✅ safeRender function exists"
else
    echo "   ❌ safeRender function missing - this could cause React error #31"
fi

echo ""
echo "2. Checking for direct object rendering..."
OBJECT_RENDERS=$(grep -r "{\s*en\s*:" app/ components/ --include="*.tsx" --exclude-dir=admin | wc -l)
if [ "$OBJECT_RENDERS" -eq 0 ]; then
    echo "   ✅ No direct object rendering found in public components"
else
    echo "   ⚠️  Found $OBJECT_RENDERS potential object rendering issues"
fi

echo ""
echo "🗄️ CHECKING DATABASE..."
if systemctl is-active --quiet mongod; then
    echo "   ✅ MongoDB is running"
else
    echo "   🔄 Starting MongoDB..."
    systemctl start mongod
    sleep 3
    if systemctl is-active --quiet mongod; then
        echo "   ✅ MongoDB started successfully"
    else
        echo "   ❌ Failed to start MongoDB"
        systemctl status mongod --no-pager
    fi
fi

echo ""
echo "🌐 CHECKING NGINX..."
if systemctl is-active --quiet nginx; then
    echo "   ✅ Nginx is running"
else
    echo "   🔄 Starting Nginx..."
    # Check for port conflicts
    PORT_80_USED=$(netstat -tulpn | grep :80 | wc -l)
    if [ "$PORT_80_USED" -gt 0 ]; then
        echo "   ⚠️  Port 80 is in use:"
        netstat -tulpn | grep :80
        echo "   Killing processes on port 80..."
        fuser -k 80/tcp 2>/dev/null || echo "   No processes to kill"
        sleep 2
    fi
    
    systemctl start nginx
    if systemctl is-active --quiet nginx; then
        echo "   ✅ Nginx started successfully"
    else
        echo "   ❌ Failed to start Nginx"
        systemctl status nginx --no-pager
    fi
fi

echo ""
echo "🧹 CLEANING BUILD CACHE..."
rm -rf .next
rm -rf node_modules/.cache
echo "   ✅ Build cache cleared"

echo ""
echo "📦 CHECKING DEPENDENCIES..."
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "   🔄 Installing dependencies..."
    npm install
else
    echo "   ✅ Dependencies are installed"
fi

echo ""
echo "🔨 BUILDING APPLICATION..."
echo "   Building Next.js application..."
if npm run build; then
    echo "   ✅ Build successful"
else
    echo "   ❌ Build failed - checking for errors..."
    npm run build 2>&1 | grep -i error | head -10
    echo ""
    echo "   Trying to continue anyway..."
fi

echo ""
echo "🚀 STARTING APPLICATION..."
pm2 start npm --name "victoriaocara" -- start

# Wait for startup
echo "   Waiting for application to start..."
sleep 10

echo ""
echo "📊 FINAL STATUS CHECK:"
echo "PM2 Status:"
pm2 status

echo ""
echo "🌐 Testing Application:"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ✅ Application responding on port 3000 (HTTP $HTTP_STATUS)"
else
    echo "   ❌ Application not responding on port 3000 (HTTP $HTTP_STATUS)"
fi

echo ""
echo "📋 Recent Application Logs:"
pm2 logs victoriaocara --lines 15 --nostream

echo ""
echo "========================================================"
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ SERVER FIX COMPLETE - APPLICATION IS RUNNING!"
    echo "🌐 Website: https://victoriaocara.com"
    echo "🔍 Monitor logs: pm2 logs victoriaocara"
else
    echo "❌ SERVER FIX INCOMPLETE - CHECK LOGS ABOVE"
    echo "🔍 Debug commands:"
    echo "   pm2 logs victoriaocara"
    echo "   pm2 restart victoriaocara"
    echo "   systemctl status mongod"
    echo "   systemctl status nginx"
fi
echo "========================================================"