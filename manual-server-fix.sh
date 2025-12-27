#!/bin/bash

echo "🔧 MANUAL SERVER FIX - COMPLETE OVERRIDE"
echo "========================================"

# First, let's check what's on the server
echo "📋 Step 1: Checking current server state..."
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" root@anyway.ro "cd /root/victoriaocara.com && pwd && ls -la app/admin/paintings/page.tsx"

# Upload the file with verbose output
echo "📤 Step 2: Force uploading fixed file..."
scp -v -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" app/admin/paintings/page.tsx root@anyway.ro:/root/victoriaocara.com/app/admin/paintings/page.tsx

# Verify the upload
echo "✅ Step 3: Verifying upload..."
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" root@anyway.ro "cd /root/victoriaocara.com && ls -la app/admin/paintings/page.tsx && echo 'File size:' && wc -l app/admin/paintings/page.tsx"

# Manual server operations
echo "🔄 Step 4: Manual server operations..."
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" root@anyway.ro "cd /root/victoriaocara.com && bash -c '

echo \"🛑 Stopping PM2...\"
pm2 stop all

echo \"🧹 Clearing all caches...\"
rm -rf .next
rm -rf node_modules/.cache
npm cache clean --force

echo \"📦 Reinstalling dependencies...\"
npm install

echo \"🔨 Fresh build...\"
npm run build

echo \"🚀 Starting PM2...\"
pm2 start all

echo \"📊 Final status:\"
pm2 status

echo \"✅ MANUAL FIX COMPLETED!\"

'"

echo ""
echo "🎉 MANUAL SERVER FIX COMPLETED!"
echo "=============================="
echo ""
echo "🔗 Test now: https://victoriaocara.com/admin/paintings"