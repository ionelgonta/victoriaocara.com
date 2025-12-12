#!/bin/bash

echo "🚀 BYPASS NGINX - ACCES DIRECT LA SITE"
echo "======================================"

echo "🔍 PASUL 1: Verifică statusul curent..."

echo "Next.js pe portul 3000:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000

echo ""
echo "PM2 Status:"
pm2 status

echo ""
echo "🔧 PASUL 2: Configurează Next.js pentru acces extern..."

cd /opt/victoriaocara

# Verifică configurația Next.js
echo "Verifică next.config.js:"
if [ -f "next.config.js" ]; then
    cat next.config.js
else
    echo "   next.config.js nu există"
fi

echo ""
echo "🌐 PASUL 3: Configurează Next.js să accepte conexiuni externe..."

# Creează/actualizează next.config.js pentru a accepta conexiuni externe
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose']
  },
  images: {
    domains: ['localhost', 'victoriaocara.com', '23.88.113.154'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Permite conexiuni externe
  server: {
    host: '0.0.0.0',
    port: 3000
  }
}

module.exports = nextConfig
EOF

echo "   ✅ next.config.js actualizat pentru conexiuni externe"

echo ""
echo "🔄 PASUL 4: Repornește aplicația cu configurația nouă..."

# Oprește aplicația
pm2 stop victoriaocara

# Reconstruiește cu noua configurație
npm run build

# Pornește din nou
pm2 start npm --name "victoriaocara" -- start

# Așteaptă să pornească
sleep 10

echo ""
echo "🧪 PASUL 5: Testează accesul direct..."

echo "1. Test local (localhost:3000):"
LOCAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
echo "   Status: $LOCAL_STATUS"

echo ""
echo "2. Test prin IP extern (23.88.113.154:3000):"
EXTERNAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://23.88.113.154:3000)
echo "   Status: $EXTERNAL_STATUS"

echo ""
echo "🔥 PASUL 6: Configurează firewall pentru portul 3000..."

# Permite traficul pe portul 3000
ufw allow 3000/tcp 2>/dev/null && echo "   ✅ Firewall: portul 3000 permis" || echo "   ⚠️  UFW nu este activ"

# Verifică dacă iptables blochează
iptables -L INPUT | grep 3000 || echo "   iptables: nu există reguli pentru portul 3000"

echo ""
echo "🌐 PASUL 7: Testează din exterior..."

echo "Test final prin IP:3000:"
FINAL_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://23.88.113.154:3000)
echo "   Status: $FINAL_TEST"

echo ""
echo "======================================"

if [ "$FINAL_TEST" = "200" ]; then
    echo "✅ SUCCES! Site-ul este accesibil direct!"
    echo ""
    echo "🌐 ACCESEAZĂ SITE-UL:"
    echo "   http://23.88.113.154:3000"
    echo ""
    echo "🔧 ADMIN PANEL:"
    echo "   http://23.88.113.154:3000/admin"
    echo "   Credențiale: admin@victoriaocara.com / AdminVictoria2024!"
    echo ""
    echo "📋 PAGINI DISPONIBILE:"
    echo "   • Homepage: http://23.88.113.154:3000"
    echo "   • Galerie: http://23.88.113.154:3000/galerie"
    echo "   • Despre: http://23.88.113.154:3000/despre"
    echo "   • Contact: http://23.88.113.154:3000/contact"
    echo "   • Comandă pictură: http://23.88.113.154:3000/comanda-pictura"
    echo ""
    echo "💡 PENTRU DOMENIU (victoriaocara.com):"
    echo "   Actualizează DNS să pointeze la 23.88.113.154:3000"
    echo "   Sau repară Nginx mai târziu cu: systemctl restart nginx"
    echo ""
    echo "📊 MONITORIZARE:"
    echo "   pm2 logs victoriaocara"
    echo "   pm2 monit"
elif [ "$LOCAL_STATUS" = "200" ]; then
    echo "⚠️  Site-ul funcționează local, dar nu extern"
    echo ""
    echo "🔍 POSIBILE CAUZE:"
    echo "   • Firewall blochează portul 3000"
    echo "   • Next.js nu acceptă conexiuni externe"
    echo "   • Configurația de rețea"
    echo ""
    echo "🛠️  SOLUȚII DE ÎNCERCAT:"
    echo "   1. Verifică firewall: ufw status"
    echo "   2. Verifică iptables: iptables -L"
    echo "   3. Testează local: curl http://localhost:3000"
else
    echo "❌ PROBLEME CU APLICAȚIA!"
    echo ""
    echo "🔍 DEBUG:"
    pm2 logs victoriaocara --lines 10 --nostream
fi

echo "======================================"