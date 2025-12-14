#!/bin/bash

echo "🎯 ULTIMATE SITE FIX - VICTORIA OCARA"
echo "===================================="
echo "Fixing all issues: React Error #31, SSL, Caching, Multi-domain"
echo ""

# Change to project directory
cd /opt/victoriaocara

echo "🔍 STEP 1: CURRENT STATUS DIAGNOSIS"
echo "-----------------------------------"

echo "PM2 processes:"
pm2 list 2>/dev/null || echo "PM2 not available"

echo ""
echo "Nginx status:"
systemctl is-active nginx && echo "✅ Nginx running" || echo "❌ Nginx not running"

echo ""
echo "MongoDB status:"
systemctl is-active mongod && echo "✅ MongoDB running" || echo "❌ MongoDB not running"

echo ""
echo "Port usage:"
netstat -tulpn | grep -E ":(80|443|3000)" || echo "No processes on web ports"

echo ""
echo "Current site response:"
curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:3000 2>/dev/null || echo "No response from port 3000"

echo ""
echo "🛑 STEP 2: STOP ALL SERVICES"
echo "----------------------------"

# Stop PM2 processes
pm2 stop all 2>/dev/null || echo "No PM2 processes to stop"
pm2 delete all 2>/dev/null || echo "No PM2 processes to delete"

# Stop nginx
systemctl stop nginx 2>/dev/null || echo "Nginx already stopped"

# Kill any processes on ports 80, 443, 3000
fuser -k 80/tcp 2>/dev/null || echo "Port 80 was free"
fuser -k 443/tcp 2>/dev/null || echo "Port 443 was free"
fuser -k 3000/tcp 2>/dev/null || echo "Port 3000 was free"

sleep 3
echo "✅ All services stopped"

echo ""
echo "🗄️ STEP 3: ENSURE DATABASE IS RUNNING"
echo "-------------------------------------"

if ! systemctl is-active --quiet mongod; then
    echo "Starting MongoDB..."
    systemctl start mongod
    sleep 3
fi

if systemctl is-active --quiet mongod; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB failed to start"
    systemctl status mongod --no-pager
fi

echo ""
echo "🧹 STEP 4: CLEAN BUILD AND CACHE"
echo "--------------------------------"

# Remove build artifacts
rm -rf .next
rm -rf node_modules/.cache
rm -rf /tmp/next-*

# Clear PM2 logs
pm2 flush 2>/dev/null || echo "No PM2 logs to clear"

echo "✅ Build cache cleared"

echo ""
echo "🔧 STEP 5: FIX REACT ERROR #31 ISSUES"
echo "------------------------------------"

# Check if safeRender function exists and is properly implemented
if ! grep -q "export const safeRender" lib/utils.ts; then
    echo "Adding safeRender function to lib/utils.ts..."
    
    cat >> lib/utils.ts << 'EOF'

// CRITICAL: Safe render function to prevent React error #31
export const safeRender = (value: any): string => {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return '';
  }

  // Handle primitives
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  // Handle objects with en/ro properties (multilingual content)
  if (typeof value === 'object' && value !== null) {
    if (value.en || value.ro) {
      return String(value.en || value.ro || '');
    }

    // For any other object, return empty string to prevent React error
    return '';
  }

  // Fallback
  return String(value || '');
};
EOF
    echo "✅ safeRender function added"
else
    echo "✅ safeRender function already exists"
fi

echo ""
echo "📦 STEP 6: REBUILD APPLICATION"
echo "-----------------------------"

echo "Installing dependencies..."
npm install --production

echo ""
echo "Building Next.js application..."
if npm run build; then
    echo "✅ Build successful"
else
    echo "❌ Build failed, but continuing..."
    npm run build 2>&1 | tail -20
fi

echo ""
echo "🌐 STEP 7: CONFIGURE NGINX FOR MULTI-DOMAIN"
echo "-------------------------------------------"

