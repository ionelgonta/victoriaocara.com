Write-Host "Creating deployment package..." -ForegroundColor Green

# Creează directorul
$deployDir = "deployment-package"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Creează structura
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

Write-Host "Deployment package created in '$deployDir' directory" -ForegroundColor Green
Write-Host "Upload these files to your production server and run the migration!" -ForegroundColor Yellow