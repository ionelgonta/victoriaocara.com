#!/bin/bash

echo "🔧 FIXING DUPLICATE SAFERENDER FUNCTION"
echo "======================================="

cd /opt/victoriaocara

echo "🛑 Stopping application..."
pm2 stop victoriaocara 2>/dev/null || echo "   No application to stop"
pm2 delete victoriaocara 2>/dev/null || echo "   No application to delete"

echo ""
echo "📝 Pulling latest changes from GitHub..."
git pull origin main

echo ""
echo "🧹 Cleaning build cache..."
rm -rf .next
rm -rf node_modules/.cache

echo ""
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "   ✅ Build successful"
    
    echo ""
    echo "🚀 Starting application..."
    pm2 start npm --name "victoriaocara" -- start
    
    echo ""
    echo "⏳ Waiting for startup..."
    sleep 5
    
    echo ""
    echo "📊 Final status:"
    pm2 status
    
    echo ""
    echo "🌐 Testing connection..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
    echo "   HTTP Status: $HTTP_STATUS"
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "   ✅ Application is running successfully!"
        echo "   🌐 Website: https://victoriaocara.com"
    else
        echo "   ❌ Application not responding properly"
        echo "   📋 Recent logs:"
        pm2 logs victoriaocara --lines 10 --nostream
    fi
else
    echo "   ❌ Build failed"
    echo "   📋 Build errors:"
    npm run build 2>&1 | tail -20
fi

echo ""
echo "======================================="
echo "✅ Fix complete!"