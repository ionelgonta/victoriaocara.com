#!/bin/bash

echo "🔍 IDENTIFICARE ȘI REPARARE SERVER WEB"
echo "======================================"

echo "🔍 PASUL 1: Identifică EXACT ce rulează pe porturile 80/443..."

echo "Procese pe portul 80:"
netstat -tulpn | grep :80
echo ""
lsof -i :80 2>/dev/null || echo "lsof nu găsește nimic pe 80"
echo ""

echo "Procese pe portul 443:"
netstat -tulpn | grep :443
echo ""
lsof -i :443 2>/dev/null || echo "lsof nu găsește nimic pe 443"
echo ""

echo "Toate procesele web active:"
ps aux | grep -E "(nginx|apache|httpd|lighttpd|caddy|node)" | grep -v grep || echo "Nu găsesc procese web"

echo ""
echo "🌐 PASUL 2: Testează anyway.ro pentru a vedea ce server îl servește..."

echo "Test anyway.ro cu headers:"
curl -I http://anyway.ro 2>/dev/null || echo "anyway.ro nu răspunde"

echo ""
echo "Test prin IP pentru a vedea serverul default:"
curl -I http://23.88.113.154 2>/dev/null || echo "IP-ul nu răspunde"

echo ""
echo "🔍 PASUL 3: Caută configurațiile web existente..."

echo "Configurații Nginx:"
ls -la /etc/nginx/sites-available/ 2>/dev/null || echo "Nu există /etc/nginx/sites-available/"
echo ""

echo "Configurații Apache:"
ls -la /etc/apache2/sites-available/ 2>/dev/null || echo "Nu există /etc/apache2/sites-available/"
echo ""

echo "Procese Node.js (pentru anyway.ro):"
ps aux | grep node | grep -v grep || echo "Nu rulează procese Node.js"

echo ""
echo "PM2 procese:"
pm2 list 2>/dev/null || echo "PM2 nu este disponibil sau nu are procese"

echo ""
echo "🛠️ PASUL 4: Strategia de reparare..."

# Verifică dacă anyway.ro rulează pe un port diferit
echo "Verifică porturile non-standard pentru anyway.ro:"
netstat -tulpn | grep -E ":(3001|4000|5000|8000|8080|8888)" || echo "Nu găsesc porturi non-standard"

echo ""
echo "🔧 PASUL 5: Încearcă să identifici cum rulează anyway.ro..."

# Verifică dacă anyway.ro este servit de un proces Node.js direct
if pgrep -f "anyway" > /dev/null; then
    echo "✅ Găsit proces pentru anyway:"
    ps aux | grep anyway | grep -v grep
else
    echo "❌ Nu găsesc proces specific pentru anyway"
fi

echo ""
echo "🚀 PASUL 6: Soluție - Rulează anyway.ro pe alt port și Nginx ca proxy..."

# Verifică dacă anyway.ro rulează pe un port specific
ANYWAY_PORT=""
for port in 3001 4000 5000 8000 8080; do
    if netstat -tulpn | grep ":$port" > /dev/null; then
        echo "Găsit proces pe portul $port:"
        netstat -tulpn | grep ":$port"
        
        # Testează dacă e anyway.ro
        TEST_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port 2>/dev/null)
        if [ "$TEST_RESPONSE" = "200" ]; then
            echo "   Portul $port răspunde cu 200 - posibil anyway.ro"
            ANYWAY_PORT=$port
            break
        fi
    fi
done

if [ -n "$ANYWAY_PORT" ]; then
    echo ""
    echo "✅ anyway.ro pare să ruleze pe portul $ANYWAY_PORT"
    echo "   Voi configura Nginx să facă proxy pentru ambele site-uri"
    
    # Creează configurația Nginx pentru ambele site-uri
    cat > /etc/nginx/sites-available/multi-sites << EOF
