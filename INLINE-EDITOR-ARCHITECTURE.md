# 🏗️ Arquitetura do Editor Inline Site-Wide

## 📐 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │         InlineEditorProvider                        │     │
│  │  • Gere estado global do editor                     │     │
│  │  • Verifica permissões do utilizador                │     │
│  │  • Persiste preferências (localStorage)             │     │
│  └────────────────────────────────────────────────────┘     │
│                           ↓                                  │
│  ┌────────────────────────────────────────────────────┐     │
│  │         BrowserRouter                               │     │
│  │  ┌──────────────────────────────────────────┐      │     │
│  │  │    EditableContentWrapper                 │      │     │
│  │  │  • Verifica rota atual (useLocation)      │      │     │
│  │  │  • Aplica exclusões (EXCLUDED_ROUTES)     │      │     │
│  │  │  • Decide se ativa editor                 │      │     │
│  │  └──────────────────────────────────────────┘      │     │
│  │                     ↓                               │     │
│  │         ┌──────────────────────┐                    │     │
│  │         │  Rota Excluída?      │                    │     │
│  │         └──────────────────────┘                    │     │
│  │           /          \                              │     │
│  │         SIM          NÃO                            │     │
│  │          ↓            ↓                             │     │
│  │    ┌─────────┐  ┌──────────────────────────┐       │     │
│  │    │ Render  │  │  UniversalPageWrapper     │       │     │
│  │    │ Normal  │  │  • Escaneia conteúdo      │       │     │
│  │    └─────────┘  │  • Identifica editáveis   │       │     │
│  │                 │  • Envolve com wrapper    │       │     │
│  │                 └──────────────────────────┘       │     │
│  │                            ↓                        │     │
│  │                 ┌──────────────────────────┐       │     │
│  │                 │ UniversalEditableContent  │       │     │
│  │                 │  • Adiciona hover effect  │       │     │
│  │                 │  • Ativa editor ao click  │       │     │
│  │                 │  • Guarda no Directus     │       │     │
│  │                 └──────────────────────────┘       │     │
│  └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Dados

### 1. Inicialização
```
User Login
    ↓
UnifiedAuthContext atualiza
    ↓
InlineEditorProvider verifica permissões
    ↓
canEdit = true (se Editor/Admin)
    ↓
isInlineEditingEnabled = true
```

### 2. Navegação
```
User navega para /servicos
    ↓
useLocation() deteta pathname
    ↓
EditableContentWrapper verifica EXCLUDED_ROUTES
    ↓
/servicos NÃO está excluído
    ↓
Envolve com UniversalPageWrapper
    ↓
Conteúdo torna-se editável
```

### 3. Edição
```
User passa rato sobre título
    ↓
UniversalEditableContent adiciona contorno azul
    ↓
User clica no título
    ↓
Editor de texto rico abre
    ↓
User edita e clica "Save"
    ↓
POST/PATCH para Directus API
    ↓
Directus atualiza collection
    ↓
UI atualiza com novo conteúdo
```

## 🗂️ Estrutura de Ficheiros

```
react-frontend/
├── src/
│   ├── App.tsx                          # Root component
│   ├── components/
│   │   ├── layout/
│   │   │   └── EditableContentWrapper.tsx    # ⭐ Route filter
│   │   └── universal/
│   │       ├── InlineEditorProvider.tsx      # ⭐ Global state
│   │       ├── inline-editor-context.ts      # Context definition
│   │       ├── UniversalPageWrapper.tsx      # ⭐ Content scanner
│   │       ├── UniversalEditableContent.tsx  # Editable wrapper
│   │       └── UniversalContentEditor.tsx    # Explicit editor
│   ├── pages/
│   │   ├── Index.tsx                    # ✅ Editable
│   │   ├── Servicos.tsx                 # ✅ Editable
│   │   ├── Contactos.tsx                # ✅ Editable
│   │   ├── Noticias.tsx                 # ✅ Editable
│   │   ├── Loja.tsx                     # ✅ Editable
│   │   ├── Suporte.tsx                  # ✅ Editable
│   │   └── auth/
│   │       ├── LoginPage.tsx            # ❌ Excluded
│   │       └── ForgotPasswordPage.tsx   # ❌ Excluded
│   └── hooks/
│       └── useUnifiedAuth.ts            # Auth & permissions
├── INLINE-EDITOR-GUIDE.md               # 📚 Technical guide
├── COMO-USAR-EDITOR-INLINE.md           # 📚 User guide
├── test-inline-editor.md                # 🧪 Test checklist
└── INLINE-EDITOR-ARCHITECTURE.md        # 📐 This file
```

## 🔑 Componentes Chave

### 1. InlineEditorProvider
**Responsabilidade:** Gestão de estado global

```tsx
interface InlineEditorContextType {
  isInlineEditingEnabled: boolean;
  setInlineEditingEnabled: (enabled: boolean) => void;
}
```

**Lógica:**
- Verifica `canEdit` do `UnifiedAuthContext`
- Persiste estado em `localStorage`
- Escuta eventos do Directus Visual Editor

### 2. EditableContentWrapper
**Responsabilidade:** Filtragem por rota

