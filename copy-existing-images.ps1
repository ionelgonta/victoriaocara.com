Write-Host "COPYING EXISTING IMAGES WITH CORRECT NAMES" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

Write-Host ""
Write-Host "Copying existing images to correct names..." -ForegroundColor Yellow

ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" "root@anyway.ro" 'cd /root/victoriaocara.com/public/uploads/paintings && 
echo "Current directory contents:"
ls -la | head -5

echo ""
echo "Copying existing images to required names..."

# Use the first available image as a template
TEMPLATE_IMAGE=$(ls *.jpg | head -1)
echo "Using template image: $TEMPLATE_IMAGE"

if [ -n "$TEMPLATE_IMAGE" ]; then
    cp "$TEMPLATE_IMAGE" sunset.jpg
    cp "$TEMPLATE_IMAGE" golden-sea.jpg  
    cp "$TEMPLATE_IMAGE" tulips.jpg
    cp "$TEMPLATE_IMAGE" mountain.jpg
    cp "$TEMPLATE_IMAGE" forest.jpg
    cp "$TEMPLATE_IMAGE" city.jpg
    
    echo "Files copied successfully"
    echo "Verifying:"
    ls -la sunset.jpg golden-sea.jpg tulips.jpg mountain.jpg forest.jpg city.jpg
else
    echo "No template image found"
fi
'

Write-Host ""
Write-Host "Testing image access..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

$testImages = @("sunset.jpg", "golden-sea.jpg", "tulips.jpg", "mountain.jpg", "forest.jpg", "city.jpg")

foreach ($image in $testImages) {
    try {
        $testUrl = "https://victoriaocara.com/uploads/paintings/$image"
        $response = Invoke-WebRequest -Uri $testUrl -UseBasicParsing -TimeoutSec 10
        Write-Host "$image : $($response.StatusCode) - Size: $($response.Content.Length) bytes" -ForegroundColor Green
    } catch {
        Write-Host "$image : ERROR - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "IMAGE COPYING COMPLETED!" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green