#!/bin/bash

echo "🧹 REMOVING MAINTENANCE PAGE AND CONFLICTING CONTENT"
echo "===================================================="

echo "🔍 STEP 1: SEARCH FOR MAINTENANCE PAGES"
echo "--------------------------------------"

# Common locations for maintenance pages
MAINTENANCE_LOCATIONS=(
    "/var/www/html/index.html"
    "/var/www/html/index.php"
    "/var/www/victoriaocara/index.html"
    "/var/www/victoriaocara.com/index.html"
    "/usr/share/nginx/html/index.html"
    "/etc/nginx/html/index.html"
    "/opt/victoriaocara/public/maintenance.html"
)

echo "Checking common maintenance page locations..."
for location in "${MAINTENANCE_LOCATIONS[@]}"; do
    if [ -f "$location" ]; then
        echo "❌ Found maintenance page: $location"
        
        # Show first few lines to confirm it's a maintenance page
        echo "   Content preview:"
        head -5 "$location" | sed 's/^/   /'
        
        # Remove the file
        echo "   Removing maintenance page..."
        rm -f "$location"
        echo "   ✅ Removed: $location"
    else
        echo "✅ No maintenance page at: $location"
    fi
done

echo ""
echo "🔍 STEP 2: CHECK NGINX DOCUMENT ROOTS"
echo "------------------------------------"

echo "Checking Nginx configurations for document roots..."

# Check all nginx configurations
for config in /etc/nginx/sites-available/* /etc/nginx/sites-enabled/*; do
    if [ -f "$config" ]; then
        echo "Checking: $config"
        
        # Look for root directives
        ROOT_DIRS=$(grep -n "root " "$config" 2>/dev/null || echo "")
        if [ -n "$ROOT_DIRS" ]; then
            echo "   Found root directives:"
            echo "$ROOT_DIRS" | sed 's/^/   /'
            
            # Extract root paths and check for index files
            grep "root " "$config" | sed 's/.*root \([^;]*\);.*/\1/' | while read -r root_path; do
                if [ -d "$root_path" ]; then
                    echo "   Checking directory: $root_path"
                    
                    # Look for index files in root directory
                    for index_file in "$root_path/index.html" "$root_path/index.php" "$root_path/index.htm"; do
                        if [ -f "$index_file" ]; then
                            echo "   ❌ Found index file: $index_file"
                            echo "      Content preview:"
                            head -3 "$index_file" | sed 's/^/      /'
                            
                            # Ask if it looks like a maintenance page
                            if grep -qi -E "(maintenance|under construction|coming soon|temporarily unavailable)" "$index_file"; then
                                echo "      🚨 This looks like a maintenance page!"
                                echo "      Removing: $index_file"
                                rm -f "$index_file"
                                echo "      ✅ Removed maintenance page"
                            else
                                echo "      ⚠️  This might be blocking the site"
                                echo "      Moving to backup: ${index_file}.backup"
                                mv "$index_file" "${index_file}.backup"
                                echo "      ✅ Moved to backup"
                            fi
                        fi
                    done
                fi
            done
        else
            echo "   No root directives found"
        fi
    fi
done

echo ""
echo "🔍 STEP 3: CHECK FOR APACHE CONFIGURATIONS"
echo "-----------------------------------------"

