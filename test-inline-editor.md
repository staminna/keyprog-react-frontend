# ✅ Checklist de Testes - Editor Inline Site-Wide

## 🧪 Testes a Realizar

### 1. Páginas com Editor Ativo (Devem Funcionar)

#### ✅ Página Inicial (/)
- [ ] Fazer login como Editor/Administrador
- [ ] Navegar para `/`
- [ ] Passar rato sobre "Categorias Principais" → deve aparecer contorno azul
- [ ] Clicar e editar o título
- [ ] Guardar alteração
- [ ] Verificar se a alteração foi guardada

#### ✅ Serviços (/servicos)
- [ ] Navegar para `/servicos`
- [ ] Passar rato sobre "Serviços Especializados" → contorno azul
- [ ] Clicar e editar
- [ ] Guardar e verificar

#### ✅ Contactos (/contactos)
- [ ] Navegar para `/contactos`
- [ ] Passar rato sobre "Contactos" → contorno azul
- [ ] Passar rato sobre "Fale connosco..." → contorno azul
- [ ] Editar ambos os campos
- [ ] Guardar e verificar

#### ✅ Notícias (/noticias)
- [ ] Navegar para `/noticias`
- [ ] Passar rato sobre "Notícias" → contorno azul
- [ ] Passar rato sobre "Atualizações do setor..." → contorno azul
- [ ] Editar e guardar

#### ✅ Loja (/loja)
- [ ] Navegar para `/loja`
- [ ] Passar rato sobre "Loja Keyprog" → contorno azul
- [ ] Passar rato sobre "Explore a nossa gama..." → contorno azul
- [ ] Editar e guardar

#### ✅ Suporte (/suporte)
- [ ] Navegar para `/suporte`
- [ ] Passar rato sobre "Centro de Suporte" → contorno azul
- [ ] Passar rato sobre "Estamos aqui para ajudar..." → contorno azul
- [ ] Editar e guardar

### 2. Páginas SEM Editor (Devem Estar Bloqueadas)

#### ❌ Login (/login)
- [ ] Navegar para `/login`
- [ ] Passar rato sobre qualquer texto
- [ ] **NÃO deve aparecer contorno azul**
- [ ] **NÃO deve ser editável**

#### ❌ Admin (/admin)
- [ ] Navegar para `/admin`
- [ ] Passar rato sobre qualquer texto
- [ ] **NÃO deve aparecer contorno azul**
- [ ] **NÃO deve ser editável**

#### ❌ Forgot Password (/forgot-password)
- [ ] Navegar para `/forgot-password`
- [ ] Passar rato sobre qualquer texto
- [ ] **NÃO deve aparecer contorno azul**
- [ ] **NÃO deve ser editável**

#### ❌ Registo (/registo)
- [ ] Navegar para `/registo`
- [ ] Passar rato sobre qualquer texto
- [ ] **NÃO deve aparecer contorno azul**
- [ ] **NÃO deve ser editável**

#### ❌ Checkout (/checkout)
- [ ] Navegar para `/checkout`
- [ ] Passar rato sobre qualquer texto
- [ ] **NÃO deve aparecer contorno azul**
- [ ] **NÃO deve ser editável**

### 3. Testes de Permissões

#### Utilizador SEM Permissões
- [ ] Fazer logout
- [ ] Navegar para `/servicos`
- [ ] **NÃO deve aparecer contorno azul**
- [ ] **NÃO deve ser editável**

#### Utilizador com Permissões de Editor
- [ ] Login como Editor
- [ ] Navegar para `/servicos`
- [ ] **DEVE aparecer contorno azul**
- [ ] **DEVE ser editável**

#### Utilizador com Permissões de Administrador
- [ ] Login como Administrador
- [ ] Navegar para `/servicos`
- [ ] **DEVE aparecer contorno azul**
- [ ] **DEVE ser editável**

### 4. Testes de Funcionalidade

#### Editor de Texto Rico
- [ ] Abrir editor em qualquer página permitida
- [ ] Testar **negrito** (Ctrl+B)
- [ ] Testar *itálico* (Ctrl+I)
- [ ] Testar listas
- [ ] Testar links
- [ ] Guardar e verificar formatação

#### Guardar Alterações
- [ ] Fazer uma edição
- [ ] Clicar em **✓ Save**
- [ ] Atualizar página (F5)
- [ ] Verificar se alteração persiste

#### Cancelar Alterações
- [ ] Fazer uma edição
- [ ] Clicar em **✗ Cancel**
- [ ] Verificar se alteração foi descartada

### 5. Testes de Navegação

#### Navegação entre Páginas
- [ ] Editar conteúdo em `/servicos`
- [ ] Navegar para `/contactos`
- [ ] Verificar se editor continua a funcionar
- [ ] Navegar para `/login`
- [ ] Verificar se editor está desativado
- [ ] Voltar para `/servicos`
- [ ] Verificar se editor está ativo novamente

## 🐛 Problemas Conhecidos a Verificar

### Console do Browser
- [ ] Abrir DevTools (F12)
- [ ] Verificar se há erros na consola
- [ ] Verificar logs de "Inline editing enabled for route:"

### Network
- [ ] Abrir DevTools → Network
- [ ] Fazer uma edição e guardar
- [ ] Verificar se request para Directus foi bem-sucedido (200 OK)

### LocalStorage
- [ ] Abrir DevTools → Application → LocalStorage
- [ ] Verificar `inline-editor-enabled` = "true"
- [ ] Verificar `inline-editor-override` (se aplicável)

## 📊 Resultados Esperados

### ✅ Sucesso
- Editor funciona em todas as páginas públicas
- Editor bloqueado em páginas de autenticação/admin
- Alterações são guardadas no Directus
- Formatação é preservada
- Permissões são respeitadas

### ❌ Falha
- Editor não aparece em páginas públicas
- Editor aparece em páginas bloqueadas
- Alterações não são guardadas
- Erros na consola
- Problemas de permissões

## 🚀 Como Executar os Testes

```bash
# 1. Iniciar o frontend
cd /Users/jorgenunes/2026/keyprog-local/react-frontend
npm run dev

# 2. Abrir browser
# http://localhost:5173

# 3. Fazer login
# http://localhost:5173/login
# User: editor@keyprog.pt (ou admin)

# 4. Seguir checklist acima
```

## 📝 Notas

- Marcar cada item com ✅ quando testado e funcional
- Anotar problemas encontrados
- Tirar screenshots se necessário
- Reportar bugs ao suporte técnico

---

**Data do Teste:** _____________  
**Testado por:** _____________  
**Resultado Geral:** ⬜ Passou ⬜ Falhou
