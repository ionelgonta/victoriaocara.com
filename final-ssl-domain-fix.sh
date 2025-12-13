#!/bin/bash

echo "🎯 REPARARE FINALĂ: HTTPS VICTORIAOCARA.COM FĂRĂ PORTURI"
echo "========================================================"

echo "🔍 PASUL 1: Diagnosticare situație actuală..."

echo "Ce se întâmplă când accesez victoriaocara.com:"
curl -v http://victoriaocara.com 2>&1 | head -20

echo ""
echo "Ce se întâmplă când accesez HTTPS:"
curl -v https://victoriaocara.com 2>&1 | head -20

echo ""
echo "Verifică certificatele SSL existente:"
ls -la /etc/letsencrypt/live/ 2>/dev/null || echo "Nu există certificat SSL"

echo ""
echo "Configurația Nginx activă:"
ls -la /etc/nginx/sites-enabled/

echo ""
echo "🛑 PASUL 2: Oprește tot și curăță complet..."

# Oprește nginx
systemctl stop nginx

# Oprește orice proces pe porturile 80/443
fuser -k 80/tcp 2>/dev/null || echo "Portul 80 era liber"
fuser -k 443/tcp 2>/dev/null || echo "Portul 443 era liber"

# Șterge toate configurațiile nginx
rm -f /etc/nginx/sites-enabled/*

sleep 3

echo "   ✅ Serviciile oprite și porturile eliberate"

echo ""
echo "🔒 PASUL 3: Obține certificat SSL Let's Encrypt FRESH..."

# Șterge certificatul vechi dacă există
if [ -d "/etc/letsencrypt/live/victoriaocara.com" ]; then
    echo "   Șterge certificatul vechi..."
    certbot delete --cert-name victoriaocara.com --non-interactive
fi

# Obține certificat nou cu certbot standalone
echo "   Obține certificat SSL nou de la Let's Encrypt..."
certbot certonly --standalone \
    -d victoriaocara.com \
    -d www.victoriaocara.com \
    --non-interactive \
    --agree-tos \
    --email admin@victoriaocara.com \
    --force-renewal

if [ $? -eq 0 ]; then
    echo "   ✅ Certificat SSL Let's Encrypt obținut cu succes!"
    
    # Verifică certificatul
    echo "   Detalii certificat:"
    openssl x509 -in /etc/letsencrypt/live/victoriaocara.com/cert.pem -text -noout | grep -E "(Issuer|Subject|Not After)"
else
    echo "   ❌ Nu s-a putut obține certificatul SSL"
    exit 1
fi

echo ""
echo "📝 PASUL 4: Creează configurația Nginx CORECTĂ..."

# Creează configurația DOAR pentru victoriaocara.com
cat > /etc/nginx/sites-available/victoriaocara-ssl << 'EOF'
# Redirect HTTP la HTTPS pentru victoriaocara.com
server {
    listen 80;
    server_name victoriaocara.com www.victoriaocara.com;
    
    # Redirect permanent la HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server pentru victoriaocara.com
server {
    listen 443 ssl http2;
    server_name victoriaocara.com www.victoriaocara.com;

    # Certificat SSL Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/victoriaocara.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/victoriaocara.com/privkey.pem;
    
    # Configurații SSL moderne și sigure
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Headers de securitate
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy la aplicația Next.js pe portul 3000
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
        proxy_connect_timeout 60;
        proxy_send_timeout 60;
        
        # Headers pentru cache fresh
        proxy_set_header Cache-Control "no-cache, no-store, must-revalidate";
        proxy_set_header Pragma "no-cache";
        proxy_set_header Expires "0";
    }

    # Optimizări pentru fișierele statice Next.js
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    location /images/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 1d;
    }

    # Logs specifice pentru victoriaocara
    access_log /var/log/nginx/victoriaocara-ssl.access.log;
    error_log /var/log/nginx/victoriaocara-ssl.error.log;
}
EOF

echo "   ✅ Configurația SSL pentru victoriaocara.com creată"

echo ""
echo "🔗 PASUL 5: Activează DOAR configurația victoriaocara.com..."

# Activează DOAR configurația victoriaocara
ln -sf /etc/nginx/sites-available/victoriaocara-ssl /etc/nginx/sites-enabled/

echo "   Configurații active:"
ls -la /etc/nginx/sites-enabled/

echo ""
echo "🧪 PASUL 6: Testează configurația Nginx..."

nginx -t

if [ $? -eq 0 ]; then
    echo "   ✅ Configurația Nginx este validă"
else
    echo "   ❌ Configurația Nginx are erori"
    nginx -t
    exit 1
fi

echo ""
echo "🚀 PASUL 7: Pornește Nginx cu configurația nouă..."

systemctl start nginx

if systemctl is-active --quiet nginx; then
    echo "   ✅ Nginx pornit cu succes"
else
    echo "   ❌ Nginx nu a pornit"
    systemctl status nginx --no-pager
    exit 1
fi

echo ""
echo "🔄 PASUL 8: Verifică și repornește aplicația Next.js..."

cd /opt/victoriaocara

# Verifică că aplicația rulează pe portul 3000
NEXTJS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [ "$NEXTJS_STATUS" != "200" ]; then
    echo "   Aplicația Next.js nu rulează, o repornesc..."
    
    pm2 stop victoriaocara 2>/dev/null || echo "Nu rula în PM2"
    pm2 delete victoriaocara 2>/dev/null || echo "Nu era în PM2"
    
    # Curăță cache
    rm -rf .next/cache
    
    # Reconstruiește
    npm run build
    
    # Pornește din nou
    pm2 start start-server.js --name "victoriaocara"
    
    sleep 10
    
    # Verifică din nou
    NEXTJS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
fi

echo "   Next.js pe portul 3000: $NEXTJS_STATUS"

echo ""
echo "⏳ PASUL 9: Așteaptă stabilizarea serviciilor..."
sleep 5

echo ""
echo "🧪 PASUL 10: TESTARE FINALĂ..."

echo "1. Test HTTP (ar trebui 301 redirect):"
HTTP_RESULT=$(curl -s -o /dev/null -w "%{http_code}" http://victoriaocara.com)
echo "   http://victoriaocara.com: $HTTP_RESULT"

echo ""
echo "2. Test HTTPS (ar trebui 200):"
HTTPS_RESULT=$(curl -s -o /dev/null -w "%{http_code}" https://victoriaocara.com)
echo "   https://victoriaocara.com: $HTTPS_RESULT"

echo ""
echo "3. Verifică certificatul SSL:"
if [ -f "/etc/letsencrypt/live/victoriaocara.com/cert.pem" ]; then
    echo "   Certificat SSL Let's Encrypt:"
    openssl x509 -in /etc/letsencrypt/live/victoriaocara.com/cert.pem -text -noout | grep -A 1 "Issuer:"
    echo ""
    echo "   Valabilitate certificat:"
    openssl x509 -in /etc/letsencrypt/live/victoriaocara.com/cert.pem -text -noout | grep -A 2 "Validity"
else
    echo "   ❌ Certificatul SSL nu există"
fi

echo ""
echo "4. Test SSL din exterior:"
echo "   SSL Labs test: https://www.ssllabs.com/ssltest/analyze.html?d=victoriaocara.com"

echo ""
echo "5. Headers HTTPS:"
curl -I https://victoriaocara.com 2>/dev/null | head -10

echo ""
echo "========================================================"

if [ "$HTTPS_RESULT" = "200" ] && [ "$HTTP_RESULT" = "301" ]; then
    echo "🎉 SUCCES COMPLET! SITE-UL FUNCȚIONEAZĂ PERFECT!"
    echo ""
    echo "✅ VERIFICĂRI FINALE:"
    echo "   • HTTP redirect: ✅ (301)"
    echo "   • HTTPS funcțional: ✅ (200)"
    echo "   • SSL Let's Encrypt: ✅"
    echo "   • Fără porturi în URL: ✅"
    echo ""
    echo "🌐 ACCESEAZĂ SITE-UL:"
    echo "   https://victoriaocara.com"
    echo ""
    echo "🔧 ADMIN PANEL:"
    echo "   https://victoriaocara.com/admin"
    echo "   Credențiale: admin@victoriaocara.com / AdminVictoria2024!"
    echo ""
    echo "📋 PAGINI DISPONIBILE:"
    echo "   • Homepage: https://victoriaocara.com"
    echo "   • Galerie: https://victoriaocara.com/galerie"
    echo "   • Despre: https://victoriaocara.com/despre"
    echo "   • Contact: https://victoriaocara.com/contact"
    echo "   • Comandă pictură: https://victoriaocara.com/comanda-pictura"
    echo ""
    echo "💡 PENTRU CACHE BROWSER:"
    echo "   • Apasă Ctrl+Shift+R pentru hard refresh"
    echo "   • Sau deschide în modul incognito"
    echo "   • Sau șterge cache-ul browser pentru victoriaocara.com"
    
else
    echo "❌ ÎNCĂ SUNT PROBLEME!"
    echo ""
    echo "🔍 DEBUG INFO:"
    
    if [ "$NEXTJS_STATUS" != "200" ]; then
        echo "   • Next.js nu funcționează pe portul 3000"
        pm2 logs victoriaocara --lines 5 --nostream
    fi
    
    if [ "$HTTPS_RESULT" != "200" ]; then
        echo "   • HTTPS nu funcționează"
        echo "   • Verifică: tail -f /var/log/nginx/victoriaocara-ssl.error.log"
    fi
    
    if [ "$HTTP_RESULT" != "301" ]; then
        echo "   • HTTP redirect nu funcționează"
        echo "   • Verifică configurația Nginx"
    fi
fi

echo "========================================================"