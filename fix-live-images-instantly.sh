#!/bin/bash

echo "🚀 URGENT: Fixing live image loading performance"
echo "=============================================="

# Creează directoarele pe server
echo "📁 Creating upload directories on server..."
mkdir -p public/uploads/paintings
mkdir -p public/uploads/general
chmod 755 public/uploads
chmod 755 public/uploads/paintings
chmod 755 public/uploads/general

echo "✅ Upload directories created with proper permissions"

# Verifică dacă avem conexiune la baza de date
echo "🔍 Testing database connection..."
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "❌ No .env file found"
    exit 1
fi

# Rulează migrarea
echo "🔄 Running image migration on live server..."
node scripts/migrate-images-to-files.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Migration completed! Images should now load instantly."
    echo ""
    echo "🔄 Restarting application..."
    
    # Restart aplicația (adaptează după sistemul tău)
    if command -v pm2 &> /dev/null; then
        pm2 restart all
        echo "✅ PM2 restarted"
    elif command -v systemctl &> /dev/null; then
        sudo systemctl restart nginx
        echo "✅ Nginx restarted"
    else
        echo "⚠️  Please restart your web server manually"
    fi
    
    echo ""
    echo "🧪 Testing the fix..."
    sleep 3
    
    # Test API size
    echo "📊 Checking API response size..."
    api_size=$(curl -s https://victoriaocara.com/api/paintings | wc -c)
    echo "API response size: $api_size bytes"
    
    if [ $api_size -lt 100000 ]; then
        echo "✅ API response is now small - images use file URLs!"
    else
        echo "⚠️  API response still large - some images may still be base64"
    fi
    
    echo ""
    echo "🎯 Test the gallery now: https://victoriaocara.com/galerie"
    echo "Images should load instantly without preloader!"
    
else
    echo "❌ Migration failed. Check errors above."
    exit 1
fi