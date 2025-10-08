# Guia do Editor Inline Site-Wide

## 📝 Visão Geral

O Editor Inline está agora ativo em **todo o website**, permitindo edição de conteúdo diretamente nas páginas sem necessidade de aceder ao painel de administração do Directus.

## ✅ Páginas com Editor Inline Ativo

O editor inline funciona em **todas as páginas públicas**, incluindo:

### Páginas Principais
- ✅ **/** (Página Inicial)
- ✅ **/servicos** (Serviços)
- ✅ **/contactos** (Contactos)
- ✅ **/noticias** (Notícias)
- ✅ **/loja** (Loja)
- ✅ **/suporte** (Suporte)

### Páginas de Detalhe
- ✅ **/servicos/:slug** (Detalhes de Serviço)
- ✅ **/noticias/:id** (Detalhes de Notícia)
- ✅ **/loja/produtos/:slug** (Detalhes de Produto)
- ✅ **/pages/:slug** (Páginas Dinâmicas)

### Páginas de Serviço Específicas
- ✅ **/servicos/diagnostico**
- ✅ **/servicos/reparacao**
- ✅ **/servicos/reprogramacao**
- ✅ **/servicos/desbloqueio**
- ✅ **/servicos/clonagem**
- ✅ **/servicos/airbag**
- ✅ **/servicos/adblue**
- ✅ **/servicos/chaves**
- ✅ **/servicos/quadrantes**

## ❌ Páginas Excluídas (Sem Editor Inline)

Por razões de segurança, o editor inline está **desativado** nas seguintes páginas:

- ❌ **/login** (Login)
- ❌ **/admin** (Administração)
- ❌ **/editor** (Editor)
- ❌ **/forgot-password** (Recuperação de Password)
- ❌ **/reset-password** (Reset de Password)
- ❌ **/verify-email** (Verificação de Email)
- ❌ **/registo** (Registo)
- ❌ **/checkout** (Checkout)
- ❌ **/checkout/success** (Checkout Sucesso)
- ❌ **/checkout/cancel** (Checkout Cancelado)

## 🎯 Como Usar o Editor Inline

### 1. Requisitos
- Ter uma conta com permissões de **Editor** ou **Administrador**
- Estar autenticado no sistema

### 2. Ativar o Editor
O editor inline é ativado automaticamente quando:
- Está autenticado com permissões adequadas
- Navega para uma página pública (não excluída)

### 3. Editar Conteúdo

#### Método 1: Hover + Click
1. Navegue para qualquer página pública (/, /servicos, /contactos, etc.)
2. Passe o rato sobre o conteúdo editável
3. O conteúdo terá um **contorno azul** quando editável
4. Clique no conteúdo para começar a editar
5. Use o editor de texto rico que aparece
6. Clique em **✓ Save** para guardar ou **✗ Cancel** para cancelar

#### Método 2: Edição Automática
- Alguns elementos são automaticamente detetados como editáveis
- Títulos (h1, h2, h3, etc.)
- Parágrafos (p)
- Descrições e textos

### 4. Tipos de Conteúdo Editável

#### Títulos de Página
```tsx
<h1>Serviços Especializados</h1>
```
- Clique diretamente no título para editar

#### Descrições
```tsx
<p>Soluções profissionais em eletrónica automóvel...</p>
```
- Clique no texto para editar

#### Conteúdo Rico (HTML)
- Suporta formatação (negrito, itálico, listas)
- Suporta links
- Suporta imagens (em alguns casos)

## 🔧 Arquitetura Técnica

### Componentes Principais

#### 1. EditableContentWrapper
**Localização:** `/src/components/layout/EditableContentWrapper.tsx`

Wrapper global que:
- Verifica a rota atual
- Ativa/desativa o editor inline baseado na rota
- Envolve o conteúdo com `UniversalPageWrapper` para páginas permitidas

```tsx
const EXCLUDED_ROUTES = [
  '/forgot-password',
  '/admin',
  '/login',
  '/reset-password',
  '/verify-email',
  '/registo',
  '/checkout',
  '/editor',
];
```

#### 2. UniversalPageWrapper
**Localização:** `/src/components/universal/UniversalPageWrapper.tsx`

