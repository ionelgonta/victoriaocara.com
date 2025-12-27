#!/bin/bash

echo "🔧 Fixing upload limits for image uploads..."

# Backup current nginx config
echo "📋 Creating backup of current nginx config..."
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)

# Copy the updated nginx config
echo "📝 Updating nginx configuration..."
if [ -f "nginx-multi-domain-config.txt" ]; then
    sudo cp nginx-multi-domain-config.txt /etc/nginx/sites-available/default
    echo "✅ Multi-domain nginx config applied"
elif [ -f "nginx-simple-config.txt" ]; then
    sudo cp nginx-simple-config.txt /etc/nginx/sites-available/default
    echo "✅ Simple nginx config applied"
else
    echo "❌ No nginx config file found!"
    exit 1
fi

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    # Reload nginx
    echo "🔄 Reloading nginx..."
    sudo systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx reloaded successfully"
        echo ""
        echo "🎉 Upload limits fixed!"
        echo "📊 New limits:"
        echo "   • Nginx: 10MB (client_max_body_size)"
        echo "   • API routes: 10MB"
        echo "   • Frontend validation: 10MB"
        echo "   • Axios timeout: 60 seconds"
        echo ""
        echo "🔍 You can now upload images up to 10MB without getting 413 errors"
    else
        echo "❌ Failed to reload nginx"
        exit 1
    fi
else
    echo "❌ Nginx configuration test failed"
    echo "🔄 Restoring backup..."
    sudo cp /etc/nginx/sites-available/default.backup.* /etc/nginx/sites-available/default
    exit 1
fi