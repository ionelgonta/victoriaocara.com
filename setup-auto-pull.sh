#!/bin/bash

# Script pentru auto-pull la fiecare 5 minute
set -e

echo "⏰ Configurez auto-pull la fiecare 5 minute..."

# Creează script de auto-pull
cat > /opt/auto-pull-victoriaocara.sh << 'EOF'
#!/bin/bash

cd /opt/victoriaocara

# Verifică dacă sunt modificări noi pe GitHub
git fetch origin main

# Compară cu versiunea locală
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "🔄 Modificări detectate, actualizez..."
    
    # Pull modificările
    git pull origin main
    
    # Instalează dependențele noi
    npm install
    
    # Build proiectul
    npm run build
    
    # Restart aplicația
    pm2 restart victoriaocara
    
    echo "✅ Actualizare completă la $(date)"
else
    echo "✅ Nicio modificare la $(date)"
fi
EOF

chmod +x /opt/auto-pull-victoriaocara.sh

# Adaugă în crontab (la fiecare 5 minute)
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/auto-pull-victoriaocara.sh >> /var/log/auto-pull.log 2>&1") | crontab -

echo ""
echo "✅ AUTO-PULL CONFIGURAT!"
echo ""
echo "📋 Configurație:"
echo "   ⏰ Frecvență: La fiecare 5 minute"
echo "   📝 Log: /var/log/auto-pull.log"
echo "   📁 Script: /opt/auto-pull-victoriaocara.sh"
echo ""
echo "📝 Comenzi utile:"
echo "   tail -f /var/log/auto-pull.log    # Vezi logs"
echo "   crontab -l                        # Vezi cron jobs"
echo "   /opt/auto-pull-victoriaocara.sh   # Test manual"
echo ""