import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, AlertCircle } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      
      if (!success) {
        setError('Credenciais inválidas. Verifique o email e password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Erro ao conectar com o Directus. Verifique se o servidor está ativo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@keyprog.com"
          autoComplete="username"
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
          disabled={isLoading}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || !email || !password}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Autenticando...
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Entrar
          </>
        )}
      </Button>
      
      <div className="text-xs text-muted-foreground text-center mt-4">
        <p>Use as suas credenciais do Directus CMS</p>
        <p className="mt-1">Servidor: {import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8065'}</p>
      </div>
    </form>
  );
};

export default LoginForm;