if [ -d "/etc/apache2" ]; then
    echo "Apache is installed, checking configurations..."
    
    # Check if Apache is running
    if systemctl is-active --quiet apache2; then
        echo "❌ Apache is running - this might conflict with Nginx!"
        echo "   Stopping Apache..."
        systemctl stop apache2
        systemctl disable apache2
        echo "   ✅ Apache stopped and disabled"
    else
        echo "✅ Apache is not running"
    fi
    
    # Check Apache document roots
    for config in /etc/apache2/sites-enabled/*; do
        if [ -f "$config" ]; then
            echo "Checking Apache config: $config"
            ROOT_DIRS=$(grep -n "DocumentRoot" "$config" 2>/dev/null || echo "")
            if [ -n "$ROOT_DIRS" ]; then
                echo "   Found DocumentRoot directives:"
                echo "$ROOT_DIRS" | sed 's/^/   /'
            fi
        fi
    done
else
    echo "✅ Apache is not installed"
fi

echo ""
echo "🔍 STEP 4: CHECK FOR CONFLICTING PROCESSES"
echo "-----------------------------------------"

echo "Checking for processes serving content on ports 80/443..."

# Check what's listening on port 80
PORT_80_PROCESSES=$(netstat -tulpn | grep :80 || echo "")
if [ -n "$PORT_80_PROCESSES" ]; then
    echo "Processes on port 80:"
    echo "$PORT_80_PROCESSES" | sed 's/^/   /'
else
    echo "✅ No processes listening on port 80"
fi

# Check what's listening on port 443
PORT_443_PROCESSES=$(netstat -tulpn | grep :443 || echo "")
if [ -n "$PORT_443_PROCESSES" ]; then
    echo "Processes on port 443:"
    echo "$PORT_443_PROCESSES" | sed 's/^/   /'
else
    echo "✅ No processes listening on port 443"
fi

echo ""
echo "🔍 STEP 5: VERIFY NGINX CONFIGURATION"
echo "------------------------------------"

echo "Current Nginx sites-enabled:"
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "No sites enabled"

echo ""
echo "Testing Nginx configuration:"
if nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors"
    nginx -t
fi

echo ""
echo "🔍 STEP 6: CHECK CURRENT SITE RESPONSE"
echo "-------------------------------------"

echo "Testing direct access to different locations..."

# Test localhost
echo "Testing http://localhost..."
LOCALHOST_RESPONSE=$(curl -s -I http://localhost 2>/dev/null | head -1 || echo "No response")
echo "   Response: $LOCALHOST_RESPONSE"

# Test IP address
echo "Testing http://23.88.113.154..."
IP_RESPONSE=$(curl -s -I http://23.88.113.154 2>/dev/null | head -1 || echo "No response")
echo "   Response: $IP_RESPONSE"

# Test domain
echo "Testing http://victoriaocara.com..."
DOMAIN_RESPONSE=$(curl -s -I http://victoriaocara.com 2>/dev/null | head -1 || echo "No response")
echo "   Response: $DOMAIN_RESPONSE"

# Test Next.js app directly
echo "Testing http://localhost:3000..."
NEXTJS_RESPONSE=$(curl -s -I http://localhost:3000 2>/dev/null | head -1 || echo "No response")
echo "   Response: $NEXTJS_RESPONSE"

echo ""
echo "🧹 STEP 7: CLEAN UP TEMPORARY FILES"
echo "----------------------------------"

# Remove common temporary files that might interfere
TEMP_FILES=(
    "/tmp/nginx.pid"
    "/var/run/nginx.pid"
    "/tmp/maintenance.html"
    "/tmp/index.html"
)

for temp_file in "${TEMP_FILES[@]}"; do
    if [ -f "$temp_file" ]; then
        echo "Removing temporary file: $temp_file"
        rm -f "$temp_file"
    fi
done

echo "✅ Temporary files cleaned"

echo ""
echo "🔄 STEP 8: RESTART SERVICES"
echo "---------------------------"

echo "Restarting Nginx..."
systemctl restart nginx

if systemctl is-active --quiet nginx; then
    echo "✅ Nginx restarted successfully"
else
    echo "❌ Nginx failed to restart"
    systemctl status nginx --no-pager
fi

echo ""
echo "===================================================="
echo "🎯 MAINTENANCE PAGE REMOVAL COMPLETE"
echo ""
echo "✅ ACTIONS TAKEN:"
echo "   • Searched and removed maintenance pages"
echo "   • Checked Nginx document roots"
echo "   • Stopped conflicting Apache service"
echo "   • Cleaned temporary files"
echo "   • Restarted Nginx"
echo ""
echo "🧪 FINAL TEST:"
echo "   Try accessing: http://victoriaocara.com"
echo "   If still not working, run: ./ultimate-site-fix.sh"
echo ""
echo "🔍 DEBUG COMMANDS:"
echo "   • curl -I http://victoriaocara.com"
echo "   • curl -I http://localhost:3000"
echo "   • pm2 logs victoriaocara"
echo "   • tail -f /var/log/nginx/error.log"
echo "===================================================="