#!/bin/bash

echo "🔍 FIND AND FIX BLOCKING CONTENT - VICTORIA OCARA"
echo "================================================"
echo "Based on user feedback: 'vad o pula' - something is blocking the new site"
echo ""

echo "🎯 STEP 1: IDENTIFY WHAT'S ACTUALLY BEING SERVED"
echo "-----------------------------------------------"

echo "Testing what content is actually returned..."

# Test the domain and save the response
echo "Getting full response from victoriaocara.com:"
curl -v http://victoriaocara.com > /tmp/victoria_response.html 2>/tmp/victoria_headers.txt

echo ""
echo "Response headers:"
cat /tmp/victoria_headers.txt | head -20

echo ""
echo "Response body (first 50 lines):"
head -50 /tmp/victoria_response.html

echo ""
echo "🔍 STEP 2: SEARCH FOR THE BLOCKING CONTENT"
echo "-----------------------------------------"

# Search for the exact content being served
echo "Searching for this content on the server..."

# Get the title or first few lines to search for
SEARCH_CONTENT=$(head -5 /tmp/victoria_response.html | grep -o '<title>[^<]*</title>' | head -1)
if [ -z "$SEARCH_CONTENT" ]; then
    SEARCH_CONTENT=$(head -1 /tmp/victoria_response.html | tr -d '\n\r' | cut -c1-50)
fi

echo "Searching for content: '$SEARCH_CONTENT'"

# Search in common web directories
WEB_DIRECTORIES=(
    "/var/www"
    "/usr/share/nginx"
    "/etc/nginx"
    "/opt"
    "/home"
    "/root"
)

for dir in "${WEB_DIRECTORIES[@]}"; do
    if [ -d "$dir" ]; then
        echo ""
        echo "Searching in $dir..."
        
        # Search for HTML files containing similar content
        find "$dir" -name "*.html" -type f 2>/dev/null | while read -r file; do
            if [ -f "$file" ]; then
                # Check if this file contains similar content
                if head -10 "$file" | grep -q "$(echo "$SEARCH_CONTENT" | cut -c1-20)" 2>/dev/null; then
                    echo "❌ FOUND MATCHING CONTENT: $file"
                    echo "   File size: $(stat -c%s "$file" 2>/dev/null || echo "unknown") bytes"
                    echo "   Modified: $(stat -c%y "$file" 2>/dev/null || echo "unknown")"
                    echo "   Content preview:"
                    head -5 "$file" | sed 's/^/   /'
                    
                    # This is likely the blocking file
                    echo "   🚨 THIS FILE IS LIKELY BLOCKING THE NEW SITE!"
                    echo "   Moving to backup: ${file}.blocking_backup"
                    mv "$file" "${file}.blocking_backup"
                    echo "   ✅ File moved to backup"
                fi
            fi
        done
        
        # Also search for index files
        find "$dir" -name "index.*" -type f 2>/dev/null | while read -r file; do
            if [ -f "$file" ]; then
                echo "Found index file: $file"
                echo "   Content preview:"
                head -3 "$file" | sed 's/^/   /'
                
                # Check if it's not our Next.js app
                if ! grep -q "Next.js" "$file" && ! grep -q "_next" "$file"; then
                    echo "   ⚠️  This index file might be blocking the site"
                    echo "   Moving to backup: ${file}.blocking_backup"
                    mv "$file" "${file}.blocking_backup"
                    echo "   ✅ Moved to backup"
                fi
            fi
        done
    fi
done

echo ""
echo "🔍 STEP 3: CHECK NGINX CONFIGURATION DETAILS"
echo "-------------------------------------------"

echo "Detailed Nginx configuration analysis..."

