#!/bin/bash

echo "🚀 AUTO-DEPLOYMENT FROM GIT TO HETZNER SERVER"
echo "=============================================="

# Acest script trebuie rulat pe serverul Hetzner
# Va face pull de pe git și va rula migrarea imaginilor

echo "📡 Pulling latest changes from git..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed"
    exit 1
fi

echo "✅ Git pull successful"

echo "📁 Creating upload directories..."
mkdir -p public/uploads/paintings
mkdir -p public/uploads/general
chmod 755 public/uploads -R

echo "📦 Installing dependencies..."
npm install --save-dev @types/uuid

echo "🔄 Loading environment variables..."
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment loaded from .env"
else
    echo "⚠️  No .env file found"
fi

echo "🔄 Running image migration..."
node scripts/migrate-images-to-files.js

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    
    echo "🔄 Restarting application..."
    if command -v pm2 >/dev/null 2>&1; then
        pm2 restart victoriaocara
        echo "✅ PM2 restart completed"
    else
        echo "⚠️  PM2 not found, please restart manually"
    fi
    
    echo ""
    echo "🎉 AUTO-DEPLOYMENT SUCCESSFUL!"
    echo "============================="
    echo ""
    echo "✅ Code updated from git"
    echo "✅ Image migration completed"
    echo "✅ Server restarted"
    echo ""
    echo "🔗 Test the gallery: https://victoriaocara.com/galerie"
    echo "🚀 Images should now load INSTANTLY!"
    
else
    echo "❌ Migration failed"
    echo "Check the error messages above"
    exit 1
fi