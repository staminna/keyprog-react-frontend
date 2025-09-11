import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { OrderService, Customer } from '@/services/orderService';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Mail, Phone, User, MapPin, Calendar } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import NotFoundContent from './NotFoundContent';

interface CustomerDetailProps {
  id?: string; // Optional prop to override URL id
}

const CustomerDetail = ({ id: propId }: CustomerDetailProps) => {
  const { id: urlId } = useParams<{ id: string }>();
  const id = propId || urlId;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) {
        setError('No customer ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const customerData = await OrderService.getCustomer(id);
        
        if (!customerData) {
          setError('Customer not found');
        } else {
          setCustomer(customerData);
        }
      } catch (err) {
        console.error('Error fetching customer:', err);
        setError('Failed to load customer details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  // Format date function
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString('pt-PT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-3/4" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/admin" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // No customer found
  if (!customer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <NotFoundContent 
          title="Cliente não encontrado"
          message="O cliente solicitado não foi encontrado ou não está disponível."
          backLink="/admin"
          backText="Voltar ao Painel de Administração"
        />
      </div>
    );
  }

  // Render customer details
  return (
    <>
      <SEOHead 
        title={`${customer.first_name} ${customer.last_name} - Cliente - Keyprog`}
        description="Detalhes do cliente"
        keywords="cliente, detalhes, keyprog"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <Link to="/admin" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Painel de Administração
          </Link>

          {/* Customer Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gradient-primary">
              {customer.first_name} {customer.last_name}
            </h1>
            <p className="text-muted-foreground">
              Cliente desde {formatDate(customer.date_created)}
            </p>
          </div>

          {/* Customer Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informações de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <span>{customer.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Histórico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cliente desde:</span>
                    <span>{formatDate(customer.date_created)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total de encomendas:</span>
                    <span>0</span> {/* This would be populated from actual order data */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-8">
            <Button>
              <Mail className="h-4 w-4 mr-2" />
              Enviar Email
            </Button>
            <Button variant="outline">
              Editar Cliente
            </Button>
          </div>

          {/* Orders Section - Placeholder for future implementation */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Encomendas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Nenhuma encomenda encontrada para este cliente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CustomerDetail;
