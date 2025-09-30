# File Service Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Site Header                            │  │
│  │  ┌────────────┐  ┌─────────────────────────────────┐    │  │
│  │  │  Logo      │  │  Login/Register or User Menu     │    │  │
│  │  └────────────┘  └─────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                File Service Page                          │  │
│  │                                                            │  │
│  │  IF Not Authenticated:                                    │  │
│  │  ┌──────────────────────────────────────────┐            │  │
│  │  │  Login Prompt                             │            │  │
│  │  │  [Fazer Login] [Registar]                 │            │  │
│  │  └──────────────────────────────────────────┘            │  │
│  │                                                            │  │
│  │  IF Authenticated but NOT Cliente:                        │  │
│  │  ┌──────────────────────────────────────────┐            │  │
│  │  │  Access Denied Message                    │            │  │
│  │  │  [Contactar Suporte]                      │            │  │
│  │  └──────────────────────────────────────────┘            │  │
│  │                                                            │  │
│  │  IF Authenticated AND Cliente:                            │  │
│  │  ┌──────────────────────────────────────────┐            │  │
│  │  │  Welcome: user@email.com                  │            │  │
│  │  │                                            │            │  │
│  │  │  ┌─────────────────────────────────────┐ │            │  │
│  │  │  │   [📁 Escolher Ficheiros]            │ │            │  │
│  │  │  └─────────────────────────────────────┘ │            │  │
│  │  │                                            │            │  │
│  │  │  Selected Files:                           │            │  │
│  │  │  • file1.bin (125 KB)                      │            │  │
│  │  │  • file2.hex (89 KB)                       │            │  │
│  │  │                                            │            │  │
│  │  │  ┌─────────────────────────────────────┐ │            │  │
│  │  │  │   [📤 Enviar Ficheiros]              │ │            │  │
│  │  │  └─────────────────────────────────────┘ │            │  │
│  │  └──────────────────────────────────────────┘            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## User Authentication Flow

```
┌──────────────┐
│ User Visits  │
│ /file-service│
└──────┬───────┘
       │
       ▼
┌─────────────────┐
│ Check Auth      │◄────────────┐
│ (useAuth hook)  │             │
└────────┬────────┘             │
         │                       │
    ┌────┴────┐                 │
    │         │                 │
    ▼         ▼                 │
┌─────┐   ┌──────┐             │
│ Yes │   │  No  │             │
└──┬──┘   └───┬──┘             │
   │          │                │
   │          ▼                │
   │    ┌──────────────┐       │
   │    │ Show Login   │       │
   │    │ Prompt       │       │
   │    └──────┬───────┘       │
   │           │                │
   │           ▼                │
   │    ┌──────────────┐       │
   │    │ User Clicks  │       │
   │    │ "Fazer Login"│       │
   │    └──────┬───────┘       │
   │           │                │
   │           ▼                │
   │    ┌──────────────┐       │
   │    │ Login Page   │       │
   │    │ with return= │       │
   │    │ /file-service│       │
   │    └──────┬───────┘       │
   │           │                │
   │           ▼                │
   │    ┌──────────────┐       │
   │    │ Enter Creds  │       │
   │    │ + Submit     │       │
   │    └──────┬───────┘       │
   │           │                │
   │           ▼                │
   │    ┌──────────────┐       │
   │    │ Auth Success │───────┘
   │    └──────────────┘
   │
   ▼
┌──────────────┐
│ Check Role   │
│ Is Cliente?  │
└────────┬─────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────┐   ┌──────┐
│ Yes │   │  No  │
└──┬──┘   └───┬──┘
   │          │
   │          ▼
   │    ┌──────────────┐
   │    │ Show Access  │
   │    │ Denied       │
   │    └──────────────┘
   │
   ▼
┌──────────────┐
│ Show Upload  │
│ Interface    │
└──────────────┘
```

## File Upload Flow

