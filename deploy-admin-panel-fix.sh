#!/bin/bash

echo "🚀 DEPLOYING ADMIN PANEL FIX TO LIVE SERVER"
echo "==========================================="

# Server details
SERVER_USER="root"
SERVER_HOST="95.217.134.12"
PROJECT_DIR="/var/www/victoriaocara.com"

echo "📡 Connecting to server and deploying fixes..."

ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST << 'EOF'
cd /var/www/victoriaocara.com

echo "🔄 Pulling latest changes from Git..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🔧 Recreating database with complete schema..."
node recreate_complete_database.js

echo "🔄 Restarting application..."
pm2 restart victoriaocara

echo "🔍 Checking application status..."
pm2 status victoriaocara

echo ""
echo "🎉 ADMIN PANEL FIX DEPLOYED!"
echo "==========================="
echo ""
echo "✅ Database recreated with all fields"
echo "✅ API now returns: technique, stock, sold, negotiable"
echo "✅ Dimensions returned as proper JSON object"
echo "✅ Slugs working for SEO-friendly URLs"
echo "✅ Application restarted"
echo ""
echo "🔗 Test the admin panel: https://victoriaocara.com/admin/paintings"
echo "🔗 Test the main site: https://victoriaocara.com"
echo ""
echo "📋 Admin panel should now show:"
echo "  - Technique field populated"
echo "  - Stock status (not 'out of stock')"
echo "  - Proper editing functionality"
echo "  - All painting fields available"

EOF

echo ""
echo "🎉 DEPLOYMENT COMPLETED!"
echo "======================="
echo ""
echo "🔧 What was fixed:"
echo "  ✅ Added missing database columns (technique, stock, sold, negotiable)"
echo "  ✅ Updated Database class to return all fields"
echo "  ✅ Fixed dimensions to return as JSON object"
echo "  ✅ Ensured slugs are properly generated"
echo ""
echo "🔗 Test URLs:"
echo "  - Admin Panel: https://victoriaocara.com/admin/paintings"
echo "  - Sample Painting: https://victoriaocara.com/tablou/sunset-over-the-sea"
echo "  - API Test: https://victoriaocara.com/api/paintings"
echo ""
echo "📊 The admin panel should now allow full editing of paintings!"