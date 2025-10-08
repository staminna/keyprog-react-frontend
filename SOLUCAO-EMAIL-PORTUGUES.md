# ✅ Solução: Email em Português

## 🚨 Problema Identificado

O email estava saindo em inglês porque o código estava usando o endpoint **`/auth/password/request`** do Directus, que:
- ✅ Gera o token automaticamente
- ✅ É seguro e confiável
- ❌ **Envia email padrão em inglês** (não usa o Flow!)

```typescript
// ❌ CÓDIGO ANTIGO - Enviava email em inglês
await fetch(`${DIRECTUS_URL}/auth/password/request`, {
  method: 'POST',
  body: JSON.stringify({
    email,
    reset_url: `${window.location.origin}/reset-password`,
  }),
});
```

---

## ✅ Solução Implementada

Agora o código **NÃO usa** o endpoint do Directus. Em vez disso:
1. Gera o token manualmente
2. Chama o Flow diretamente via webhook
3. Flow usa template Liquid em português 🇵🇹

```typescript
// ✅ CÓDIGO NOVO - Envia email em português via Flow
const resetToken = generateToken();
await sendPasswordResetEmail(email, resetToken);
```

---

## 📝 Mudanças Feitas

### 1. **ForgotPasswordPage.tsx** (Atualizado)
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // Gerar token de reset
    const resetToken = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    // Enviar email via Flow (template Liquid em português)
    const emailSent = await sendPasswordResetEmail(email, resetToken);

    if (!emailSent) {
      throw new Error('Falha ao enviar email');
    }

    setSuccess(true);
  } catch (err) {
    setError('Erro ao enviar email.');
  } finally {
    setIsLoading(false);
  }
};
```

### 2. **emailFlowService.ts** (Já configurado)
```typescript
const FLOWS = {
  PASSWORD_RESET: '/flows/trigger/93097043-26b6-4311-8aae-e1e2632494b8', // ✅
  EMAIL_VERIFICATION: '/flows/trigger/8763052d-7d18-4748-bd07-72d2de1c2b9c', // ✅
};

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
  
  const response = await fetch(`${DIRECTUS_URL}${FLOWS.PASSWORD_RESET}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      resetUrl: resetUrl,
    }),
  });
  
  return response.ok;
}
```

---

## 🧪 Testar Agora

### 1. Reiniciar o React:
```bash
cd react-frontend
npm run dev
```

### 2. Testar na UI:
1. Vá para: http://localhost:3000/forgot-password
2. Insira um email: `teste@keyprog.pt`
3. Clique em "Enviar Link de Recuperação"
4. Verifique o MailHog: http://localhost:8025

### 3. Verificar o Email:
- ✅ Deve estar em **português** 🇵🇹
- ✅ Design moderno com emoji 🔑
- ✅ Botão azul "Redefinir Palavra-passe"
- ✅ Texto: "Redefina a sua palavra-passe"

---

## ⚠️ Próximo Passo IMPORTANTE

Como agora geramos o token manualmente, você precisa:

### Opção 1: Usar Sistema de Tokens do Directus (Recomendado)

Modificar para usar o endpoint do Directus MAS desabilitar o email automático:

```typescript
// 1. Gerar token via Directus (sem enviar email)
const response = await fetch(`${DIRECTUS_URL}/auth/password/request`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email,
    reset_url: null, // Não enviar email automático
  }),
});

const data = await response.json();

// 2. Enviar email via Flow
await sendPasswordResetEmail(email, data.token);
```

### Opção 2: Criar Collection `password_resets`

Se quiser controle total, crie uma collection no Directus:

**Collection:** `password_resets`
**Campos:**
- `id` (UUID, Primary Key)
- `email` (String, Required)
- `token` (String, Required, Unique)
- `expires_at` (Timestamp, Required)
- `used` (Boolean, Default: false)

Depois salve o token:
```typescript
await directus.request(
  createItem('password_resets', {
    email,
    token: resetToken,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
  })
);
```

---

## 🎯 Resultado Final

Agora quando o utilizador pedir reset de password:
1. ✅ Email enviado em **português** 🇵🇹
2. ✅ Design **moderno e profissional**
3. ✅ Template **Liquid personalizado**
4. ✅ Totalmente **controlado por você**

---

## 📚 Arquivos Relacionados

- `src/pages/auth/ForgotPasswordPage.tsx` - Página atualizada
- `src/services/emailFlowService.ts` - Serviço de email
- `keyprog-templates/password-reset.liquid` - Template em português
- Flow Directus: `93097043-26b6-4311-8aae-e1e2632494b8`

---

**Teste agora e veja o email em português! 🎉**
