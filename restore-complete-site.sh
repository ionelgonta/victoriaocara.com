#!/bin/bash

echo "🚀 RESTABILIRE COMPLETĂ SITE VICTORIAOCARA.COM"
echo "=============================================="
echo "Acest script va restabili complet site-ul pe serverul live"
echo ""

cd /opt/victoriaocara

# 1. OPREȘTE APLICAȚIA
echo "🛑 PASUL 1: Oprește aplicația curentă..."
pm2 stop victoriaocara 2>/dev/null || echo "   Aplicația nu rula"
pm2 delete victoriaocara 2>/dev/null || echo "   Aplicația nu era în PM2"

# 2. VERIFICĂ ȘI PORNEȘTE SERVICIILE
echo ""
echo "🔧 PASUL 2: Verifică serviciile de bază..."

# MongoDB
echo "   Verifică MongoDB..."
if ! systemctl is-active --quiet mongod; then
    echo "   Pornește MongoDB..."
    systemctl start mongod
    sleep 3
fi

if systemctl is-active --quiet mongod; then
    echo "   ✅ MongoDB rulează"
else
    echo "   ❌ MongoDB nu pornește - încearcă manual: systemctl start mongod"
fi

# Nginx
echo "   Verifică Nginx..."
if ! systemctl is-active --quiet nginx; then
    echo "   Pornește Nginx..."
    # Oprește orice proces pe portul 80
    fuser -k 80/tcp 2>/dev/null || echo "   Portul 80 este liber"
    sleep 2
    systemctl start nginx
fi

if systemctl is-active --quiet nginx; then
    echo "   ✅ Nginx rulează"
else
    echo "   ❌ Nginx nu pornește - verifică configurația"
fi

# 3. ACTUALIZEAZĂ CODUL
echo ""
echo "📥 PASUL 3: Actualizează codul din GitHub..."
git fetch origin
git reset --hard origin/main
git pull origin main

echo "   ✅ Cod actualizat"

# 4. CURĂȚĂ ȘI REINSTALEAZĂ
echo ""
echo "🧹 PASUL 4: Curăță cache-ul și reinstalează..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .next/cache

# Verifică node_modules
if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    echo "   Reinstalează dependențele..."
    npm install
else
    echo "   ✅ Dependențele sunt instalate"
fi

# 5. CONSTRUIEȘTE APLICAȚIA
echo ""
echo "🔨 PASUL 5: Construiește aplicația..."
echo "   Rulează npm run build..."

if npm run build; then
    echo "   ✅ Build reușit"
else
    echo "   ❌ Build eșuat - verifică erorile de mai sus"
    echo "   Încearcă să continui oricum..."
fi

# 6. PORNEȘTE APLICAȚIA
echo ""
echo "🚀 PASUL 6: Pornește aplicația..."
pm2 start npm --name "victoriaocara" -- start

# Așteaptă pornirea
echo "   Așteaptă pornirea aplicației..."
sleep 10

# 7. VERIFICĂ STATUSUL
echo ""
echo "📊 PASUL 7: Verifică statusul final..."

echo "PM2 Status:"
pm2 status

echo ""
echo "Test aplicație:"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ✅ Aplicația răspunde (HTTP $HTTP_STATUS)"
else
    echo "   ❌ Aplicația nu răspunde (HTTP $HTTP_STATUS)"
fi

echo ""
echo "Test website extern:"
EXTERNAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://victoriaocara.com 2>/dev/null || echo "000")

if [ "$EXTERNAL_STATUS" = "200" ]; then
    echo "   ✅ Website accesibil extern (HTTP $EXTERNAL_STATUS)"
else
    echo "   ❌ Website nu este accesibil extern (HTTP $EXTERNAL_STATUS)"
fi

# 8. TESTEAZĂ TRADUCERILE
echo ""
echo "🌐 PASUL 8: Testează traducerile..."
TRANS_TEST=$(curl -s http://localhost:3000/api/translations 2>/dev/null | grep -o '"success":true' || echo "")

if [ -n "$TRANS_TEST" ]; then
    echo "   ✅ API traduceri funcționează"
else
    echo "   ⚠️  API traduceri - verifică manual"
fi

# 9. RAPORT FINAL
echo ""
echo "=============================================="
echo "🎯 RAPORT FINAL:"

if [ "$HTTP_STATUS" = "200" ] && [ "$EXTERNAL_STATUS" = "200" ]; then
    echo "✅ SUCCES! Site-ul este complet funcțional!"
    echo ""
    echo "🌐 Website: https://victoriaocara.com"
    echo "🔧 Admin: https://victoriaocara.com/admin"
    echo "📊 Monitorizare: pm2 logs victoriaocara"
    echo ""
    echo "🧪 Pentru a testa traducerile:"
    echo "   1. Mergi la https://victoriaocara.com/admin/translations"
    echo "   2. Editează o traducere"
    echo "   3. Verifică pe site dacă se aplică"
else
    echo "❌ PROBLEME DETECTATE!"
    echo ""
    echo "🔍 Comenzi de debug:"
    echo "   pm2 logs victoriaocara --lines 20"
    echo "   systemctl status mongod"
    echo "   systemctl status nginx"
    echo "   curl http://localhost:3000"
    echo ""
    echo "📋 Loguri recente:"
    pm2 logs victoriaocara --lines 10 --nostream
fi

echo "=============================================="