#!/bin/bash

# 🚀 Quick Start - Teste do Editor Inline Site-Wide
# Este script inicia o frontend e abre o browser para testar

echo "================================================"
echo "🚀 Iniciando Teste do Editor Inline Site-Wide"
echo "================================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na pasta react-frontend"
    exit 1
fi

# 2. Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "${YELLOW}📦 Instalando dependências...${NC}"
    npm install
fi

# 3. Mostrar informações
echo "${BLUE}📋 Informações do Teste:${NC}"
echo ""
echo "✅ Editor Inline ativo em:"
echo "   • / (Página Inicial)"
echo "   • /servicos"
echo "   • /contactos"
echo "   • /noticias"
echo "   • /loja"
echo "   • /suporte"
echo "   • Todas as páginas públicas"
echo ""
echo "❌ Editor Inline bloqueado em:"
echo "   • /login"
echo "   • /admin"
echo "   • /forgot-password"
echo "   • /checkout"
echo "   • Páginas de autenticação"
echo ""

# 4. Mostrar credenciais de teste
echo "${YELLOW}🔑 Credenciais de Teste:${NC}"
echo "   URL: http://localhost:5173/login"
echo "   User: editor@keyprog.pt (ou admin)"
echo "   Pass: (sua password)"
echo ""

# 5. Mostrar como testar
echo "${GREEN}🧪 Como Testar:${NC}"
echo "   1. Fazer login com conta Editor/Administrador"
echo "   2. Navegar para /servicos ou /contactos"
echo "   3. Passar rato sobre títulos → contorno azul"
echo "   4. Clicar para editar"
echo "   5. Guardar (✓) ou Cancelar (✗)"
echo ""

# 6. Mostrar documentação
echo "${BLUE}📚 Documentação:${NC}"
echo "   • INLINE-EDITOR-SUMMARY.md - Resumo executivo"
echo "   • COMO-USAR-EDITOR-INLINE.md - Guia de utilizador"
echo "   • INLINE-EDITOR-GUIDE.md - Guia técnico"
echo "   • test-inline-editor.md - Checklist de testes"
echo ""

# 7. Perguntar se quer continuar
read -p "Iniciar servidor de desenvolvimento? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "${GREEN}🚀 Iniciando servidor...${NC}"
    echo ""
    echo "Servidor estará disponível em: ${BLUE}http://localhost:5173${NC}"
    echo ""
    echo "Para parar o servidor: ${YELLOW}Ctrl+C${NC}"
    echo ""
    echo "================================================"
    echo ""
    
    # Iniciar o servidor
    npm run dev
else
    echo ""
    echo "Teste cancelado. Para iniciar manualmente:"
    echo "  ${BLUE}npm run dev${NC}"
    echo ""
fi