Componente que:
- Escaneia automaticamente o conteúdo da página
- Identifica elementos editáveis (h1-h6, p, span)
- Envolve elementos com `UniversalEditableContent`
- Infere collection, itemId e field automaticamente

#### 3. UniversalContentEditor
**Localização:** `/src/components/universal/UniversalContentEditor.tsx`

Componente para edição explícita:
```tsx
<UniversalContentEditor
  collection="pages"
  itemId="contactos"
  field="title"
  tag="h1"
  className="text-3xl font-bold"
  value="Contactos"
/>
```

#### 4. InlineEditorProvider
**Localização:** `/src/components/universal/InlineEditorProvider.tsx`

Provider de contexto que:
- Gere o estado global do editor inline
- Verifica permissões do utilizador
- Persiste preferências no localStorage

### Fluxo de Dados

```
User Authentication
        ↓
InlineEditorProvider (verifica permissões)
        ↓
EditableContentWrapper (verifica rota)
        ↓
UniversalPageWrapper (escaneia conteúdo)
        ↓
UniversalEditableContent (torna editável)
        ↓
Save to Directus API
```

## 🎨 Personalização

### Adicionar Novas Páginas Editáveis
As páginas são automaticamente editáveis. Não é necessário configuração adicional.

### Excluir Páginas do Editor
Adicione a rota ao array `EXCLUDED_ROUTES` em `EditableContentWrapper.tsx`:

```tsx
const EXCLUDED_ROUTES = [
  '/forgot-password',
  '/admin',
  '/login',
  '/nova-pagina-excluida', // Adicionar aqui
];
```

### Personalizar Elementos Editáveis
Edite a função `shouldMakeEditable` em `UniversalPageWrapper.tsx`:

```tsx
function shouldMakeEditable(element: ReactElement): boolean {
  const editableTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'];
  // Adicione lógica personalizada aqui
}
```

## 🔐 Segurança

### Controlo de Acesso
- Apenas utilizadores com roles **Editor** ou **Administrador** podem editar
- Verificação de permissões em múltiplos níveis:
  1. Provider (InlineEditorProvider)
  2. Wrapper (EditableContentWrapper)
  3. Componente (UniversalEditableContent)

### Rotas Protegidas
- Páginas de autenticação excluídas
- Páginas de checkout excluídas
- Páginas administrativas excluídas

### Validação
- Todas as alterações são validadas no backend (Directus)
- Token de autenticação obrigatório
- Verificação de permissões por collection

## 🐛 Troubleshooting

### Editor não aparece
1. Verifique se está autenticado
2. Verifique se tem permissões de Editor/Administrador
3. Verifique se não está numa página excluída
4. Limpe o localStorage: `localStorage.clear()`

### Alterações não são guardadas
1. Verifique a consola do browser para erros
2. Verifique se o Directus está a correr
3. Verifique o token de autenticação
4. Verifique permissões na collection

### Conteúdo não é editável
1. Verifique se o elemento está dentro de `EditableContentWrapper`
2. Verifique se o elemento é um dos tipos editáveis (h1-h6, p, span)
3. Verifique se tem texto suficiente (mínimo 5 caracteres)

## 📊 Monitorização

### Logs
O editor inline regista ações importantes:
```javascript
console.log('Inline editing enabled for route:', pathname);
console.log('Saving content to Directus:', { collection, itemId, field, value });
```

### Estado do Editor
Verifique o estado no React DevTools:
- `InlineEditorContext.isInlineEditingEnabled`
- `UnifiedAuthContext.canEdit`

## 🚀 Melhorias Futuras

### Planeadas
- [ ] Editor de imagens inline
- [ ] Histórico de alterações
- [ ] Preview antes de guardar
- [ ] Edição de múltiplos campos em simultâneo
- [ ] Drag & drop para reordenar elementos

### Em Consideração
- [ ] Edição colaborativa em tempo real
- [ ] Comentários e anotações
- [ ] Workflow de aprovação
- [ ] Versionamento de conteúdo

## 📞 Suporte

Para questões ou problemas com o editor inline:
- Email: suporte@keyprog.pt
- Documentação técnica: `/src/docs/EDITABLE_COMPONENTS.md`
- Issues: GitHub repository

---

**Última atualização:** 2025-10-09  
**Versão:** 2.0 (Site-Wide)
