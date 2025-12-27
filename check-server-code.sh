#!/bin/bash

echo "🔍 CHECKING SERVER CODE VERSION"
echo "==============================="

# Check what's actually on the server
echo "📋 Checking admin paintings page on server..."
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" root@anyway.ro "cd /root/victoriaocara.com && bash -c '

echo \"📄 Current updateImage function on server:\"
echo \"===========================================\"
grep -A 20 \"updateImage.*=\" app/admin/paintings/page.tsx

echo \"\"
echo \"📄 Current handleEdit function on server:\"
echo \"=========================================\"
grep -A 15 \"images.*painting.images\" app/admin/paintings/page.tsx

echo \"\"
echo \"📊 File modification time:\"
ls -la app/admin/paintings/page.tsx

'"

echo ""
echo "🔍 SERVER CODE CHECK COMPLETED"
echo "=============================="