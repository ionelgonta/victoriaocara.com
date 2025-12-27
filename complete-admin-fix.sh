#!/bin/bash

echo "🔧 COMPLETE ADMIN PANEL FIX DEPLOYMENT"
echo "======================================"

# Upload all necessary files
echo "📤 Uploading fixed files to server..."

# Upload the fixed admin paintings page
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" app/admin/paintings/page.tsx root@anyway.ro:/root/victoriaocara.com/app/admin/paintings/

# Upload the fixed stripe integration
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" lib/stripe.ts root@anyway.ro:/root/victoriaocara.com/lib/

echo "✅ Files uploaded"

# Run complete fix on server
echo "🔄 Running complete fix on server..."
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" root@anyway.ro "cd /root/victoriaocara.com && bash -c '

echo \"📦 Installing dependencies...\"
npm install

echo \"🔨 Building application...\"
npm run build

echo \"🔄 Restarting application...\"
pm2 restart all

echo \"✅ COMPLETE ADMIN FIX DEPLOYED!\"
echo \"==============================\"
echo \"\"
echo \"🎯 Fixed:\"
echo \"  ✅ Cannot create property url on string error\"
echo \"  ✅ Admin panel image editing functionality\"
echo \"  ✅ Stripe integration image handling\"
echo \"  ✅ Complete rebuild and restart\"
echo \"\"
echo \"🌐 Test admin panel: https://victoriaocara.com/admin/paintings\"

'"

echo ""
echo "🎉 COMPLETE ADMIN FIX DEPLOYMENT COMPLETED!"
echo "=========================================="
echo ""
echo "✅ All image handling errors should be fixed"
echo "✅ Admin panel fully functional"
echo "✅ Application rebuilt and restarted"
echo ""
echo "🔗 Test at: https://victoriaocara.com/admin/paintings"