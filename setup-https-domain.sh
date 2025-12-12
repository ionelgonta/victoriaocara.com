#!/bin/bash

echo "🔒 CONFIGURARE HTTPS ȘI DOMENIU FĂRĂ PORTURI"
echo "============================================="

echo "🔍 PASUL 1: Verifică că Next.js funcționează..."

# Verifică că aplicația rulează pe 3000
NEXTJS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$NEXTJS_STATUS" != "200" ]; then
    echo "❌ Next.js nu funcționează pe portul 3000"
    echo "   Rulează mai întâi: ./fix-nextjs-config-and-build.sh"
    exit 1
fi

echo "   ✅ Next.js funcționează pe portul 3000"

echo ""
echo "🛑 PASUL 2: Oprește și curăță Nginx complet..."

# Oprește Nginx
systemctl stop nginx 2>/dev/null || echo "   Nginx nu rula"

# Omoară orice proces nginx rămas
pkill -9 -f nginx 2>/dev/null || echo "   Nu există procese nginx"

# Oprește orice proces pe porturile 80 și 443
fuser -k 80/tcp 2>/dev/null || echo "   Portul 80 era liber"
fuser -k 443/tcp 2>/dev/null || echo "   Portul 443 era liber"

sleep 3

echo "   ✅ Nginx și porturile curățate"

echo ""
echo "📝 PASUL 3: Creează configurația Nginx corectă..."

