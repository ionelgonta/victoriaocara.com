#!/bin/bash

echo "🔍 DEBUGGING REACT ERROR #31..."

echo "1. Checking for object rendering in components..."

# Search for potential React error #31 issues
echo "   Searching for {en:, ro:} objects being rendered directly..."
grep -r "{\s*en\s*:" app/ components/ --include="*.tsx" --include="*.ts" -n || echo "   No direct object rendering found"

echo ""
echo "2. Checking safeRender usage..."
grep -r "safeRender" app/ components/ lib/ --include="*.tsx" --include="*.ts" -n || echo "   No safeRender usage found"

echo ""
echo "3. Checking getLocalizedText usage..."
grep -r "getLocalizedText" app/ components/ --include="*.tsx" --include="*.ts" -n || echo "   No getLocalizedText usage found"

echo ""
echo "4. Checking for multilingual object handling..."
grep -r "language\[" app/ components/ --include="*.tsx" --include="*.ts" -n || echo "   No direct language object access found"

echo ""
echo "5. Testing build for errors..."
npm run build 2>&1 | grep -i error || echo "   Build completed without errors"

echo ""
echo "✅ React error #31 debug complete!"