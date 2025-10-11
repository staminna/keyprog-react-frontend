import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DirectusService } from '@/services/directusService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import NotFoundContent from '@/components/NotFoundContent';
import SEOHead from '@/components/SEOHead';
import { UniversalContentEditor } from '@/components/universal/UniversalContentEditor';
import { CheckCircle, ArrowLeft, Star, Euro, Clock, Shield } from 'lucide-react';

interface ServiceData {
  id: string;
  title: string;
  description: string;
  slug: string;
  category: string;
  price: string;
  features: string[];
  image?: string;
}

interface ServicePageTemplateProps {
  serviceSlug: string;
}

const ServicePageTemplate: React.FC<ServicePageTemplateProps> = ({ serviceSlug }) => {
  const [service, setService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      try {
        const services = await DirectusService.getServices();
        const foundService = services.find(s => s.slug === serviceSlug);
        
        if (foundService) {
          setService(foundService as unknown as ServiceData);
        } else {
          setError('Serviço não encontrado');
        }
      } catch (err) {
        console.error('Error fetching service:', err);
        setError('Falha ao carregar o serviço. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceSlug]);

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(numPrice);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container py-12">
        <NotFoundContent 
          title="Serviço não encontrado"
          message={error || "O serviço solicitado não foi encontrado ou não está disponível."}
          backLink="/servicos"
          backText="Voltar para Serviços"
        />
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${service.title} - Keyprog`}
        description={service.description || `${service.title} - Keyprog`}
        keywords={`${service.title}, ${service.category}, serviços, keyprog`}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Link to="/servicos" className="hover:text-foreground transition-colors">
              Serviços
            </Link>
            <span>/</span>
            <span className="text-foreground">{service.title}</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              {service.category && (
                <Badge variant="secondary" className="text-sm">
                  {service.category}
                </Badge>
              )}
              {service.price && (
                <Badge variant="outline" className="text-sm font-semibold">
                  <Euro className="w-3 h-3 mr-1" />
                  {formatPrice(service.price)}
                </Badge>
              )}
            </div>
            
            <UniversalContentEditor
              collection="services"
              itemId={service.id}
              field="title"
              value={service.title}
              tag="h1"
              className="text-4xl font-bold mb-4 text-gradient-primary"
              placeholder="Enter service title..."
            />
            
            <UniversalContentEditor
              collection="services"
              itemId={service.id}
              field="description"
              value={service.description}
              tag="p"
              className="text-xl text-muted-foreground max-w-3xl leading-relaxed"
              placeholder="Enter service description..."
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Featured Image */}
              {service.image && (
                <div className="relative overflow-hidden rounded-lg shadow-lg">
                  <img 
                    src={`${import.meta.env.VITE_DIRECTUS_URL}/assets/${service.image}`}
                    alt={service.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}

              {/* Service Features */}
              {service.features && service.features.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <UniversalContentEditor
                        collection="service_templates"
                        itemId="default"
                        field="features_title"
                        value="O que está incluído"
                        tag="span"
                        placeholder="Features title..."
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Service Details */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <UniversalContentEditor
                      collection="service_templates"
                      itemId="default"
                      field="details_title"
                      value="Detalhes do Serviço"
                      tag="span"
                      placeholder="Details title..."
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-lg max-w-none">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                      <div>
                        <UniversalContentEditor
                          collection="service_templates"
                          itemId="default"
                          field="quality_title"
                          value="Garantia de Qualidade"
                          tag="h4"
                          className="font-semibold mb-1"
                          placeholder="Quality title..."
                        />
                        <UniversalContentEditor
                          collection="service_templates"
                          itemId="default"
                          field="quality_description"
                          value="Todos os nossos serviços incluem garantia e suporte técnico especializado."
                          tag="p"
                          className="text-sm text-muted-foreground"
                          placeholder="Quality description..."
                        />
                      </div>
                    </div>
                    
                    <div className="border-t my-4"></div>
                    
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                      <div>
                        <UniversalContentEditor
                          collection="service_templates"
                          itemId="default"
                          field="speed_title"
                          value="Atendimento Rápido"
                          tag="h4"
                          className="font-semibold mb-1"
                          placeholder="Speed title..."
                        />
                        <UniversalContentEditor
                          collection="service_templates"
                          itemId="default"
                          field="speed_description"
                          value="Diagnóstico e orçamento em 24h. Intervenções rápidas e eficientes."
                          tag="p"
                          className="text-sm text-muted-foreground"
                          placeholder="Speed description..."
                        />
                      </div>
                    </div>
                    
                    <div className="border-t my-4"></div>
                    
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                      <div>
                        <UniversalContentEditor
                          collection="service_templates"
                          itemId="default"
                          field="experience_title"
                          value="Experiência Comprovada"
                          tag="h4"
                          className="font-semibold mb-1"
                          placeholder="Experience title..."
                        />
                        <UniversalContentEditor
                          collection="service_templates"
                          itemId="default"
                          field="experience_description"
                          value="Mais de 10 anos de experiência em eletrónica automóvel."
                          tag="p"
                          className="text-sm text-muted-foreground"
                          placeholder="Experience description..."
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <Card className="border-2 border-primary/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">
                    {service.price ? formatPrice(service.price) : 'Consultar'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {service.price ? 'a partir de' : 'Preço sob consulta'}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" size="lg">
                    Pedir Orçamento
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/contactos">
                      Contactar
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    <UniversalContentEditor
                      collection="service_templates"
                      itemId="default"
                      field="help_title"
                      value="Precisa de Ajuda?"
                      tag="span"
                      placeholder="Help title..."
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <UniversalContentEditor
                    collection="service_templates"
                    itemId="default"
                    field="help_description"
                    value="Entre em contacto connosco para mais informações sobre este serviço."
                    tag="p"
                    className="text-sm text-muted-foreground"
                    placeholder="Help description..."
                  />
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Email:</strong> info@keyprog.pt
                    </div>
                    <div>
                      <strong>Telefone:</strong> +351 000 000 000
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Services */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    <UniversalContentEditor
                      collection="service_templates"
                      itemId="default"
                      field="related_title"
                      value="Outros Serviços"
                      tag="span"
                      placeholder="Related services title..."
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link 
                      to="/servicos/reprogramacao" 
                      className="block text-sm text-primary hover:underline"
                    >
                      Reprogramação ECU
                    </Link>
                    <Link 
                      to="/servicos/diagnostico" 
                      className="block text-sm text-primary hover:underline"
                    >
                      Diagnóstico Automotivo
                    </Link>
                    <Link 
                      to="/servicos/chaves" 
                      className="block text-sm text-primary hover:underline"
                    >
                      Programação de Chaves
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Back Navigation */}
          <div className="mt-12 pt-8 border-t">
            <Button variant="outline" asChild>
              <Link to="/servicos" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar para Serviços
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServicePageTemplate;
