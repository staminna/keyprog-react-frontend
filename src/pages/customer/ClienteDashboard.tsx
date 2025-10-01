import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { DirectusService } from '@/services/directusService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, FileText, User, LogOut, Package, Settings } from 'lucide-react';

interface UploadedFile {
  id: string;
  filename_download: string;
  filesize: number;
  uploaded_on: string;
  type: string;
}

export const ClienteDashboard = () => {
  const { user, isLoading: authLoading, logout, canUpload } = useUnifiedAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      loadUserFiles();
    }
  }, [authLoading, user]);

  const loadUserFiles = async () => {
    if (!user?.id) return;

    try {
      setIsLoadingFiles(true);
      // Get user's File_service field which contains array of file IDs
      const userResponse = await fetch(
        `${import.meta.env.VITE_DIRECTUS_URL}/users/${user.id}?fields=File_service`,
        {
          headers: {
            'Authorization': `Bearer ${await DirectusService.getToken()}`
          }
        }
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const fileIds = userData.data?.File_service || [];

        if (fileIds.length > 0) {
          // Fetch file details
          const filesResponse = await fetch(
            `${import.meta.env.VITE_DIRECTUS_URL}/files?filter[id][_in]=${fileIds.join(',')}&sort=-uploaded_on`,
            {
              headers: {
                'Authorization': `Bearer ${await DirectusService.getToken()}`
              }
            }
          );

          if (filesResponse.ok) {
            const filesData = await filesResponse.json();
            setFiles(filesData.data || []);
          }
        }
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading) {
    return (
      <main className="container py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  if (!user || !canUpload) {
    navigate('/login');
    return null;
  }

  return (
    <main className="container py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Minha Conta</h1>
            <p className="text-gray-600 mt-1">
              Bem-vindo, {user.firstName || user.email}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/file-service')}>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Upload className="h-5 w-5 mr-2 text-blue-600" />
                Enviar Ficheiros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Faça upload dos ficheiros da sua ECU para análise
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/loja')}>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Package className="h-5 w-5 mr-2 text-green-600" />
                Loja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Explore produtos e equipamentos disponíveis
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/conta/perfil')}>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Settings className="h-5 w-5 mr-2 text-gray-600" />
                Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Gerir as suas informações pessoais
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informações da Conta
            </CardTitle>
            <CardDescription>
              As suas informações pessoais e de contacto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nome</p>
                <p className="text-base text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base text-gray-900">{user.email}</p>
              </div>
              {user.telefone && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefone</p>
                  <p className="text-base text-gray-900">{user.telefone}</p>
                </div>
              )}
              {user.cidade && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Cidade</p>
                  <p className="text-base text-gray-900">{user.cidade}</p>
                </div>
              )}
            </div>
            <div className="pt-4">
              <Button variant="outline" onClick={() => navigate('/conta/perfil')}>
                Editar Perfil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Ficheiros Enviados
            </CardTitle>
            <CardDescription>
              Histórico dos ficheiros que enviou para análise
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingFiles ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">
                  Ainda não enviou nenhum ficheiro
                </p>
                <Button onClick={() => navigate('/file-service')}>
                  Enviar Primeiro Ficheiro
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {file.filename_download}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.filesize)} • {formatDate(file.uploaded_on)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Em análise
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ClienteDashboard;
