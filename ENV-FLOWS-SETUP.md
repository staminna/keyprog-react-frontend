# 🔧 Configuração de Email Flows via .env

## 📋 Variáveis de Ambiente

Os Flow IDs do Directus agora são configurados via `.env` para facilitar a troca entre desenvolvimento e produção.

---

## 🛠️ Configuração

### 1. Development (`.env`)

```env
# Email Flows (Directus Webhook URLs)
VITE_FLOW_PASSWORD_RESET=93097043-26b6-4311-8aae-e1e2632494b8
VITE_FLOW_EMAIL_VERIFICATION=8763052d-7d18-4748-bd07-72d2de1c2b9c
VITE_FLOW_USER_INVITATION=8763052d-7d18-4748-bd07-72d2de1c2b9c
```

### 2. Production (`.env.production`)

```env
# Email Flows (Directus Webhook URLs)
# Copy these Flow IDs from production Directus instance
VITE_FLOW_PASSWORD_RESET=production-flow-id-here
VITE_FLOW_EMAIL_VERIFICATION=production-flow-id-here
VITE_FLOW_USER_INVITATION=production-flow-id-here
```

---

## 📝 Como Obter os Flow IDs

### Passo 1: Criar Flow no Directus
1. Vá para **Settings → Flows**
2. Crie o Flow (ex: "Password Reset Email")
3. Configure trigger **Webhook**
4. Adicione operações (LiquidJS + Send Email)
5. **Salve o Flow**

### Passo 2: Copiar Webhook URL
Após salvar, você verá a Webhook URL:
```
http://localhost:8065/flows/trigger/93097043-26b6-4311-8aae-e1e2632494b8
                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                    Este é o Flow ID
```

### Passo 3: Adicionar ao .env
```env
VITE_FLOW_PASSWORD_RESET=93097043-26b6-4311-8aae-e1e2632494b8
```

---

## 🚀 Uso no Código

O serviço `emailFlowService.ts` lê automaticamente do `.env`:

```typescript
// emailFlowService.ts
const FLOWS = {
  PASSWORD_RESET: `/flows/trigger/${import.meta.env.VITE_FLOW_PASSWORD_RESET}`,
  EMAIL_VERIFICATION: `/flows/trigger/${import.meta.env.VITE_FLOW_EMAIL_VERIFICATION}`,
  USER_INVITATION: `/flows/trigger/${import.meta.env.VITE_FLOW_USER_INVITATION || ''}`,
};
```

---

## ✅ Vantagens

### 1. **Fácil Deploy**
```bash
# Development
npm run dev

# Production
npm run build  # Usa .env.production automaticamente
```

### 2. **Diferentes Flows por Ambiente**
- **Dev:** Flows de teste no Directus local
- **Prod:** Flows reais no Directus de produção

### 3. **Segurança**
- Flow IDs não ficam hardcoded no código
- Fácil rotação de Flows sem rebuild

### 4. **CI/CD Friendly**
```yaml
# GitHub Actions
- name: Build
  env:
    VITE_FLOW_PASSWORD_RESET: ${{ secrets.FLOW_PASSWORD_RESET }}
    VITE_FLOW_EMAIL_VERIFICATION: ${{ secrets.FLOW_EMAIL_VERIFICATION }}
  run: npm run build
```

---

## 🔍 Validação

O serviço valida automaticamente se os Flow IDs estão configurados:

```typescript
// Console warnings se não configurado
if (!import.meta.env.VITE_FLOW_PASSWORD_RESET) {
  console.warn('⚠️ VITE_FLOW_PASSWORD_RESET não configurado no .env');
}
```

---

## 📚 Flows Disponíveis

### 1. **Password Reset** 🔑
- **Variável:** `VITE_FLOW_PASSWORD_RESET`
- **Template:** `password-reset.liquid`
- **Função:** `sendPasswordResetEmail(email, token)`

### 2. **Email Verification** ✉️
- **Variável:** `VITE_FLOW_EMAIL_VERIFICATION`
- **Template:** `email-verification.liquid`
- **Função:** `sendEmailVerification(email, token)`

### 3. **User Invitation** 🎉
- **Variável:** `VITE_FLOW_USER_INVITATION`
- **Template:** `user-invitation.liquid`
- **Função:** `sendUserInvitation(email, token)`

---

## 🧪 Testar Configuração

### 1. Verificar .env
```bash
cat .env | grep VITE_FLOW
```

### 2. Testar no Browser Console
```javascript
console.log(import.meta.env.VITE_FLOW_PASSWORD_RESET);
// Deve mostrar: 93097043-26b6-4311-8aae-e1e2632494b8
```

### 3. Testar Envio
```typescript
import { sendPasswordResetEmail } from '@/services/emailFlowService';

await sendPasswordResetEmail('teste@keyprog.pt', 'token123');
// Verifique MailHog: http://localhost:8025
```

---

## 🔄 Migração de Produção

### Quando fazer deploy:

1. **Criar Flows no Directus de Produção**
   - Replicar os 3 Flows (Password Reset, Email Verification, User Invitation)
   - Copiar os Flow IDs

2. **Atualizar `.env.production`**
   ```env
   VITE_FLOW_PASSWORD_RESET=prod-flow-id-1
   VITE_FLOW_EMAIL_VERIFICATION=prod-flow-id-2
   VITE_FLOW_USER_INVITATION=prod-flow-id-3
   ```

3. **Build e Deploy**
   ```bash
   npm run build
   # Deploy dist/ para produção
   ```

---

## 📖 Documentação Relacionada

- **Guia Completo de Flows:** `/keyprog-templates/GUIA-COMPLETO-FLOWS.md`
- **Setup User Invitation:** `/keyprog-templates/USER-INVITATION-FLOW-SETUP.md`
- **Solução Email Português:** `/react-frontend/SOLUCAO-EMAIL-PORTUGUES.md`

---

**Última atualização:** 2025-10-08  
**Versão:** 1.0.0  
**Autor:** Equipa Keyprog
