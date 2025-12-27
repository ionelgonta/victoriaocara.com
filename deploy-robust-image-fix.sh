#!/bin/bash

echo "🔧 DEPLOYING ROBUST IMAGE FIX"
echo "============================="

# Upload the robust fix
echo "📤 Uploading robust image fix..."
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" app/admin/paintings/page.tsx root@anyway.ro:/root/victoriaocara.com/app/admin/paintings/

echo "✅ File uploaded"

# Apply fix on server
echo "🔄 Applying robust fix on server..."
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" root@anyway.ro "cd /root/victoriaocara.com && bash -c '

echo \"🔨 Building with robust image handling...\"
npm run build

echo \"🔄 Restarting with new fix...\"
pm2 restart all

echo \"✅ ROBUST IMAGE FIX DEPLOYED!\"
echo \"=============================\"
echo \"\"
echo \"🎯 Improvements:\"
echo \"  ✅ Type-safe image handling with explicit casting\"
echo \"  ✅ Multiple fallback checks for object conversion\"
echo \"  ✅ Robust error prevention for string->object conversion\"
echo \"\"
echo \"🌐 Test admin panel: https://victoriaocara.com/admin/paintings\"

'"

echo ""
echo "🎉 ROBUST IMAGE FIX DEPLOYMENT COMPLETED!"
echo "========================================"
echo ""
echo "✅ Enhanced error handling for image objects"
echo "✅ Type-safe property assignment"
echo "✅ Multiple fallback mechanisms"
echo ""
echo "🔗 Test at: https://victoriaocara.com/admin/paintings"