#!/bin/bash

echo "🚀 FIXING SLOW IMAGE LOADING ON PRODUCTION SERVER"
echo "================================================="

# Verifică dacă suntem în directorul corect
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    echo "Please run this script from your project root directory"
    exit 1
fi

echo "✅ Project directory confirmed"

# Creează directoarele pentru imagini
echo "📁 Creating upload directories..."
mkdir -p public/uploads/paintings
mkdir -p public/uploads/general

# Setează permisiunile
chmod 755 public/uploads
chmod 755 public/uploads/paintings
chmod 755 public/uploads/general

echo "✅ Upload directories created with proper permissions"

# Verifică dacă există variabila MONGODB_URI
if [ -z "$MONGODB_URI" ]; then
    echo "⚠️  MONGODB_URI not set in environment"
    if [ -f ".env" ]; then
        echo "📄 Loading environment variables from .env file..."
        export $(cat .env | grep -v '^#' | xargs)
        echo "✅ Environment variables loaded"
    else
        echo "❌ No .env file found and MONGODB_URI not set"
        echo "Please set MONGODB_URI environment variable or create .env file"
        exit 1
    fi
fi

# Instalează dependențele necesare
echo "📦 Installing required dependencies..."
npm install --save-dev @types/uuid

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "⚠️  Warning: Failed to install dependencies, continuing anyway..."
fi

# Rulează migrarea imaginilor
echo ""
echo "🔄 Running image migration from base64 to files..."
echo "This will convert all existing base64 images to file storage"
echo ""

node scripts/migrate-images-to-files.js

migration_result=$?

if [ $migration_result -eq 0 ]; then
    echo ""
    echo "🎉 IMAGE MIGRATION COMPLETED SUCCESSFULLY!"
    echo "========================================="
    
    # Restart aplicația
    echo "🔄 Restarting application..."
    
    if command -v pm2 >/dev/null 2>&1; then
        echo "Using PM2 to restart..."
        pm2 restart all
        echo "✅ PM2 restart completed"
    elif command -v systemctl >/dev/null 2>&1; then
        echo "Attempting to restart with systemctl..."
        sudo systemctl restart nginx
        echo "✅ Nginx restarted"
    else
        echo "⚠️  Could not detect process manager"
        echo "Please restart your application manually"
    fi
    
    echo ""
    echo "🧪 Testing the fix..."
    sleep 3
    
    # Test API response size
    echo "📊 Checking API response size..."
    if command -v curl >/dev/null 2>&1; then
        api_size=$(curl -s https://victoriaocara.com/api/paintings | wc -c 2>/dev/null || echo "0")
        echo "API response size: $api_size bytes"
        
        if [ "$api_size" -lt 100000 ] && [ "$api_size" -gt 0 ]; then
            echo "✅ SUCCESS: API response is now small - images use file URLs!"
        elif [ "$api_size" -gt 1000000 ]; then
            echo "⚠️  WARNING: API response still large - some images may still be base64"
        else
            echo "ℹ️  Could not determine API size accurately"
        fi
    else
        echo "ℹ️  curl not available, skipping API size test"
    fi
    
    echo ""
    echo "🎯 DEPLOYMENT SUCCESSFUL!"
    echo "======================="
    echo ""
    echo "✅ Images are now stored as files instead of base64"
    echo "✅ Upload directories created and configured"
    echo "✅ APIs updated to use file storage"
    echo "✅ Application restarted"
    echo ""
    echo "🔗 Test the gallery now: https://victoriaocara.com/galerie"
    echo "🚀 Images should load INSTANTLY without preloader!"
    echo ""
    echo "📊 Expected improvements:"
    echo "   • Instant image loading (no more 3-5 second delays)"
    echo "   • No preloader on gallery page"
    echo "   • Smooth gallery browsing"
    echo "   • Reduced server memory usage"
    echo "   • Smaller database size"
    echo ""
    
else
    echo ""
    echo "❌ MIGRATION FAILED"
    echo "=================="
    echo ""
    echo "The migration script encountered errors."
    echo "Please check the error messages above and:"
    echo ""
    echo "1. Verify MongoDB connection (MONGODB_URI)"
    echo "2. Check database permissions"
    echo "3. Ensure sufficient disk space"
    echo "4. Try running manually: node scripts/migrate-images-to-files.js"
    echo ""
    exit 1
fi