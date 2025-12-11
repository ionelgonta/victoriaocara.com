#!/bin/bash

# Script pentru debugging React error #31
echo "🐛 Debugging React error #31..."

# 1. Creează un build de dezvoltare pentru a vedea eroarea completă
echo "📦 Building development version..."
cd /opt/victoriaocara
NODE_ENV=development npm run build

# 2. Restart cu versiunea de dezvoltare
echo "🔄 Restarting with development build..."
pm2 restart victoriaocara

# 3. Verifică logs pentru erori detaliate
echo "📋 Checking logs..."
pm2 logs victoriaocara --lines 20

echo ""
echo "🌐 Acum accesează site-ul și verifică console-ul pentru eroarea completă (nu minificată)"
echo "   Site: https://victoriaocara.com"
echo ""
echo "📝 Căută în console pentru 'React error #31' și vezi detaliile complete"
echo ""