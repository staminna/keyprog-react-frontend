import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import VisualEditor from '@/components/editor/VisualEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Shield } from 'lucide-react';

const ProtectedEditor: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Tem certeza que deseja sair?');
    if (confirmLogout) {
      await logout();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Authentication Header */}
        <div className="bg-white border-b shadow-sm">
          <div className="container flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                Sessão Autenticada
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user?.email || 'Utilizador Autenticado'}</span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Protected Editor Content */}
        <VisualEditor initialEditMode={true} />
      </div>
    </ProtectedRoute>
  );
};

export default ProtectedEditor;