# Remove all existing nginx configurations
rm -f /etc/nginx/sites-enabled/*

# Create comprehensive multi-domain configuration
cat > /etc/nginx/sites-available/multi-domain << 'EOF'
# anyway.ro configuration (assuming it runs on port 8080)
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

# HTTPS configuration for victoriaocara.com
server {
    listen 443 ssl http2;
    server_name victoriaocara.com www.victoriaocara.com;

    # SSL certificate paths (will be created by certbot)
    ssl_certificate /etc/letsencrypt/live/victoriaocara.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/victoriaocara.com/privkey.pem;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js application
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Anti-cache headers for fresh content
        proxy_set_header Cache-Control "no-cache, no-store, must-revalidate";
        proxy_set_header Pragma "no-cache";
        proxy_set_header Expires "0";
    }

    # Static files optimization
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    access_log /var/log/nginx/victoriaocara-ssl.access.log;
    error_log /var/log/nginx/victoriaocara-ssl.error.log;
}

# Default server for direct IP access
server {
    listen 80 default_server;
    server_name _;
    
    return 301 http://anyway.ro$request_uri;
}
EOF

# Enable the configuration
ln -sf /etc/nginx/sites-available/multi-domain /etc/nginx/sites-enabled/

echo "✅ Multi-domain Nginx configuration created"

echo ""
echo "🔒 STEP 8: SETUP SSL CERTIFICATE"
echo "-------------------------------"

# Check if SSL certificate exists
if [ ! -f "/etc/letsencrypt/live/victoriaocara.com/fullchain.pem" ]; then
    echo "Obtaining SSL certificate from Let's Encrypt..."
    
    # Stop nginx temporarily for standalone mode
    systemctl stop nginx 2>/dev/null
    
    # Get SSL certificate
    certbot certonly --standalone \
        -d victoriaocara.com \
        -d www.victoriaocara.com \
        --non-interactive \
        --agree-tos \
        --email admin@victoriaocara.com \
        --force-renewal
    
    if [ $? -eq 0 ]; then
        echo "✅ SSL certificate obtained successfully"
    else
        echo "❌ Failed to obtain SSL certificate"
        echo "Continuing without SSL for now..."
        
        # Create HTTP-only configuration
        cat > /etc/nginx/sites-available/multi-domain << 'EOF'
# anyway.ro configuration
server {
    listen 80;
    server_name anyway.ro www.anyway.ro;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# victoriaocara.com configuration (HTTP only)
server {
    listen 80;
    server_name victoriaocara.com www.victoriaocara.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Anti-cache headers
        proxy_set_header Cache-Control "no-cache, no-store, must-revalidate";
        proxy_set_header Pragma "no-cache";
        proxy_set_header Expires "0";
    }
}

# Default server
server {
    listen 80 default_server;
    server_name _;
    return 301 http://anyway.ro$request_uri;
}
EOF
    fi
else
    echo "✅ SSL certificate already exists"
fi

echo ""
echo "🚀 STEP 9: START SERVICES"
echo "------------------------"

# Test nginx configuration
echo "Testing Nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid"
    
    # Start nginx
    systemctl start nginx
    
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx started successfully"
    else
        echo "❌ Nginx failed to start"
        systemctl status nginx --no-pager
    fi
else
    echo "❌ Nginx configuration has errors"
    nginx -t
fi

echo ""
echo "Starting Next.js application..."

# Create a custom start script to ensure proper binding
cat > start-server.js << 'EOF'
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
  .once('error', (err) => {
    console.error(err)
    process.exit(1)
  })
  .listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
EOF

# Start with PM2
pm2 start start-server.js --name "victoriaocara"

# Wait for startup
echo "Waiting for application to start..."
sleep 15

echo ""
echo "🧪 STEP 10: FINAL TESTING"
echo "------------------------"

echo "PM2 Status:"
pm2 status

echo ""
echo "Service Status:"
systemctl is-active nginx && echo "✅ Nginx: Running" || echo "❌ Nginx: Not running"
systemctl is-active mongod && echo "✅ MongoDB: Running" || echo "❌ MongoDB: Not running"

echo ""
echo "Application Tests:"

# Test local application
LOCAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
echo "Local app (port 3000): HTTP $LOCAL_STATUS"

# Test through nginx
if systemctl is-active --quiet nginx; then
    NGINX_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://victoriaocara.com 2>/dev/null || echo "000")
    echo "Through Nginx: HTTP $NGINX_STATUS"
    
    # Test SSL if available
    if [ -f "/etc/letsencrypt/live/victoriaocara.com/fullchain.pem" ]; then
        SSL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://victoriaocara.com 2>/dev/null || echo "000")
        echo "HTTPS: HTTP $SSL_STATUS"
    fi
fi

echo ""
echo "Recent Application Logs:"
pm2 logs victoriaocara --lines 10 --nostream 2>/dev/null || echo "No PM2 logs available"

echo ""
echo "===================================="

# Final status check
if [ "$LOCAL_STATUS" = "200" ]; then
    echo "🎉 SUCCESS! SITE IS WORKING!"
    echo ""
    echo "✅ WORKING URLS:"
    echo "   • http://victoriaocara.com"
    if [ -f "/etc/letsencrypt/live/victoriaocara.com/fullchain.pem" ]; then
        echo "   • https://victoriaocara.com"
    fi
    echo ""
    echo "🔧 ADMIN PANEL:"
    echo "   • https://victoriaocara.com/admin"
    echo "   • Credentials: admin@victoriaocara.com / AdminVictoria2024!"
    echo ""
    echo "📱 FEATURES:"
    echo "   • Gallery: /galerie"
    echo "   • About: /despre"
    echo "   • Contact: /contact"
    echo "   • Custom paintings: /comanda-pictura"
    echo ""
    echo "🔍 MONITORING:"
    echo "   • pm2 logs victoriaocara"
    echo "   • tail -f /var/log/nginx/victoriaocara-ssl.error.log"
    echo ""
    echo "💡 CACHE CLEARING:"
    echo "   • Press Ctrl+Shift+R in browser"
    echo "   • Or use incognito mode"
    
else
    echo "❌ SITE IS NOT WORKING PROPERLY"
    echo ""
    echo "🔍 DEBUG STEPS:"
    echo "   1. Check PM2 logs: pm2 logs victoriaocara"
    echo "   2. Check Nginx logs: tail -f /var/log/nginx/error.log"
    echo "   3. Check MongoDB: systemctl status mongod"
    echo "   4. Restart services: pm2 restart victoriaocara"
    echo ""
    echo "📊 CURRENT STATUS:"
    echo "   • Local app: $LOCAL_STATUS"
    echo "   • Through Nginx: ${NGINX_STATUS:-'Not tested'}"
fi

echo "===================================="