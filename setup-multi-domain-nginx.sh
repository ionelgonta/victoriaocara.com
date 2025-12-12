#!/bin/bash

echo "🌐 CONFIGURARE MULTI-DOMENIU: anyway.ro + victoriaocara.com"
echo "=========================================================="

echo "🔍 PASUL 1: Analizează configurația existentă..."

echo "Verifică configurațiile Nginx existente:"
ls -la /etc/nginx/sites-enabled/
echo ""

echo "Configurația anyway.ro:"
if [ -f "/etc/nginx/sites-available/anyway.ro" ]; then
    echo "   ✅ anyway.ro configurație există"
    head -20 /etc/nginx/sites-available/anyway.ro
elif [ -f "/etc/nginx/sites-enabled/anyway.ro" ]; then
    echo "   ✅ anyway.ro configurație activă"
    head -20 /etc/nginx/sites-enabled/anyway.ro
else
    echo "   ⚠️  Nu găsesc configurația anyway.ro"
    echo "   Configurațiile disponibile:"
    ls -la /etc/nginx/sites-available/
fi

echo ""
echo "Verifică ce rulează pe portul 3000 (victoriaocara):"
netstat -tulpn | grep :3000 || echo "   Nimic pe portul 3000"

echo ""
echo "Verifică ce rulează pe alte porturi pentru anyway.ro:"
netstat -tulpn | grep -E ":(80|443|8080|3001|4000|5000)" || echo "   Doar 80/443 ocupate"

echo ""
echo "📝 PASUL 2: Creează configurația pentru victoriaocara.com..."

# Creează configurația pentru victoriaocara.com fără a afecta anyway.ro
cat > /etc/nginx/sites-available/victoriaocara.com << 'EOF'
# Configurația pentru victoriaocara.com
server {
    listen 80;
    server_name victoriaocara.com www.victoriaocara.com;

    # Redirect la HTTPS (va fi activat după SSL)
    # return 301 https://$server_name$request_uri;

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
    }

    # Optimizări pentru Next.js
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
    access_log /var/log/nginx/victoriaocara.access.log;
    error_log /var/log/nginx/victoriaocara.error.log;
}

# Configurația HTTPS pentru victoriaocara.com (va fi completată de certbot)
# server {
#     listen 443 ssl;
#     server_name victoriaocara.com www.victoriaocara.com;
#     
#     # Certificatele SSL vor fi adăugate de certbot
#     
#     location / {
#         proxy_pass http://127.0.0.1:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#     }
# }
EOF

echo "   ✅ Configurația victoriaocara.com creată"

echo ""
echo "🔗 PASUL 3: Activează configurația victoriaocara.com..."

# Activează configurația (fără a dezactiva anyway.ro)
ln -sf /etc/nginx/sites-available/victoriaocara.com /etc/nginx/sites-enabled/

echo "   ✅ victoriaocara.com activat în sites-enabled"

echo ""
echo "📋 PASUL 4: Verifică configurațiile active..."

echo "Site-uri active în Nginx:"
ls -la /etc/nginx/sites-enabled/

echo ""
echo "🧪 PASUL 5: Testează configurația Nginx..."

nginx -t

if [ $? -eq 0 ]; then
    echo "   ✅ Configurația Nginx este validă pentru ambele site-uri"
else
    echo "   ❌ Configurația Nginx are erori"
    nginx -t
    exit 1
fi

echo ""
echo "🔄 PASUL 6: Reîncarcă Nginx (fără a opri anyway.ro)..."

# Reîncarcă configurația fără restart complet
systemctl reload nginx

if [ $? -eq 0 ]; then
    echo "   ✅ Nginx reîncărcat cu succes"
else
    echo "   ⚠️  Nginx reload a eșuat, încearcă restart..."
    systemctl restart nginx
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Nginx restartat cu succes"
    else
        echo "   ❌ Nginx nu a putut fi restartat"
        systemctl status nginx --no-pager
        exit 1
    fi
fi

echo ""
echo "🧪 PASUL 7: Testează ambele site-uri..."

echo "1. Test anyway.ro:"
ANYWAY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://anyway.ro 2>/dev/null || echo "000")
echo "   http://anyway.ro: $ANYWAY_STATUS"

echo ""
echo "2. Test victoriaocara.com:"
VICTORIA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://victoriaocara.com 2>/dev/null || echo "000")
echo "   http://victoriaocara.com: $VICTORIA_STATUS"

echo ""
echo "3. Test prin IP (ar trebui să servească anyway.ro ca default):"
IP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://23.88.113.154 2>/dev/null || echo "000")
echo "   http://23.88.113.154: $IP_STATUS"

echo ""
echo "🔍 PASUL 8: Verifică serviciile..."

echo "Statusul serviciilor:"
echo "   Nginx: $(systemctl is-active nginx)"
echo "   MongoDB (pentru victoriaocara): $(systemctl is-active mongod)"

echo ""
echo "PM2 pentru victoriaocara:"
pm2 status

echo ""
echo "Porturile ocupate:"
netstat -tulpn | grep -E ":(80|443|3000)" || echo "   Nu găsesc porturile așteptate"

echo ""
echo "=========================================================="

if [ "$ANYWAY_STATUS" = "200" ] && [ "$VICTORIA_STATUS" = "200" ]; then
    echo "✅ SUCCES COMPLET! Ambele site-uri funcționează!"
    echo ""
    echo "🌐 SITE-URI ACTIVE:"
    echo "   📍 anyway.ro: http://anyway.ro"
    echo "   🎨 victoriaocara.com: http://victoriaocara.com"
    echo ""
    echo "🔧 ADMIN PANELS:"
    echo "   anyway.ro: (verifică configurația existentă)"
    echo "   victoriaocara.com: http://victoriaocara.com/admin"
    echo "   Credențiale Victoria: admin@victoriaocara.com / AdminVictoria2024!"
    echo ""
    echo "📊 MONITORIZARE:"
    echo "   Nginx logs: tail -f /var/log/nginx/access.log"
    echo "   Victoria logs: pm2 logs victoriaocara"
    echo "   Victoria specific: tail -f /var/log/nginx/victoriaocara.access.log"
    echo ""
    echo "🔒 URMĂTORUL PAS - SSL pentru victoriaocara.com:"
    echo "   certbot --nginx -d victoriaocara.com -d www.victoriaocara.com"
    echo ""
    echo "💡 NOTĂ: anyway.ro rămâne neschimbat și funcțional"
    
elif [ "$ANYWAY_STATUS" = "200" ]; then
    echo "⚠️  anyway.ro funcționează, dar victoriaocara.com are probleme"
    echo ""
    echo "🔍 VERIFICĂ:"
    echo "   • Next.js rulează pe port 3000: pm2 logs victoriaocara"
    echo "   • DNS pentru victoriaocara.com pointează la 23.88.113.154"
    echo "   • Configurația Nginx: nginx -t"
    
elif [ "$VICTORIA_STATUS" = "200" ]; then
    echo "⚠️  victoriaocara.com funcționează, dar anyway.ro are probleme"
    echo "   Verifică configurația anyway.ro"
    
else
    echo "❌ PROBLEME CU AMBELE SITE-URI"
    echo ""
    echo "🔍 DEBUG:"
    echo "   Nginx status: systemctl status nginx"
    echo "   Nginx logs: journalctl -u nginx --no-pager | tail -10"
    echo "   Test local: curl http://localhost"
fi

echo "=========================================================="