#!/bin/bash

echo "💥 CURĂȚARE NUCLEARĂ PORTURI 80/443"
echo "===================================="

echo "🔍 PASUL 1: Identifică EXACT ce ocupă porturile..."

echo "Procese pe portul 80:"
netstat -tulpn | grep :80
echo ""
lsof -i :80 2>/dev/null || echo "lsof nu găsește nimic pe 80"
echo ""
ss -tulpn | grep :80 || echo "ss nu găsește nimic pe 80"

echo ""
echo "Procese pe portul 443:"
netstat -tulpn | grep :443
echo ""
lsof -i :443 2>/dev/null || echo "lsof nu găsește nimic pe 443"
echo ""
ss -tulpn | grep :443 || echo "ss nu găsește nimic pe 443"

echo ""
echo "Toate procesele nginx:"
ps aux | grep nginx | grep -v grep || echo "Nu există procese nginx"

echo ""
echo "Toate procesele apache:"
ps aux | grep apache | grep -v grep || echo "Nu există procese apache"

echo ""
echo "💀 PASUL 2: OMOARĂ TOT ce poate ocupa porturile..."

# Oprește toate serviciile web cunoscute
systemctl stop nginx 2>/dev/null || echo "nginx nu rula"
systemctl stop apache2 2>/dev/null || echo "apache2 nu rula"
systemctl stop lighttpd 2>/dev/null || echo "lighttpd nu rula"
systemctl stop caddy 2>/dev/null || echo "caddy nu rula"

# Omoară toate procesele nginx
pkill -9 nginx 2>/dev/null || echo "Nu există procese nginx de omorât"

# Omoară toate procesele apache
pkill -9 apache2 2>/dev/null || echo "Nu există procese apache de omorât"
pkill -9 httpd 2>/dev/null || echo "Nu există procese httpd de omorât"

# Omoară orice proces pe portul 80
echo "Omoară procese pe portul 80..."
fuser -k 80/tcp 2>/dev/null || echo "Portul 80 era liber"

# Omoară orice proces pe portul 443  
echo "Omoară procese pe portul 443..."
fuser -k 443/tcp 2>/dev/null || echo "Portul 443 era liber"

# Folosește lsof pentru a omorî procese specifice
for pid in $(lsof -t -i:80 2>/dev/null); do
    echo "Omoară procesul $pid pe portul 80"
    kill -9 $pid 2>/dev/null || echo "Nu s-a putut omorî $pid"
done

for pid in $(lsof -t -i:443 2>/dev/null); do
    echo "Omoară procesul $pid pe portul 443"
    kill -9 $pid 2>/dev/null || echo "Nu s-a putut omorî $pid"
done

# Așteaptă să se elibereze porturile
sleep 5

echo ""
echo "🔍 PASUL 3: Verifică că porturile sunt libere..."

PORT_80_CHECK=$(netstat -tulpn | grep :80 | wc -l)
PORT_443_CHECK=$(netstat -tulpn | grep :443 | wc -l)

echo "Portul 80: $PORT_80_CHECK conexiuni"
echo "Portul 443: $PORT_443_CHECK conexiuni"

if [ "$PORT_80_CHECK" -eq 0 ] && [ "$PORT_443_CHECK" -eq 0 ]; then
    echo "   ✅ Porturile 80 și 443 sunt LIBERE!"
