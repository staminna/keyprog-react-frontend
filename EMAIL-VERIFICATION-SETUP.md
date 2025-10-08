# Email Verification Setup

## Overview
Implemented email verification flow for new customer registrations. Users must verify their email before they can login and make purchases.

## Changes Made

### 1. **Input Text Color Fix** ✅
- **File**: `src/components/ui/input.tsx`
- **Change**: Added `text-black` class to ensure input text is always visible
- **File**: `src/pages/auth/LoginPage.tsx`
- **Change**: Added inline `style={{ color: '#000000' }}` to force black text color

### 2. **Login Page - Directus Integration** ✅
- **File**: `src/pages/auth/LoginPage.tsx`
- **Features**:
  - Fetches all text content from Directus `pages` collection (slug: 'login')
  - Inline editing for admin/editor users with pencil icon
  - All text fields editable: heading, subheading, labels, placeholders, buttons, links
  - Uses `useDirectusContent` hook for bidirectional data sync
  - Created `EditableText` component for reusable inline editing

### 3. **Registration Flow Updates** ✅
- **File**: `src/pages/customer/RegistrationPage.tsx`
- **Changes**:
  - New users created with `status: 'draft'` (not active)
  - Added `email_notifications: true` to enable Directus email sending
  - Success message updated to inform about email verification
  - Redirects to `/verify-email` instead of `/login`

### 4. **Email Verification Page** ✅
- **File**: `src/pages/auth/EmailVerificationPage.tsx`
- **Features**:
  - Shows pending verification message with user's email
  - Handles verification token from Directus email link
  - Three states: pending, success, error
  - Auto-redirects to login after successful verification
  - Resend verification link option

### 5. **Login Verification Check** ✅
- **File**: `src/pages/auth/LoginPage.tsx`
- **Added**:
  - Check if user status is 'draft' → show error message
  - Check if user status is not 'active' → block login
  - Clear error messages guiding users to verify email

### 6. **User Type Update** ✅
- **File**: `src/types/auth.ts`
- **Added**: `status?: 'active' | 'draft' | 'suspended' | 'archived'` to User interface

### 7. **Routing** ✅
- **File**: `src/App.tsx`
- **Added**: Route for `/verify-email` → `EmailVerificationPage`

## Directus Configuration Required

### Email Settings
Configure Directus to send verification emails:

1. **Environment Variables** (in Directus `.env`):
```env
# Email Configuration
EMAIL_FROM="noreply@keyprog.com"
EMAIL_TRANSPORT="smtp"
EMAIL_SMTP_HOST="smtp.your-provider.com"
EMAIL_SMTP_PORT="587"
EMAIL_SMTP_USER="your-smtp-user"
EMAIL_SMTP_PASSWORD="your-smtp-password"
EMAIL_SMTP_SECURE="false"

# Email Verification
EMAIL_VERIFY_SETUP="true"
```

2. **User Registration Flow**:
   - When a user registers, Directus automatically sends verification email
   - Email contains a verification link with token
   - User clicks link → redirects to `/verify-email?token=xxx`
   - Frontend calls Directus API to verify token
   - Directus updates user status from 'draft' to 'active'

### Pages Collection Setup
Created login page content in Directus:

```json
{
  "id": 2,
  "title": "Login Page",
  "slug": "login",
  "page_type": "login",
  "content": {
    "heading": "Keyprog",
    "subheading": "Inicie sessão para continuar",
    "email_label": "Email",
    "email_placeholder": "Insira o seu @email",
    "password_label": "Password",
    "password_placeholder": "••••••••",
    "submit_button": "Iniciar Sessão",
    "loading_text": "A iniciar sessão...",
    "register_text": "Não tem conta?",
    "register_link": "Registar",
    "forgot_password_text": "Esqueceu a password?",
    "support_text": "Precisa de ajuda? Contacte o suporte"
  }
}
```

## User Flow

### Registration Flow
1. User fills registration form
2. Frontend creates user with `status: 'draft'`
3. Directus sends verification email automatically
4. User sees success message with email address
5. User redirected to `/verify-email?email=user@example.com`

### Email Verification Flow
1. User receives email from Directus
2. Clicks verification link in email
3. Redirected to `/verify-email?token=xxx`
4. Frontend calls Directus API to verify token
5. Directus updates user status to 'active'
6. User redirected to login page

### Login Flow
1. User enters credentials
2. Frontend checks authentication
3. **NEW**: Check if user status is 'draft' → block login
4. **NEW**: Check if user status is 'active' → allow login
5. Redirect based on user role

## Purchase Protection

Users with `status: 'draft'` cannot:
- Login to the system
- Access customer dashboard
- Make purchases
- View orders

Only verified users (`status: 'active'`) can access these features.

## Testing

### Test Email Verification Flow
1. Register new user at `/registo`
2. Check Directus logs for email sending
3. Get verification token from Directus email
4. Visit `/verify-email?token=xxx`
5. Verify user status changes to 'active' in Directus
6. Login with verified account

### Test Login Blocking
1. Create user with `status: 'draft'` in Directus
2. Try to login → should see error message
3. Change status to 'active' in Directus
4. Login should work

## Components Created

### EditableText Component
**File**: `src/components/ui/EditableText.tsx`

Reusable component for inline text editing:
- Shows pencil icon on hover for editors
- Supports different HTML elements (h1, h2, p, span, label)
- Integrates with Directus permissions
- Used throughout login page

## Next Steps

1. **Configure Directus Email**: Set up SMTP settings in Directus
2. **Test Email Flow**: Verify emails are being sent
3. **Customize Email Template**: Update Directus email templates
4. **Add Resend Functionality**: Implement resend verification email
5. **Add Email Verification to Other Pages**: Apply same pattern to registration, forgot password

## Files Modified

- ✅ `src/components/ui/input.tsx` - Added text-black class
- ✅ `src/pages/auth/LoginPage.tsx` - Directus integration + verification check
- ✅ `src/pages/customer/RegistrationPage.tsx` - Draft status + email redirect
- ✅ `src/types/auth.ts` - Added status field
- ✅ `src/App.tsx` - Added email verification route

## Files Created

- ✅ `src/pages/auth/EmailVerificationPage.tsx` - Email verification page
- ✅ `src/components/ui/EditableText.tsx` - Reusable editable text component
- ✅ `EMAIL-VERIFICATION-SETUP.md` - This documentation

## Directus Collections Used

- **pages**: Stores login page content (editable from Directus)
- **directus_users**: User management with status field
