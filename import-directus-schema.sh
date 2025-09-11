#!/bin/bash

# Script to import Directus schema
# This will create all the collections defined in keyprog_schema_import.json

echo "🚀 Importing Directus Schema..."

# Check if schema file exists
SCHEMA_FILE="/Users/jorgenunes/2026/keyprog/keyprog-directus/keyprog_schema_import.json"

if [ ! -f "$SCHEMA_FILE" ]; then
    echo "❌ Schema file not found: $SCHEMA_FILE"
    exit 1
fi

echo "📄 Schema file found: $SCHEMA_FILE"

# Import schema using curl
echo "📥 Importing schema to Directus..."

curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d @"$SCHEMA_FILE" \
  http://localhost:8065/schema/apply

echo ""
echo "✅ Schema import completed!"
echo ""
echo "Next steps:"
echo "1. Restart your Directus instance"
echo "2. Check Directus admin panel to verify collections were created"
echo "3. Set proper permissions for the collections"
echo "4. Test the React app again"