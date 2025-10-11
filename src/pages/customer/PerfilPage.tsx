import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { DirectusService } from '@/services/directusService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, ArrowLeft, User } from 'lucide-react';

export const PerfilPage = () => {
  const { user, isLoading: authLoading, checkAuth } = useUnifiedAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    telefone: '',
    morada: '',
    cidade: '',
    codigo_postal: '',
    pais: 'PT',
    nif: '',
    nome_empresa: '',
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      try {
        setIsLoadingData(true);
        // Fetch complete user data from Directus
        const response = await fetch(
          `${import.meta.env.VITE_DIRECTUS_URL}/users/${user.id}?fields=first_name,last_name,email,telefone,morada,cidade,codigo_postal,pais,nif,nome_empresa`,
          {
            headers: {
              'Authorization': `Bearer ${await DirectusService.getToken()}`
            }
          }
        );

        if (response.ok) {
          const userData = await response.json();
          const data = userData.data;

          setFormData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: data.email || '',
            telefone: data.telefone || '',
            morada: data.morada || '',
            cidade: data.cidade || '',
            codigo_postal: data.codigo_postal || '',
            pais: data.pais || 'PT',
            nif: data.nif || '',
            nome_empresa: data.nome_empresa || '',
          });
        } else {
          console.error('Failed to load user data:', response.statusText);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do perfil",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do perfil",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadUserData();
  }, [user?.id, toast]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Utilizador não autenticado",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Update user in Directus
      const response = await fetch(
        `${import.meta.env.VITE_DIRECTUS_URL}/users/${user.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await DirectusService.getToken()}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.message || 'Failed to update profile');
      }

      // Refresh user data
      await checkAuth();

      toast({
        title: "Sucesso!",
        description: "Perfil atualizado com sucesso",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoadingData) {
    return (
      <main className="container py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">
              {authLoading ? 'A verificar autenticação...' : 'A carregar dados do perfil...'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <main className="container py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/conta')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
              <p className="text-gray-600 mt-1">
                Gerir as suas informações pessoais e de contacto
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize os seus dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Primeiro Nome *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Último Nome *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  O email não pode ser alterado. Contacte o suporte se necessitar de mudança.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => handleChange('telefone', e.target.value)}
                  placeholder="+351 000 000 000"
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Morada</CardTitle>
              <CardDescription>
                Informações de contacto e localização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="morada">Morada Completa</Label>
                <Textarea
                  id="morada"
                  value={formData.morada}
                  onChange={(e) => handleChange('morada', e.target.value)}
                  placeholder="Rua, número, apartamento..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => handleChange('cidade', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo_postal">Código Postal</Label>
                  <Input
                    id="codigo_postal"
                    value={formData.codigo_postal}
                    onChange={(e) => handleChange('codigo_postal', e.target.value)}
                    placeholder="0000-000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pais">País</Label>
                <Select
                  value={formData.pais}
                  onValueChange={(value) => handleChange('pais', value)}
                >
                  <SelectTrigger id="pais">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PT">Portugal</SelectItem>
                    <SelectItem value="ES">Espanha</SelectItem>
                    <SelectItem value="FR">França</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Empresariais (Opcional)</CardTitle>
              <CardDescription>
                Preencha se for uma empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome_empresa">Nome da Empresa</Label>
                <Input
                  id="nome_empresa"
                  value={formData.nome_empresa}
                  onChange={(e) => handleChange('nome_empresa', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nif">NIF / Número Fiscal</Label>
                <Input
                  id="nif"
                  value={formData.nif}
                  onChange={(e) => handleChange('nif', e.target.value)}
                  placeholder="000000000"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/conta')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  A guardar...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default PerfilPage;
