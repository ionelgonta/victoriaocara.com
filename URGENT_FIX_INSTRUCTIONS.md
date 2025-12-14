# 🚨 URGENT FIX INSTRUCTIONS - VICTORIA OCARA SITE

## Problem Summary
Based on the context, the Victoria Ocara website is not displaying correctly. Users see old content or maintenance pages instead of the new Next.js art gallery application.

## Root Cause Analysis
The issue appears to be:
1. **Maintenance pages or old HTML files** blocking the new site
2. **Nginx configuration** serving static content instead of proxying to Next.js
3. **React Error #31** causing application crashes
4. **SSL certificate** issues preventing HTTPS access
5. **Cache issues** showing old versions

## Quick Fix Solution

### Step 1: Connect to Server
```bash
ssh root@23.88.113.154
# Password: FlightSchedule2024!
```

### Step 2: Navigate to Project
```bash
cd /opt/victoriaocara
```

### Step 3: Run Master Fix Script
```bash
chmod +x master-fix-script.sh
./master-fix-script.sh
```

This script will automatically:
- ✅ Remove maintenance pages and blocking content
- ✅ Fix Nginx configuration for multi-domain setup
- ✅ Resolve React Error #31 issues
- ✅ Setup SSL certificates
- ✅ Restart all services properly
- ✅ Verify everything is working

### Step 4: Verify Site is Working
After the script completes, test:
- http://victoriaocara.com
- https://victoriaocara.com (if SSL was configured)

## Expected Results

### ✅ Success Indicators
- Site shows "site nou Victoria ocara" title
- Gallery displays paintings properly
- Admin panel accessible at /admin
- No React errors in browser console
- SSL certificate valid (if configured)

### ❌ If Still Not Working
Run individual diagnostic scripts:

```bash
# Find what's blocking the site
./find-and-fix-blocking-content.sh

# Check web server configuration
./identify-and-fix-web-server.sh

# Complete application rebuild
./ultimate-site-fix.sh
```

## Manual Verification Steps

### 1. Check Services
```bash
pm2 status                    # Should show victoriaocara running
systemctl status nginx        # Should be active
systemctl status mongod       # Should be active
```

### 2. Check Application
```bash
curl http://localhost:3000     # Should return HTML with Victoria content
curl http://victoriaocara.com  # Should return same content
```

### 3. Check Logs
```bash
pm2 logs victoriaocara         # Check for React errors
tail -f /var/log/nginx/error.log  # Check for proxy errors
```

## Site Features (After Fix)

### 🎨 Public Pages
- **Homepage**: Gallery preview with featured paintings
- **Gallery** (`/galerie`): Full painting collection with cart functionality
- **About** (`/despre`): Artist information and story
- **Contact** (`/contact`): Contact form and information
- **Custom Orders** (`/comanda-pictura`): Custom painting request system
- **Cart & Checkout**: Stripe payment integration

### 🔧 Admin Panel (`/admin`)
- **Credentials**: admin@victoriaocara.com / AdminVictoria2024!
- **Paintings Management**: Add/edit/delete paintings
- **Orders Management**: View and manage orders
- **Custom Requests**: Handle custom painting requests
- **Translations**: Manage site text in Romanian/English
- **About Content**: Edit about page content

### 🌐 Technical Details
- **Framework**: Next.js 14 with TypeScript
- **Database**: MongoDB (local instance)
- **Payments**: Stripe integration
- **Languages**: Romanian (default) + English
- **SSL**: Let's Encrypt certificate
- **Domain**: victoriaocara.com (+ www.victoriaocara.com)
- **Server**: Ubuntu with Nginx reverse proxy

## Troubleshooting

### Issue: "vad o pula" (seeing nothing/wrong content)
**Solution**: Run `./find-and-fix-blocking-content.sh` - this will find and remove any HTML files blocking the new site.

### Issue: React Error #31
**Solution**: The `safeRender` function in `lib/utils.ts` prevents objects from being rendered directly in JSX.

### Issue: SSL Certificate Invalid
**Solution**: The fix script will obtain a fresh Let's Encrypt certificate.

### Issue: Old Version Cached
**Solution**: 
- Server side: Scripts clear Next.js cache and restart services
- Client side: Use Ctrl+Shift+R or incognito mode

### Issue: anyway.ro Conflicts
**Solution**: Nginx is configured to serve both domains without conflicts.

## Emergency Contacts
- **Server**: 23.88.113.154
- **Domain**: victoriaocara.com
- **Admin Email**: admin@victoriaocara.com
- **Database**: MongoDB local (port 27017)
- **Application**: Next.js on port 3000
- **Web Server**: Nginx on ports 80/443

## Success Confirmation
When everything works correctly, you should see:
1. ✅ Site loads at https://victoriaocara.com
2. ✅ Title shows "site nou Victoria ocara"
3. ✅ Gallery displays paintings with prices in EUR
4. ✅ Admin panel accessible and functional
5. ✅ No console errors in browser
6. ✅ SSL certificate valid and trusted
7. ✅ anyway.ro continues to work alongside

---

**Last Updated**: December 13, 2025  
**Status**: Ready for deployment  
**Estimated Fix Time**: 10-15 minutes