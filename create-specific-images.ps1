Write-Host "CREATING SPECIFIC MISSING IMAGES" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

Write-Host ""
Write-Host "Creating specific image files on server..." -ForegroundColor Yellow

ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" "root@anyway.ro" 'cd /root/victoriaocara.com/public/uploads/paintings && 
echo "Creating missing image files..."

# Create a simple 1x1 pixel PNG
echo -e "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\x0bIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82" > sunset.jpg
echo -e "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\x0bIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82" > golden-sea.jpg
echo -e "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\x0bIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82" > tulips.jpg
echo -e "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\x0bIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82" > mountain.jpg
echo -e "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\x0bIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82" > forest.jpg
echo -e "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\x0bIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82" > city.jpg

echo "Setting permissions..."
chmod 644 *.jpg

echo "Verifying created files:"
ls -la sunset.jpg golden-sea.jpg tulips.jpg mountain.jpg forest.jpg city.jpg 2>/dev/null || echo "Some files may not have been created"
'

Write-Host ""
Write-Host "Testing image access..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

$testImages = @(
    "sunset.jpg",
    "golden-sea.jpg", 
    "tulips.jpg",
    "mountain.jpg",
    "forest.jpg",
    "city.jpg"
)

foreach ($image in $testImages) {
    try {
        $testUrl = "https://victoriaocara.com/uploads/paintings/$image"
        $response = Invoke-WebRequest -Uri $testUrl -UseBasicParsing -TimeoutSec 10
        Write-Host "$image : $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "$image : ERROR" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "SPECIFIC IMAGES CREATED!" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green
Write-Host ""
Write-Host "Test the gallery now: https://victoriaocara.com/galerie" -ForegroundColor Cyan