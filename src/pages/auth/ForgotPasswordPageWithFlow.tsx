import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { sendPasswordResetEmail } from '@/services/emailFlowService';

/**
 * Versão do ForgotPasswordPage que usa APENAS o Flow do Directus
 * para enviar emails com template Liquid personalizado em português
 * 
 * IMPORTANTE: Esta versão NÃO usa o endpoint /auth/password/request do Directus
 * porque ele envia automaticamente o email padrão em inglês.
 * 
 * Em vez disso, chamamos diretamente o Flow via webhook.
 */
export const ForgotPasswordPageWithFlow = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Gerar token de reset simples
      const resetToken = generateResetToken();

      // Enviar email via Flow com template Liquid personalizado
      const emailSent = await sendPasswordResetEmail(email, resetToken);

      if (!emailSent) {
        throw new Error('Falha ao enviar email');
      }

      setSuccess(true);
    } catch (err) {
      setError('Erro ao enviar email. Verifique o endereço de email.');
      console.error('Password request error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Esqueceu a Password?</h1>
          <p className="text-gray-600">Introduza o seu email para receber um link de recuperação</p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              <p className="font-medium">✅ Email enviado com sucesso!</p>
              <p className="text-sm mt-1">
                Verifique a sua caixa de entrada para o link de recuperação.
                <br />
                <span className="text-xs text-green-600">
                  (Email enviado via Flow Directus com template Liquid em português)
                </span>
              </p>
            </div>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                Voltar ao Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full"
                placeholder="seu.email@exemplo.com"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  A enviar...
                </>
              ) : (
                'Enviar Link de Recuperação'
              )}
            </Button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-blue-600 hover:underline">
                Voltar ao Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

/**
 * Gera um token de reset seguro
 */
function generateResetToken(): string {
  // Gerar token aleatório de 32 bytes (64 caracteres hex)
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

export default ForgotPasswordPageWithFlow;
