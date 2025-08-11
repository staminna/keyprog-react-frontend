import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit } from "lucide-react";
import { DirectusService } from "@/services/directusService";
import type { DirectusServices } from "@/lib/directus";

interface EditableServicesProps {
  isEditing?: boolean;
  onSave?: (data: DirectusServices[]) => void;
}

const EditableServices = ({ isEditing = false, onSave }: EditableServicesProps) => {
  const [services, setServices] = useState<DirectusServices[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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

  const handleServiceChange = (index: number, field: keyof DirectusServices, value: string) => {
    const updatedServices = [...services];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value,
    };
    setServices(updatedServices);
  };

  const addService = () => {
    const newService: DirectusServices = {
      id: Date.now().toString(),
      title: "New Service",
      description: "Service description",
      slug: "new-service"
    };
    setServices([...services, newService]);
    setEditingIndex(services.length);
  };

  const removeService = (index: number) => {
    const updatedServices = services.filter((_, i) => i !== index);
    setServices(updatedServices);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(services);
    }
    setEditingIndex(null);
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />;
  }

  if (isEditing) {
    return (
      <Card className="w-full max-w-6xl mx-auto my-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Edit Services</CardTitle>
          <Button onClick={addService} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.map((service, index) => (
            <Card key={service.id} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-medium">Service {index + 1}</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeService(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {editingIndex === index ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input
                      value={service.title || ""}
                      onChange={(e) => handleServiceChange(index, "title", e.target.value)}
                      placeholder="Service title"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      value={service.description || ""}
                      onChange={(e) => handleServiceChange(index, "description", e.target.value)}
                      placeholder="Service description"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Slug</label>
                    <Input
                      value={service.slug || ""}
                      onChange={(e) => handleServiceChange(index, "slug", e.target.value)}
                      placeholder="service-slug"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="font-medium">{service.title}</h4>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  <p className="text-xs text-primary">/{service.slug}</p>
                </div>
              )}
            </Card>
          ))}
          
          <Button onClick={handleSave} className="w-full">
            Save All Changes
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Nossos Serviços</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Oferecemos soluções completas para otimização e diagnóstico de centralinas automotivas
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EditableServices;