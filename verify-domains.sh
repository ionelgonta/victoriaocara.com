#!/bin/bash

echo "=== DOMAIN VERIFICATION ==="
echo ""

# Check PM2 status
echo "PM2 Applications:"
pm2 list
echo ""

# Check nginx configuration
echo "Active nginx configuration:"
ls -la /etc/nginx/sites-enabled/
echo ""

# Test applications on their ports
echo "Testing port 8080 (should be flight schedule):"
timeout 5 curl -s http://localhost:8080 | head -3 | grep -E "(title|Zbor|Flight|Orarul)" || echo "❌ No flight content found on port 8080"
echo ""

echo "Testing port 3000 (should be art gallery):"
timeout 5 curl -s http://localhost:3000 | head -3 | grep -E "(title|Victoria|Art|Galerie)" || echo "❌ No art gallery content found on port 3000"
echo ""

# Test domain routing through nginx
echo "Testing anyway.ro through nginx:"
timeout 5 curl -s -H "Host: anyway.ro" http://localhost/ | head -3 | grep -E "(title|Zbor|Flight|Orarul)" && echo "✅ anyway.ro correctly routed to flight schedule" || echo "❌ anyway.ro NOT correctly routed"
echo ""

echo "Testing victoriaocara.com redirect:"
curl -s -I -H "Host: victoriaocara.com" http://localhost/ | grep -E "(301|Location)" && echo "✅ victoriaocara.com correctly redirects to HTTPS" || echo "❌ victoriaocara.com redirect issue"
echo ""

# Test actual domains (if accessible)
echo "Testing actual domains:"
echo "anyway.ro:"
timeout 10 curl -s http://anyway.ro | head -3 | grep -E "(title|Zbor|Flight|Orarul)" && echo "✅ anyway.ro working" || echo "❌ anyway.ro issue"
echo ""

echo "victoriaocara.com:"
timeout 10 curl -s -I http://victoriaocara.com | grep -E "(301|Location)" && echo "✅ victoriaocara.com redirect working" || echo "❌ victoriaocara.com issue"
echo ""

echo "=== VERIFICATION COMPLETE ==="