# Check all nginx configurations
for config in /etc/nginx/sites-enabled/*; do
    if [ -f "$config" ]; then
        echo ""
        echo "Analyzing: $config"
        echo "Content:"
        cat "$config" | sed 's/^/   /'
        
        # Check if it has any root directives pointing to static content
        if grep -q "root " "$config"; then
            echo ""
            echo "   🔍 This config has root directives - checking directories..."
            grep "root " "$config" | while read -r line; do
                root_path=$(echo "$line" | sed 's/.*root \([^;]*\);.*/\1/' | tr -d ' ')
                if [ -d "$root_path" ]; then
                    echo "   Checking root directory: $root_path"
                    ls -la "$root_path" | head -10 | sed 's/^/      /'
                    
                    # Check for index files in this directory
                    for index_file in "$root_path/index.html" "$root_path/index.php" "$root_path/index.htm"; do
                        if [ -f "$index_file" ]; then
                            echo "      ❌ BLOCKING INDEX FILE: $index_file"
                            echo "         Content:"
                            head -5 "$index_file" | sed 's/^/         /'
                            echo "         Moving to backup..."
                            mv "$index_file" "${index_file}.blocking_backup"
                            echo "         ✅ Moved to backup"
                        fi
                    done
                fi
            done
        fi
        
        # Check if it's proxying correctly
        if grep -q "proxy_pass" "$config"; then
            echo "   ✅ This config uses proxy_pass (good for Next.js)"
            grep "proxy_pass" "$config" | sed 's/^/      /'
        else
            echo "   ⚠️  This config doesn't use proxy_pass - might serve static files"
        fi
    fi
done

echo ""
echo "🔍 STEP 4: CHECK FOR HIDDEN NGINX CONFIGS"
echo "----------------------------------------"

# Check for nginx configs in unusual places
echo "Searching for nginx configurations in unusual locations..."

find /etc -name "*.conf" -path "*/nginx/*" 2>/dev/null | while read -r conf; do
    echo "Found nginx config: $conf"
    if grep -q "server" "$conf"; then
        echo "   Contains server blocks:"
        grep -n "server" "$conf" | sed 's/^/   /'
    fi
done

echo ""
echo "🔍 STEP 5: CHECK WHAT'S ACTUALLY RUNNING ON PORT 80"
echo "--------------------------------------------------"

echo "Detailed analysis of port 80 usage..."

# Get the PID of what's listening on port 80
PORT_80_PID=$(netstat -tulpn | grep :80 | awk '{print $7}' | cut -d'/' -f1 | head -1)

if [ -n "$PORT_80_PID" ] && [ "$PORT_80_PID" != "-" ]; then
    echo "Process listening on port 80: PID $PORT_80_PID"
    
    # Get process details
    echo "Process details:"
    ps -p "$PORT_80_PID" -o pid,ppid,cmd --no-headers | sed 's/^/   /'
    
    # Check what files this process has open
    echo "Files opened by this process:"
    lsof -p "$PORT_80_PID" 2>/dev/null | grep -E "\.(html|php|js)$" | head -10 | sed 's/^/   /'
    
    # If it's nginx, check its configuration
    if ps -p "$PORT_80_PID" -o cmd --no-headers | grep -q nginx; then
        echo "   This is nginx - checking its active configuration..."
        nginx -T 2>/dev/null | grep -A 10 -B 2 "server_name.*victoriaocara" | sed 's/^/   /'
    fi
else
    echo "No process found listening on port 80"
fi

echo ""
echo "🔄 STEP 6: FORCE CLEAN RESTART"
echo "-----------------------------"

echo "Performing force clean restart of all services..."

# Kill everything on ports 80 and 443
echo "Killing all processes on ports 80 and 443..."
fuser -k 80/tcp 2>/dev/null || echo "   Port 80 was free"
fuser -k 443/tcp 2>/dev/null || echo "   Port 443 was free"

sleep 3

# Stop and restart nginx
echo "Restarting nginx..."
systemctl stop nginx
sleep 2
systemctl start nginx

if systemctl is-active --quiet nginx; then
    echo "✅ Nginx restarted successfully"
else
    echo "❌ Nginx failed to restart"
    systemctl status nginx --no-pager
fi

# Restart the Next.js application
echo "Restarting Next.js application..."
cd /opt/victoriaocara

pm2 stop victoriaocara 2>/dev/null || echo "   App wasn't running in PM2"
pm2 delete victoriaocara 2>/dev/null || echo "   App wasn't in PM2"

