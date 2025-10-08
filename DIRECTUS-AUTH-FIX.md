# 🔧 Fix: Directus Authentication 401 Error

## ❌ Problema Identificado

**Erro:** `Failed to load resource: the server responded with a status of 401 (Unauthorized)`

**Causa:** O cliente Directus estava a usar o URL errado para autenticação:
- ❌ Estava a usar: `http://localhost:3000/auth/login` (Vite dev server)
- ✅ Deveria usar: `http://localhost:8065/auth/login` (Directus server)

## ✅ Solução Aplicada

### Ficheiro Modificado
**`/src/lib/directus.ts`**

### Alteração
```typescript
// ANTES (ERRADO)
if (isBrowser) {
  // In development browser, use the current origin to leverage Vite proxy
  // This avoids CORS issues by proxying through the Vite dev server
  return window.location.origin; // ❌ Retorna http://localhost:3000
}

// DEPOIS (CORRETO)
// In development, always use the VITE_DIRECTUS_URL from environment
// This ensures we connect to the correct Directus instance (localhost:8065)
return import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8065'; // ✅ Retorna http://localhost:8065
```

## 🔍 Detalhes Técnicos

### Função `getDirectusURL()`
A função agora:
1. ✅ Em **produção** → usa `VITE_DIRECTUS_URL` ou `https://keyprog.varrho.com`
2. ✅ Em **desenvolvimento** → usa `VITE_DIRECTUS_URL` (http://localhost:8065)
3. ✅ Não usa mais `window.location.origin` em desenvolvimento

### Variáveis de Ambiente
```bash
# .env
VITE_DIRECTUS_URL=http://localhost:8065  # ✅ Correto
VITE_DIRECTUS_TOKEN=F2y7HQYqSxHF45TjXk7OkDLmwnuiTS7g
```

## 🚀 Como Testar

### 1. Reiniciar o Dev Server
```bash
# Parar o servidor atual (Ctrl+C)
# Reiniciar
npm run dev
```

### 2. Verificar Console
Deve aparecer:
```
🔧 Directus Configuration: {
  url: "http://localhost:8065",  // ✅ Correto
  isProduction: false,
  ...
}
```

### 3. Testar Login
```bash
# 1. Abrir http://localhost:5173/login
# 2. Login com:
#    Email: editor@keyprog.pt
#    Password: (sua password)
# 3. Deve funcionar sem erro 401
```

## ✅ Resultado Esperado

### Antes (Erro)
```
❌ POST http://localhost:3000/auth/login → 401 Unauthorized
❌ Authentication failed with error: Invalid user credentials
```

### Depois (Sucesso)
```
✅ POST http://localhost:8065/auth/login → 200 OK
✅ Authentication successful
✅ User logged in successfully
```

## 🔐 Impacto no Editor Inline

Com esta correção:
- ✅ Autenticação funciona corretamente
- ✅ Editor-user pode fazer login
- ✅ Inline editor ativa-se após login
- ✅ Permissões são verificadas corretamente

## 📝 Notas Adicionais

### CORS
- Não é mais necessário proxy através do Vite dev server
- Directus já tem CORS configurado para localhost
- Autenticação funciona diretamente com Directus

### Tokens
- Token estático: `F2y7HQYqSxHF45TjXk7OkDLmwnuiTS7g`
- Session tokens: geridos automaticamente pelo SDK
- Refresh automático ativado (30s antes de expirar)

### Roles Permitidos
```typescript
// Editor-user e Administrator podem editar
const ALLOWED_ROLES = [
  '97ef35d8-3d16-458d-8c93-78e35b7105a4', // Editor-user
  '0582d74b-a83f-4076-849f-b588e627c868'  // Administrator
];
```

## 🐛 Troubleshooting

### Ainda recebe 401?
1. ✅ Verificar se Directus está a correr: `http://localhost:8065/admin`
2. ✅ Verificar credenciais do utilizador
3. ✅ Verificar role do utilizador (deve ser Editor-user ou Administrator)
4. ✅ Limpar localStorage: `localStorage.clear()`
5. ✅ Reiniciar dev server

### Verificar URL no Console
```javascript
// Abrir DevTools (F12) → Console
// Deve mostrar:
🔧 Directus Configuration: {
  url: "http://localhost:8065", // ✅ Deve ser 8065, não 3000 ou 5173
  ...
}
```

---

**Status:** ✅ CORRIGIDO  
**Data:** 2025-10-09  
**Ficheiro:** `/src/lib/directus.ts`
