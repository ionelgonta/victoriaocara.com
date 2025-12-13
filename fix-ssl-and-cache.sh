#!/bin/bash

echo "🔒 REPARARE SSL ȘI CACHE PENTRU VICTORIAOCARA.COM"
echo "================================================"

echo "🔍 PASUL 1: Verifică configurația SSL actuală..."

echo "Certificatele SSL disponibile:"
ls -la /etc/letsencrypt/live/ 2>/dev/null || echo "Nu există certificat SSL"

echo ""
echo "Configurația Nginx activă:"
ls -la /etc/nginx/sites-enabled/

echo ""
echo "Configurația victoriaocara.com:"
if [ -f "/etc/nginx/sites-available/victoriaocara.com" ]; then
    cat /etc/nginx/sites-available/victoriaocara.com
else
    echo "Nu există configurația victoriaocara.com"
fi

echo ""
echo "🌐 PASUL 2: Testează accesul direct la Next.js..."

echo "Test Next.js pe portul 3000:"
NEXTJS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
echo "   localhost:3000: $NEXTJS_STATUS"

if [ "$NEXTJS_STATUS" = "200" ]; then
    echo "   ✅ Next.js funcționează"
    
    # Testează o pagină specifică
    echo "   Test homepage Next.js:"
    curl -s http://localhost:3000 | head -5
else
    echo "   ❌ Next.js nu funcționează pe portul 3000"
    echo "   PM2 status:"
    pm2 status
    echo "   PM2 logs:"
    pm2 logs victoriaocara --lines 5 --nostream
fi

echo ""
echo "🔧 PASUL 3: Repară configurația Nginx pentru victoriaocara.com..."

# Creează configurația corectă pentru victoriaocara.com
cat > /etc/nginx/sites-available/victoriaocara.com << 'EOF'
server {
    listen 80;
    server_name victoriaocara.com www.victoriaocara.com;
    
    # Redirect la HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name victoriaocara.com www.victoriaocara.com;

    # Certificatele SSL (vor fi completate de certbot)
    ssl_certificate /etc/letsencrypt/live/victoriaocara.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/victoriaocara.com/privkey.pem;
    
    # Configurații SSL moderne
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de securitate
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy la Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
        proxy_connect_timeout 60;
        proxy_send_timeout 60;
        
        # Disable cache pentru debugging
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Optimizări pentru Next.js static files
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    # Logs specifice
    access_log /var/log/nginx/victoriaocara.access.log;
    error_log /var/log/nginx/victoriaocara.error.log;
}
EOF

echo "   ✅ Configurația victoriaocara.com actualizată"

echo ""
echo "🔒 PASUL 4: Configurează SSL pentru victoriaocara.com..."

# Verifică dacă certificatul există deja
if [ -d "/etc/letsencrypt/live/victoriaocara.com" ]; then
    echo "   ✅ Certificatul SSL există deja"
    
    # Verifică validitatea certificatului
    openssl x509 -in /etc/letsencrypt/live/victoriaocara.com/cert.pem -text -noout | grep -A 2 "Validity"
else
    echo "   🔒 Obține certificatul SSL..."
    
    # Oprește temporar nginx pentru certbot standalone
    systemctl stop nginx
    
    # Obține certificatul
    certbot certonly --standalone -d victoriaocara.com -d www.victoriaocara.com --non-interactive --agree-tos --email admin@victoriaocara.com
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Certificatul SSL obținut cu succes"
    else
        echo "   ❌ Nu s-a putut obține certificatul SSL"
        echo "   Încearcă cu webroot..."
        
        # Pornește nginx înapoi
        systemctl start nginx
        
        # Încearcă cu webroot
        certbot --webroot -w /var/www/html -d victoriaocara.com -d www.victoriaocara.com --non-interactive --agree-tos --email admin@victoriaocara.com
    fi
fi

echo ""
echo "🔄 PASUL 5: Activează configurația și repornește serviciile..."

# Activează configurația
ln -sf /etc/nginx/sites-available/victoriaocara.com /etc/nginx/sites-enabled/

# Testează configurația
nginx -t

