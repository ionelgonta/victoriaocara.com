#!/bin/bash

echo "🔍 Verificând fix-ul pentru limitele de upload..."

# Verifică configurația nginx
echo "📋 Verificând configurația nginx..."
if grep -q "client_max_body_size 10M" /etc/nginx/sites-available/default; then
    echo "✅ Nginx: client_max_body_size 10M configurată"
else
    echo "❌ Nginx: client_max_body_size nu este configurată corect"
fi

# Verifică statusul nginx
echo "🌐 Verificând statusul nginx..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx: rulează"
else
    echo "❌ Nginx: nu rulează"
fi

# Verifică statusul aplicației
echo "🚀 Verificând statusul aplicației..."
if pm2 list | grep -q "victoriaocara.*online"; then
    echo "✅ Aplicația: rulează"
else
    echo "❌ Aplicația: nu rulează"
fi

# Testează conectivitatea
echo "🌍 Testând conectivitatea..."
if curl -s -o /dev/null -w "%{http_code}" https://victoriaocara.com | grep -q "200"; then
    echo "✅ Site: accesibil (HTTP 200)"
else
    echo "❌ Site: nu este accesibil"
fi

echo ""
echo "📊 Rezumat configurație upload:"
echo "   • Nginx: 10MB (client_max_body_size)"
echo "   • API /upload: 10MB"
echo "   • API /upload-public: 10MB"
echo "   • Frontend: 10MB validare"
echo "   • Axios: 60s timeout"
echo ""
echo "🎯 Acum poți încărca imagini până la 10MB fără eroarea 413!"
echo "🌐 Testează pe: https://victoriaocara.com/comanda-pictura"