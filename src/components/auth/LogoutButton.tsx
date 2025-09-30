import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Loader2 } from 'lucide-react';
import { DirectusService } from '@/services/directusService';

export const LogoutButton = ({ className = '' }: { className?: string }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Clear stored credentials
      localStorage.removeItem('directus_auth_email');
      localStorage.removeItem('directus_auth_password');
      localStorage.removeItem('directus_token');
      localStorage.removeItem('inline-editor-enabled');
      localStorage.removeItem('inline-editor-override');
      
      // Redirect to home
      navigate('/');
      
      // Reload to clear all state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors disabled:opacity-50 ${className}`}
      title="Logout"
    >
      {isLoggingOut ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <LogOut className="w-5 h-5" />
      )}
      <span>Logout</span>
    </button>
  );
};

export default LogoutButton;
