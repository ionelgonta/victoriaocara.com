#!/bin/bash

echo "🧪 Testând limitele pentru toate API-urile (inclusiv cu ID-uri)..."

# Creează un fișier de test de 8MB
echo "📁 Creez fișier de test 8MB..."
dd if=/dev/zero of=/tmp/test_8mb.json bs=1M count=8 2>/dev/null

# Lista API-urilor de testat (inclusiv cu ID-uri)
declare -A apis=(
    ["upload"]="POST"
    ["upload-public"]="POST"
    ["paintings"]="POST"
    ["paintings/test123"]="PUT"
    ["custom-painting-request"]="POST"
    ["custom-painting-request/test123"]="PUT"
    ["orders"]="POST"
    ["orders/test123"]="PUT"
    ["price-offers"]="POST"
    ["price-offers/test123"]="PUT"
    ["similar-requests"]="POST"
    ["similar-requests/test123"]="PUT"
)

echo ""
echo "🔍 Testez API-urile cu fișier de 8MB..."

for api in "${!apis[@]}"; do
    method="${apis[$api]}"
    echo -n "Testing $method /api/$api: "
    
    if [[ "$api" == "upload" || "$api" == "upload-public" ]]; then
        # Pentru upload APIs folosim multipart/form-data
        response=$(curl -s -X "$method" "https://victoriaocara.com/api/$api" \
          -H 'Authorization: Bearer test' \
          -F 'file=@/tmp/test_8mb.json' \
          -w '%{http_code}' -o /dev/null)
    else
        # Pentru alte APIs folosim JSON
        response=$(curl -s -X "$method" "https://victoriaocara.com/api/$api" \
          -H 'Authorization: Bearer test' \
          -H 'Content-Type: application/json' \
          -d '@/tmp/test_8mb.json' \
          -w '%{http_code}' -o /dev/null)
    fi
    
    if [[ "$response" == "401" || "$response" == "400" || "$response" == "500" || "$response" == "404" ]]; then
        echo "✅ Trece prin nginx (HTTP $response)"
    elif [[ "$response" == "413" ]]; then
        echo "❌ Blocat de nginx (HTTP 413)"
    else
        echo "⚠️  Răspuns neașteptat (HTTP $response)"
    fi
done

# Curăță fișierul de test
rm -f /tmp/test_8mb.json

echo ""
echo "🎯 Testare completă!"
echo "   ✅ API-urile (inclusiv cu ID-uri) ar trebui să primească cereri până la 10MB"
echo "   ❌ Cererile > 10MB vor fi respinse cu 413"
echo ""
echo "🌐 Testează acum în admin: https://victoriaocara.com/admin"