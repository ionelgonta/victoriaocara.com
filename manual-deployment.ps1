Write-Host "MANUAL DEPLOYMENT - STEP BY STEP" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Step 1: Verify local file
Write-Host ""
Write-Host "STEP 1: Verifying local file..." -ForegroundColor Yellow
if (Test-Path "app/admin/paintings/page.tsx") {
    $localContent = Get-Content "app/admin/paintings/page.tsx" -Raw
    if ($localContent -match "Create a completely new images array") {
        Write-Host "Local file contains the fix" -ForegroundColor Green
    } else {
        Write-Host "Local file does not contain the fix" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Local file not found" -ForegroundColor Red
    exit 1
}

# Step 2: Upload file to server
Write-Host ""
Write-Host "STEP 2: Uploading file to server..." -ForegroundColor Yellow
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" "app/admin/paintings/page.tsx" "root@anyway.ro:/root/victoriaocara.com/app/admin/paintings/page.tsx"
Write-Host "File uploaded" -ForegroundColor Green

# Step 3: Verify upload on server
Write-Host ""
Write-Host "STEP 3: Verifying upload on server..." -ForegroundColor Yellow
$serverCheck = ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" "root@anyway.ro" "cd /root/victoriaocara.com; grep -c 'Create a completely new images array' app/admin/paintings/page.tsx"
Write-Host "Server verification result: $serverCheck" -ForegroundColor Gray

# Step 4: Complete server operations
Write-Host ""
Write-Host "STEP 4: Running complete server operations..." -ForegroundColor Yellow
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" "root@anyway.ro" @"
cd /root/victoriaocara.com
echo 'Stopping application...'
pm2 stop all
echo 'Clearing caches...'
rm -rf .next
npm cache clean --force
echo 'Building application...'
npm run build
echo 'Starting application...'
pm2 start all
echo 'Deployment completed!'
pm2 status
"@

Write-Host ""
Write-Host "STEP 5: Verifying deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
try {
    $response = Invoke-WebRequest -Uri "https://victoriaocara.com/admin" -UseBasicParsing -TimeoutSec 30
    Write-Host "Admin panel status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Admin panel verification failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "MANUAL DEPLOYMENT COMPLETED!" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host ""
Write-Host "Test now: https://victoriaocara.com/admin/paintings" -ForegroundColor Cyan