import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DirectusService } from '@/services/directusService';
import { User, Shield, Edit3 } from 'lucide-react';
import LogoutButton from './LogoutButton';
import type { User as DirectusUser } from '@/types/auth';

export const AuthStatus = () => {
  const [user, setUser] = useState<DirectusUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await DirectusService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
      >
        <User className="w-5 h-5" />
        <span className="hidden md:inline">Login</span>
      </Link>
    );
  }

  const isAdmin = user.role?.toLowerCase().includes('admin');

  return (
    <div className="flex items-center space-x-4">
      {/* Editor Link */}
      <Link
        to="/editor"
        className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
        title="Content Editor"
      >
        <Edit3 className="w-5 h-5" />
        <span className="hidden md:inline">Editor</span>
      </Link>

      {/* Admin Link (only for admins) */}
      {isAdmin && (
        <Link
          to="/admin"
          className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
          title="Admin Dashboard"
        >
          <Shield className="w-5 h-5" />
          <span className="hidden md:inline">Admin</span>
        </Link>
      )}

      {/* User Info */}
      <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-600">
        <User className="w-4 h-4" />
        <span>{user.firstName || user.email}</span>
      </div>

      {/* Logout Button */}
      <LogoutButton className="hidden md:flex" />
    </div>
  );
};

export default AuthStatus;
