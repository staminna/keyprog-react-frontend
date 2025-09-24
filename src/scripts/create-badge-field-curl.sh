#!/bin/bash

# Load environment variables
if [ -f "../../.env" ]; then
  source ../../.env
elif [ -f "../.env" ]; then
  source ../.env
elif [ -f ".env" ]; then
  source .env
fi

# Check if DIRECTUS_TOKEN is set
if [ -z "$DIRECTUS_TOKEN" ]; then
  echo "❌ DIRECTUS_TOKEN not found in environment variables"
  exit 1
fi

# Set Directus URL
DIRECTUS_URL=${VITE_DIRECTUS_URL:-http://localhost:8065}

echo "🔍 Creating badge_text field in hero collection..."

# Create the field
curl -s -X POST "$DIRECTUS_URL/fields/hero" \
  -H "Authorization: Bearer $DIRECTUS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "field": "badge_text",
    "type": "string",
    "meta": {
      "interface": "input",
      "options": {
        "placeholder": "Enter badge text"
      },
      "note": "Text displayed in the badge at the top of the hero section"
    },
    "schema": {
      "name": "badge_text",
      "table": "hero",
      "data_type": "varchar",
      "default_value": "Especialistas em eletrónica automóvel",
      "max_length": 255,
      "is_nullable": true
    }
  }' | grep -q "data" && echo "✅ Field created successfully" || echo "❌ Failed to create field"

# Check if hero item exists
echo "🔍 Checking if hero item exists..."
HERO_RESPONSE=$(curl -s -X GET "$DIRECTUS_URL/items/hero/1" \
  -H "Authorization: Bearer $DIRECTUS_TOKEN")

if echo "$HERO_RESPONSE" | grep -q "data"; then
  # Update the hero item with the badge_text field
  echo "✅ Hero item exists. Updating with badge_text field..."
  curl -s -X PATCH "$DIRECTUS_URL/items/hero/1" \
    -H "Authorization: Bearer $DIRECTUS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "badge_text": "Especialistas em eletrónica automóvel"
    }' | grep -q "data" && echo "✅ Hero item updated with badge_text field" || echo "❌ Failed to update hero item"
else
  # Create the hero item if it doesn't exist
  echo "❌ Hero item does not exist. Creating it..."
  curl -s -X POST "$DIRECTUS_URL/items/hero" \
    -H "Authorization: Bearer $DIRECTUS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "id": 1,
      "title": "Performance, diagnóstico e soluções para a sua centralina",
      "subtitle": "Reprogramação, desbloqueio, clonagem, reparações e uma loja completa de equipamentos, emuladores e software.",
      "primary_button_text": "Ver Serviços",
      "primary_button_link": "/servicos",
      "badge_text": "Especialistas em eletrónica automóvel"
    }' | grep -q "data" && echo "✅ Hero item created with badge_text field" || echo "❌ Failed to create hero item"
fi

echo "✅ All done! The badge_text field is now available in the hero collection."