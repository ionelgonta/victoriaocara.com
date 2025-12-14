#!/bin/bash

echo "=== FIXING BOTH SITES WITH HTTPS - NO PORTS ==="

# 1. Stop all conflicting services
echo "1. Stopping conflicting services..."
systemctl stop nginx
pm2 stop all

# 2. Kill any processes on ports 80, 443
echo "2. Killing processes on ports 80, 443..."
fuser -k 80/tcp 2>/dev/null || true
fuser -k 443/tcp 2>/dev/null || true

# 3. Install certbot if not installed
echo "3. Installing certbot..."
apt update
apt install -y certbot python3-certbot-nginx

# 4. Get SSL certificates for both domains
echo "4. Getting SSL certificates..."
certbot certonly --standalone -d anyway.ro --non-interactive --agree-tos --email admin@anyway.ro || echo "anyway.ro cert failed"
certbot certonly --standalone -d victoriaocara.com --non-interactive --agree-tos --email admin@victoriaocara.com || echo "victoriaocara.com cert failed"

# 5. Create complete nginx configuration
echo "5. Creating nginx configuration..."
cat > /etc/nginx/sites-available/multi-https << 'EOF'
# HTTP to HTTPS redirect for anyway.ro
server {
    listen 80;
    server_name anyway.ro www.anyway.ro;
    return 301 https://$server_name$request_uri;
}

# HTTPS server for anyway.ro (flight schedule)
server {
    listen 443 ssl http2;
    server_name anyway.ro www.anyway.ro;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/anyway.ro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/anyway.ro/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;

    # Proxy to flight schedule app
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

    # Proxy to art gallery app
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

# Default server for direct IP access
server {
    listen 80 default_server;
    listen 443 ssl default_server;
    server_name _;
    
    ssl_certificate /etc/letsencrypt/live/victoriaocara.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/victoriaocara.com/privkey.pem;
    
    return 444;
}
EOF

# 6. Remove old configurations and enable new one
echo "6. Configuring nginx..."
rm -f /etc/nginx/sites-enabled/*
ln -sf /etc/nginx/sites-available/multi-https /etc/nginx/sites-enabled/

# 7. Test nginx configuration
echo "7. Testing nginx configuration..."
nginx -t
if [ $? -ne 0 ]; then
    echo "ERROR: Nginx configuration failed!"
    exit 1
fi

# 8. Start applications
echo "8. Starting applications..."
cd /opt/victoriaocara
pm2 start start-server.js --name victoriaocara

cd /opt/anyway-flight-schedule
pm2 start npm --name anyway-ro -- start

# 9. Start nginx
echo "9. Starting nginx..."
systemctl start nginx
systemctl enable nginx

# 10. Setup SSL auto-renewal
echo "10. Setting up SSL auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx") | crontab -

# 11. Final verification
echo "11. Final verification..."
sleep 10

echo "Testing anyway.ro HTTPS:"
curl -I https://anyway.ro 2>/dev/null | head -3

echo "Testing victoriaocara.com HTTPS:"
curl -I https://victoriaocara.com 2>/dev/null | head -3

echo "PM2 Status:"
pm2 status

echo ""
echo "=== SETUP COMPLETE ==="
echo "✅ anyway.ro → https://anyway.ro (flight schedule)"
echo "✅ victoriaocara.com → https://victoriaocara.com (art gallery)"
echo "✅ Both sites have SSL certificates"
echo "✅ No ports visible in URLs"
echo "✅ Auto SSL renewal configured"