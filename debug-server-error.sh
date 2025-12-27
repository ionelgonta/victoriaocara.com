#!/bin/bash

echo "🔍 DEBUGGING SERVER ERROR"
echo "========================="

# Check what's actually running on the server
echo "📋 Checking server status and files..."
ssh -i "C:/Users/Ionel/.ssh/hetzner_anyway_key" root@anyway.ro "cd /root/victoriaocara.com && bash -c '

echo \"📊 Current directory and files:\"
pwd
ls -la app/admin/paintings/

echo \"\"
echo \"📄 Current updateImage function (first 10 lines):\"
grep -A 10 \"updateImage.*=\" app/admin/paintings/page.tsx

echo \"\"
echo \"🔄 PM2 status:\"
pm2 status

echo \"\"
echo \"📝 Recent PM2 logs (last 20 lines):\"
pm2 logs --lines 20

echo \"\"
echo \"🏗️ Build status:\"
ls -la .next/

echo \"\"
echo \"📦 Package.json scripts:\"
grep -A 5 -B 5 \"build\" package.json

'"

echo ""
echo "🔍 SERVER DEBUG COMPLETED"
echo "========================"