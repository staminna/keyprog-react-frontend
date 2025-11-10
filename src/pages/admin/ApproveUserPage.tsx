import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { approveUser } from '@/services/verificationService';
import { Loader2, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react';

export const ApproveUserPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'success' | 'waiting-user' | 'error'>('pending');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleApproval = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token de aprovação não fornecido');
        setLoading(false);
        return;
      }

      try {
        // Use the dual verification service
        const result = await approveUser(token);

        if (result.success) {
          if (result.userActivated) {
            // Both verifications complete - user is now active
            setStatus('success');
            setMessage(result.message);
          } else {
            // Admin approved but user hasn't verified email yet
            setStatus('waiting-user');
            setMessage(result.message);
          }
        } else {
          setStatus('error');
          setMessage(result.message);
        }
      } catch (error) {
        console.error('Approval error:', error);
        setStatus('error');
        setMessage('Erro ao aprovar utilizador. Por favor tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    handleApproval();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {loading && (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processando Aprovação...</h1>
            <p className="text-gray-600">Por favor aguarde</p>
          </>
        )}

        {!loading && status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Utilizador Aprovado!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                <strong>✅ Conta Ativada:</strong> O utilizador pode agora fazer login e efetuar compras.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                to="/"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Voltar ao Site
              </Link>
              <a
                href="http://localhost:8065/admin/users"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition-colors"
              >
                Ir para Directus Admin
              </a>
            </div>
          </>
        )}

        {!loading && status === 'waiting-user' && (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Utilizador Aprovado!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>⏳ Próximo passo:</strong> O utilizador ainda precisa verificar o email.
                A conta será ativada automaticamente após a verificação.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                to="/"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Voltar ao Site
              </Link>
              <a
                href="http://localhost:8065/admin/users"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition-colors"
              >
                Ver Utilizador no Admin
              </a>
            </div>
          </>
        )}

        {!loading && status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro na Aprovação</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                to="/"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Voltar ao Site
              </Link>
              <a
                href="http://localhost:8065/admin/users"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition-colors"
              >
                Ir para Directus Admin
              </a>
            </div>
          </>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center text-xs text-gray-500">
            <UserCheck className="w-4 h-4 mr-1" />
            <span>Sistema de Aprovação Keyprog</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApproveUserPage;