```tsx
const EXCLUDED_ROUTES = [
  '/forgot-password',
  '/admin',
  '/login',
  // ...
];

const isExcludedRoute = (pathname: string): boolean => {
  return EXCLUDED_ROUTES.some(route => pathname.startsWith(route));
};
```

**Decisão:**
```tsx
if (shouldDisableEditing) {
  return <>{children}</>;
}

return (
  <UniversalPageWrapper>
    {children}
  </UniversalPageWrapper>
);
```

### 3. UniversalPageWrapper
**Responsabilidade:** Deteção automática de conteúdo editável

```tsx
function shouldMakeEditable(element: ReactElement): boolean {
  const editableTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'];
  const tagName = typeof element.type === 'string' ? element.type : '';
  
  // Skip navigation/UI elements
  if (className.includes('nav') || className.includes('button')) {
    return false;
  }
  
  return editableTags.includes(tagName) && hasTextContent(element);
}
```

### 4. UniversalEditableContent
**Responsabilidade:** Wrapper editável individual

```tsx
<div
  className="editable-content"
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  onClick={handleEdit}
  style={{
    outline: isHovered ? '2px solid blue' : 'none'
  }}
>
  {children}
</div>
```

## 🔐 Controlo de Acesso

### Níveis de Verificação

```
1. InlineEditorProvider
   ↓ verifica canEdit (role-based)
   
2. EditableContentWrapper
   ↓ verifica rota (route-based)
   
3. UniversalEditableContent
   ↓ verifica permissões de collection
   
4. Directus API
   ↓ validação final no backend
```

### Roles Permitidos
```typescript
const allowedRoles = [
  'administrator',
  'admin',
  'editor',
  'editor-user'
];
```

## 📊 Estado da Aplicação

### Context Hierarchy
```
UnifiedAuthProvider
  └── user, canEdit, isAuthenticated
      ↓
InlineEditorProvider
  └── isInlineEditingEnabled
      ↓
EditableContentWrapper
  └── shouldDisableEditing (computed)
      ↓
UniversalPageWrapper
  └── autoDetect (boolean)
      ↓
UniversalEditableContent
  └── isEditing, value (local state)
```

### LocalStorage Keys
```javascript
{
  "inline-editor-enabled": "true",
  "inline-editor-override": "false",
  "auth-token": "Bearer xxx...",
  "user-role": "editor"
}
```

## 🌐 API Integration

### Endpoints Utilizados

```typescript
// GET - Fetch content
GET /items/{collection}/{id}?fields=*

// PATCH - Update content
PATCH /items/{collection}/{id}
Body: {
  [field]: newValue
}

// Headers
Authorization: Bearer {token}
Content-Type: application/json
```

### Exemplo de Request
```javascript
// Save edited content
const response = await fetch(
  `${DIRECTUS_URL}/items/pages/contactos`,
  {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Novo Título de Contactos'
    })
  }
);
```

## 🎨 Styling

### CSS Classes
```css
/* Editable content hover */
.editable-content:hover {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  cursor: pointer;
}

/* Editing state */
.editable-content.editing {
  outline: 2px solid #10b981;
}

/* Editor toolbar */
.inline-editor-toolbar {
  position: absolute;
  top: -40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

## 🚀 Performance

### Otimizações Implementadas

1. **Memoization**
   ```tsx
   const shouldDisableEditing = useMemo(() => {
     return isExcludedRoute(location.pathname);
   }, [location.pathname]);
   ```

2. **Lazy Loading**
   - Editor de texto rico carregado apenas quando necessário
   - Componentes editáveis renderizados on-demand

3. **Debouncing**
   - Saves são debounced para evitar requests excessivos
   - Hover effects otimizados

## 🐛 Error Handling

### Estratégias

1. **Network Errors**
   ```tsx
   try {
     await saveToDirectus(data);
   } catch (error) {
     toast.error('Erro ao guardar. Tente novamente.');
     console.error('Save failed:', error);
   }
   ```

2. **Permission Errors**
   ```tsx
   if (!canEdit) {
     toast.error('Sem permissões para editar');
     return;
   }
   ```

3. **Validation Errors**
   ```tsx
   if (!value || value.trim().length === 0) {
     toast.error('Conteúdo não pode estar vazio');
     return;
   }
   ```

## 📈 Métricas & Monitoring

### Logs Importantes
```javascript
// Activation
console.log('Inline editing enabled for route:', pathname);

// Edits
console.log('Editing content:', { collection, itemId, field });

// Saves
console.log('Saved to Directus:', { collection, itemId, field, value });

// Errors
console.error('Failed to save:', error);
```

### Analytics Events (Future)
```javascript
// Track usage
analytics.track('inline_edit_started', { page, field });
analytics.track('inline_edit_saved', { page, field, duration });
analytics.track('inline_edit_cancelled', { page, field });
```

## 🔮 Roadmap

### Próximas Features
- [ ] Drag & drop para reordenar
- [ ] Histórico de alterações (undo/redo)
- [ ] Preview antes de guardar
- [ ] Edição colaborativa em tempo real
- [ ] Versionamento de conteúdo
- [ ] Workflow de aprovação

---

**Versão:** 2.0  
**Última Atualização:** 2025-10-09  
**Autor:** Cascade AI
