#!/bin/bash

echo "🚀 DEPLOYING SQLITE MIGRATION TO SERVER"
echo "======================================"

# Install sqlite3
echo "📦 Installing sqlite3..."
npm install sqlite3

# Run migration from MongoDB to SQLite
echo "🔄 Running migration..."
node migrate-to-sqlite.js

# Update environment
echo "🔧 Updating environment..."
sed -i 's/^MONGODB_URI=/#MONGODB_URI=/' .env
echo "DATABASE_PATH=./database/victoriaocara.db" >> .env

# Restart application
echo "🔄 Restarting application..."
pm2 restart victoriaocara

echo ""
echo "🎉 SQLITE MIGRATION COMPLETED!"
echo "============================="
echo ""
echo "✅ MongoDB replaced with SQLite"
echo "✅ Database file: ./database/victoriaocara.db"
echo "✅ Application restarted"
echo ""
echo "🔗 Test the site: https://victoriaocara.com"
echo "📊 Database size is now much smaller!"
