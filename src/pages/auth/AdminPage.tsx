import { DirectusService } from '@/services/directusService';
import { Loader2, Shield, Users, Database, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { User } from '@/types/auth';

export const AdminPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const currentUser = await DirectusService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Admin Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">System administration and management</p>
            </div>
          </div>
          
          {user && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="font-medium text-gray-900">{user.email}</p>
              <p className="text-sm text-gray-600 mt-1">Role: {user.role}</p>
            </div>
          )}
        </div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Directus CMS */}
          <a
            href={import.meta.env.VITE_DIRECTUS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <Database className="w-10 h-10 text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Directus CMS</h2>
            <p className="text-gray-600 mb-4">
              Access the full Directus admin panel for advanced content management
            </p>
            <span className="text-blue-600 hover:text-blue-700 font-medium">
              Open Directus →
            </span>
          </a>

          {/* User Management */}
          <a
            href={`${import.meta.env.VITE_DIRECTUS_URL}/admin/users`}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <Users className="w-10 h-10 text-green-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">User Management</h2>
            <p className="text-gray-600 mb-4">
              Manage users, roles, and permissions
            </p>
            <span className="text-green-600 hover:text-green-700 font-medium">
              Manage Users →
            </span>
          </a>

          {/* Settings */}
          <a
            href={`${import.meta.env.VITE_DIRECTUS_URL}/admin/settings`}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <Settings className="w-10 h-10 text-purple-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">System Settings</h2>
            <p className="text-gray-600 mb-4">
              Configure system-wide settings and preferences
            </p>
            <span className="text-purple-600 hover:text-purple-700 font-medium">
              Open Settings →
            </span>
          </a>

          {/* Content Editor */}
          <a
            href="/editor"
            className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <Shield className="w-10 h-10 text-orange-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Content Editor</h2>
            <p className="text-gray-600 mb-4">
              Edit website content inline without accessing Directus
            </p>
            <span className="text-orange-600 hover:text-orange-700 font-medium">
              Open Editor →
            </span>
          </a>
        </div>

        {/* Warning Notice */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Administrator Access</h3>
          <p className="text-yellow-800 text-sm">
            This area is restricted to administrators only. Any changes made here can affect the entire website. 
            Please exercise caution when modifying system settings or user permissions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
