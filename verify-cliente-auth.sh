#!/bin/bash
echo "🔍 Verificação rápida - Cliente Auth"
echo "=================================="

# Verificar .env
CLIENTE_ID=$(grep "VITE_DIRECTUS_CLIENTE_ROLE_ID" .env | cut -d'=' -f2)
echo "Cliente Role ID no .env: $CLIENTE_ID"

# Teste de login
echo ""
echo "Para testar:"
echo "1. Vá para http://localhost:3000/login"
echo "2. Use credenciais de uma conta com role Cliente"
echo "3. Deve redirecionar para /file-service"
echo "4. Se ainda mostrar erro, execute no console:"
echo "   window.diagnoseAuth()"
