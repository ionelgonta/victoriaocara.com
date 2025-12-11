#!/bin/bash

echo "🚀 QUICK SERVER FIX - Building and Starting Application"
echo "======================================================"

cd /opt/victoriaocara

echo "🛑 Stopping current application..."
pm2 stop victoriaocara 2>/dev/null || echo "   No application to stop"
pm2 delete victoriaocara 2>/dev/null || echo "   No application to delete"

echo ""
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "   ✅ Build successful"
else
    echo "   ❌ Build failed"
    exit 1
fi

echo ""
echo "🚀 Starting application..."
pm2 start npm --name "victoriaocara" -- start

echo ""
echo "⏳ Waiting for startup..."
sleep 5

echo ""
echo "📊 Status check:"
pm2 status

echo ""
echo "🌐 Testing connection..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000

echo ""
echo "✅ Done! Check status above."