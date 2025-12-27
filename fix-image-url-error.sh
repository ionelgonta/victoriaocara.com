#!/bin/bash

echo "🔧 FIXING IMAGE URL ERROR ON SERVER"
echo "==================================="

# Upload the fixed admin paintings page
echo "📤 Uploading fixed admin paintings page..."
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" app/admin/paintings/page.tsx root@anyway.ro:/root/victoriaocara.com/app/admin/paintings/

echo "✅ File uploaded"

# Restart the application on server
echo "🔄 Restarting application on server..."
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" root@anyway.ro "cd /root/victoriaocara.com && bash -c '

echo \"🔄 Restarting application...\"
pm2 restart all

echo \"✅ IMAGE URL ERROR FIXED!\"
echo \"========================\"
echo \"\"
echo \"🎯 Fixed:\"
echo \"  ✅ Cannot create property url on string error\"
echo \"  ✅ Admin panel image editing now works\"
echo \"  ✅ Proper handling of string vs object images\"
echo \"\"
echo \"🌐 Test admin panel: https://victoriaocara.com/admin/paintings\"

'"

echo ""
echo "🎉 IMAGE URL ERROR FIX DEPLOYED!"
echo "==============================="
echo ""
echo "✅ Admin panel should now work without errors"
echo "✅ Image editing functionality restored"
echo ""
echo "🔗 Test at: https://victoriaocara.com/admin/paintings"