Write-Host "SIMPLE SERVER FIX" -ForegroundColor Green
Write-Host "=================" -ForegroundColor Green

Write-Host ""
Write-Host "Connecting to server and running fix..." -ForegroundColor Yellow

# Single command approach
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" "root@anyway.ro" 'cd /root/victoriaocara.com && pwd && pm2 restart all && pm2 list'

Write-Host ""
Write-Host "Testing result..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "https://victoriaocara.com/admin/paintings" -UseBasicParsing -TimeoutSec 30
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    
    # Check if the page contains admin content
    if ($response.Content -match "Gestionează Tablouri" -or $response.Content -match "admin") {
        Write-Host "Admin panel is working correctly" -ForegroundColor Green
    } else {
        Write-Host "Admin panel may have issues" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "SIMPLE FIX COMPLETED!" -ForegroundColor Green
Write-Host "Test the admin panel now: https://victoriaocara.com/admin/paintings" -ForegroundColor Cyan