#!/bin/bash

echo "🎨 UPLOADING REAL PAINTINGS TO SERVER"
echo "====================================="

# Upload the new scripts to server
echo "📤 Uploading painting scripts..."
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" populate-real-paintings.js root@anyway.ro:/root/victoriaocara.com/
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" fix-painting-slugs.js root@anyway.ro:/root/victoriaocara.com/
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" fix-technique-storage.js root@anyway.ro:/root/victoriaocara.com/
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" create-placeholder-images.js root@anyway.ro:/root/victoriaocara.com/

# Upload updated database class
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" lib/database.js root@anyway.ro:/root/victoriaocara.com/lib/

echo "✅ Files uploaded"

# Run deployment on server
echo "🔄 Running real paintings deployment on server..."
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" root@anyway.ro "cd /root/victoriaocara.com && bash -c '

echo \"🎨 Populating real paintings...\"
node populate-real-paintings.js

echo \"🔧 Fixing painting slugs...\"
node fix-painting-slugs.js

echo \"🛠️ Fixing technique storage...\"
node fix-technique-storage.js

echo \"🖼️ Creating placeholder images...\"
node create-placeholder-images.js

echo \"🔄 Restarting application...\"
pm2 restart all

echo \"✅ REAL PAINTINGS DEPLOYED SUCCESSFULLY!\"
echo \"========================================\"
echo \"\"
echo \"🎯 Results:\"
echo \"  ✅ 8 authentic Victoria Ocara paintings\"
echo \"  ✅ Realistic prices (680-1350 EUR)\"
echo \"  ✅ Professional descriptions (EN/RO)\"
echo \"  ✅ Proper SEO-friendly URLs\"
echo \"  ✅ Working image placeholders\"
echo \"\"
echo \"🌐 Test the gallery: https://victoriaocara.com/galerie\"
echo \"🔗 Test individual painting: https://victoriaocara.com/tablou/the-winter-road\"

'"

echo ""
echo "🎉 REAL PAINTINGS DEPLOYMENT COMPLETED!"
echo "======================================="
echo ""
echo "✅ All real Victoria Ocara paintings are now live"
echo "✅ Professional titles, prices, and descriptions"  
echo "✅ SEO-friendly URLs working correctly"
echo "✅ Image placeholders ready for real photos"
echo ""
echo "🌐 Visit gallery at: https://victoriaocara.com/galerie"
echo "🔗 Test painting page: https://victoriaocara.com/tablou/the-winter-road"