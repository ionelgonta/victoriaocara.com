#!/bin/bash

echo "=== TESTING APPLICATIONS ON THEIR PORTS ==="
echo ""

echo "1. Testing flight schedule app on port 8080..."
echo "Expected: Should show flight schedule content with Romanian text"
response_8080=$(timeout 10 curl -s http://localhost:8080 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✓ Port 8080 is responding"
    echo "Content preview:"
    echo "$response_8080" | head -15
    echo ""
    echo "Checking for flight-related keywords:"
    echo "$response_8080" | grep -i -E "(zbor|flight|orarul|romania)" | head -5 || echo "No flight keywords found"
else
    echo "✗ Port 8080 is not responding"
fi

echo ""
echo "2. Testing art gallery app on port 3000..."
echo "Expected: Should show Victoria Ocara art gallery content"
response_3000=$(timeout 10 curl -s http://localhost:3000 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✓ Port 3000 is responding"
    echo "Content preview:"
    echo "$response_3000" | head -15
    echo ""
    echo "Checking for art gallery keywords:"
    echo "$response_3000" | grep -i -E "(victoria|art|gallery|pictur|tablou)" | head -5 || echo "No art gallery keywords found"
else
    echo "✗ Port 3000 is not responding"
fi

echo ""
echo "3. PM2 Status Check..."
pm2 list

echo ""
echo "4. Process Check..."
echo "Processes on port 8080:"
lsof -i :8080 2>/dev/null || echo "No process found on port 8080"
echo ""
echo "Processes on port 3000:"
lsof -i :3000 2>/dev/null || echo "No process found on port 3000"

echo ""
echo "=== APPLICATION TEST COMPLETE ==="