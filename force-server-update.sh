#!/bin/bash

echo "🔧 FORCE SERVER UPDATE - COMPLETE OVERRIDE"
echo "=========================================="

# Step 1: Check current server state
echo "📋 Step 1: Checking current server state..."
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" root@anyway.ro "cd /root/victoriaocara.com && echo 'Current directory:' && pwd && echo 'Current updateImage function:' && grep -A 5 'updateImage.*=' app/admin/paintings/page.tsx"

# Step 2: Backup current file
echo "💾 Step 2: Backing up current server file..."
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" root@anyway.ro "cd /root/victoriaocara.com && cp app/admin/paintings/page.tsx app/admin/paintings/page.tsx.backup.$(date +%Y%m%d_%H%M%S)"

# Step 3: Force upload with overwrite
echo "📤 Step 3: Force uploading new file..."
scp -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" app/admin/paintings/page.tsx root@anyway.ro:/root/victoriaocara.com/app/admin/paintings/page.tsx

# Step 4: Verify the upload worked
echo "✅ Step 4: Verifying upload..."
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" root@anyway.ro "cd /root/victoriaocara.com && echo 'New updateImage function:' && grep -A 10 'updateImage.*=' app/admin/paintings/page.tsx"

# Step 5: Complete server restart
echo "🔄 Step 5: Complete server restart..."
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" root@anyway.ro "cd /root/victoriaocara.com && bash -c '

echo \"🛑 Stopping all processes...\"
pm2 stop all
pm2 delete all

echo \"🧹 Complete cleanup...\"
rm -rf .next
rm -rf node_modules/.cache
npm cache clean --force

echo \"📦 Fresh install...\"
npm install

echo \"🔨 Fresh build...\"
npm run build

echo \"🚀 Fresh start...\"
pm2 start npm --name \"victoriaocara\" -- start

echo \"📊 Final status:\"
pm2 status
pm2 logs --lines 5

echo \"✅ COMPLETE SERVER UPDATE FINISHED!\"

'"

echo ""
echo "🎉 FORCE SERVER UPDATE COMPLETED!"
echo "================================"
echo ""
echo "🔗 Test now: https://victoriaocara.com/admin/paintings"
echo "The error should be completely resolved now."