if [ $? -eq 0 ]; then
    echo "   ✅ Configurația Nginx este validă"
    
    # Repornește nginx
    systemctl restart nginx
    
    if systemctl is-active --quiet nginx; then
        echo "   ✅ Nginx restartat cu succes"
    else
        echo "   ❌ Nginx nu a pornit"
        systemctl status nginx --no-pager
    fi
else
    echo "   ❌ Configurația Nginx are erori"
    nginx -t
fi

echo ""
echo "🧹 PASUL 6: Curăță cache-ul Next.js și repornește aplicația..."

cd /opt/victoriaocara

# Oprește aplicația
pm2 stop victoriaocara

# Curăță cache-ul Next.js
rm -rf .next/cache
rm -rf .next/server/pages-manifest.json
rm -rf .next/static

# Reconstruiește aplicația
echo "   Reconstruiește aplicația..."
npm run build

# Repornește aplicația
pm2 start victoriaocara

echo "   ✅ Aplicația reconstruită și repornită"

echo ""
echo "⏳ PASUL 7: Așteaptă stabilizarea serviciilor..."
sleep 10

echo ""
echo "🧪 PASUL 8: Testează totul..."

echo "1. Test Next.js direct:"
NEXTJS_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
echo "   localhost:3000: $NEXTJS_TEST"

echo ""
echo "2. Test HTTP (ar trebui să redirecționeze la HTTPS):"
HTTP_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://victoriaocara.com)
echo "   http://victoriaocara.com: $HTTP_TEST"

echo ""
echo "3. Test HTTPS:"
HTTPS_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://victoriaocara.com)
echo "   https://victoriaocara.com: $HTTPS_TEST"

echo ""
echo "4. Test certificat SSL:"
if [ -f "/etc/letsencrypt/live/victoriaocara.com/cert.pem" ]; then
    echo "   Certificat SSL:"
    openssl x509 -in /etc/letsencrypt/live/victoriaocara.com/cert.pem -text -noout | grep -E "(Subject:|Issuer:|Not After)"
else
    echo "   ❌ Nu există certificat SSL"
fi

echo ""
echo "5. Test headers SSL:"
curl -I https://victoriaocara.com 2>/dev/null | grep -E "(HTTP|server|strict-transport)"

echo ""
echo "================================================"

if [ "$HTTPS_TEST" = "200" ] && [ -f "/etc/letsencrypt/live/victoriaocara.com/cert.pem" ]; then
    echo "✅ SUCCES! Site-ul funcționează cu SSL valid!"
    echo ""
    echo "🌐 ACCESEAZĂ SITE-UL:"
    echo "   https://victoriaocara.com"
    echo ""
    echo "🔧 ADMIN PANEL:"
    echo "   https://victoriaocara.com/admin"
    echo "   Credențiale: admin@victoriaocara.com / AdminVictoria2024!"
    echo ""
    echo "🔒 SSL CONFIGURAT:"
    echo "   ✅ Certificat valid Let's Encrypt"
    echo "   ✅ HTTPS forțat (redirect automat)"
    echo "   ✅ Headers de securitate"
    echo "   ✅ HTTP/2 activat"
    echo ""
    echo "💡 PENTRU CACHE BROWSER:"
    echo "   Apasă Ctrl+F5 în browser pentru refresh forțat"
    echo "   Sau deschide în modul incognito"
    
elif [ "$NEXTJS_TEST" = "200" ]; then
    echo "⚠️  Next.js funcționează, dar SSL are probleme"
    echo ""
    echo "🔍 VERIFICĂ:"
    echo "   • Certificatul SSL: ls -la /etc/letsencrypt/live/"
    echo "   • Configurația Nginx: nginx -t"
    echo "   • Logurile Nginx: tail -f /var/log/nginx/error.log"
    
else
    echo "❌ PROBLEME CU APLICAȚIA"
    echo ""
    echo "🔍 DEBUG:"
    echo "   PM2 status:"
    pm2 status
    echo ""
    echo "   PM2 logs:"
    pm2 logs victoriaocara --lines 5 --nostream
fi

echo "================================================"