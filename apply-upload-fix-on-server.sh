#!/bin/bash

# Script pentru aplicarea fix-ului de upload pe server
set -e

echo "🔧 Aplicând fix-ul pentru limitele de upload pe server..."

# Directorul proiectului pe server
PROJECT_DIR="/root/victoriaocara.com"

# 1. Actualizează codul
echo "📥 Actualizez codul din GitHub..."
cd $PROJECT_DIR
git pull origin main

# 2. Verifică dacă s-au modificat dependențele
if git diff --name-only HEAD~1 HEAD | grep -q "package.json"; then
    echo "📦 Reinstalează dependențele..."
    npm install
fi

# 3. Build proiectul
echo "🔨 Build proiectul..."
npm run build

# 4. Backup configurația nginx actuală
echo "📋 Creez backup pentru configurația nginx..."
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)

# 5. Aplică noua configurație nginx cu limitele de upload
echo "📝 Actualizez configurația nginx..."
if [ -f "$PROJECT_DIR/nginx-multi-domain-config.txt" ]; then
    cp $PROJECT_DIR/nginx-multi-domain-config.txt /etc/nginx/sites-available/default
    echo "✅ Configurația multi-domain aplicată"
elif [ -f "$PROJECT_DIR/nginx-simple-config.txt" ]; then
    cp $PROJECT_DIR/nginx-simple-config.txt /etc/nginx/sites-available/default
    echo "✅ Configurația simplă aplicată"
else
    echo "❌ Nu am găsit fișierele de configurație nginx!"
    exit 1
fi

# 6. Testează configurația nginx
echo "🧪 Testez configurația nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configurația nginx este validă"
    
    # 7. Reload nginx
    echo "🔄 Reîncarcă nginx..."
    systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx reîncărcat cu succes"
    else
        echo "❌ Eroare la reîncărcarea nginx"
        exit 1
    fi
else
    echo "❌ Configurația nginx nu este validă"
    echo "🔄 Restaurez backup-ul..."
    cp /etc/nginx/sites-available/default.backup.* /etc/nginx/sites-available/default
    exit 1
fi

# 8. Restart aplicația Next.js
echo "🚀 Restart aplicația..."
pm2 restart victoriaocara || pm2 restart all

# 9. Verifică statusul
echo "📊 Verific statusul aplicației..."
pm2 status

echo ""
echo "🎉 FIX APLICAT CU SUCCES!"
echo ""
echo "📊 Modificări aplicate:"
echo "   ✅ Nginx: client_max_body_size 10M"
echo "   ✅ API routes: limită 10MB"
echo "   ✅ Frontend: validare 10MB"
echo "   ✅ Axios: timeout 60 secunde"
echo ""
echo "🔍 Acum poți încărca imagini până la 10MB fără eroarea 413!"
echo "🌐 Testează pe: https://victoriaocara.com"
echo ""