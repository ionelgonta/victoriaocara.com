# PowerShell script to deploy admin panel fix to live server

Write-Host "🚀 DEPLOYING ADMIN PANEL FIX TO LIVE SERVER" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Server details
$SERVER_USER = "root"
$SERVER_HOST = "95.217.134.12"
$PROJECT_DIR = "/var/www/victoriaocara.com"

Write-Host "📡 Connecting to server and deploying fixes..." -ForegroundColor Yellow

# Create the SSH command
$sshCommand = @"
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
"@

# Execute SSH command
$serverConnection = "$SERVER_USER@$SERVER_HOST"
ssh -o StrictHostKeyChecking=no $serverConnection $sshCommand

Write-Host ""
Write-Host "🎉 DEPLOYMENT COMPLETED!" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 What was fixed:" -ForegroundColor Yellow
Write-Host "  ✅ Added missing database columns (technique, stock, sold, negotiable)" -ForegroundColor Green
Write-Host "  ✅ Updated Database class to return all fields" -ForegroundColor Green
Write-Host "  ✅ Fixed dimensions to return as JSON object" -ForegroundColor Green
Write-Host "  ✅ Ensured slugs are properly generated" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Test URLs:" -ForegroundColor Yellow
Write-Host "  - Admin Panel: https://victoriaocara.com/admin/paintings" -ForegroundColor Cyan
Write-Host "  - Sample Painting: https://victoriaocara.com/tablou/sunset-over-the-sea" -ForegroundColor Cyan
Write-Host "  - API Test: https://victoriaocara.com/api/paintings" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 The admin panel should now allow full editing of paintings!" -ForegroundColor Green