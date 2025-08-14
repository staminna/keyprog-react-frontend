import { useState } from 'react';
import { DirectusService } from '@/services/directusService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const BulkServicesCreator = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Array<{title: string, status: 'success' | 'error', message?: string}>>([]);

  const services = [
    {
      title: "Emulador ECU Universal",
      slug: "emulador-ecu-universal",
      description: "Emulador ECU de alta qualidade para bypass de sistemas eletrónicos automóveis. Compatível com a maioria das marcas e modelos. Ideal para oficinas profissionais e técnicos especializados em eletrónica automóvel.",
      category: "Emuladores",
      price: 150.00,
      features: ["Compatibilidade universal", "Instalação simples", "Garantia 12 meses", "Suporte técnico", "Manual em português"]
    },
    {
      title: "Ferramenta Diagnóstico OBD2 Pro",
      slug: "ferramenta-diagnostico-obd2-pro",
      description: "Ferramenta de diagnóstico profissional OBD2 com suporte para múltiplos protocolos e marcas automóveis. Inclui relatórios detalhados para diagnóstico preciso.",
      category: "Equipamentos",
      price: 280.00,
      features: ["Suporte multi-protocolo", "Relatórios detalhados", "Interface intuitiva", "Atualizações gratuitas", "Cabo OBD2 incluído"]
    },
    {
      title: "Software Reprogramação ECU Master",
      slug: "software-reprogramacao-ecu-master",
      description: "Software profissional para reprogramação de centralinas (ECU) com suporte para centenas de modelos de veículos. Inclui mapas otimizados e funcionalidades avançadas de tuning.",
      category: "Software",
      price: 450.00,
      features: ["Centenas de modelos", "Mapas otimizados", "Interface profissional", "Backup automático", "Suporte técnico especializado"]
    },
    {
      title: "Estabilizador Tensão Automóvel",
      slug: "estabilizador-tensao-automovel",
      description: "Estabilizador de tensão profissional para proteção de equipamentos durante intervenções em sistemas eletrónicos automóveis. Essencial para trabalhos seguros.",
      category: "Estabilizadores",
      price: 120.00,
      features: ["Proteção completa", "Indicadores LED", "Construção robusta", "Certificação CE", "Garantia 24 meses"]
    },
    {
      title: "Kit Reparação Airbag",
      slug: "kit-reparacao-airbag",
      description: "Kit completo para reparação e reset de sistemas airbag. Inclui ferramentas especializadas e software para eliminação de códigos de erro.",
      category: "Segurança",
      price: 200.00,
      features: ["Kit completo", "Software incluído", "Ferramentas especializadas", "Manual técnico", "Suporte online"]
    },
    {
      title: "Programador Chaves Universal",
      slug: "programador-chaves-universal",
      description: "Programador universal de chaves automóveis compatível com múltiplas marcas. Ideal para programação de chaves, comandos e sistemas keyless.",
      category: "Segurança",
      price: 350.00,
      features: ["Compatibilidade universal", "Programação rápida", "Interface simples", "Base de dados atualizada", "Cabo de ligação incluído"]
    },
    {
      title: "Analisador Sistema DPF",
      slug: "analisador-sistema-dpf",
      description: "Analisador especializado para sistemas DPF (Diesel Particulate Filter). Permite diagnóstico, limpeza e regeneração de filtros de partículas.",
      category: "Emissões",
      price: 180.00,
      features: ["Diagnóstico completo", "Regeneração forçada", "Relatórios técnicos", "Compatibilidade diesel", "Software atualizado"]
    },
    {
      title: "Testador Quadrantes Digital",
      slug: "testador-quadrantes-digital",
      description: "Equipamento para teste e calibração de quadrantes de instrumentos digitais. Essencial para reparação de displays e ponteiros defeituosos.",
      category: "Reparação",
      price: 220.00,
      features: ["Teste completo", "Calibração precisa", "Suporte LCD/LED", "Relatório de teste", "Garantia técnica"]
    },
    {
      title: "Scanner Imobilizador Pro",
      slug: "scanner-imobilizador-pro",
      description: "Scanner profissional para sistemas imobilizador. Permite diagnóstico, programação e sincronização de componentes de segurança automóvel.",
      category: "Segurança",
      price: 300.00,
      features: ["Diagnóstico avançado", "Programação completa", "Sincronização automática", "Base dados extensa", "Interface profissional"]
    },
    {
      title: "Limpador Sistema EGR",
      slug: "limpador-sistema-egr",
      description: "Equipamento especializado para limpeza de sistemas EGR (Exhaust Gas Recirculation). Inclui produtos químicos específicos para limpeza profunda.",
      category: "Emissões",
      price: 95.00,
      features: ["Limpeza profunda", "Produtos incluídos", "Processo automatizado", "Resultados garantidos", "Eco-friendly"]
    },
    {
      title: "Testador Start/Stop Advanced",
      slug: "testador-start-stop-advanced",
      description: "Testador avançado para sistemas Start/Stop. Permite diagnóstico completo, teste de bateria e calibração de parâmetros de funcionamento.",
      category: "Eficiência",
      price: 160.00,
      features: ["Teste completo", "Análise de bateria", "Calibração automática", "Relatório detalhado", "Compatibilidade ampla"]
    },
    {
      title: "Multímetro Automóvel Pro",
      slug: "multimetro-automovel-pro",
      description: "Multímetro profissional específico para eletrónica automóvel. Inclui funções especializadas para diagnóstico de sistemas eletrónicos complexos.",
      category: "Equipamentos",
      price: 85.00,
      features: ["Funções especializadas", "Display digital", "Pontas de prova incluídas", "Resistente a impactos", "Precisão elevada"]
    }
  ];

  const createAllServices = async () => {
    setIsCreating(true);
    setProgress(0);
    setResults([]);

    const newResults: Array<{title: string, status: 'success' | 'error', message?: string}> = [];

    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      
      try {
        await DirectusService.createService(service);
        newResults.push({
          title: service.title,
          status: 'success'
        });
      } catch (error) {
        newResults.push({
          title: service.title,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      setProgress(((i + 1) / services.length) * 100);
      setResults([...newResults]);
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setIsCreating(false);
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Bulk Services Creator</span>
          {isCreating && <Loader2 className="h-5 w-5 animate-spin" />}
        </CardTitle>
        <p className="text-muted-foreground">
          Create all {services.length} professional Keyprog services in Directus at once.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex gap-4 items-center">
          <Button 
            onClick={createAllServices} 
            disabled={isCreating}
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Services...
              </>
            ) : (
              'Create All Services'
            )}
          </Button>
          
          {results.length > 0 && (
            <div className="flex gap-2">
              <Badge variant="default" className="bg-green-500">
                {successCount} Success
              </Badge>
              {errorCount > 0 && (
                <Badge variant="destructive">
                  {errorCount} Errors
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Progress */}
        {isCreating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Creating services...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Results:</h3>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {results.map((result, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {result.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={result.status === 'success' ? 'text-green-700' : 'text-red-700'}>
                    {result.title}
                  </span>
                  {result.message && (
                    <span className="text-muted-foreground">- {result.message}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services Preview */}
        <div className="space-y-2">
          <h3 className="font-semibold">Services to be created:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {services.map((service, index) => (
              <div key={index} className="text-sm p-2 border rounded">
                <div className="font-medium">{service.title}</div>
                <div className="text-muted-foreground">{service.category} - €{service.price}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkServicesCreator;
