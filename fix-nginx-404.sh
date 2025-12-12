#!/bin/bash

echo "🔧 REPARARE NGINX 404 ERROR"
echo "============================"

cd /opt/victoriaocara

echo "🔍 PASUL 1: Diagnosticare problemă..."

# Verifică statusul PM2
echo "PM2 Status:"
pm2 status

echo ""
echo "Verifică dacă aplicația rulează pe portul 3000:"
netstat -tulpn | grep :3000 || echo "   ❌ Nimic pe portul 3000"

echo ""
echo "Verifică procesele Node.js:"
ps aux | grep node | grep -v grep || echo "   ❌ Nu rulează procese Node.js"

echo ""
echo "🛑 PASUL 2: Oprește tot și repornește..."

# Oprește aplicația
pm2 stop all
pm2 delete all

# Oprește Nginx temporar
systemctl stop nginx

# Verifică și pornește MongoDB
echo "Verifică MongoDB..."
if ! systemctl is-active --quiet mongod; then
    systemctl start mongod
    sleep 3
fi

echo ""
echo "🔨 PASUL 3: Reconstruiește aplicația..."

# Curăță complet
rm -rf .next
rm -rf node_modules/.cache

# Trage ultimele modificări
git pull origin main

# Build aplicația
echo "Construiește aplicația..."
npm run build

if [ $? -eq 0 ]; then
    echo "   ✅ Build reușit"
else
    echo "   ❌ Build eșuat - verifică erorile"
    exit 1
fi

echo ""
echo "🚀 PASUL 4: Pornește aplicația..."

# Pornește aplicația
pm2 start npm --name "victoriaocara" -- start

# Așteaptă să pornească
sleep 10

# Verifică dacă rulează
echo "Verifică aplicația pe portul 3000:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000

# Verifică PM2
pm2 status

echo ""
echo "🌐 PASUL 5: Configurează și pornește Nginx..."

# Verifică configurația Nginx
echo "Verifică configurația Nginx pentru victoriaocara.com:"
if [ -f "/etc/nginx/sites-available/victoriaocara.com" ]; then
    echo "   ✅ Configurația există"
    
    # Afișează configurația
    echo "   Configurația curentă:"
    cat /etc/nginx/sites-available/victoriaocara.com
else
    echo "   ❌ Configurația lipsește - o creez..."
    
    # Creează configurația Nginx
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
    }
}

server {
    listen 443 ssl;
    server_name victoriaocara.com www.victoriaocara.com;

    ssl_certificate /etc/letsencrypt/live/victoriaocara.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/victoriaocara.com/privkey.pem;

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
    }
}
EOF

    # Activează site-ul
    ln -sf /etc/nginx/sites-available/victoriaocara.com /etc/nginx/sites-enabled/
    
    echo "   ✅ Configurația creată și activată"
fi

# Testează configurația Nginx
echo ""
echo "Testează configurația Nginx:"
nginx -t

if [ $? -eq 0 ]; then
    echo "   ✅ Configurația Nginx este validă"
    
    # Pornește Nginx
    systemctl start nginx
    
    if systemctl is-active --quiet nginx; then
        echo "   ✅ Nginx pornit cu succes"
    else
        echo "   ❌ Nginx nu a pornit"
        systemctl status nginx --no-pager
    fi
else
    echo "   ❌ Configurația Nginx are erori"
    nginx -t
fi

echo ""
echo "🧪 PASUL 6: Test final..."

# Test local
echo "Test local (localhost:3000):"
LOCAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
echo "   Status: $LOCAL_STATUS"

# Test prin Nginx
echo "Test prin Nginx (localhost:80):"
NGINX_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80)
echo "   Status: $NGINX_STATUS"

# Test extern
echo "Test extern (victoriaocara.com):"
EXTERNAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://victoriaocara.com)
echo "   Status: $EXTERNAL_STATUS"

echo ""
echo "============================"

if [ "$LOCAL_STATUS" = "200" ] && [ "$NGINX_STATUS" = "200" ]; then
    echo "✅ SUCCES! Site-ul funcționează!"
    echo "🌐 Accesează: https://victoriaocara.com"
else
    echo "❌ ÎNCĂ SUNT PROBLEME!"
    echo ""
    echo "🔍 Debug info:"
    echo "PM2 logs:"
    pm2 logs victoriaocara --lines 5 --nostream
    echo ""
    echo "Nginx status:"
    systemctl status nginx --no-pager -l
    echo ""
    echo "Procese pe portul 3000:"
    netstat -tulpn | grep :3000
fi

echo "============================"