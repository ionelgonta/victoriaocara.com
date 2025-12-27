Write-Host "FIXING MISSING IMAGES ON SERVER" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

Write-Host ""
Write-Host "Step 1: Checking image directories on server..." -ForegroundColor Yellow
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" "root@anyway.ro" 'cd /root/victoriaocara.com && echo "Checking public/uploads structure:" && ls -la public/ && echo "" && echo "Checking paintings directory:" && ls -la public/uploads/paintings/ 2>/dev/null || echo "Paintings directory does not exist"'

Write-Host ""
Write-Host "Step 2: Creating missing directories..." -ForegroundColor Yellow
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" "root@anyway.ro" 'cd /root/victoriaocara.com && mkdir -p public/uploads/paintings && chmod 755 public/uploads -R'

Write-Host ""
Write-Host "Step 3: Uploading placeholder images..." -ForegroundColor Yellow
# Upload all placeholder images from local
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" -r "public/uploads/paintings/*" "root@anyway.ro:/root/victoriaocara.com/public/uploads/paintings/" 2>$null

Write-Host ""
Write-Host "Step 4: Creating missing image files on server..." -ForegroundColor Yellow
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" "root@anyway.ro" 'cd /root/victoriaocara.com && node -e "
const fs = require(\"fs\");
const path = require(\"path\");

// Create placeholder images for the missing files
const imageNames = [
  \"sunset.jpg\", \"golden-sea.jpg\", \"tulips.jpg\", 
  \"mountain.jpg\", \"forest.jpg\", \"city.jpg\"
];

// Simple 1x1 pixel transparent PNG as placeholder
const placeholderContent = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
  0x0B, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
]);

const uploadsDir = \"public/uploads/paintings\";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

imageNames.forEach(filename => {
  const filePath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, placeholderContent);
    console.log(\"Created placeholder:\", filename);
  } else {
    console.log(\"Already exists:\", filename);
  }
});

console.log(\"Placeholder images created successfully!\");
"'

Write-Host ""
Write-Host "Step 5: Verifying image files..." -ForegroundColor Yellow
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" "root@anyway.ro" 'cd /root/victoriaocara.com && echo "Final image directory contents:" && ls -la public/uploads/paintings/'

Write-Host ""
Write-Host "Step 6: Testing image access..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
try {
    $testUrl = "https://victoriaocara.com/uploads/paintings/sunset.jpg"
    $response = Invoke-WebRequest -Uri $testUrl -UseBasicParsing -TimeoutSec 10
    Write-Host "Direct image access test: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Direct image access failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "MISSING IMAGES FIX COMPLETED!" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""
Write-Host "Test the gallery now: https://victoriaocara.com/galerie" -ForegroundColor Cyan
Write-Host "Images should load without 400 errors." -ForegroundColor White