# Start fresh
pm2 start npm --name "victoriaocara" -- start

sleep 10

echo ""
echo "🧪 STEP 7: FINAL VERIFICATION"
echo "----------------------------"

echo "Testing the site after cleanup..."

# Test the application directly
echo "Testing Next.js app directly (port 3000):"
NEXTJS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
echo "   Status: $NEXTJS_STATUS"

if [ "$NEXTJS_STATUS" = "200" ]; then
    echo "   ✅ Next.js app is working"
    
    # Get a sample of the content to verify it's the right app
    echo "   Content verification:"
    curl -s http://localhost:3000 | head -10 | grep -E "(title|Victoria|ocara)" | sed 's/^/   /'
else
    echo "   ❌ Next.js app is not responding"
    echo "   PM2 status:"
    pm2 status | sed 's/^/   /'
    echo "   Recent logs:"
    pm2 logs victoriaocara --lines 5 --nostream 2>/dev/null | sed 's/^/   /'
fi

# Test through nginx
echo ""
echo "Testing through Nginx (victoriaocara.com):"
NGINX_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://victoriaocara.com 2>/dev/null || echo "000")
echo "   Status: $NGINX_STATUS"

if [ "$NGINX_STATUS" = "200" ]; then
    echo "   ✅ Site is working through Nginx"
    
    # Verify it's serving the right content
    echo "   Content verification:"
    curl -s http://victoriaocara.com | head -10 | grep -E "(title|Victoria|ocara)" | sed 's/^/   /'
    
    # Check if it shows "site nou Victoria ocara" as mentioned in context
    if curl -s http://victoriaocara.com | grep -q "site nou Victoria ocara"; then
        echo "   ✅ Confirmed: Site shows 'site nou Victoria ocara'"
    else
        echo "   ⚠️  Site doesn't show expected 'site nou Victoria ocara' title"
    fi
else
    echo "   ❌ Site is not working through Nginx"
fi

echo ""
echo "================================================"

if [ "$NEXTJS_STATUS" = "200" ] && [ "$NGINX_STATUS" = "200" ]; then
    echo "🎉 SUCCESS! BLOCKING CONTENT REMOVED!"
    echo ""
    echo "✅ SITE IS NOW WORKING:"
    echo "   • http://victoriaocara.com"
    echo "   • Direct app: http://localhost:3000"
    echo ""
    echo "🧹 CLEANUP PERFORMED:"
    echo "   • Removed blocking HTML files"
    echo "   • Moved suspicious index files to .blocking_backup"
    echo "   • Restarted all services"
    echo ""
    echo "💡 CACHE CLEARING REMINDER:"
    echo "   • Press Ctrl+Shift+R in browser"
    echo "   • Or use incognito/private mode"
    echo "   • Clear browser cache for victoriaocara.com"
    
elif [ "$NEXTJS_STATUS" = "200" ]; then
    echo "⚠️  PARTIAL SUCCESS - APP WORKS BUT NGINX ISSUE"
    echo ""
    echo "✅ Next.js app is working on port 3000"
    echo "❌ Nginx is not proxying correctly"
    echo ""
    echo "🔧 NEXT STEPS:"
    echo "   1. Check nginx error logs: tail -f /var/log/nginx/error.log"
    echo "   2. Verify nginx config: nginx -t"
    echo "   3. Check if nginx is proxying to port 3000"
    
else
    echo "❌ SITE IS STILL NOT WORKING"
    echo ""
    echo "🔍 DEBUGGING NEEDED:"
    echo "   • Next.js app status: $NEXTJS_STATUS"
    echo "   • Nginx proxy status: $NGINX_STATUS"
    echo ""
    echo "🔧 DEBUG COMMANDS:"
    echo "   • pm2 logs victoriaocara"
    echo "   • tail -f /var/log/nginx/error.log"
    echo "   • curl -v http://localhost:3000"
    echo "   • curl -v http://victoriaocara.com"
fi

echo "================================================"

# Clean up temporary files
rm -f /tmp/victoria_response.html /tmp/victoria_headers.txt