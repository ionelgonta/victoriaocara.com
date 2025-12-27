#!/bin/bash

echo "🚀 Starting image migration from base64 to file storage..."
echo "=================================================="

# Verifică dacă directorul uploads există
if [ ! -d "public/uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir -p public/uploads/paintings
    echo "✅ Uploads directory created"
else
    echo "✅ Uploads directory already exists"
fi

# Verifică dacă există variabila de mediu MongoDB
if [ -z "$MONGODB_URI" ]; then
    echo "⚠️  MONGODB_URI environment variable not set"
    echo "   Loading from .env file..."
    if [ -f ".env" ]; then
        export $(cat .env | grep -v '^#' | xargs)
        echo "✅ Environment variables loaded from .env"
    else
        echo "❌ No .env file found. Please set MONGODB_URI environment variable."
        exit 1
    fi
fi

echo ""
echo "🔄 Running migration script..."
node scripts/migrate-images-to-files.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Migration completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Test image loading on the website"
    echo "   2. Verify new uploads use file storage"
    echo "   3. Monitor server disk space"
    echo ""
    echo "💡 To test uploads, try uploading a new painting in the admin panel"
else
    echo ""
    echo "❌ Migration failed. Check the error messages above."
    exit 1
fi