```
┌───────────────┐
│ Cliente User  │
│ Selects Files │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Files Stored  │
│ in React State│
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ User Clicks   │
│ "Enviar       │
│  Ficheiros"   │
└───────┬───────┘
        │
        ▼
┌────────────────────────┐
│ Validate:              │
│ • Has files?           │
│ • Is authenticated?    │
│ • Is Cliente role?     │
└───────┬────────────────┘
        │
        ▼
┌────────────────────────┐
│ Call:                  │
│ DirectusService        │
│  .uploadFiles(files)   │
└───────┬────────────────┘
        │
        ▼
┌────────────────────────┐
│ For each file:         │
│ POST /files            │
│ with FormData          │
└───────┬────────────────┘
        │
        ▼
┌────────────────────────┐
│ Directus validates:    │
│ • Auth token           │
│ • Cliente role perms   │
│ • File size/type       │
└───────┬────────────────┘
        │
        ▼
┌────────────────────────┐
│ Files uploaded to      │
│ Directus storage       │
│ Returns file IDs:      │
│ ['abc123', 'def456']   │
└───────┬────────────────┘
        │
        ▼
┌────────────────────────┐
│ Call:                  │
│ DirectusService        │
│ .updateUserFileService │
│  (userId, fileIds)     │
└───────┬────────────────┘
        │
        ▼
┌────────────────────────┐
│ GET /users/:id         │
│ to get existing files  │
└───────┬────────────────┘
        │
        ▼
┌────────────────────────┐
│ Merge:                 │
│ existing + new fileIds │
└───────┬────────────────┘
        │
        ▼
┌────────────────────────┐
│ PATCH /users/:id       │
│ Update File_service    │
│ field with all fileIds │
└───────┬────────────────┘
        │
        ▼
┌────────────────────────┐
│ Show Success Message   │
│ Clear form             │
│ Reset state            │
└────────────────────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────┐       │
│  │ FileService.tsx                                   │       │
│  │ • Manages UI state                                │       │
│  │ • Validates role & auth                           │       │
│  │ • Calls DirectusService                           │       │
│  └────────────────────┬─────────────────────────────┘       │
│                       │                                       │
│  ┌────────────────────▼─────────────────────────────┐       │
│  │ DirectusService.ts                                │       │
│  │ • uploadFiles()                                   │       │
│  │ • updateUserFileService()                         │       │
│  └────────────────────┬─────────────────────────────┘       │
│                       │                                       │
└───────────────────────┼───────────────────────────────────┘
                        │
                        │ HTTP Requests with
                        │ Bearer Token
                        │
┌───────────────────────▼───────────────────────────────────┐
│                    Directus Backend                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────┐       │
│  │ Authentication Layer                              │       │
│  │ • Validates Bearer Token                          │       │
│  │ • Identifies User                                 │       │
│  └────────────────────┬─────────────────────────────┘       │
│                       │                                       │
│  ┌────────────────────▼─────────────────────────────┐       │
│  │ Authorization Layer                               │       │
│  │ • Checks Cliente role permissions                 │       │
│  │ • Validates CRUD operations                       │       │
│  └────────────────────┬─────────────────────────────┘       │
│                       │                                       │
│  ┌────────────────────▼─────────────────────────────┐       │
│  │ Business Logic                                    │       │
│  │ • POST /files → Upload to storage                 │       │
│  │ • PATCH /users/:id → Update File_service          │       │
│  └────────────────────┬─────────────────────────────┘       │
│                       │                                       │
│  ┌────────────────────▼─────────────────────────────┐       │
│  │ Database (PostgreSQL)                             │       │
│  │                                                    │       │
│  │  directus_files:                                  │       │
│  │  ┌──────────────────────────────────────┐        │       │
│  │  │ id | filename | uploaded_by | ...     │        │       │
│  │  └──────────────────────────────────────┘        │       │
│  │                                                    │       │
│  │  directus_users:                                  │       │
│  │  ┌──────────────────────────────────────┐        │       │
│  │  │ id | email | role | File_service | ...│        │       │
│  │  │                     └─ [file_ids]     │        │       │
│  │  └──────────────────────────────────────┘        │       │
│  └──────────────────────────────────────────────────┘       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Security Model

```
┌─────────────────────────────────────────────────────┐
│                   Security Layers                    │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Layer 1: Client-Side Validation (UX)               │
│  ┌─────────────────────────────────────────┐        │
│  │ • Check if authenticated                 │        │
│  │ • Check if Cliente role                  │        │
│  │ • Show appropriate UI                    │        │
│  │ → FAST UX, NOT SECURE                    │        │
│  └─────────────────────────────────────────┘        │
│           │                                           │
│           ▼                                           │
│  Layer 2: API Authentication                         │
│  ┌─────────────────────────────────────────┐        │
│  │ • Bearer Token in headers                │        │
│  │ • Token validated by Directus            │        │
│  │ • Identifies user                        │        │
│  │ → SECURE: No token = No access           │        │
│  └─────────────────────────────────────────┘        │
│           │                                           │
│           ▼                                           │
│  Layer 3: Role-Based Permissions                     │
│  ┌─────────────────────────────────────────┐        │
│  │ • Directus checks user's role            │        │
│  │ • Validates against role permissions     │        │
│  │ • Enforces CRUD rules                    │        │
│  │ → SECURE: Role enforcement               │        │
│  └─────────────────────────────────────────┘        │
│           │                                           │
│           ▼                                           │
│  Layer 4: Record-Level Permissions                   │
│  ┌─────────────────────────────────────────┐        │
│  │ • Custom access rules                    │        │
│  │ • { "id": { "_eq": "$CURRENT_USER" } }   │        │
│  │ • Users only access own records          │        │
│  │ → SECURE: Data isolation                 │        │
│  └─────────────────────────────────────────┘        │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## File Relationships

```
┌──────────────────────────────────────────────────────┐
│                File Relationships                     │
└──────────────────────────────────────────────────────┘

directus_users                    directus_files
┌─────────────────┐              ┌──────────────────┐
│ id: user-123    │              │ id: file-abc     │
│ email: c@t.com  │◄─────────────│ uploaded_by:     │
│ role: Cliente   │   linked     │   user-123       │
│ File_service: ──┼─────────────►│ filename: ecu.bin│
│  [file-abc,     │   M2M        │ size: 125 KB     │
│   file-def]     │              └──────────────────┘
└─────────────────┘                       ▲
        │                                  │
        │                                  │
        └──────────────────────────────────┘
             File_service relationship

Directus automatically manages:
• Junction table for M2M relationship
• File ownership (uploaded_by)
• Access control based on relationships
```

## Summary

This architecture ensures:
- ✅ Secure authentication via Bearer tokens
- ✅ Role-based access control
- ✅ Record-level data isolation
- ✅ File ownership tracking
- ✅ Clean separation of concerns
- ✅ Scalable and maintainable code
