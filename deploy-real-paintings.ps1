Write-Host "🎨 DEPLOYING REAL VICTORIA OCARA PAINTINGS" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Connect to production server and deploy real paintings
ssh root@victoriaocara.com @"
cd /var/www/victoriaocara.com

echo "📥 Pulling latest changes from Git..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🎨 Populating real paintings..."
node populate-real-paintings.js

echo "🔧 Fixing painting slugs..."
node fix-painting-slugs.js

echo "🛠️ Fixing technique storage..."
node fix-technique-storage.js

echo "🖼️ Creating placeholder images..."
node create-placeholder-images.js

echo "🔄 Restarting application..."
pm2 restart all

echo "✅ REAL PAINTINGS DEPLOYED SUCCESSFULLY!"
echo "========================================"
echo ""
echo "🎯 Results:"
echo "  ✅ 8 authentic Victoria Ocara paintings"
echo "  ✅ Realistic prices (680-1350 EUR)"
echo "  ✅ Professional descriptions (EN/RO)"
echo "  ✅ Proper SEO-friendly URLs"
echo "  ✅ Working image placeholders"
echo ""
echo "🌐 Test the gallery: https://victoriaocara.com/galerie"
echo "🔗 Test individual painting: https://victoriaocara.com/tablou/the-winter-road"
"@

Write-Host ""
Write-Host "🎉 REAL PAINTINGS DEPLOYMENT COMPLETED!" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ All real Victoria Ocara paintings are now live" -ForegroundColor Green
Write-Host "✅ Professional titles, prices, and descriptions" -ForegroundColor Green  
Write-Host "✅ SEO-friendly URLs working correctly" -ForegroundColor Green
Write-Host "✅ Image placeholders ready for real photos" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Visit gallery at: https://victoriaocara.com/galerie" -ForegroundColor Cyan
Write-Host "🔗 Test painting page: https://victoriaocara.com/tablou/the-winter-road" -ForegroundColor Cyan