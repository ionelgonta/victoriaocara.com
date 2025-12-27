Write-Host "FIXING DEPLOYMENT ISSUES" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

Write-Host ""
Write-Host "Step 1: Checking server directory..." -ForegroundColor Yellow
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" "root@anyway.ro" "pwd && ls -la /root/ | grep victoria"

Write-Host ""
Write-Host "Step 2: Finding correct directory..." -ForegroundColor Yellow
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" "root@anyway.ro" "find /root -name 'victoriaocara.com' -type d 2>/dev/null"

Write-Host ""
Write-Host "Step 3: Manual operations in correct directory..." -ForegroundColor Yellow
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" "root@anyway.ro" "
cd /root/victoriaocara.com
echo 'Current directory:'
pwd
echo 'Stopping PM2 processes...'
pm2 stop victoriaocara
echo 'Clearing build cache...'
rm -rf .next
echo 'Fresh build...'
npm run build
echo 'Restarting PM2...'
pm2 restart victoriaocara
echo 'Final status:'
pm2 list
"

Write-Host ""
Write-Host "Step 4: Final verification..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
try {
    $response = Invoke-WebRequest -Uri "https://victoriaocara.com/admin/paintings" -UseBasicParsing -TimeoutSec 30
    Write-Host "Admin paintings page status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content length: $($response.Content.Length) bytes" -ForegroundColor Gray
} catch {
    Write-Host "Verification failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "DEPLOYMENT FIX COMPLETED!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green