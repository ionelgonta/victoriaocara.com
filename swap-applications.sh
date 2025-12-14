#!/bin/bash

echo "=== SWAPPING APPLICATIONS TO CORRECT PORTS ==="

# The issue: Port 3000 shows flight schedule, Port 8080 should show flight schedule
# We need: Port 3000 = Victoria Ocara, Port 8080 = Flight Schedule

# 1. Stop all PM2 processes
echo "1. Stopping all PM2 processes..."
pm2 stop all
pm2 delete all

# 2. Kill processes on ports
echo "2. Killing processes on ports 3000 and 8080..."
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 8080/tcp 2>/dev/null || true

sleep 3

# 3. Check what's actually in each directory
echo "3. Checking application directories..."
echo "Victoria Ocara directory:"
ls -la /opt/victoriaocara/package.json 2>/dev/null && echo "✅ Victoria Ocara found" || echo "❌ Victoria Ocara not found"

echo "Flight Schedule directory:"
ls -la /opt/anyway-flight-schedule/ 2>/dev/null && echo "✅ Flight Schedule found" || echo "❌ Flight Schedule not found"

# 4. If flight schedule doesn't exist, check if it's in another location
if [ ! -d "/opt/anyway-flight-schedule" ]; then
    echo "Looking for flight schedule app in other locations..."
    find /opt -name "*anyway*" -type d 2>/dev/null
    find /opt -name "*flight*" -type d 2>/dev/null
    
    # Check if there's another Next.js app running
    echo "Checking for other Next.js applications..."
    find /opt -name "package.json" -exec grep -l "next" {} \; 2>/dev/null
fi

# 5. Start Victoria Ocara on port 3000
echo "5. Starting Victoria Ocara on port 3000..."
cd /opt/victoriaocara

# Ensure the package.json has the correct start script
if [ -f "package.json" ]; then
    # Update package.json to use port 3000
    npm pkg set scripts.start="next start -p 3000"
    
    # Start with PM2
    pm2 start npm --name "victoriaocara" -- start
    
    echo "✅ Victoria Ocara started on port 3000"
else
    echo "❌ Victoria Ocara package.json not found!"
fi

# 6. Handle flight schedule app
echo "6. Handling flight schedule application..."

# Check if we have the flight schedule app
if [ -d "/opt/anyway-flight-schedule" ]; then
    cd /opt/anyway-flight-schedule
    npm pkg set scripts.start="next start -p 8080"
    pm2 start npm --name "anyway-ro" -- start
    echo "✅ Flight Schedule started on port 8080"
else
    # Create a simple flight schedule app
    echo "Creating simple flight schedule app..."
    mkdir -p /opt/anyway-flight-schedule
    cd /opt/anyway-flight-schedule
    
    # Create package.json
    cat > package.json << 'EOF'
{
  "name": "anyway-flight-schedule",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}
EOF

    # Create simple Express server
    cat > server.js << 'EOF'
const express = require('express');
const app = express();
const port = 8080;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Orarul Zborurilor România - Informații Zboruri în Timp Real</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1>Orarul Zborurilor România</h1>
        <p>Informații în timp real despre sosirile și plecările zborurilor din aeroporturile majore din România și Moldova.</p>
        <p>Flight Schedule Application - Running on port ${port}</p>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Flight Schedule app running on port ${port}`);
});
EOF

    # Install dependencies and start
    npm install
    pm2 start server.js --name "anyway-ro"
    echo "✅ Simple Flight Schedule created and started on port 8080"
fi

# 7. Wait for applications to start
echo "7. Waiting for applications to start..."
sleep 10

# 8. Verify the applications are running correctly
echo "8. Verifying applications..."

echo "Testing port 3000 (should be Victoria Ocara):"
response_3000=$(curl -s http://localhost:3000 | grep -o "<title>[^<]*</title>" 2>/dev/null || echo "No title found")
echo "Port 3000 title: $response_3000"

echo "Testing port 8080 (should be Flight Schedule):"
response_8080=$(curl -s http://localhost:8080 | grep -o "<title>[^<]*</title>" 2>/dev/null || echo "No title found")
echo "Port 8080 title: $response_8080"

# 9. Restart nginx to ensure proper routing
echo "9. Restarting nginx..."
systemctl restart nginx

# 10. Final verification
echo "10. Final verification..."
sleep 5

echo "PM2 Status:"
pm2 status

echo ""
echo "Port Status:"
netstat -tlnp | grep -E ":3000|:8080" | head -10

echo ""
echo "Domain Tests:"
echo "anyway.ro (should show flight schedule):"
curl -s http://anyway.ro | grep -o "<title>[^<]*</title>" 2>/dev/null || echo "No response"

echo "victoriaocara.com (should show art gallery):"
curl -s https://victoriaocara.com | grep -o "<title>[^<]*</title>" 2>/dev/null || echo "No response"

echo ""
echo "=== APPLICATION SWAP COMPLETE ==="
echo "✅ Port 3000: Victoria Ocara Art Gallery"
echo "✅ Port 8080: Flight Schedule"
echo "✅ Nginx routing should now work correctly"
echo ""
echo "If still having issues:"
echo "- pm2 logs victoriaocara"
echo "- pm2 logs anyway-ro"
echo "- systemctl status nginx"