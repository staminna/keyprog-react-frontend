# React App Routes to Directus Collections Mapping

This document maps each React app route/page to the relevant Directus collection(s) for dynamic content management.

## Current Routes and Their Directus Collection Mappings

### 1. **Index Page (`/`)**
**Current State**: Static content with hardcoded categories and hero section
**Directus Collections**:
- `hero` - Hero section content (title, subtitle, buttons)
- `categories` - Main categories displayed on homepage (Emuladores, Equipamentos, Software, Estabilizadores)
- `settings` - Site-wide settings (logo, site title, description)

**Implementation Priority**: HIGH - Homepage is critical for user experience

### 2. **Loja Page (`/loja`)**
**Current State**: Basic structure with placeholder content
**Directus Collections**:
- `categories` - Product categories (Emuladores, Equipamentos, Software, Estabilizadores)
- `products` - Individual products within each category (needs to be created)
- `pages` - Page-specific content (intro text, SEO metadata)

**Implementation Priority**: HIGH - Core business functionality

### 3. **Servicos Page (`/servicos`)**
**Current State**: Static service sections with hardcoded data
**Directus Collections**:
- `services` - Service offerings (Reprogramação, Desbloqueio, Clonagem, etc.)
- `pages` - Page-specific content and metadata

**Implementation Priority**: HIGH - Core business functionality

### 4. **Noticias Page (`/noticias`)**
**Current State**: Placeholder page
**Directus Collections**:
- `news` - News articles and blog posts
- `pages` - Page-specific content and metadata

**Implementation Priority**: MEDIUM - Content marketing

### 5. **Contactos Page (`/contactos`)**
**Current State**: Basic contact information
**Directus Collections**:
- `contacts` - Contact information (email, phone, address)
- `pages` - Page-specific content and metadata

**Implementation Priority**: MEDIUM - Business contact info

### 6. **FileService Page (`/file-service`)**
**Current State**: Placeholder page
**Directus Collections**:
- `services` - Related to file upload/processing services
- `pages` - Page-specific content and metadata

**Implementation Priority**: LOW - Specialized functionality

### 7. **Simulador Page (`/simulador`)**
**Current State**: Placeholder page
**Directus Collections**:
- `pages` - Page-specific content and metadata
- `tools` - Tool-specific configuration (needs to be created)

**Implementation Priority**: LOW - Specialized functionality

### 8. **Editor Page (`/editor`)**
**Current State**: Protected Directus Visual Editor integration
**Directus Collections**:
- All collections - This is the admin interface for managing content
- No specific mapping needed - uses Directus Visual Editor

**Implementation Priority**: COMPLETE - Already implemented with authentication

### 9. **NotFound Page (`*`)**
**Current State**: Static 404 page
**Directus Collections**:
- `pages` - Custom 404 content and messaging

**Implementation Priority**: LOW - Error handling

## Header and Footer Menu Mapping

### Header Menu
**Current State**: Static navigation
**Directus Collections**:
- `header_menu` - Main navigation items with sub-menus
  - Fields: `title`, `link`, `sub_menu` (repeater field)
  - Already partially implemented

**Implementation Priority**: HIGH - Site navigation

### Footer Menu
**Current State**: Static footer links
**Directus Collections**:
- `footer_menu` - Footer navigation and links
  - Fields: `title`, `links` (repeater field)

**Implementation Priority**: MEDIUM - Secondary navigation

## Missing Directus Collections to Create

### 1. **Products Collection**
```json
{
  "collection": "products",
  "fields": [
    {"field": "id", "type": "integer", "primary_key": true},
    {"field": "title", "type": "string"},
    {"field": "description", "type": "text"},
    {"field": "price", "type": "decimal"},
    {"field": "category", "type": "string", "interface": "select-dropdown"},
    {"field": "image", "type": "uuid", "interface": "file-image"},
    {"field": "slug", "type": "string"},
    {"field": "status", "type": "string", "default": "published"}
  ]
}
```

### 2. **Tools Collection** (for Simulador)
```json
{
  "collection": "tools",
  "fields": [
    {"field": "id", "type": "integer", "primary_key": true},
    {"field": "name", "type": "string"},
    {"field": "description", "type": "text"},
    {"field": "configuration", "type": "json"},
    {"field": "status", "type": "string", "default": "published"}
  ]
}
```

## Implementation Phases

### Phase 1: Core Business Pages (PRIORITY)
1. **Index Page** - Implement dynamic hero and categories
2. **Header Menu** - Complete dynamic navigation implementation
3. **Servicos Page** - Dynamic service listings
4. **Loja Page** - Dynamic category and product listings

### Phase 2: Content Management (MEDIUM)
1. **Noticias Page** - Dynamic news/blog system
2. **Footer Menu** - Dynamic footer navigation
3. **Contactos Page** - Dynamic contact information

### Phase 3: Specialized Features (LOW)
1. **FileService Page** - Dynamic tool configuration
2. **Simulador Page** - Dynamic tool interface
3. **NotFound Page** - Dynamic 404 content

## Technical Implementation Notes

### Data Fetching Strategy
- Use React Query for caching and state management
- Implement fallback content for offline/error states
- Use DirectusService methods for consistent API calls

### SEO Considerations
- Map page metadata from Directus `pages` collection
- Implement dynamic meta tags for each route
- Use structured data for better search engine visibility

### Performance Optimization
- Implement lazy loading for images from Directus
- Use React.lazy() for code splitting on less critical pages
- Cache Directus responses appropriately

### Error Handling
- Graceful fallbacks when Directus is unavailable
- User-friendly error messages
- Maintain functionality with static fallback content
