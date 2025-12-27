Write-Host "🚀 Preparing Image Fix Deployment Package" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Creează un director pentru deployment
$deployDir = "deployment-package"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow

# Copiază fișierele necesare
Write-Host "📄 Copying files..." -ForegroundColor Blue

# Creează structura de directoare
New-Item -ItemType Directory -Path "$deployDir/lib" -Force | Out-Null
New-Item -ItemType Directory -Path "$deployDir/app/api/upload" -Force | Out-Null
New-Item -ItemType Directory -Path "$deployDir/app/api/upload-public" -Force | Out-Null
New-Item -ItemType Directory -Path "$deployDir/scripts" -Force | Out-Null

# Copiază fișierele
Copy-Item "lib/imageStorage.ts" "$deployDir/lib/" -Force
Copy-Item "app/api/upload/route.ts" "$deployDir/app/api/upload/" -Force
Copy-Item "app/api/upload-public/route.ts" "$deployDir/app/api/upload-public/" -Force
Copy-Item "scripts/migrate-images-to-files.js" "$deployDir/scripts/" -Force
Copy-Item "quick-migrate-server.js" "$deployDir/" -Force

# Creează script de deployment pentru server
$serverScript = @'
#!/bin/bash
echo "🚀 Running Image Fix on Production Server"
echo "========================================"

# Creează directoarele
echo "📁 Creating upload directories..."
mkdir -p public/uploads/paintings
mkdir -p public/uploads/general
chmod 755 public/uploads -R

# Instalează dependențele
echo "📦 Installing dependencies..."
npm install --save-dev @types/uuid

# Rulează migrarea
echo "🔄 Running image migration..."
node scripts/migrate-images-to-files.js

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    
    # Restart server
    echo "🔄 Restarting server..."
    if command -v pm2 >/dev/null 2>&1; then
        pm2 restart all
        echo "✅ PM2 restarted"
    else
        echo "⚠️  Please restart your server manually"
    fi
    
    echo ""
    echo "🎉 Image fix deployed successfully!"
    echo "🔗 Test: https://victoriaocara.com/galerie"
    echo "Images should now load instantly!"
    
else
    echo "❌ Migration failed. Check errors above."
    exit 1
fi
'@

$serverScript | Out-File -FilePath "$deployDir/run-on-server.sh" -Encoding UTF8

# Creează instrucțiuni
$instructions = @'
# 🚀 IMAGE FIX DEPLOYMENT INSTRUCTIONS

## Files in this package:
- lib/imageStorage.ts (new image storage system)
- app/api/upload/route.ts (updated upload API)
- app/api/upload-public/route.ts (updated public upload API)
- scripts/migrate-images-to-files.js (migration script)
- quick-migrate-server.js (quick migration alternative)
- run-on-server.sh (automated deployment script)

## Deployment Steps:

### 1. Upload files to production server
Upload all files maintaining the directory structure

### 2. Run deployment script on server
chmod +x run-on-server.sh
./run-on-server.sh

### 3. Verify fix
Visit: https://victoriaocara.com/galerie
Images should load instantly
No more preloader
API response should be less than 100KB instead of 20MB+

## Manual deployment (if script fails):
mkdir -p public/uploads/paintings
chmod 755 public/uploads -R
npm install --save-dev @types/uuid
node scripts/migrate-images-to-files.js
pm2 restart all

## Expected Results:
Images load instantly
No preloader on gallery page
Smooth browsing experience
Reduced server load
Smaller database size

URGENT: This fixes the slow image loading issue!
'@

$instructions | Out-File -FilePath "$deployDir/DEPLOYMENT_INSTRUCTIONS.md" -Encoding UTF8

Write-Host "✅ Deployment package created in '$deployDir' directory" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Upload the contents of '$deployDir' to your production server" -ForegroundColor White
Write-Host "2. Run the deployment script on the server" -ForegroundColor White
Write-Host "3. Test https://victoriaocara.com/galerie for instant loading" -ForegroundColor White
Write-Host ""
Write-Host "📁 Package contents:" -ForegroundColor Yellow
Get-ChildItem $deployDir -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Replace((Get-Location).Path + "\$deployDir\", "")
    Write-Host "   $relativePath" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🚨 IMPORTANT: Run this on your PRODUCTION SERVER to fix slow images!" -ForegroundColor Red