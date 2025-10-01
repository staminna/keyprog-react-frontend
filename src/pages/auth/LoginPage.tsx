import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { DirectusService } from '@/services/directusService';
import { Loader2 } from 'lucide-react';

// Role IDs from .env
const ADMIN_ROLE_ID = '0582d74b-a83f-4076-849f-b588e627c868';
const EDITOR_ROLE_ID = '97ef35d8-3d16-458d-8c93-78e35b7105a4';
const CLIENTE_ROLE_ID = import.meta.env.VITE_DIRECTUS_CLIENTE_ROLE_ID || '6c969db6-03d6-4240-b944-d0ba2bc56fc4';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedReturnUrl = searchParams.get('return') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await DirectusService.authenticate(email, password);
      
      if (!success) {
        setError('Email ou password inválidos');
        setIsLoading(false);
        return;
      }

      // Get user information to determine role
      const user = await DirectusService.getCurrentUser();
      
      if (!user || !user.roleId) {
        setError('Não foi possível determinar as permissões do utilizador');
        setIsLoading(false);
        return;
      }

      const userRoleId = user.roleId;
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

      // Navigate to appropriate URL
      navigate(redirectUrl);
      
    } catch (err) {
      setError('Erro na autenticação. Por favor tente novamente.');
      console.error('Login error:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Keyprog</h1>
          <p className="text-gray-600">Inicie sessão para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="seu.email@exemplo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
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
                A iniciar sessão...
              </>
            ) : (
              'Iniciar Sessão'
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Não tem conta?{' '}
            <Link to="/registo" className="text-blue-600 hover:underline font-medium">
              Registar
            </Link>
          </p>
          <p className="text-xs text-gray-500">
            Precisa de ajuda? Contacte o suporte
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
