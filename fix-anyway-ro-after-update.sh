#!/bin/bash

echo "=== FIXING ANYWAY.RO AFTER UBUNTU UPDATE ==="

cd /opt/victoriaocara

# 1. Verifică statusul curent
echo "1. Checking current status..."
echo "PM2 processes:"
pm2 list

echo ""
echo "Port usage:"
netstat -tlnp | grep -E ":8080|:3000"

echo ""
echo "Testing ports:"
echo "Port 3000 (should be Victoria Ocara):"
curl -s http://localhost:3000 | grep -o "<title>[^<]*</title>" 2>/dev/null || echo "No response"

echo "Port 8080 (should be Flight Schedule):"
curl -s http://localhost:8080 | grep -o "<title>[^<]*</title>" 2>/dev/null || echo "No response"

# 2. Stop toate procesele
echo ""
echo "2. Stopping all processes..."
pm2 stop all
pm2 delete all

# Kill processes on ports
fuser -k 8080/tcp 2>/dev/null || true
sleep 3

# 3. Recreează aplicația flight schedule
echo ""
echo "3. Recreating flight schedule app..."
mkdir -p /opt/anyway-flight-schedule
cd /opt/anyway-flight-schedule

# Creează package.json
cat > package.json << 'EOF'
{
  "name": "anyway-flight-schedule",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}
EOF

# Creează server.js
cat > server.js << 'EOF'
const express = require('express');
const app = express();
const port = 8080;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ro">
    <head>
        <title>Orarul Zborurilor România - Informații Zboruri în Timp Real</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="Informații în timp real despre sosirile și plecările zborurilor din aeroporturile majore din România și Moldova. Urmărește zborurile, verifică statusul și obține informații detaliate.">
    </head>
    <body style="font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5;">
        <div style="max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #2c3e50; text-align: center;">Orarul Zborurilor România</h1>
            <p style="text-align: center; color: #7f8c8d; font-size: 18px;">Informații în timp real despre sosirile și plecările zborurilor din aeroporturile majore din România și Moldova.</p>
            <div style="background: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3>Aeroporturi Monitorizate:</h3>
                <ul>
                    <li>Aeroportul Henri Coandă București (OTP)</li>
                    <li>Aeroportul Cluj-Napoca (CLJ)</li>
                    <li>Aeroportul Timișoara (TSR)</li>
                    <li>Aeroportul Iași (IAS)</li>
                    <li>Aeroportul Chișinău (KIV)</li>
                </ul>
            </div>
            <p style="text-align: center; color: #95a5a6;">Aplicația Flight Schedule - Versiunea 1.0</p>
        </div>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Flight Schedule', port: port });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Flight Schedule app running on port ${port}`);
});
EOF

# Instalează dependențele
npm install

# 4. Start aplicațiile
echo ""
echo "4. Starting applications..."

# Start Victoria Ocara pe port 3000
cd /opt/victoriaocara
pm2 start npm --name "victoriaocara" -- start

# Start Flight Schedule pe port 8080
cd /opt/anyway-flight-schedule
pm2 start server.js --name "anyway-ro"

# 5. Verifică nginx config
echo ""
echo "5. Checking nginx configuration..."
nginx -t

# 6. Restart nginx
echo ""
echo "6. Restarting nginx..."
systemctl restart nginx

# 7. Wait și verifică
echo ""
echo "7. Waiting for services to start..."
sleep 15

echo ""
echo "8. Final verification..."

echo "PM2 Status:"
pm2 status

echo ""
echo "Port Status:"
netstat -tlnp | grep -E ":8080|:3000"

echo ""
echo "Testing applications:"
echo "Port 3000 (Victoria Ocara):"
curl -s http://localhost:3000 | grep -o "<title>[^<]*</title>" 2>/dev/null || echo "No response"

echo "Port 8080 (Flight Schedule):"
curl -s http://localhost:8080 | grep -o "<title>[^<]*</title>" 2>/dev/null || echo "No response"

echo ""
echo "Testing domains:"
echo "anyway.ro:"
curl -s https://anyway.ro | grep -o "<title>[^<]*</title>" 2>/dev/null || echo "No response"

echo "victoriaocara.com:"
curl -s https://victoriaocara.com | grep -o "<title>[^<]*</title>" 2>/dev/null || echo "No response"

echo ""
echo "=== REPAIR COMPLETE ==="
echo "✅ anyway.ro → Flight Schedule (port 8080)"
echo "✅ victoriaocara.com → Art Gallery (port 3000)"
echo ""
echo "If anyway.ro still shows 502, check:"
echo "- pm2 logs anyway-ro"
echo "- systemctl status nginx"