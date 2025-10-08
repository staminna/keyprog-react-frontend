import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { DirectusService } from '@/services/directusService';
import { Loader2, Mail, CheckCircle, XCircle } from 'lucide-react';

export const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const email = searchParams.get('email') || '';

  const handleResendEmail = async () => {
    if (!email) return;
    
    setResending(true);
    try {
      await DirectusService.resendVerificationEmail(email);
      setMessage('Email de verificação reenviado! Verifique a sua caixa de entrada.');
    } catch (error) {
      console.error('Failed to resend email:', error);
      setMessage('Erro ao reenviar email. Por favor tente novamente.');
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        // No token - show waiting for verification message
        setStatus('pending');
        setMessage('Aguardando verificação de email');
        return;
      }

      try {
        // Token is the user ID from the Directus Flow email
        const adminToken = import.meta.env.VITE_DIRECTUS_TOKEN;
        
        // Activate the user by updating their status
        const activateResponse = await fetch(
          `${import.meta.env.VITE_DIRECTUS_URL}/users/${token}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
              status: 'active'
            })
          }
        );

        if (activateResponse.ok) {
          setStatus('success');
          setMessage('Email verificado com sucesso! Pode agora fazer login.');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login?verified=true');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Link de verificação inválido ou expirado');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Erro ao verificar email. Por favor tente novamente.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {status === 'pending' && (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifique o seu Email</h1>
            <p className="text-gray-600 mb-4">
              Enviámos um link de verificação para:
            </p>
            <p className="text-lg font-semibold text-blue-600 mb-6">{email}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Por favor clique no link no email para ativar a sua conta. 
                Pode fechar esta janela após verificar o email.
              </p>
            </div>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Aguardando verificação...
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verificado!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">A redirecionar para o login...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro na Verificação</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link 
                to="/login" 
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Ir para Login
              </Link>
              <Link 
                to="/registo" 
                className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition-colors"
              >
                Registar Novamente
              </Link>
            </div>
          </>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Não recebeu o email?{' '}
            <button 
              onClick={handleResendEmail}
              disabled={resending || !email}
              className="text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {resending ? 'A enviar...' : 'Reenviar link de verificação'}
            </button>
          </p>
          {message && (
            <p className="text-xs text-green-600 mt-2">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
