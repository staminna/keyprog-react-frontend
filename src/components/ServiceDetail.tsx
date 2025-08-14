import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DirectusService } from '@/services/directusService';
import type { DirectusServices } from '@/lib/directus';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, Phone, Mail } from 'lucide-react';

interface ServiceDetailProps {
  slug?: string; // Optional prop to override URL slug
}

const ServiceDetail = ({ slug: propSlug }: ServiceDetailProps) => {
  const { slug: urlSlug } = useParams<{ slug: string }>();
  const slug = propSlug || urlSlug;
  
  const [service, setService] = useState<DirectusServices | null>(null);
  const [relatedServices, setRelatedServices] = useState<DirectusServices[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      if (!slug) {
        setError('No service slug provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const [serviceData, allServices] = await Promise.all([
          DirectusService.getService(slug),
          DirectusService.getServices()
        ]);
        
        if (!serviceData) {
          setError('Service not found');
        } else {
          setService(serviceData);
          // Get related services (exclude current service)
          setRelatedServices(
            allServices
              .filter(s => s.id !== serviceData.id)
              .slice(0, 3)
          );
        }
      } catch (err) {
        console.error('Error fetching service:', err);
        setError('Failed to load service details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [slug]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-64 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/servicos" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Serviços
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

  // No service found
  if (!service) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/servicos" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Serviços
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-muted-foreground mb-4">
              Serviço Não Encontrado
            </h1>
            <p className="text-muted-foreground">
              O serviço solicitado não foi encontrado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render service details
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <Link to="/servicos" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" />
          Voltar aos Serviços
        </Link>

        {/* Service Header */}
        <div className="mb-8">
          {service.title && (
            <h1 className="text-4xl font-bold mb-4 text-gradient-primary">
              {service.title}
            </h1>
          )}

          {/* Service Categories/Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary">Serviço Automóvel</Badge>
            <Badge variant="outline">ECU</Badge>
            {service.category && (
              <Badge variant="default">{service.category}</Badge>
            )}
          </div>

          {/* Service Image */}
          {service.image && (
            <div className="mb-6">
              <img
                src={DirectusService.getImageUrl(service.image)}
                alt={service.title || 'Service Image'}
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
            </div>
          )}
        </div>

        {/* Service Description */}
        {service.description && (
          <div className="prose prose-lg max-w-none mb-8">
            <div dangerouslySetInnerHTML={{ __html: service.description }} />
          </div>
        )}

        {/* Service Features/Benefits */}
        {service.features && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Características do Serviço</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Array.isArray(service.features) ? (
                service.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-muted rounded-lg">
                  <div dangerouslySetInnerHTML={{ __html: service.features }} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Interessado neste serviço?</h3>
          <p className="text-muted-foreground mb-4">
            Entre em contacto connosco para mais informações ou para agendar o seu serviço.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link to="/contactos">
                <Phone className="h-4 w-4 mr-2" />
                Contactar
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/contactos">
                <Mail className="h-4 w-4 mr-2" />
                Pedir Orçamento
              </Link>
            </Button>
          </div>
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Outros Serviços</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedServices.map((relatedService) => (
                <Link
                  key={relatedService.id}
                  to={`/servicos/${relatedService.slug}`}
                  className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  {relatedService.image && (
                    <img
                      src={DirectusService.getImageUrl(relatedService.image)}
                      alt={relatedService.title || 'Service'}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                  )}
                  <h3 className="font-semibold mb-2">{relatedService.title}</h3>
                  {relatedService.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {relatedService.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetail;
