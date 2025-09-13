import React, { useState, useEffect } from 'react';
import { Mail, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DirectusService } from '@/services/directusService';
import type { DirectusContactInfo } from '@/lib/directus';
import useDirectusEditorContext from '@/hooks/useDirectusEditorContext';
import { InlineRichText } from '@/components/inline';

interface ContactInfoProps {
  className?: string;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ className = '' }) => {
  // State for contact data
  const [contactData, setContactData] = useState<DirectusContactInfo>({
    id: '1',
    title: 'Como Podemos Ajudar?',
    email: 'suporte@keyprog.pt',
    phone: '+351 XXX XXX XXX',
    chat_hours: 'Seg-Sex: 9h-18h',
    contact_form_text: 'Formulário de Contacto',
    contact_form_link: '/contactos'
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Get Directus editor context
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  const canEdit = isInDirectusEditor || isAuthenticated;

  // Fetch contact data from Directus
  useEffect(() => {
    const fetchContactData = async () => {
      try {
        setLoading(true);
        // Fetch contact info from Directus
        const response = await DirectusService.getContactInfo();
        
        if (response) {
          setContactData(response);
        }
      } catch (err) {
        console.error('Error fetching contact data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch contact data'));
        // Keep using the fallback data in state
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, []);

  if (loading) {
    return (
      <div className={`rounded-lg border bg-card p-8 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border bg-card p-8 ${className}`}>
      <div className="flex items-center justify-center mb-8">
        {canEdit ? (
          <InlineRichText
            collection="contact_info"
            itemId={contactData.id}
            field="title"
            value={contactData.title}
            className="text-3xl font-bold text-center"
          />
        ) : (
          <h2 className="text-3xl font-bold text-center flex items-center">
            <span className="mr-2">❓</span> {contactData.title}
          </h2>
        )}
      </div>

      <div className="space-y-6">
        {/* Email */}
        <div className="rounded-lg border p-6 flex items-start">
          <Mail className="h-8 w-8 text-red-500 mr-4 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold mb-1">Email</h3>
            {canEdit ? (
              <InlineRichText
                collection="contact_info"
                itemId={contactData.id}
                field="email"
                value={contactData.email}
                className="text-gray-600 text-lg"
              />
            ) : (
              <p className="text-gray-600 text-lg">{contactData.email}</p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="rounded-lg border p-6 flex items-start">
          <Phone className="h-8 w-8 text-red-500 mr-4 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold mb-1">Telefone</h3>
            {canEdit ? (
              <InlineRichText
                collection="contact_info"
                itemId={contactData.id}
                field="phone"
                value={contactData.phone}
                className="text-gray-600 text-lg"
              />
            ) : (
              <p className="text-gray-600 text-lg">{contactData.phone}</p>
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="rounded-lg border p-6 flex items-start">
          <MessageCircle className="h-8 w-8 text-red-500 mr-4 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold mb-1">Chat Online</h3>
            {canEdit ? (
              <InlineRichText
                collection="contact_info"
                itemId={contactData.id}
                field="chat_hours"
                value={contactData.chat_hours}
                className="text-gray-600 text-lg"
              />
            ) : (
              <p className="text-gray-600 text-lg">{contactData.chat_hours}</p>
            )}
          </div>
        </div>

        {/* Contact Form Button */}
        <Button 
          className="w-full bg-red-500 hover:bg-red-600 text-white py-6 text-lg font-medium"
          asChild
        >
          <a href={contactData.contact_form_link}>
            {canEdit ? (
              <InlineRichText
                collection="contact_info"
                itemId={contactData.id}
                field="contact_form_text"
                value={contactData.contact_form_text}
              />
            ) : (
              contactData.contact_form_text
            )}
          </a>
        </Button>
      </div>

      {error && (
        <div className="mt-4 p-2 bg-red-50 text-red-600 text-sm rounded">
          <p>Using local data due to error fetching from Directus.</p>
        </div>
      )}
    </div>
  );
};

export default ContactInfo;
