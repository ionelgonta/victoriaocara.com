Write-Host "🚀 Starting image migration from base64 to file storage..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Verifică dacă directorul uploads există
if (-not (Test-Path "public/uploads")) {
    Write-Host "📁 Creating uploads directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "public/uploads/paintings" -Force | Out-Null
    Write-Host "✅ Uploads directory created" -ForegroundColor Green
} else {
    Write-Host "✅ Uploads directory already exists" -ForegroundColor Green
}

# Verifică dacă există variabila de mediu MongoDB
if (-not $env:MONGODB_URI) {
    Write-Host "⚠️  MONGODB_URI environment variable not set" -ForegroundColor Yellow
    Write-Host "   Loading from .env file..." -ForegroundColor Yellow
    
    if (Test-Path ".env") {
        Get-Content ".env" | ForEach-Object {
            if ($_ -match "^([^#][^=]+)=(.*)$") {
                [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
            }
        }
        Write-Host "✅ Environment variables loaded from .env" -ForegroundColor Green
    } else {
        Write-Host "❌ No .env file found. Please set MONGODB_URI environment variable." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🔄 Running migration script..." -ForegroundColor Blue
node scripts/migrate-images-to-files.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Migration completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Test image loading on the website" -ForegroundColor White
    Write-Host "   2. Verify new uploads use file storage" -ForegroundColor White
    Write-Host "   3. Monitor server disk space" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 To test uploads, try uploading a new painting in the admin panel" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Migration failed. Check the error messages above." -ForegroundColor Red
    exit 1
}