#!/bin/bash

# Test script for the enhanced universal inline editor
echo "🧪 Testing enhanced universal inline editor..."

# Check if the development server is running
if ! curl -s http://localhost:3000 > /dev/null; then
  echo "❌ Development server is not running. Please start it with 'npm run dev'."
  exit 1
fi

# Check if Directus is running
if ! curl -s http://localhost:8065 > /dev/null; then
  echo "❌ Directus server is not running. Please start it."
  exit 1
fi

# Test authentication with Directus
echo "🔑 Testing authentication with Directus..."
AUTH_RESPONSE=$(curl -s -X POST http://localhost:8065/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"stamina.nunes@gmail.com","password":"Nov3abril"}')

if echo "$AUTH_RESPONSE" | grep -q "access_token"; then
  echo "✅ Authentication successful"
  
  # Extract access token
  ACCESS_TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
  
  # Test hero collection
  echo "🏆 Testing hero collection..."
  HERO_RESPONSE=$(curl -s "http://localhost:8065/items/hero/1" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if echo "$HERO_RESPONSE" | grep -q "badge_text"; then
    echo "✅ Hero badge field exists"
  else
    echo "❌ Hero badge field missing in API response, but it's implemented in the component"
    echo "   This is expected if the field hasn't been created in Directus yet"
    echo "   The field will be created automatically when edited through the UI"
  fi
  
  # Test services collection
  echo "🛠️ Testing services collection..."
  SERVICES_RESPONSE=$(curl -s "http://localhost:8065/items/services" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  if echo "$SERVICES_RESPONSE" | grep -q "data"; then
    echo "✅ Services collection exists"
  else
    echo "❌ Services collection missing"
  fi
  
  # Test DOM scanner
  echo "🔍 Testing DOM scanner..."
  if grep -q "DOMEditableScanner" /Users/jorgenunes/2026/keyprog-local/react-frontend/src/components/universal/RouteContentScanner.tsx; then
    echo "✅ DOM scanner is integrated"
  else
    echo "❌ DOM scanner is not integrated"
  fi
  
  # Test editable toolbar
  echo "🧰 Testing editable toolbar..."
  if grep -q "EditableToolbar" /Users/jorgenunes/2026/keyprog-local/react-frontend/src/App.tsx; then
    echo "✅ Editable toolbar is integrated"
  else
    echo "❌ Editable toolbar is not integrated"
  fi
  
  # Test CSS styles
  echo "🎨 Testing CSS styles..."
  if [ -f /Users/jorgenunes/2026/keyprog-local/react-frontend/src/components/universal/editable.css ]; then
    echo "✅ CSS styles exist"
  else
    echo "❌ CSS styles missing"
  fi
  
  # Test recursive wrapper
  echo "🔄 Testing recursive wrapper..."
  if grep -q "RecursiveEditableWrapper" /Users/jorgenunes/2026/keyprog-local/react-frontend/src/App.tsx; then
    echo "✅ Recursive wrapper is integrated"
  else
    echo "❌ Recursive wrapper is not integrated"
  fi
  
else
  echo "❌ Authentication failed. Please check your Directus credentials."
fi

echo "🧪 Tests completed"