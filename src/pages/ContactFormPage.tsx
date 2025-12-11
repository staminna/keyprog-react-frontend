import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { useToast } from '@/hooks/use-toast';

const ContactFormPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create mailto link with form data
      const subject = encodeURIComponent(formData.subject || 'Contacto via Website');
      const body = encodeURIComponent(
        `Nome: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Telefone: ${formData.phone}\n\n` +
        `Mensagem:\n${formData.message}`
      );
      
      const mailtoLink = `mailto:info@keyprog.pt?subject=${subject}&body=${body}`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      // Show success message
      setIsSuccess(true);
      toast({
        title: 'Email preparado!',
        description: 'O seu cliente de email foi aberto. Por favor, envie a mensagem.',
      });
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao preparar o email. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead 
        title="Formulário de Contacto - Keyprog"
        description="Entre em contacto connosco através do nosso formulário. Responderemos o mais breve possível."
        keywords="contacto, formulário, keyprog, suporte"
      />
      
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Formulário de Contacto</h1>
              <p className="text-xl text-muted-foreground">
                Preencha o formulário abaixo e entraremos em contacto consigo
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Envie-nos uma Mensagem</CardTitle>
                    <CardDescription>
                      Preencha todos os campos e clique em enviar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isSuccess ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-2xl font-semibold mb-2">Email Preparado!</h3>
                        <p className="text-muted-foreground">
                          O seu cliente de email foi aberto. Por favor, envie a mensagem.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nome *</Label>
                            <Input
                              id="name"
                              name="name"
                              placeholder="O seu nome"
                              value={formData.name}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="seu@email.com"
                              value={formData.email}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              placeholder="+351 964 463 161"
                              value={formData.phone}
                              onChange={handleChange}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="subject">Assunto</Label>
                            <Input
                              id="subject"
                              name="subject"
                              placeholder="Assunto da mensagem"
                              value={formData.subject}
                              onChange={handleChange}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Mensagem *</Label>
                          <Textarea
                            id="message"
                            name="message"
                            placeholder="Escreva a sua mensagem aqui..."
                            rows={6}
                            value={formData.message}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full" 
                          size="lg"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            'A preparar...'
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Enviar Mensagem
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações de Contacto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a href="mailto:info@keyprog.pt" className="text-sm text-muted-foreground hover:text-primary">
                          info@keyprog.pt
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="font-medium">Telefone</p>
                        <p className="text-sm text-muted-foreground">+351 964 463 161</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="font-medium">Horário</p>
                        <p className="text-sm text-muted-foreground">Seg-Sex: 9h-18h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resposta Rápida</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Respondemos a todas as mensagens no prazo máximo de 24 horas úteis.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactFormPage;