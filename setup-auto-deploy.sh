#!/bin/bash

# Script pentru configurarea auto-deployment cu GitHub webhooks
set -e

echo "🚀 Configurez auto-deployment pentru serverul tău..."

# 1. Creează directorul pentru webhook
mkdir -p /opt/webhook
cd /opt/webhook

# 2. Instalează webhook tool
echo "📦 Instalez webhook tool..."
wget https://github.com/adnanh/webhook/releases/download/2.8.1/webhook-linux-amd64.tar.gz
tar -xzf webhook-linux-amd64.tar.gz
mv webhook-linux-amd64/webhook /usr/local/bin/
rm -rf webhook-linux-amd64*

# 3. Creează script de deployment
cat > /opt/webhook/deploy-victoriaocara.sh << 'EOF'
#!/bin/bash

echo "🔄 Auto-deployment declanșat la $(date)"

cd /opt/victoriaocara

# Pull ultimele modificări
git pull origin main

# Instalează dependențele noi (dacă există)
npm install

# Build proiectul
npm run build

# Restart aplicația
pm2 restart victoriaocara

echo "✅ Deployment complet la $(date)"
EOF

chmod +x /opt/webhook/deploy-victoriaocara.sh

# 4. Creează configurația webhook
cat > /opt/webhook/hooks.json << 'EOF'
[
  {
    "id": "victoriaocara-deploy",
    "execute-command": "/opt/webhook/deploy-victoriaocara.sh",
    "command-working-directory": "/opt/victoriaocara",
    "response-message": "Deployment started",
    "trigger-rule": {
      "and": [
        {
          "match": {
            "type": "payload-hash-sha1",
            "secret": "VictoriaOcara2024WebhookSecret",
            "parameter": {
              "source": "header",
              "name": "X-Hub-Signature"
            }
          }
        },
        {
          "match": {
            "type": "value",
            "value": "refs/heads/main",
            "parameter": {
              "source": "payload",
              "name": "ref"
            }
          }
        }
      ]
    }
  }
]
EOF

# 5. Creează serviciul systemd pentru webhook
cat > /etc/systemd/system/webhook.service << 'EOF'
[Unit]
Description=GitHub Webhook Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/webhook
ExecStart=/usr/local/bin/webhook -hooks /opt/webhook/hooks.json -verbose -port 9000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 6. Pornește serviciul webhook
systemctl daemon-reload
systemctl enable webhook
systemctl start webhook

# 7. Configurează firewall pentru webhook
ufw allow 9000

# 8. Configurează Nginx pentru webhook
cat > /etc/nginx/sites-available/webhook << 'EOF'
server {
    listen 80;
    server_name webhook.victoriaocara.com;

    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/webhook /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo ""
echo "🎉 AUTO-DEPLOYMENT CONFIGURAT!"
echo ""
echo "📋 Informații webhook:"
echo "   🔗 URL: http://webhook.victoriaocara.com"
echo "   🔑 Secret: VictoriaOcara2024WebhookSecret"
echo "   🚪 Port: 9000"
echo ""
echo "📝 Următorii pași:"
echo "   1. Mergi la GitHub → Settings → Webhooks"
echo "   2. Add webhook cu URL: http://webhook.victoriaocara.com"
echo "   3. Secret: VictoriaOcara2024WebhookSecret"
echo "   4. Events: Just the push event"
echo ""
echo "✅ Acum modificările se vor deploya automat!"
echo ""