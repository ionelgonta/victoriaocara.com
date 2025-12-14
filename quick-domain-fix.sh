#!/bin/bash

echo "🎯 QUICK MULTI-DOMAIN ROUTING FIX"
echo "================================="
echo "Fixing anyway.ro serving wrong content"
echo ""

# Navigate to the project directory
cd /opt/victoriaocara

echo "📍 Current directory: $(pwd)"
echo ""

echo "🔍 STEP 1: Quick Diagnosis"
echo "========================="

echo "Checking PM2 status:"
pm2 list

echo ""
echo "Testing applications on their ports:"
echo "Port 8080 (flight schedule):"
timeout 5 curl -s http://localhost:8080 | head -5 | grep -E "(title|Zbor|Flight)" || echo "No flight content found"

echo ""
echo "Port 3000 (art gallery):"
timeout 5 curl -s http://localhost:3000 | head -5 | grep -E "(title|Victoria|Art)" || echo "No art gallery content found"

echo ""
echo "Current nginx sites:"
ls -la /etc/nginx/sites-enabled/

echo ""
echo "🔧 STEP 2: Applying Fix"
echo "======================"

# Backup current config
cp /etc/nginx/sites-available/multi-domain-final /etc/nginx/sites-available/multi-domain-final.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null

# Apply correct configuration
cat > /etc/nginx/sites-available/multi-domain-final << 'EOF'
# Configuration for anyway.ro (flight schedule app)
server {
    listen 80;
    server_name anyway.ro www.anyway.ro;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    access_log /var/log/nginx/anyway.access.log;
    error_log /var/log/nginx/anyway.error.log;
}

# HTTP to HTTPS redirect for victoriaocara.com
server {
    listen 80;
    server_name victoriaocara.com www.victoriaocara.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server for victoriaocara.com (art gallery)
server {
    listen 443 ssl http2;
    server_name victoriaocara.com www.victoriaocara.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/victoriaocara.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/victoriaocara.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;

    # Proxy to Next.js art gallery app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files optimization
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, immutable";
    }

    access_log /var/log/nginx/victoriaocara.access.log;
    error_log /var/log/nginx/victoriaocara.error.log;
}

# Default server for direct IP access - redirect to anyway.ro
server {
    listen 80 default_server;
    server_name _;
    return 301 http://anyway.ro$request_uri;
}
EOF

echo "✓ Nginx configuration updated"

echo ""
echo "Testing nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✓ Configuration is valid"
    
    echo ""
    echo "Restarting nginx..."
    systemctl restart nginx
    
    echo "✓ Nginx restarted"
    
    echo ""
    echo "🧪 STEP 3: Testing Results"
    echo "========================="
    
    sleep 5
    
    echo "Testing anyway.ro (should show flight schedule):"
    ANYWAY_TEST=$(curl -s -H "Host: anyway.ro" http://localhost/ | head -10)
    if echo "$ANYWAY_TEST" | grep -q -i -E "(zbor|flight|orarul)"; then
        echo "✅ anyway.ro correctly shows flight schedule"
    else
        echo "❌ anyway.ro still showing wrong content:"
        echo "$ANYWAY_TEST" | head -3
    fi
    
    echo ""
    echo "Testing victoriaocara.com redirect:"
    VICTORIA_REDIRECT=$(curl -s -I -H "Host: victoriaocara.com" http://localhost/ | grep -i location)
    if echo "$VICTORIA_REDIRECT" | grep -q "https://victoriaocara.com"; then
        echo "✅ victoriaocara.com correctly redirects to HTTPS"
    else
        echo "❌ victoriaocara.com redirect issue:"
        echo "$VICTORIA_REDIRECT"
    fi
    
    echo ""
    echo "================================="
    echo "🎉 DOMAIN ROUTING FIX COMPLETE!"
    echo ""
    echo "🌐 TEST IN BROWSER:"
    echo "   • http://anyway.ro (flight schedule)"
    echo "   • https://victoriaocara.com (art gallery)"
    echo ""
    echo "💡 If you still see wrong content:"
    echo "   • Clear browser cache (Ctrl+Shift+R)"
    echo "   • Use incognito/private mode"
    echo "   • Wait 1-2 minutes for DNS propagation"
    echo "================================="
    
else
    echo "❌ Nginx configuration has errors:"
    nginx -t
fi