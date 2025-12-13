#!/bin/bash

echo "🔄 FORȚARE VERSIUNE NOUĂ - CURĂȚARE CACHE COMPLET"
echo "================================================="

cd /opt/victoriaocara

echo "🔍 PASUL 1: Verifică versiunea curentă..."

echo "Test versiunea curentă:"
curl -s https://victoriaocara.com | grep -o '<title>.*</title>' || echo "Nu găsesc title"

echo ""
echo "PM2 status:"
pm2 status

echo ""
echo "🛑 PASUL 2: Oprește aplicația complet..."

pm2 stop victoriaocara
pm2 delete victoriaocara

echo "   ✅ Aplicația oprită"

echo ""
echo "🧹 PASUL 3: Curăță COMPLET cache-ul Next.js..."

# Șterge tot cache-ul Next.js
rm -rf .next
rm -rf node_modules/.cache
rm -rf .next/cache
rm -rf .next/server
rm -rf .next/static

# Șterge și cache-ul npm
npm cache clean --force

echo "   ✅ Cache-ul Next.js șters complet"

echo ""
echo "📥 PASUL 4: Trage ultimele modificări din GitHub..."

git fetch origin
git reset --hard origin/main
git pull origin main

echo "   ✅ Cod actualizat din GitHub"

echo ""
echo "🔨 PASUL 5: Reconstruiește aplicația complet..."

echo "   Instalează dependențele..."
npm install

echo "   Construiește aplicația..."
npm run build

if [ $? -eq 0 ]; then
    echo "   ✅ Build reușit"
else
    echo "   ❌ Build eșuat"
    exit 1
fi

echo ""
echo "🚀 PASUL 6: Pornește aplicația cu configurația nouă..."

# Pornește cu scriptul personalizat pentru conexiuni externe
pm2 start start-server.js --name "victoriaocara"

echo "   Așteaptă pornirea aplicației..."
sleep 10

echo ""
echo "🧪 PASUL 7: Testează versiunea nouă..."

echo "PM2 status după restart:"
pm2 status

echo ""
echo "Test Next.js direct pe portul 3000:"
NEXTJS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
echo "   localhost:3000: $NEXTJS_STATUS"

if [ "$NEXTJS_STATUS" = "200" ]; then
    echo "   ✅ Next.js funcționează"
    
    echo ""
    echo "   Conținutul homepage Next.js:"
    curl -s http://localhost:3000 | grep -o '<title>.*</title>' || echo "Nu găsesc title"
else
    echo "   ❌ Next.js nu funcționează"
    pm2 logs victoriaocara --lines 10 --nostream
fi

echo ""
echo "🌐 PASUL 8: Testează prin HTTPS..."

echo "Test HTTPS victoriaocara.com:"
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://victoriaocara.com)
echo "   https://victoriaocara.com: $HTTPS_STATUS"

if [ "$HTTPS_STATUS" = "200" ]; then
    echo "   ✅ HTTPS funcționează"
    
    echo ""
    echo "   Conținutul homepage HTTPS:"
    curl -s https://victoriaocara.com | grep -o '<title>.*</title>' || echo "Nu găsesc title"
    
    echo ""
    echo "   Headers cache:"
    curl -I https://victoriaocara.com 2>/dev/null | grep -i cache
else
    echo "   ❌ HTTPS nu funcționează"
fi

echo ""
echo "🔧 PASUL 9: Configurează Nginx pentru cache fresh..."

# Actualizează configurația Nginx pentru a forța no-cache
cat > /tmp/nginx-no-cache.conf << 'EOF'
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
        
        # Headers pentru cache fresh - FORȚEAZĂ NO CACHE
        add_header Cache-Control "no-cache, no-store, must-revalidate, max-age=0" always;
        add_header Pragma "no-cache" always;
        add_header Expires "Thu, 01 Jan 1970 00:00:00 GMT" always;
        
        # Previne cache-ul proxy
        proxy_no_cache 1;
        proxy_cache_bypass 1;
    }
EOF

# Înlocuiește secțiunea location / în configurația Nginx
sed -i '/# Proxy la aplicația Next.js pe portul 3000/,/}/c\
    # Proxy la aplicația Next.js pe portul 3000\
    location / {\
        proxy_pass http://127.0.0.1:3000;\
        proxy_http_version 1.1;\
        proxy_set_header Upgrade $http_upgrade;\
        proxy_set_header Connection '\''upgrade'\'';\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        proxy_set_header X-Forwarded-Host $host;\
        proxy_cache_bypass $http_upgrade;\
        proxy_read_timeout 86400;\
        proxy_connect_timeout 60;\
        proxy_send_timeout 60;\
        \
        # Headers pentru cache fresh - FORȚEAZĂ NO CACHE\
        add_header Cache-Control "no-cache, no-store, must-revalidate, max-age=0" always;\
        add_header Pragma "no-cache" always;\
        add_header Expires "Thu, 01 Jan 1970 00:00:00 GMT" always;\
        \
        # Previne cache-ul proxy\
        proxy_no_cache 1;\
        proxy_cache_bypass 1;\
    }' /etc/nginx/sites-available/victoriaocara-ssl

echo "   ✅ Configurația Nginx actualizată pentru no-cache"

echo ""
echo "🔄 PASUL 10: Reîncarcă Nginx..."

nginx -t

if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo "   ✅ Nginx reîncărcat"
else
    echo "   ❌ Configurația Nginx are erori"
    nginx -t
fi

echo ""
echo "⏳ PASUL 11: Așteaptă propagarea modificărilor..."
sleep 5

echo ""
echo "🧪 PASUL 12: TEST FINAL - VERSIUNE NOUĂ..."

echo "Test final HTTPS cu headers no-cache:"
FINAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://victoriaocara.com)
echo "   Status: $FINAL_STATUS"

echo ""
echo "Headers cache finale:"
curl -I https://victoriaocara.com 2>/dev/null | grep -i -E "(cache|pragma|expires)"

echo ""
echo "Conținut homepage final:"
curl -s https://victoriaocara.com | grep -o '<title>.*</title>' || echo "Nu găsesc title"

echo ""
echo "================================================="

if [ "$FINAL_STATUS" = "200" ]; then
    echo "✅ SUCCES! Versiunea nouă este forțată!"
    echo ""
    echo "🌐 ACCESEAZĂ SITE-UL ACUM:"
    echo "   https://victoriaocara.com"
    echo ""
    echo "💡 PENTRU BROWSER:"
    echo "   1. Apasă Ctrl+Shift+R (hard refresh)"
    echo "   2. Sau deschide în modul incognito"
    echo "   3. Sau șterge cache-ul pentru victoriaocara.com"
    echo ""
    echo "🔧 HEADERS NO-CACHE ACTIVE:"
    echo "   ✅ Cache-Control: no-cache, no-store"
    echo "   ✅ Pragma: no-cache"
    echo "   ✅ Expires: în trecut"
    echo ""
    echo "📊 MONITORIZARE:"
    echo "   pm2 logs victoriaocara"
    echo "   tail -f /var/log/nginx/victoriaocara-ssl.access.log"
    
else
    echo "❌ ÎNCĂ SUNT PROBLEME!"
    echo ""
    echo "🔍 DEBUG:"
    pm2 logs victoriaocara --lines 10 --nostream
fi

echo "================================================="