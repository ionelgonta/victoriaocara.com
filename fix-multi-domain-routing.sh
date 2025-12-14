#!/bin/bash

echo "=== FIXING MULTI-DOMAIN ROUTING ISSUE ==="
echo "Problem: anyway.ro serving victoriaocara.com content instead of flight schedule"
echo "Expected: anyway.ro -> port 8080 (flight schedule), victoriaocara.com -> port 3000 (art gallery)"
echo ""

# Check current PM2 status
echo "1. Checking PM2 applications status..."
pm2 list

echo ""
echo "2. Testing applications directly on their ports..."
echo "Testing anyway.ro app on port 8080:"
curl -s -I http://localhost:8080 | head -5
echo ""
echo "Testing victoriaocara app on port 3000:"
curl -s -I http://localhost:3000 | head -5

echo ""
echo "3. Checking current nginx configuration..."
echo "Active nginx sites:"
ls -la /etc/nginx/sites-enabled/

echo ""
echo "4. Checking nginx configuration syntax..."
nginx -t

echo ""
echo "5. Backing up current nginx config and applying correct multi-domain config..."
cp /etc/nginx/sites-available/multi-domain-final /etc/nginx/sites-available/multi-domain-final.backup.$(date +%Y%m%d_%H%M%S)

# Apply the correct configuration
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

echo "6. Testing nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✓ Nginx configuration is valid"
    
    echo ""
    echo "7. Reloading nginx..."
    systemctl reload nginx
    
    echo ""
    echo "8. Checking nginx status..."
    systemctl status nginx --no-pager -l
    
    echo ""
    echo "9. Testing domain routing..."
    echo "Testing anyway.ro (should show flight schedule):"
    curl -s -H "Host: anyway.ro" http://localhost/ | head -10
    
    echo ""
    echo "Testing victoriaocara.com (should redirect to HTTPS):"
    curl -s -I -H "Host: victoriaocara.com" http://localhost/
    
    echo ""
    echo "10. Clearing any cached DNS/proxy issues..."
    # Clear nginx cache if any
    rm -rf /var/cache/nginx/* 2>/dev/null
    
    # Restart nginx completely to ensure clean state
    echo "Restarting nginx completely..."
    systemctl restart nginx
    
    echo ""
    echo "11. Final verification..."
    echo "anyway.ro should serve flight schedule app:"
    curl -s -H "Host: anyway.ro" http://localhost/ | grep -i "zbor\|flight" | head -3
    
    echo ""
    echo "victoriaocara.com should redirect to HTTPS:"
    curl -s -I -H "Host: victoriaocara.com" http://localhost/ | grep -i location
    
    echo ""
    echo "=== MULTI-DOMAIN ROUTING FIX COMPLETED ==="
    echo "✓ anyway.ro -> port 8080 (flight schedule app)"
    echo "✓ victoriaocara.com -> HTTPS redirect -> port 3000 (art gallery)"
    echo ""
    echo "Please test:"
    echo "- http://anyway.ro (should show flight schedule)"
    echo "- https://victoriaocara.com (should show art gallery with SSL)"
    
else
    echo "✗ Nginx configuration has errors. Please check the syntax."
    nginx -t
fi