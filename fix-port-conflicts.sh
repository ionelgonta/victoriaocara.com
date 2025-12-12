#!/bin/bash

echo "🔧 REPARARE CONFLICTE PORTURI"
echo "=============================="

echo "🔍 PASUL 1: Identifică ce ocupă porturile..."

echo "Portul 80:"
netstat -tulpn | grep :80 || echo "   Portul 80 este liber"

echo ""
echo "Portul 443:"
netstat -tulpn | grep :443 || echo "   Portul 443 este liber"

echo ""
echo "Portul 3000:"
netstat -tulpn | grep :3000 || echo "   Portul 3000 este liber"

echo ""
echo "🛑 PASUL 2: Oprește procesele care blochează porturile..."

# Oprește orice proces pe portul 80
echo "Oprește procese pe portul 80..."
fuser -k 80/tcp 2>/dev/null || echo "   Nimic de oprit pe portul 80"

# Oprește orice proces pe portul 443
echo "Oprește procese pe portul 443..."
fuser -k 443/tcp 2>/dev/null || echo "   Nimic de oprit pe portul 443"

# Verifică dacă există alte servere web
echo ""
echo "Verifică alte servere web..."
systemctl stop apache2 2>/dev/null || echo "   Apache2 nu rulează"
systemctl disable apache2 2>/dev/null || echo "   Apache2 nu este instalat"

# Oprește orice instanță Nginx
pkill -f nginx 2>/dev/null || echo "   Nu există procese nginx de oprit"

sleep 3

echo ""
echo "🌐 PASUL 3: Configurează Nginx simplu (doar HTTP)..."

# Creează o configurație simplă doar pentru HTTP
cat > /etc/nginx/sites-available/victoriaocara.com << 'EOF'
server {
    listen 80;
    server_name victoriaocara.com www.victoriaocara.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

# Dezactivează configurația default
rm -f /etc/nginx/sites-enabled/default

# Activează configurația noastră
ln -sf /etc/nginx/sites-available/victoriaocara.com /etc/nginx/sites-enabled/

echo "   ✅ Configurația Nginx creată (doar HTTP)"

echo ""
echo "🧪 PASUL 4: Testează și pornește Nginx..."

# Testează configurația
nginx -t

if [ $? -eq 0 ]; then
    echo "   ✅ Configurația Nginx este validă"
    
    # Pornește Nginx
    systemctl start nginx
    
    # Verifică dacă a pornit
    sleep 2
    
    if systemctl is-active --quiet nginx; then
        echo "   ✅ Nginx pornit cu succes"
    else
        echo "   ❌ Nginx nu a pornit - încearcă din nou..."
        systemctl status nginx --no-pager -l
    fi
else
    echo "   ❌ Configurația Nginx are erori"
    nginx -t
fi

echo ""
echo "🔍 PASUL 5: Verifică statusul final..."

echo "Servicii:"
echo "   MongoDB: $(systemctl is-active mongod)"
echo "   Nginx: $(systemctl is-active nginx)"

echo ""
echo "PM2 Status:"
pm2 status

echo ""
echo "Porturi ocupate:"
echo "   Port 80: $(netstat -tulpn | grep :80 | wc -l) conexiuni"
echo "   Port 443: $(netstat -tulpn | grep :443 | wc -l) conexiuni"
echo "   Port 3000: $(netstat -tulpn | grep :3000 | wc -l) conexiuni"

echo ""
echo "🧪 PASUL 6: Test final..."

# Test aplicația Next.js direct
echo "Test Next.js (localhost:3000):"
NEXTJS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
echo "   Status: $NEXTJS_STATUS"

# Test prin Nginx
echo "Test prin Nginx (localhost:80):"
NGINX_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80)
echo "   Status: $NGINX_STATUS"

# Test extern
echo "Test extern (victoriaocara.com):"
EXTERNAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://victoriaocara.com)
echo "   Status: $EXTERNAL_STATUS"

echo ""
echo "=============================="

if [ "$NEXTJS_STATUS" = "200" ] && [ "$NGINX_STATUS" = "200" ]; then
    echo "✅ SUCCES! Site-ul funcționează!"
    echo ""
    echo "🌐 Accesează site-ul:"
    echo "   http://victoriaocara.com"
    echo "   http://www.victoriaocara.com"
    echo ""
    echo "🔧 Admin panel:"
    echo "   http://victoriaocara.com/admin"
    echo ""
    echo "📊 Monitorizare:"
    echo "   pm2 logs victoriaocara"
    echo "   systemctl status nginx"
    echo ""
    echo "💡 Pentru HTTPS (mai târziu):"
    echo "   Instalează SSL cu: certbot --nginx -d victoriaocara.com"
else
    echo "❌ ÎNCĂ SUNT PROBLEME!"
    echo ""
    echo "🔍 Debug:"
    if [ "$NEXTJS_STATUS" != "200" ]; then
        echo "   Next.js nu răspunde pe portul 3000"
        pm2 logs victoriaocara --lines 5 --nostream
    fi
    
    if [ "$NGINX_STATUS" != "200" ]; then
        echo "   Nginx nu răspunde pe portul 80"
        systemctl status nginx --no-pager
    fi
fi

echo "=============================="