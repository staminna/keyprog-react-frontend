import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DirectusService } from '@/services/directusService';
import type { DirectusServices } from '@/lib/directus';
import { PageSection, PageImage, PageButton } from '@/components/editable';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Clock, CheckCircle, Star } from 'lucide-react';

const Servicos = () => {
  const [services, setServices] = useState<DirectusServices[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const servicesData = await DirectusService.getServices();
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Helper function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <main className="container py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <PageSection
          id="1"
          collection="settings"
          field="services_title"
          value="Serviços Especializados"
          tag="h1"
          className="text-4xl font-bold text-gradient-primary mb-4"
        />
        <PageSection
          id="1"
          collection="settings"
          field="services_description"
          value="Soluções profissionais em eletrónica automóvel com mais de 10 anos de experiência. Oferecemos serviços de qualidade com garantia e suporte técnico especializado."
          tag="p"
          className="text-lg text-muted-foreground max-w-3xl mx-auto"
        />
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {service.title}
                    </CardTitle>
                    {service.category && (
                      <Badge variant="secondary" className="mt-2">
                        {service.category}
                      </Badge>
                    )}
                  </div>
                  {service.price && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {formatPrice(service.price)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        a partir de
                      </div>
                    </div>
                  )}
                </div>
                
                {service.description && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                    {service.description.replace(/<[^>]*>/g, '')}
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="pt-0 space-y-4">
                {/* Features */}
                {service.features && Array.isArray(service.features) && service.features.length > 0 && (
                  <div className="space-y-2">
                    {service.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button asChild className="flex-1 group">
                    <Link to={`/servicos/${service.slug}`}>
                      Ver Detalhes
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Star className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Additional Information */}
      <div className="mt-16 grid gap-8 md:grid-cols-3">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <PageSection
            id="1"
            collection="settings"
            field="services_feature1_title"
            value="Atendimento Rápido"
            tag="h3"
            className="font-semibold mb-2"
          />
          <PageSection
            id="1"
            collection="settings"
            field="services_feature1_description"
            value="Diagnóstico e orçamento em 24h. Intervenções rápidas e eficientes."
            tag="p"
            className="text-sm text-muted-foreground"
          />
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <PageSection
            id="1"
            collection="settings"
            field="services_feature2_title"
            value="Garantia de Qualidade"
            tag="h3"
            className="font-semibold mb-2"
          />
          <PageSection
            id="1"
            collection="settings"
            field="services_feature2_description"
            value="Todos os serviços incluem garantia e suporte técnico pós-venda."
            tag="p"
            className="text-sm text-muted-foreground"
          />
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <PageSection
            id="1"
            collection="settings"
            field="services_feature3_title"
            value="Experiência Comprovada"
            tag="h3"
            className="font-semibold mb-2"
          />
          <PageSection
            id="1"
            collection="settings"
            field="services_feature3_description"
            value="Mais de 10 anos de experiência em eletrónica automóvel."
            tag="p"
            className="text-sm text-muted-foreground"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center bg-muted/50 rounded-lg p-8">
        <PageSection
          id="1"
          collection="settings"
          field="services_cta_title"
          value="Precisa de um Orçamento?"
          tag="h2"
          className="text-2xl font-bold mb-4"
        />
        <PageSection
          id="1"
          collection="settings"
          field="services_cta_description"
          value="Entre em contacto connosco para um orçamento personalizado. Analisamos o seu caso e apresentamos a melhor solução."
          tag="p"
          className="text-muted-foreground mb-6 max-w-2xl mx-auto"
        />
        <div className="flex gap-4 justify-center flex-wrap">
          <PageButton
            id="1"
            collection="settings"
            field="services_cta_button1"
            value="Pedir Orçamento"
            linkTo="/contacto"
            size="lg"
          />
          <PageButton
            id="1"
            collection="settings"
            field="services_cta_button2"
            value="Saber Mais"
            linkTo="/sobre"
            variant="outline"
            size="lg"
          />
        </div>
      </div>
    </main>
  );
};

export default Servicos;