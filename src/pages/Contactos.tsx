import { useState, useEffect } from 'react';
import { DirectusService } from '@/services/directusService';
import { DirectusContacts } from '@/lib/directus';
import { Skeleton } from '@/components/ui/skeleton';
import ContactInfo from '@/components/ContactInfo';
import SEOHead from '@/components/SEOHead';
import { UniversalContentEditor } from '@/components/universal/UniversalContentEditor';

const Contactos = () => {
  const [contacts, setContacts] = useState<DirectusContacts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const contactsData = await DirectusService.getContacts();
        // Use the first contact entry if available
        setContacts(contactsData && contactsData.length > 0 ? contactsData[0] : null);
        setError(null);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError('Failed to load contact information');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Fallback data if no contacts are found
  const fallbackEmail = 'info@exemplo.com';
  const fallbackPhone = '+351 000 000 000';

  return (
    <>
      <SEOHead 
        title="Contactos - Keyprog"
        description="Entre em contacto connosco para pedidos, dúvidas e parcerias."
        keywords="contactos, email, telefone, keyprog"
      />
      
      <main className="container py-12">
        <UniversalContentEditor
          collection="pages"
          itemId="contactos"
          field="title"
          tag="h1"
          className="text-3xl font-bold"
          value="Contactos"
        />
        <UniversalContentEditor
          collection="pages"
          itemId="contactos"
          field="description"
          tag="p"
          className="mt-2 text-muted-foreground"
          value="Fale connosco para pedidos, dúvidas e parcerias."
        />
        
        {/* Enhanced Contact Info Component with Directus Integration */}
        <div className="mt-8 max-w-3xl mx-auto">
          <ContactInfo className="shadow-md" />
        </div>
        
        {/* Original Contact Display - Kept as Fallback */}
        {loading ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border p-6">
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="rounded-lg border p-6">
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        ) : error ? (
          <div className="mt-12 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border p-6">
              <h2 className="text-lg font-semibold">Email</h2>
              <p className="mt-2 text-sm">{contacts?.email || fallbackEmail}</p>
            </div>
            <div className="rounded-lg border p-6">
              <h2 className="text-lg font-semibold">Telefone</h2>
              <p className="mt-2 text-sm">{contacts?.phone || fallbackPhone}</p>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Contactos;