# Configurația pentru anyway.ro
server {
    listen 80;
    server_name anyway.ro www.anyway.ro;

    location / {
        proxy_pass http://127.0.0.1:$ANYWAY_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    access_log /var/log/nginx/anyway.access.log;
    error_log /var/log/nginx/anyway.error.log;
}

# Configurația pentru victoriaocara.com
server {
    listen 80;
    server_name victoriaocara.com www.victoriaocara.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Optimizări Next.js
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    access_log /var/log/nginx/victoriaocara.access.log;
    error_log /var/log/nginx/victoriaocara.error.log;
}

# Server default pentru IP direct
server {
    listen 80 default_server;
    server_name _;
    
    # Redirect la anyway.ro ca default
    return 301 http://anyway.ro\$request_uri;
}
EOF

    echo "   ✅ Configurația multi-sites creată"
    
else
    echo ""
    echo "❌ Nu pot identifica pe ce port rulează anyway.ro"
    echo "   Voi crea o configurație generică"
    
    # Configurație generică - anyway.ro pe 8080, victoriaocara pe 3000
    cat > /etc/nginx/sites-available/multi-sites << 'EOF'
# Configurația pentru anyway.ro (presupun că rulează pe 8080)
server {
    listen 80;
    server_name anyway.ro www.anyway.ro;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Configurația pentru victoriaocara.com
server {
    listen 80;
    server_name victoriaocara.com www.victoriaocara.com;

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
    }
}
EOF

    echo "   ⚠️  Configurația generică creată - poate necesita ajustări"
fi

echo ""
echo "🔄 PASUL 7: Activează noua configurație..."

# Dezactivează configurațiile vechi
rm -f /etc/nginx/sites-enabled/*

# Activează configurația nouă
ln -sf /etc/nginx/sites-available/multi-sites /etc/nginx/sites-enabled/

echo "   ✅ Configurația multi-sites activată"

echo ""
echo "🧪 PASUL 8: Testează și pornește Nginx..."

nginx -t

if [ $? -eq 0 ]; then
    echo "   ✅ Configurația Nginx este validă"
    
    # Omoară orice proces care ocupă porturile
    fuser -k 80/tcp 2>/dev/null || echo "   Portul 80 era liber"
    fuser -k 443/tcp 2>/dev/null || echo "   Portul 443 era liber"
    
    sleep 2
    
    # Pornește Nginx
    systemctl start nginx
    
    if systemctl is-active --quiet nginx; then
        echo "   ✅ Nginx pornit cu succes!"
    else
        echo "   ❌ Nginx nu a pornit prin systemctl, încearcă manual..."
        nginx
        
        if pgrep nginx > /dev/null; then
            echo "   ✅ Nginx pornit manual"
        else
            echo "   ❌ Nginx nu pornește deloc"
        fi
    fi
else
    echo "   ❌ Configurația Nginx are erori"
    nginx -t
fi

echo ""
echo "🧪 PASUL 9: Test final..."

if pgrep nginx > /dev/null; then
    echo "✅ Nginx rulează!"
    
    echo ""
    echo "Test anyway.ro:"
    ANYWAY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://anyway.ro 2>/dev/null || echo "000")
    echo "   http://anyway.ro: $ANYWAY_STATUS"
    
    echo ""
    echo "Test victoriaocara.com:"
    VICTORIA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://victoriaocara.com 2>/dev/null || echo "000")
    echo "   http://victoriaocara.com: $VICTORIA_STATUS"
    
    if [ "$ANYWAY_STATUS" = "200" ] && [ "$VICTORIA_STATUS" = "200" ]; then
        echo ""
        echo "✅ SUCCES! Ambele site-uri funcționează!"
        echo "🌐 anyway.ro: http://anyway.ro"
        echo "🎨 victoriaocara.com: http://victoriaocara.com"
    else
        echo ""
        echo "⚠️  Unul sau ambele site-uri au probleme"
        echo "   Verifică porturile și configurațiile"
    fi
else
    echo "❌ Nginx nu rulează"
    systemctl status nginx --no-pager
fi

echo ""
echo "======================================"