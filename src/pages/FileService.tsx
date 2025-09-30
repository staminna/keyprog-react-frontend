import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { DirectusService } from '@/services/directusService';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

const FileService = () => {
  const { isAuthenticated, user, isLoading: authLoading, canUpload } = useUnifiedAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      setUploadStatus('idle');
      setUploadMessage('');
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus('error');
      setUploadMessage('Por favor, selecione pelo menos um ficheiro.');
      return;
    }

    if (!isAuthenticated || !user) {
      setUploadStatus('error');
      setUploadMessage('Precisa de estar autenticado para fazer upload de ficheiros.');
      return;
    }

    if (!canUpload) {
      setUploadStatus('error');
      setUploadMessage('Apenas utilizadores com role "Cliente" podem fazer upload de ficheiros.');
      return;
    }

    setUploading(true);
    setUploadStatus('idle');
    setUploadMessage('');

    try {
      // Upload files to Directus
      const uploadedFileIds = await DirectusService.uploadFiles(files);
      
      // Update user's File_service field with the uploaded file IDs
      await DirectusService.updateUserFileService(user.id!, uploadedFileIds);

      setUploadStatus('success');
      setUploadMessage('Ficheiros enviados com sucesso! A nossa equipa irá analisá-los em breve.');
      setFiles([]);
      
      // Clear file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadMessage('Erro ao enviar ficheiros. Por favor, tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <main className="container py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <main className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>File Service</CardTitle>
              <CardDescription>
                Envie o ficheiro da sua ECU para análise e otimização por técnicos especializados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Autenticação Necessária</h3>
                <p className="text-muted-foreground mb-6">
                  Por favor, faça login ou registe-se para utilizar o File Service.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => navigate('/login?return=/file-service')}>
                    Fazer Login
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/registo?return=/file-service')}>
                    Registar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Show access denied if user is not Cliente
  if (!canUpload) {
    return (
      <main className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>File Service</CardTitle>
              <CardDescription>
                Envie o ficheiro da sua ECU para análise e otimização por técnicos especializados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <XCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
                <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
                <p className="text-muted-foreground mb-6">
                  Apenas utilizadores com role "Cliente" podem fazer upload de ficheiros.
                  Por favor, contacte o administrador para solicitar acesso.
                </p>
                <Button variant="outline" onClick={() => navigate('/contactos')}>
                  Contactar Suporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>File Service</CardTitle>
            <CardDescription>
              Envie o ficheiro da sua ECU para análise e otimização por técnicos especializados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Welcome message */}
              <div className="bg-primary/5 p-4 rounded-lg">
                <p className="text-sm">
                  Bem-vindo, <span className="font-semibold">{user?.email}</span>! 
                  Pode fazer upload dos ficheiros da sua ECU abaixo.
                </p>
              </div>

              {/* File upload section */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Selecione os ficheiros</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ficheiros suportados: .bin, .hex, .fls, .kess, etc.
                </p>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".bin,.hex,.fls,.kess,.ori,.mod"
                />
                <Button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  variant="outline"
                >
                  Escolher Ficheiros
                </Button>
              </div>

              {/* Selected files list */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Ficheiros selecionados:</h4>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload status messages */}
              {uploadStatus === 'success' && (
                <div className="flex items-start gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <p className="text-sm text-green-800">{uploadMessage}</p>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-800">{uploadMessage}</p>
                </div>
              )}

              {/* Upload button */}
              <Button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A enviar...
                  </>
                ) : (
                  'Enviar Ficheiros'
                )}
              </Button>

              {/* Information section */}
              <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
                <p className="font-semibold">Informações importantes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Os ficheiros serão analisados pela nossa equipa técnica</li>
                  <li>Receberá uma notificação quando a análise estiver completa</li>
                  <li>Tempo médio de resposta: 24-48 horas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default FileService;