# Șterge configurațiile vechi
rm -f /etc/nginx/sites-enabled/*
rm -f /etc/nginx/sites-available/victoriaocara.com

# Creează configurația pentru HTTP (temporar)
cat > /etc/nginx/sites-available/victoriaocara.com << 'EOF'
server {
    listen 80;
    server_name victoriaocara.com www.victoriaocara.com;

    # Redirect la HTTPS (va fi activat după SSL)
    # return 301 https://$server_name$request_uri;

    # Temporar - servește direct prin HTTP
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

    # Gestionează fișierele statice
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gestionează imaginile
    location /images/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 1d;
    }
}
EOF

# Activează configurația
ln -sf /etc/nginx/sites-available/victoriaocara.com /etc/nginx/sites-enabled/

echo "   ✅ Configurația Nginx HTTP creată"

echo ""
echo "🧪 PASUL 4: Testează și pornește Nginx..."

# Testează configurația
nginx -t

if [ $? -eq 0 ]; then
    echo "   ✅ Configurația Nginx este validă"
    
    # Pornește Nginx
    systemctl start nginx
    sleep 3
    
    if systemctl is-active --quiet nginx; then
        echo "   ✅ Nginx pornit cu succes"
    else
        echo "   ❌ Nginx nu a pornit"
        systemctl status nginx --no-pager
        exit 1
    fi
else
    echo "   ❌ Configurația Nginx are erori"
    nginx -t
    exit 1
fi

echo ""
echo "🌐 PASUL 5: Testează accesul prin domeniu..."

echo "Test HTTP prin domeniu:"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://victoriaocara.com)
echo "   http://victoriaocara.com: $HTTP_STATUS"

echo ""
echo "Test HTTP prin www:"
WWW_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://www.victoriaocara.com)
echo "   http://www.victoriaocara.com: $WWW_STATUS"

if [ "$HTTP_STATUS" = "200" ] || [ "$WWW_STATUS" = "200" ]; then
    echo "   ✅ Site-ul este accesibil prin domeniu!"
    
    echo ""
    echo "🔒 PASUL 6: Configurează HTTPS cu Let's Encrypt..."
    
    # Verifică dacă certbot este instalat
    if ! command -v certbot &> /dev/null; then
        echo "   Instalează certbot..."
        apt update
        apt install -y certbot python3-certbot-nginx
    fi
    
    echo "   Obține certificatul SSL..."
    
    # Obține certificatul SSL
    certbot --nginx -d victoriaocara.com -d www.victoriaocara.com --non-interactive --agree-tos --email admin@victoriaocara.com --redirect
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Certificatul SSL instalat cu succes!"
        
        # Repornește Nginx cu noua configurație SSL
        systemctl reload nginx
        
        echo ""
        echo "🧪 PASUL 7: Testează HTTPS..."
        
        HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://victoriaocara.com)
        echo "   https://victoriaocara.com: $HTTPS_STATUS"
        
        if [ "$HTTPS_STATUS" = "200" ]; then
            echo "   ✅ HTTPS funcționează perfect!"
        else
            echo "   ⚠️  HTTPS nu funcționează încă - verifică certificatul"
        fi
    else
        echo "   ⚠️  Certificatul SSL nu s-a putut instala"
        echo "   Site-ul funcționează pe HTTP: http://victoriaocara.com"
    fi
else
    echo "   ❌ Site-ul nu este accesibil prin domeniu"
    echo "   Verifică DNS-ul pentru victoriaocara.com"
fi

echo ""
echo "🔧 PASUL 8: Configurează auto-renewal pentru SSL..."

# Configurează cron job pentru renewal automat
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "   ✅ Auto-renewal SSL configurat"

echo ""
echo "============================================="

# Status final
FINAL_HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://victoriaocara.com 2>/dev/null || echo "000")
FINAL_HTTPS=$(curl -s -o /dev/null -w "%{http_code}" https://victoriaocara.com 2>/dev/null || echo "000")

echo "📊 STATUS FINAL:"
echo "   MongoDB: $(systemctl is-active mongod)"
echo "   Nginx: $(systemctl is-active nginx)"
echo "   Next.js: $(pm2 list | grep victoriaocara | awk '{print $10}' || echo 'unknown')"

echo ""
echo "🌐 ACCESIBILITATE:"
echo "   HTTP (victoriaocara.com): $FINAL_HTTP"
echo "   HTTPS (victoriaocara.com): $FINAL_HTTPS"

echo ""
if [ "$FINAL_HTTPS" = "200" ]; then
    echo "✅ SUCCES COMPLET! Site-ul funcționează cu HTTPS!"
    echo ""
    echo "🌐 ACCESEAZĂ SITE-UL:"
    echo "   https://victoriaocara.com (HTTPS - securizat)"
    echo "   http://victoriaocara.com (redirect automat la HTTPS)"
    echo ""
    echo "🔧 ADMIN PANEL:"
    echo "   https://victoriaocara.com/admin"
    echo "   Credențiale: admin@victoriaocara.com / AdminVictoria2024!"
    echo ""
    echo "📋 TOATE PAGINILE (HTTPS):"
    echo "   • Homepage: https://victoriaocara.com"
    echo "   • Galerie: https://victoriaocara.com/galerie"
    echo "   • Despre: https://victoriaocara.com/despre"
    echo "   • Contact: https://victoriaocara.com/contact"
    echo "   • Comandă pictură: https://victoriaocara.com/comanda-pictura"
    echo ""
    echo "🔒 SECURITATE:"
    echo "   ✅ Certificat SSL valid"
    echo "   ✅ Redirect automat HTTP → HTTPS"
    echo "   ✅ Auto-renewal SSL configurat"
elif [ "$FINAL_HTTP" = "200" ]; then
    echo "⚠️  Site-ul funcționează pe HTTP, HTTPS în curs de configurare"
    echo ""
    echo "🌐 ACCESEAZĂ SITE-UL:"
    echo "   http://victoriaocara.com"
    echo ""
    echo "💡 Pentru HTTPS, rulează manual:"
    echo "   certbot --nginx -d victoriaocara.com -d www.victoriaocara.com"
else
    echo "❌ PROBLEME CU ACCESUL PRIN DOMENIU"
    echo ""
    echo "🔍 VERIFICĂ:"
    echo "   • DNS pentru victoriaocara.com pointează la 23.88.113.154"
    echo "   • Nginx status: systemctl status nginx"
    echo "   • Next.js logs: pm2 logs victoriaocara"
fi

echo "============================================="