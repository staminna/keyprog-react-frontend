import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DirectusService } from "@/services/directusService";
import { UniversalContentEditor } from "@/components/universal/UniversalContentEditor";
import type { DirectusServices } from "@/lib/directus";


const EditableServices = () => {
  const [services, setServices] = useState<DirectusServices[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await DirectusService.getServices();
        setServices(data);
      } catch (error) {
        console.error("Error loading services:", error);
        setServices([
          {
            id: "1",
            title: "Reprogramação de Centralinas",
            description: "Otimização e personalização do desempenho do seu veículo",
            slug: "reprogramacao-centralinas"
          },
          {
            id: "2",
            title: "Diagnóstico Avançado",
            description: "Identificação precisa de problemas eletrónicos",
            slug: "diagnostico-avancado"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);


  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />;
  }


  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <UniversalContentEditor
            collection="settings"
            itemId="settings"
            field="services_section_title"
            tag="h2"
            className="text-3xl font-bold mb-4"
            value="Nossos Serviços"
          />
          <UniversalContentEditor
            collection="settings"
            itemId="settings"
            field="services_section_description"
            tag="div"
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            value="Oferecemos soluções completas para otimização e diagnóstico de centralinas automotivas"
          />
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <UniversalContentEditor
                  collection="services"
                  itemId={service.id}
                  field="title"
                  tag="h3"
                  className="text-xl font-semibold mb-3"
                  value={service.title}
                />
                <UniversalContentEditor
                  collection="services"
                  itemId={service.id}
                  field="description"
                  tag="p"
                  className="text-muted-foreground"
                  value={service.description}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EditableServices;