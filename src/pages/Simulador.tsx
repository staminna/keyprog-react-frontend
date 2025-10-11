import SEOHead from '@/components/SEOHead';
import { UniversalContentEditor } from '@/components/universal/UniversalContentEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Zap, TrendingUp, Info } from 'lucide-react';

const Simulador = () => {
  return (
    <>
      <SEOHead 
        title="Simulador - Keyprog"
        description="Simule ganhos de potência e alterações com base no seu veículo e objetivos."
        keywords="simulador, reprogramação, ganhos, potência, keyprog"
      />
      
      <main className="container py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <UniversalContentEditor
              collection="pages"
              itemId="simulador"
              field="title"
              tag="h1"
              className="text-4xl font-bold mb-4"
              value="Simulador de Reprogramação"
            />
            <UniversalContentEditor
              collection="pages"
              itemId="simulador"
              field="description"
              tag="p"
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              value="Simule ganhos de potência e torque com base no seu veículo e objetivos de reprogramação."
            />
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5 text-blue-500" />
                  Simulação Precisa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Cálculos baseados em dados reais de reprogramações efetuadas
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Ganhos de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Veja os ganhos de potência e torque possíveis para o seu veículo
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Múltiplos Cenários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Compare diferentes níveis de reprogramação disponíveis
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Simulator Coming Soon */}
          <Card className="border-2 border-dashed">
            <CardHeader className="text-center">
              <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <CardTitle className="text-2xl">Simulador em Desenvolvimento</CardTitle>
              <CardDescription className="text-base">
                Estamos a trabalhar numa ferramenta de simulação interativa que lhe permitirá:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 max-w-2xl mx-auto">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Selecionar o seu veículo</p>
                    <p className="text-sm text-muted-foreground">
                      Escolha marca, modelo, ano e motorização
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Ver ganhos estimados</p>
                    <p className="text-sm text-muted-foreground">
                      Potência, torque e eficiência melhorada
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Comparar pacotes</p>
                    <p className="text-sm text-muted-foreground">
                      Stage 1, Stage 2 e outras opções disponíveis
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <p className="font-medium">Solicitar orçamento</p>
                    <p className="text-sm text-muted-foreground">
                      Peça orçamento diretamente através do simulador
                    </p>
                  </div>
                </li>
              </ul>
              
              <div className="mt-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Enquanto isso, entre em contacto para obter uma simulação personalizada
                </p>
                <a 
                  href="/contactos" 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8"
                >
                  Contactar-nos
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default Simulador;
