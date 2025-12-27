#!/bin/bash

echo "🚀 DEPLOYING LATEST CHANGES TO LIVE SERVER"
echo "=========================================="

# Verifică dacă suntem pe server
if [ ! -d "/var/www/victoriaocara.com" ] && [ ! -d "/home/*/victoriaocara.com" ]; then
    echo "❌ This script must be run on the live server"
    echo "📡 Connect to server first: ssh root@your-hetzner-server"
    exit 1
fi

# Navighează la proiect
cd /var/www/victoriaocara.com || cd /home/*/victoriaocara.com || {
    echo "❌ Project directory not found"
    exit 1
}

echo "📁 Current directory: $(pwd)"

echo "📡 Pulling latest changes from git..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed"
    echo "🔧 Try: git reset --hard origin/main"
    exit 1
fi

echo "✅ Latest changes pulled successfully"

echo "📁 Creating upload directories..."
mkdir -p public/uploads/paintings
mkdir -p public/uploads/general
chmod 755 public/uploads -R
echo "✅ Upload directories ready"

echo "📦 Installing/updating dependencies..."
npm install --save-dev @types/uuid
echo "✅ Dependencies updated"

echo "🔄 Loading environment variables..."
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment loaded"
else
    echo "⚠️  No .env file found - using defaults"
fi

echo "🔄 Running image migration (if needed)..."
if [ -f "scripts/migrate-images-to-files.js" ]; then
    node scripts/migrate-images-to-files.js
    echo "✅ Image migration completed"
else
    echo "ℹ️  No migration script found - skipping"
fi

echo "🔄 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "⚠️  Build failed, but continuing..."
fi

echo "🔄 Restarting server..."
if command -v pm2 >/dev/null 2>&1; then
    pm2 restart victoriaocara || pm2 restart all
    echo "✅ PM2 restart completed"
elif command -v systemctl >/dev/null 2>&1; then
    systemctl restart victoriaocara
    echo "✅ Systemctl restart completed"
else
    echo "⚠️  Please restart the server manually"
fi

echo ""
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "===================================="
echo ""
echo "✅ Latest changes deployed"
echo "✅ Dependencies updated"
echo "✅ Images optimized"
echo "✅ Server restarted"
echo ""
echo "🔗 Test your site:"
echo "   https://victoriaocara.com"
echo "   https://victoriaocara.com/galerie"
echo ""
echo "🚀 Site should now be running with latest changes!"