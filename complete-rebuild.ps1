Write-Host "COMPLETE APPLICATION REBUILD" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green

Write-Host ""
Write-Host "Step 1: Complete rebuild on server..." -ForegroundColor Yellow
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" "root@anyway.ro" 'cd /root/victoriaocara.com && echo "Building application..." && npm run build && echo "Build completed"'

Write-Host ""
Write-Host "Step 2: Clean PM2 restart..." -ForegroundColor Yellow
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" "root@anyway.ro" 'cd /root/victoriaocara.com && pm2 delete all && pm2 start npm --name "victoriaocara" -- start && pm2 save'

Write-Host ""
Write-Host "Step 3: Testing all routes..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

$routes = @(
    "https://victoriaocara.com",
    "https://victoriaocara.com/galerie", 
    "https://victoriaocara.com/admin",
    "https://victoriaocara.com/admin/paintings"
)

foreach ($route in $routes) {
    try {
        $response = Invoke-WebRequest -Uri $route -UseBasicParsing -TimeoutSec 30
        Write-Host "$route : $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "$route : ERROR - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "COMPLETE REBUILD FINISHED!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green