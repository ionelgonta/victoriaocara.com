# ⚡ QUICK DEPLOY - Fix Slow Images

## 🚨 URGENT: 3-Step Fix

### Step 1: Upload Files
Upload all files from this package to your server:
- Keep the same directory structure
- Overwrite existing files

### Step 2: Run Script
SSH into your server and run:
```bash
chmod +x deploy-on-server.sh
./deploy-on-server.sh
```

### Step 3: Test
Visit: https://victoriaocara.com/galerie
- Images should load **instantly**
- No more preloader

---

## 🔧 If Script Fails - Manual Commands

```bash
mkdir -p public/uploads/paintings
node scripts/migrate-images-to-files.js
pm2 restart all
```

---

## ✅ Success Check

Run verification:
```bash
chmod +x verify-fix.sh
./verify-fix.sh
```

**Expected**: Images load instantly, API <100KB

---

## 🆘 Emergency Contact

If deployment fails:
1. Check server logs
2. Verify MongoDB connection
3. Ensure disk space available
4. Try manual commands above

**This fixes the slow image loading permanently!** 🚀