#!/bin/bash

# Script simplu pentru actualizare manuală
set -e

echo "🔄 Actualizez serverul cu ultimele modificări..."

cd /opt/victoriaocara

# Pull modificările
echo "📥 Descarcă modificările din GitHub..."
git pull origin main

# Verifică dacă package.json s-a modificat
if git diff --name-only HEAD~1 HEAD | grep -q "package.json"; then
    echo "📦 Reinstalează dependențele..."
    npm install
fi

# Build proiectul
echo "🔨 Build proiectul..."
npm run build

# Restart aplicația
echo "🚀 Restart aplicația..."
pm2 restart victoriaocara

echo ""
echo "✅ ACTUALIZARE COMPLETĂ!"
echo ""
echo "🌐 Site actualizat: https://victoriaocara.com"
echo "📊 Status: $(pm2 list | grep victoriaocara)"
echo ""