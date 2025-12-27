# 🚨 URGENT: Fix Slow Image Loading on Live Server

## Problem
Images on https://victoriaocara.com/galerie still load slowly with preloader because the migration hasn't been run on the production server yet.

## Quick Fix (Run on Server)

### 1. Create Upload Directories
```bash
mkdir -p public/uploads/paintings
mkdir -p public/uploads/general
chmod 755 public/uploads
chmod 755 public/uploads/paintings
chmod 755 public/uploads/general
```

### 2. Upload These Files to Server
- `lib/imageStorage.ts`
- `scripts/migrate-images-to-files.js`
- `app/api/upload/route.ts`
- `app/api/upload-public/route.ts`

### 3. Install Dependencies (if needed)
```bash
npm install --save-dev @types/uuid
```

### 4. Run Migration
```bash
node scripts/migrate-images-to-files.js
```

### 5. Restart Server
```bash
# Choose your restart method:
pm2 restart all
# OR
sudo systemctl restart nginx
# OR your specific restart command
```

## Expected Result
- ✅ Images load instantly
- ✅ No more preloader
- ✅ Gallery browsing is smooth
- ✅ API response size drops from ~20MB to <100KB

## Verification
1. Visit: https://victoriaocara.com/galerie
2. Images should load immediately
3. Check API size: `curl -s https://victoriaocara.com/api/paintings | wc -c`
4. Should be <100KB instead of 20MB+

## If Migration Fails
Check:
- MongoDB connection (MONGODB_URI in .env)
- File permissions on public/uploads/
- Disk space availability
- Node.js version compatibility

---

**This will fix the slow loading immediately!** 🚀