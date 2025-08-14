import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MessageCircle, HelpCircle } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

const Suporte = () => {
  const faqItems = [
    {
      question: "Como posso contactar o suporte técnico?",
      answer: "Pode contactar-nos através do email suporte@keyprog.pt, telefone +351 XXX XXX XXX, ou através do formulário de contacto no nosso website."
    },
    {
      question: "Qual é o horário de funcionamento do suporte?",
      answer: "O nosso suporte técnico está disponível de segunda a sexta-feira, das 9h às 18h. Respondemos a emails e mensagens no prazo máximo de 24 horas."
    },
    {
      question: "Oferecem garantia nos serviços?",
      answer: "Sim, todos os nossos serviços incluem garantia. A duração varia conforme o tipo de serviço prestado. Consulte os detalhes específicos de cada serviço."
    },
    {
      question: "Como funciona o processo de reprogramação?",
      answer: "O processo inclui diagnóstico inicial, backup da ECU original, reprogramação com software especializado e testes finais. Todo o processo é documentado e reversível."
    },
    {
      question: "Que equipamentos utilizam?",
      answer: "Utilizamos equipamentos profissionais das marcas líderes do mercado, incluindo programadores, interfaces OBD e software especializado sempre atualizado."
    },
    {
      question: "Fazem serviços ao domicílio?",
      answer: "Sim, oferecemos serviços ao domicílio para determinados tipos de intervenções. Contacte-nos para verificar a disponibilidade na sua área."
    }
  ];

  return (
    <>
      <SEOHead 
        title="Suporte Técnico - Keyprog"
        description="Centro de suporte técnico da Keyprog. FAQ, contactos e assistência especializada para todos os nossos serviços e produtos."
        keywords="suporte técnico, FAQ, assistência, contacto, keyprog"
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Centro de Suporte</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Estamos aqui para ajudar. Encontre respostas às suas questões ou contacte a nossa equipa de suporte técnico.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Options */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Como Podemos Ajudar?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">suporte@keyprog.pt</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Telefone</p>
                      <p className="text-sm text-muted-foreground">+351 XXX XXX XXX</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Chat Online</p>
                      <p className="text-sm text-muted-foreground">Seg-Sex: 9h-18h</p>
                    </div>
                  </div>
                  
                  <Button className="w-full" asChild>
                    <a href="/contactos">Formulário de Contacto</a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle id="faq">Perguntas Frequentes (FAQ)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Support Resources */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>Recursos Adicionais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h3 className="font-semibold mb-2">Manuais Técnicos</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Aceda aos manuais de utilização dos nossos equipamentos e software.
                    </p>
                    <Button variant="outline" size="sm">
                      Ver Manuais
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-semibold mb-2">Tutoriais em Vídeo</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Aprenda com os nossos tutoriais passo-a-passo em vídeo.
                    </p>
                    <Button variant="outline" size="sm">
                      Ver Vídeos
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-semibold mb-2">Downloads</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Faça download de software, drivers e atualizações.
                    </p>
                    <Button variant="outline" size="sm">
                      Downloads
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Suporte;
