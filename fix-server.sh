#!/bin/bash

echo "🔍 DIAGNOSING AND FIXING SERVER ISSUES..."

# Check current PM2 status
echo "📊 Current PM2 Status:"
pm2 status

echo ""
echo "📋 Recent Error Logs:"
pm2 logs victoriaocara --err --lines 20 --nostream

echo ""
echo "🔧 FIXING ISSUES..."

# 1. Stop the application completely
echo "1. Stopping application..."
pm2 stop victoriaocara
pm2 delete victoriaocara

# 2. Check MongoDB status
echo "2. Checking MongoDB..."
if ! systemctl is-active --quiet mongod; then
    echo "   Starting MongoDB..."
    systemctl start mongod
    sleep 3
fi
systemctl status mongod --no-pager -l

# 3. Check Nginx status and fix port conflict
echo "3. Checking Nginx..."
if systemctl is-active --quiet nginx; then
    echo "   Nginx is running"
else
    echo "   Nginx is not running, checking for port conflicts..."
    # Check what's using port 80
    netstat -tulpn | grep :80 || echo "   Port 80 is free"
    
    # Try to start nginx
    systemctl start nginx
fi

# 4. Clean build and restart application
echo "4. Cleaning and rebuilding application..."
cd /opt/victoriaocara

# Clean Next.js cache
rm -rf .next
rm -rf node_modules/.cache

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    npm install
fi

# Build the application
echo "   Building application..."
npm run build

# 5. Start application with PM2
echo "5. Starting application with PM2..."
pm2 start npm --name "victoriaocara" -- start

# Wait a moment for startup
sleep 5

# 6. Check final status
echo ""
echo "✅ FINAL STATUS CHECK:"
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🌐 Application Status:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000 || echo "Application not responding on port 3000"

echo ""
echo "🔍 Recent logs after restart:"
pm2 logs victoriaocara --lines 10 --nostream

echo ""
echo "✅ Fix complete! Check the status above."
echo "💡 If issues persist, check:"
echo "   - MongoDB connection: mongo mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery"
echo "   - Application logs: pm2 logs victoriaocara"
echo "   - Website: https://victoriaocara.com"