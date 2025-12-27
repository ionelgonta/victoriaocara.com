#!/bin/bash

echo "🚀 Deploying image optimization to live server"
echo "============================================="

# Upload fișierele necesare pe server
echo "📤 Uploading files to server..."

# Aici trebuie să adaptezi pentru serverul tău
# Exemplu pentru SCP/RSYNC:
# scp lib/imageStorage.ts user@server:/path/to/project/lib/
# scp scripts/migrate-images-to-files.js user@server:/path/to/project/scripts/
# scp app/api/upload/route.ts user@server:/path/to/project/app/api/upload/
# scp app/api/upload-public/route.ts user@server:/path/to/project/app/api/upload-public/

echo "📋 Files to upload to server:"
echo "   - lib/imageStorage.ts"
echo "   - scripts/migrate-images-to-files.js"
echo "   - app/api/upload/route.ts"
echo "   - app/api/upload-public/route.ts"
echo "   - fix-live-images-instantly.sh"

echo ""
echo "🔧 Commands to run on server:"
echo "   1. Upload the files above"
echo "   2. Run: chmod +x fix-live-images-instantly.sh"
echo "   3. Run: ./fix-live-images-instantly.sh"
echo "   4. Test: https://victoriaocara.com/galerie"

echo ""
echo "⚡ Quick server commands:"
echo "   # Create directories"
echo "   mkdir -p public/uploads/paintings"
echo "   "
echo "   # Run migration"
echo "   node scripts/migrate-images-to-files.js"
echo "   "
echo "   # Restart server"
echo "   pm2 restart all  # or your restart command"

echo ""
echo "🎯 Expected result: Images load instantly, no more preloader!"