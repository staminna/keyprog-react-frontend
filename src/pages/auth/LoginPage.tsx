import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { DirectusService } from '@/services/directusService';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useDirectusContent } from '@/hooks/useDirectusContent';
import { useEditableField } from '@/hooks/useEditableField';
import { EditableText } from '@/components/ui/EditableText';
import { Loader2 } from 'lucide-react';

// Role IDs from .env
const ADMIN_ROLE_ID = '0582d74b-a83f-4076-849f-b588e627c868';
const EDITOR_ROLE_ID = '97ef35d8-3d16-458d-8c93-78e35b7105a4';
const CLIENTE_ROLE_ID = import.meta.env.VITE_DIRECTUS_CLIENTE_ROLE_ID || '6c969db6-03d6-4240-b944-d0ba2bc56fc4';

interface LoginPageContent {
  heading?: string;
  subheading?: string;
  email_label?: string;
  email_placeholder?: string;
  password_label?: string;
  password_placeholder?: string;
  submit_button?: string;
  loading_text?: string;
  register_text?: string;
  register_link?: string;
  forgot_password_text?: string;
  support_text?: string;
}

export const LoginPage = () => {
  const { login: authLogin, checkAuth } = useUnifiedAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedReturnUrl = searchParams.get('return') || '/';

  // Fetch login page content from Directus
  // IMPORTANT: autoSync disabled and using useMemo to prevent infinite loops
  const { data: pageData, isLoading: contentLoading, canEdit, updateField } = useDirectusContent<{
    id: number;
    content: LoginPageContent;
  }>({
    collection: 'pages',
    slug: 'login',
    autoSync: false, // Disabled to prevent rate limiting
    syncInterval: 0 // No auto-refresh
  });

  const content: LoginPageContent = pageData?.content || {
    heading: 'Keyprog',
    subheading: 'Inicie sessão para continuar',
    email_label: 'Email',
    email_placeholder: 'seu.email@exemplo.com',
    password_label: 'Password',
    password_placeholder: '••••••••',
    submit_button: 'Iniciar Sessão',
    loading_text: 'A iniciar sessão...',
    register_text: 'Não tem conta?',
    register_link: 'Registar',
    forgot_password_text: 'Esqueceu a password?',
    support_text: 'Precisa de ajuda? Contacte o suporte'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Use UnifiedAuth login which updates context
      const success = await authLogin(email, password);
      
      if (!success) {
        setError('Email ou password inválidos');
        setIsLoading(false);
        return;
      }

      // Get user information to determine role
      const user = await DirectusService.getCurrentUser();
      
      console.log('📋 Login - User data retrieved:', { 
        hasUser: !!user, 
        hasRoleId: !!user?.roleId,
        roleId: user?.roleId,
        email: user?.email 
      });
      
      if (!user || !user.roleId) {
        console.error('❌ Login failed - user data incomplete:', { user });
        setError('Não foi possível determinar as permissões do utilizador. Contacte o administrador.');
        setIsLoading(false);
        return;
      }

      const userRoleId = user.roleId;
      
      console.log('🔍 Role comparison:', {
        userRoleId,
        userRoleIdType: typeof userRoleId,
        ADMIN_ROLE_ID,
        EDITOR_ROLE_ID,
        isAdmin: userRoleId === ADMIN_ROLE_ID,
        isEditor: userRoleId === EDITOR_ROLE_ID,
        requestedReturnUrl
      });
      
      // Only check email verification for Cliente role
      if (userRoleId === CLIENTE_ROLE_ID) {
        // Check if user email is verified (status must be 'active')
        if (user.status === 'draft') {
          setError('Por favor verifique o seu email antes de fazer login. Enviámos um novo link de verificação para ' + email);
          
          // Trigger resend verification email
          try {
            await DirectusService.resendVerificationEmail(email);
          } catch (emailError) {
            console.error('Failed to resend verification email:', emailError);
          }
          
          setIsLoading(false);
          return;
        }

        if (user.status !== 'active') {
          setError('A sua conta não está ativa. Enviámos um email de ativação para ' + email);
          
          // Send activation email
          try {
            await DirectusService.resendVerificationEmail(email);
          } catch (emailError) {
            console.error('Failed to send activation email:', emailError);
          }
          
          setIsLoading(false);
          return;
        }
      }
      console.log('👤 User logged in:', { email: user.email, roleId: userRoleId });

      // Determine redirect URL based on user role
      let redirectUrl = '/';

      // Check if user is Admin or Editor
      if (userRoleId === ADMIN_ROLE_ID || userRoleId === EDITOR_ROLE_ID) {
        // Admin/Editor: Allow access to protected routes
        const isProtectedRoute = requestedReturnUrl.startsWith('/admin') || 
                                 requestedReturnUrl.startsWith('/editor');
        
        if (isProtectedRoute) {
          redirectUrl = requestedReturnUrl;
        } else if (requestedReturnUrl === '/' || requestedReturnUrl === '/login') {
          // Default landing for admin/editor
          redirectUrl = userRoleId === ADMIN_ROLE_ID ? '/admin' : '/editor';
        } else {
          redirectUrl = requestedReturnUrl;
        }
        
        console.log('🎯 Redirecting Editor user to:', redirectUrl, '(roleId:', userRoleId, ')');
        
        console.log('✅ Admin/Editor login successful - redirecting to:', redirectUrl);
        
        // Store credentials for auto-login (only for admin/editor)
        localStorage.setItem('directus_auth_email', email);
        localStorage.setItem('directus_auth_password', password);
      } 
      // Check if user is Cliente
      else if (userRoleId === CLIENTE_ROLE_ID) {
        // Cliente: BLOCK access to admin/editor routes
        const isRequestingProtected = requestedReturnUrl.startsWith('/admin') || 
                                     requestedReturnUrl.startsWith('/editor');
        
        if (isRequestingProtected) {
          console.warn('🚫 Cliente attempted to access protected route:', requestedReturnUrl);
          setError('Não tem permissões para aceder a essa área');
          // Redirect to file service after showing error
          setTimeout(() => {
            navigate('/file-service');
          }, 2000);
          setIsLoading(false);
          return;
        } else if (requestedReturnUrl === '/' || requestedReturnUrl === '/login') {
          // Default landing for Cliente
          redirectUrl = '/file-service';
        } else {
          // Allow other public pages
          redirectUrl = requestedReturnUrl;
        }
        
        console.log('✅ Cliente login successful - redirecting to:', redirectUrl);
      } 
      // Unknown role - play it safe
      else {
        console.warn('⚠️ Unknown role ID:', userRoleId);
        redirectUrl = '/';
      }

      // CRITICAL FIX: Re-check authentication to update context
      console.log('🔄 Calling checkAuth to update context...');
      try {
        const checkResult = await checkAuth();
        console.log('✅ checkAuth completed, result:', checkResult);
      } catch (checkAuthError) {
        console.error('❌ checkAuth failed:', checkAuthError);
        // Continue anyway - we already have the user data
      }
      
      // Add small delay to ensure state is updated
      console.log('⏳ Waiting 150ms for state update...');
      await new Promise(resolve => setTimeout(resolve, 150));
      console.log('✅ State update delay completed');

      // Navigate to appropriate URL
      console.log('🚀 Attempting navigation to:', redirectUrl);
      
      try {
        navigate(redirectUrl, { replace: true });
        console.log('✅ navigate() called successfully');
        
        // Fallback: Force navigation if React Router doesn't work
        setTimeout(() => {
          if (window.location.pathname === '/login') {
            console.warn('⚠️ Still on login page after 500ms, forcing navigation...');
            window.location.href = redirectUrl;
          }
        }, 500);
      } catch (navError) {
        console.error('❌ Navigation failed:', navError);
        // Force navigation using window.location
        window.location.href = redirectUrl;
      }
      
      // Keep loading state while navigation happens
      // Don't set isLoading to false here - let the component unmount
      
    } catch (err) {
      setError('Erro na autenticação. Por favor tente novamente.');
      console.error('Login error:', err);
      setIsLoading(false);
    }
  };

  // Helper function to update nested content fields
  const updateContentField = async (field: string, value: string) => {
    if (!pageData?.id) return;
    
    const updatedContent = {
      ...content,
      [field]: value
    };
    
    await updateField('content', updatedContent);
  };

  if (contentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <EditableText
            value={content.heading || 'Keyprog'}
            isEditable={canEdit}
            onEdit={() => {
              const newValue = prompt('Edit heading:', content.heading);
              if (newValue) updateContentField('heading', newValue);
            }}
            as="h1"
            className="text-3xl font-bold text-gray-900 mb-2"
          />
          <EditableText
            value={content.subheading || 'Inicie sessão para continuar'}
            isEditable={canEdit}
            onEdit={() => {
              const newValue = prompt('Edit subheading:', content.subheading);
              if (newValue) updateContentField('subheading', newValue);
            }}
            as="p"
            className="text-gray-600"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <EditableText
              value={content.email_label || 'Email'}
              isEditable={canEdit}
              onEdit={() => {
                const newValue = prompt('Edit email label:', content.email_label);
                if (newValue) updateContentField('email_label', newValue);
              }}
              as="label"
              className="block text-sm font-medium text-gray-700 mb-2"
            />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{ color: '#000000' }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={content.email_placeholder || 'seu.email@exemplo.com'}
            />
          </div>

          <div>
            <EditableText
              value={content.password_label || 'Password'}
              isEditable={canEdit}
              onEdit={() => {
                const newValue = prompt('Edit password label:', content.password_label);
                if (newValue) updateContentField('password_label', newValue);
              }}
              as="label"
              className="block text-sm font-medium text-gray-700 mb-2"
            />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{ color: '#000000' }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={content.password_placeholder || '••••••••'}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {content.loading_text || 'A iniciar sessão...'}
              </>
            ) : (
              content.submit_button || 'Iniciar Sessão'
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            <EditableText
              value={content.register_text || 'Não tem conta?'}
              isEditable={canEdit}
              onEdit={() => {
                const newValue = prompt('Edit register text:', content.register_text);
                if (newValue) updateContentField('register_text', newValue);
              }}
              as="span"
            />
            {' '}
            <Link to="/registo" className="text-blue-600 hover:underline font-medium">
              {content.register_link || 'Registar'}
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              <EditableText
                value={content.forgot_password_text || 'Esqueceu a password?'}
                isEditable={canEdit}
                onEdit={() => {
                  const newValue = prompt('Edit forgot password text:', content.forgot_password_text);
                  if (newValue) updateContentField('forgot_password_text', newValue);
                }}
                as="span"
              />
            </Link>
          </p>
          <EditableText
            value={content.support_text || 'Precisa de ajuda? Contacte o suporte'}
            isEditable={canEdit}
            onEdit={() => {
              const newValue = prompt('Edit support text:', content.support_text);
              if (newValue) updateContentField('support_text', newValue);
            }}
            as="p"
            className="text-xs text-gray-500"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
