#!/bin/bash

echo "=== COMPREHENSIVE DOMAIN ROUTING DIAGNOSIS ==="
echo "Investigating why anyway.ro serves victoriaocara.com content"
echo ""

echo "1. CHECKING PM2 APPLICATIONS..."
pm2 list
echo ""

echo "2. TESTING APPLICATIONS ON THEIR PORTS..."
echo "Port 8080 (should be flight schedule):"
timeout 5 curl -s http://localhost:8080 | head -20 | grep -E "(title|Zbor|Flight|Orarul)" || echo "No flight-related content found"
echo ""

echo "Port 3000 (should be art gallery):"
timeout 5 curl -s http://localhost:3000 | head -20 | grep -E "(title|Victoria|Art|Gallery)" || echo "No art gallery content found"
echo ""

echo "3. CHECKING NGINX CONFIGURATION..."
echo "Active nginx sites:"
ls -la /etc/nginx/sites-enabled/
echo ""

echo "Current nginx configuration content:"
if [ -f "/etc/nginx/sites-enabled/multi-domain-final" ]; then
    echo "--- /etc/nginx/sites-enabled/multi-domain-final ---"
    cat /etc/nginx/sites-enabled/multi-domain-final
else
    echo "multi-domain-final not found in sites-enabled"
fi
echo ""

echo "4. TESTING DOMAIN ROUTING..."
echo "Testing anyway.ro routing:"
curl -s -H "Host: anyway.ro" http://localhost/ | head -10
echo ""

echo "Testing victoriaocara.com routing:"
curl -s -H "Host: victoriaocara.com" http://localhost/ | head -10
echo ""

echo "5. CHECKING NGINX PROCESSES AND LOGS..."
echo "Nginx processes:"
ps aux | grep nginx
echo ""

echo "Recent nginx error logs:"
tail -20 /var/log/nginx/error.log 2>/dev/null || echo "No nginx error log found"
echo ""

echo "Recent anyway.ro logs:"
tail -10 /var/log/nginx/anyway.error.log 2>/dev/null || echo "No anyway.ro error log found"
echo ""

echo "6. CHECKING FOR CONFLICTING CONFIGURATIONS..."
echo "All nginx configuration files:"
find /etc/nginx -name "*.conf" -o -name "*victoriaocara*" -o -name "*anyway*" | xargs ls -la
echo ""

echo "7. CHECKING SYSTEM HOSTS FILE..."
grep -E "(anyway|victoria)" /etc/hosts || echo "No relevant entries in /etc/hosts"
echo ""

echo "8. CHECKING LISTENING PORTS..."
netstat -tlnp | grep -E ":80|:443|:3000|:8080"
echo ""

echo "=== DIAGNOSIS COMPLETE ==="
echo "This will help identify the exact routing issue."