else
    echo "   ❌ Porturile încă sunt ocupate:"
    netstat -tulpn | grep -E ":(80|443)"
    
    echo ""
    echo "🔥 FORȚEAZĂ eliberarea cu iptables..."
    
    # Blochează temporar traficul pe aceste porturi pentru a forța închiderea conexiunilor
    iptables -A INPUT -p tcp --dport 80 -j DROP 2>/dev/null || echo "iptables nu funcționează"
    iptables -A INPUT -p tcp --dport 443 -j DROP 2>/dev/null || echo "iptables nu funcționează"
    
    sleep 2
    
    # Elimină regulile
    iptables -D INPUT -p tcp --dport 80 -j DROP 2>/dev/null || echo "Regula 80 nu există"
    iptables -D INPUT -p tcp --dport 443 -j DROP 2>/dev/null || echo "Regula 443 nu există"
    
    sleep 2
    
    # Verifică din nou
    PORT_80_FINAL=$(netstat -tulpn | grep :80 | wc -l)
    PORT_443_FINAL=$(netstat -tulpn | grep :443 | wc -l)
    
    echo "După forțare - Portul 80: $PORT_80_FINAL, Portul 443: $PORT_443_FINAL"
fi

echo ""
echo "🌐 PASUL 4: Configurează Nginx cu bind explicit..."

# Șterge toate configurațiile
rm -rf /etc/nginx/sites-enabled/*
rm -rf /etc/nginx/sites-available/victoriaocara.com

# Creează configurația cu bind explicit
cat > /etc/nginx/sites-available/victoriaocara.com << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name victoriaocara.com www.victoriaocara.com _;

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
}
EOF

# Activează configurația
ln -sf /etc/nginx/sites-available/victoriaocara.com /etc/nginx/sites-enabled/

echo "   ✅ Configurația Nginx cu bind explicit creată"

echo ""
echo "🧪 PASUL 5: Testează configurația..."

nginx -t

if [ $? -eq 0 ]; then
    echo "   ✅ Configurația este validă"
else
    echo "   ❌ Configurația are erori"
    nginx -t
    exit 1
fi

echo ""
echo "🚀 PASUL 6: Pornește Nginx cu debugging..."

# Încearcă să pornească nginx în modul debug
echo "Pornește nginx în foreground pentru debugging..."
timeout 10s nginx -g "daemon off; error_log /dev/stderr debug;" &
NGINX_PID=$!

sleep 3

if kill -0 $NGINX_PID 2>/dev/null; then
    echo "   ✅ Nginx pornește în foreground"
    kill $NGINX_PID
    
    # Acum pornește normal
    systemctl start nginx
    
    if systemctl is-active --quiet nginx; then
        echo "   ✅ Nginx pornit cu succes prin systemctl!"
    else
        echo "   ❌ Nginx nu pornește prin systemctl"
        
        # Încearcă pornirea manuală
        echo "   Încearcă pornirea manuală..."
        nginx
        
        if pgrep nginx > /dev/null; then
            echo "   ✅ Nginx pornit manual"
        else
            echo "   ❌ Nginx nu pornește deloc"
        fi
    fi
else
    echo "   ❌ Nginx nu pornește nici în foreground"
    
    # Verifică ce eroare dă
    echo "   Eroarea exactă:"
    nginx -g "daemon off;" 2>&1 | head -5
fi

echo ""
echo "🧪 PASUL 7: Test final..."

# Verifică dacă nginx rulează
if pgrep nginx > /dev/null; then
    echo "✅ Nginx rulează!"
    
    # Test local
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80)
    echo "   Test localhost:80: $HTTP_STATUS"
    
    # Test prin IP
    IP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://23.88.113.154)
    echo "   Test 23.88.113.154: $IP_STATUS"
    
    # Test prin domeniu
    DOMAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://victoriaocara.com)
    echo "   Test victoriaocara.com: $DOMAIN_STATUS"
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo ""
        echo "✅ SUCCES! Nginx funcționează și servește site-ul!"
        echo "🌐 Accesează: http://victoriaocara.com"
    else
        echo ""
        echo "⚠️  Nginx rulează dar nu servește corect site-ul"
    fi
else
    echo "❌ Nginx încă nu rulează"
    
    echo ""
    echo "🔍 Informații de debug:"
    echo "Statusul nginx:"
    systemctl status nginx --no-pager -l
    
    echo ""
    echo "Logurile nginx:"
    journalctl -u nginx --no-pager -l | tail -10
fi

echo ""
echo "===================================="