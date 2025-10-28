# 📧 Email Flows Integration

## 🎯 Serviço Criado: `emailFlowService.ts`

Integração com Directus Flows para envio de emails com templates Liquid personalizados em português.

### ✅ Flow Configurado:

**Password Reset Email:**
- **Flow ID:** `93097043-26b6-4311-8aae-e1e2632494b8`
- **Webhook URL:** `/flows/trigger/93097043-26b6-4311-8aae-e1e2632494b8`
- **Template:** Liquid personalizado em português
- **Funcionalidade:** Envia email de redefinição de palavra-passe

---

## 🔄 Duas Abordagens Disponíveis

### Abordagem 1: Usar Email Padrão do Directus (Atual)
**Arquivo:** `ForgotPasswordPage.tsx`

```typescript
// Usa o endpoint nativo do Directus
await fetch(`${DIRECTUS_URL}/auth/password/request`, {
  method: 'POST',
  body: JSON.stringify({
    email,
    reset_url: `${window.location.origin}/reset-password`,
  }),
});
```

**Vantagens:**
- ✅ Simples e direto
- ✅ Gerenciamento automático de tokens
- ✅ Segurança integrada

**Desvantagens:**
- ❌ Email em inglês (template padrão do Directus)
- ❌ Design básico
- ❌ Difícil de personalizar

---

### Abordagem 2: Usar Flow com Template Liquid (Recomendado)
**Arquivo:** `ForgotPasswordPageWithFlow.tsx`

```typescript
// 1. Gerar token personalizado
const resetToken = generateResetToken();

// 2. Salvar token no Directus
await directus.request(
  createItem('password_resets', {
    email,
    token: resetToken,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
  })
);

// 3. Enviar email via Flow
await sendPasswordResetEmail(email, resetToken);
```

**Vantagens:**
- ✅ Email em português 🇵🇹
- ✅ Design moderno e profissional
- ✅ Totalmente personalizável
- ✅ Controle total do processo

**Desvantagens:**
- ❌ Requer collection `password_resets`
- ❌ Mais código para gerenciar

---

## 🚀 Como Usar

### Opção 1: Manter Abordagem Atual (Simples)

Não fazer nada! O código atual já funciona.

### Opção 2: Migrar para Flow (Recomendado)

#### Passo 1: Criar Collection `password_resets`

No Directus, crie uma collection com os campos:
- `id` (UUID, Primary Key)
- `email` (String, Required)
- `token` (String, Required, Unique)
- `expires_at` (Timestamp, Required)
- `used` (Boolean, Default: false)
- `created_at` (Timestamp, Auto)

#### Passo 2: Atualizar Rota no App.tsx

```typescript
// Substituir
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';

// Por
import { ForgotPasswordPageWithFlow } from '@/pages/auth/ForgotPasswordPageWithFlow';

// E usar na rota
<Route path="/forgot-password" element={<ForgotPasswordPageWithFlow />} />
```

#### Passo 3: Implementar Verificação de Token

Criar página `ResetPasswordPage.tsx` que:
1. Lê o token da URL (`?token=abc123`)
2. Verifica se o token existe e não expirou
3. Permite definir nova password
4. Marca o token como usado

---

## 📝 Exemplo Completo: Reset Password Flow

### 1. Utilizador Esquece Password
```typescript
// ForgotPasswordPageWithFlow.tsx
const resetToken = generateResetToken();
await createItem('password_resets', { email, token: resetToken });
await sendPasswordResetEmail(email, resetToken);
```

### 2. Utilizador Recebe Email
- Email bonito em português 🇵🇹
- Link: `http://localhost:3000/reset-password?token=abc123`

### 3. Utilizador Clica no Link
```typescript
// ResetPasswordPage.tsx
const token = new URLSearchParams(window.location.search).get('token');

// Verificar token
const resetRequest = await directus.request(
  readItems('password_resets', {
    filter: {
      token: { _eq: token },
      used: { _eq: false },
      expires_at: { _gt: new Date() },
    },
  })
);

if (!resetRequest || resetRequest.length === 0) {
  // Token inválido ou expirado
  return;
}
```

### 4. Utilizador Define Nova Password
```typescript
// Atualizar password
await directus.request(
  updateUser(resetRequest[0].email, {
    password: newPassword,
  })
);

// Marcar token como usado
await directus.request(
  updateItem('password_resets', resetRequest[0].id, {
    used: true,
  })
);
```

---

## 🧪 Testar o Flow

### Teste Rápido via cURL:

```bash
curl -X POST http://localhost:8065/flows/trigger/93097043-26b6-4311-8aae-e1e2632494b8 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@keyprog.pt",
    "resetUrl": "http://localhost:3000/reset-password?token=abc123"
  }'
```

Depois verifique o Mailpit: http://localhost:8025

---

## 📚 Próximos Passos

### TODO: Criar Outros Flows

1. **Email Verification Flow**
   - Criar Flow no Directus
   - Copiar Webhook URL
   - Atualizar `FLOWS.EMAIL_VERIFICATION` no `emailFlowService.ts`
   - Usar em `RegisterPage.tsx`

2. **User Invitation Flow**
   - Criar Flow no Directus
   - Copiar Webhook URL
   - Atualizar `FLOWS.USER_INVITATION` no `emailFlowService.ts`
   - Usar em admin panel

---

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
VITE_DIRECTUS_URL=http://localhost:8065
```

### Flow URLs (emailFlowService.ts)

```typescript
const FLOWS = {
  PASSWORD_RESET: '/flows/trigger/93097043-26b6-4311-8aae-e1e2632494b8',
  EMAIL_VERIFICATION: '/flows/trigger/YOUR_ID_HERE', // TODO
  USER_INVITATION: '/flows/trigger/YOUR_ID_HERE', // TODO
};
```

---

**Última atualização:** 2025-10-08  
**Autor:** Equipa Keyprog
