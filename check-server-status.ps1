Write-Host "CHECKING SERVER STATUS" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green

Write-Host ""
Write-Host "Testing main site..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://victoriaocara.com" -UseBasicParsing -TimeoutSec 10
    Write-Host "Main site status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content length: $($response.Content.Length) bytes" -ForegroundColor Gray
} catch {
    Write-Host "Main site error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing gallery..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://victoriaocara.com/galerie" -UseBasicParsing -TimeoutSec 10
    Write-Host "Gallery status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content length: $($response.Content.Length) bytes" -ForegroundColor Gray
} catch {
    Write-Host "Gallery error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing admin panel..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://victoriaocara.com/admin" -UseBasicParsing -TimeoutSec 10
    Write-Host "Admin panel status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content length: $($response.Content.Length) bytes" -ForegroundColor Gray
} catch {
    Write-Host "Admin panel error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "SUMMARY" -ForegroundColor Green
Write-Host "=======" -ForegroundColor Green
Write-Host "Server status check completed." -ForegroundColor White