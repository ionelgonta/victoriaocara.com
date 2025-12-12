#!/bin/bash

echo "🔥 OPRIRE FORȚATĂ SERVERE WEB"
echo "============================="

echo "🔍 PASUL 1: Identifică ce ocupă porturile..."

echo "Procese pe portul 80:"
netstat -tulpn | grep :80
lsof -i :80 2>/dev/null || echo "   lsof nu găsește nimic pe portul 80"

echo ""
echo "Procese pe portul 443:"
netstat -tulpn | grep :443
lsof -i :443 2>/dev/null || echo "   lsof nu găsește nimic pe portul 443"

echo ""
echo "🛑 PASUL 2: Oprește toate serverele web..."

# Oprește Apache2 dacă există
systemctl stop apache2 2>/dev/null && echo "   Apache2 oprit" || echo "   Apache2 nu rulează"
systemctl disable apache2 2>/dev/null || echo "   Apache2 nu este instalat"

# Oprește orice proces Nginx existent
pkill -9 -f nginx 2>/dev/null && echo "   Procese nginx oprite" || echo "   Nu există procese nginx"

# Oprește orice proces pe portul 80
echo "   Oprește forțat procese pe portul 80..."
fuser -k 80/tcp 2>/dev/null && echo "   Procese pe portul 80 oprite" || echo "   Portul 80 era liber"

# Oprește orice proces pe portul 443
echo "   Oprește forțat procese pe portul 443..."
fuser -k 443/tcp 2>/dev/null && echo "   Procese pe portul 443 oprite" || echo "   Portul 443 era liber"

# Verifică dacă există alte servere web
echo "   Verifică alte servere web..."
pkill -f "lighttpd\|caddy\|traefik" 2>/dev/null && echo "   Alte servere web oprite" || echo "   Nu există alte servere web"

# Așteaptă să se elibereze porturile
sleep 5

echo ""
echo "🔍 PASUL 3: Verifică porturile după oprire..."

echo "Portul 80 după oprire:"
netstat -tulpn | grep :80 || echo "   ✅ Portul 80 este liber"

echo ""
echo "Portul 443 după oprire:"
netstat -tulpn | grep :443 || echo "   ✅ Portul 443 este liber"

echo ""
echo "🌐 PASUL 4: Configurează Nginx minimal..."

# Șterge toate configurațiile existente
rm -f /etc/nginx/sites-enabled/*
rm -f /etc/nginx/sites-available/victoriaocara.com

# Creează configurația minimală
cat > /etc/nginx/sites-available/victoriaocara.com << 'EOF'
server {
    listen 80;
    server_name victoriaocara.com www.victoriaocara.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Activează configurația
ln -sf /etc/nginx/sites-available/victoriaocara.com /etc/nginx/sites-enabled/

echo "   ✅ Configurația Nginx minimală creată"

echo ""
echo "🧪 PASUL 5: Testează și pornește Nginx..."

# Testează configurația
nginx -t

if [ $? -eq 0 ]; then
    echo "   ✅ Configurația este validă"
    
    # Încearcă să pornească Nginx
    systemctl start nginx
    sleep 3
    
    if systemctl is-active --quiet nginx; then
        echo "   ✅ Nginx pornit cu succes!"
    else
        echo "   ❌ Nginx încă nu pornește - încearcă manual..."
        
        # Încearcă pornirea manuală
        nginx -g "daemon off;" &
        NGINX_PID=$!
        sleep 2
        
        if kill -0 $NGINX_PID 2>/dev/null; then
            echo "   ✅ Nginx pornit manual"
            # Oprește procesul manual și încearcă din nou cu systemctl
            kill $NGINX_PID
            sleep 1
            systemctl start nginx
        else
            echo "   ❌ Nginx nu poate porni deloc"
        fi
    fi
else
    echo "   ❌ Configurația Nginx are erori"
    nginx -t
fi

echo ""
echo "🧪 PASUL 6: Test final complet..."

# Test Next.js direct
echo "1. Test Next.js (localhost:3000):"
NEXTJS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
echo "   Status: $NEXTJS_STATUS"

# Test Nginx local
echo "2. Test Nginx (localhost:80):"
NGINX_LOCAL=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80)
echo "   Status: $NGINX_LOCAL"

# Test prin IP
echo "3. Test prin IP (23.88.113.154):"
IP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://23.88.113.154)
echo "   Status: $IP_STATUS"

# Test extern
echo "4. Test extern (victoriaocara.com):"
EXTERNAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://victoriaocara.com)
echo "   Status: $EXTERNAL_STATUS"

echo ""
echo "📊 Status servicii:"
echo "   MongoDB: $(systemctl is-active mongod)"
echo "   Nginx: $(systemctl is-active nginx)"
echo "   PM2: $(pm2 list | grep victoriaocara | awk '{print $10}' || echo 'unknown')"

echo ""
echo "============================="

if [ "$NEXTJS_STATUS" = "200" ] && [ "$NGINX_LOCAL" = "200" ]; then
    echo "✅ SUCCES TOTAL! Site-ul funcționează!"
    echo ""
    echo "🌐 Accesează site-ul:"
    echo "   http://victoriaocara.com"
    echo "   http://23.88.113.154"
    echo ""
    echo "🔧 Admin panel:"
    echo "   http://victoriaocara.com/admin"
    echo "   Credențiale: admin@victoriaocara.com / AdminVictoria2024!"
    echo ""
    echo "📊 Monitorizare:"
    echo "   pm2 logs victoriaocara"
    echo "   systemctl status nginx"
elif [ "$NEXTJS_STATUS" = "200" ]; then
    echo "⚠️  Next.js funcționează, dar Nginx are probleme"
    echo "   Poți accesa temporar prin: http://23.88.113.154:3000"
    echo "   Sau repară Nginx cu: systemctl restart nginx"
else
    echo "❌ PROBLEME MAJORE!"
    echo ""
    echo "🔍 Debug Next.js:"
    pm2 logs victoriaocara --lines 5 --nostream
    echo ""
    echo "🔍 Debug Nginx:"
    systemctl status nginx --no-pager
fi

echo "============================="