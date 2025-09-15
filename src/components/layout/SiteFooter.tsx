import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DirectusService } from "@/services/directusService";
import { DirectusServiceExtension } from "@/services/directusServiceExtension";
import type { DirectusFooterMenu, DirectusContacts } from "@/lib/directus";

const SiteFooter = () => {
  const [footerMenu, setFooterMenu] = useState<DirectusFooterMenu[]>([]);
  const [contacts, setContacts] = useState<DirectusContacts[]>([]);
  const [heroData, setHeroData] = useState<{ title?: string; description?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuData, contactsData] = await Promise.all([
          DirectusService.getFooterMenu(),
          DirectusService.getContacts()
        ]);
        
        setFooterMenu(menuData);
        setContacts(contactsData);

        // Try to get hero data for site title and description
        try {
          const hero = await DirectusServiceExtension.getCollectionItemSafe('hero', 1);
          setHeroData(hero);
        } catch (heroError) {
          console.log('Hero data not available, using fallback');
        }
      } catch (error) {
        console.error('Failed to fetch footer data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fallback content for when Directus is unavailable
  const fallbackServices = [
    { title: "Reprogramação", link: "/servicos#reprogramacao" },
    { title: "Desbloqueio", link: "/servicos#desbloqueio" },
    { title: "Clonagem", link: "/servicos#clonagem" },
    { title: "Airbag", link: "/servicos#airbag" }
  ];

  const fallbackContact = {
    email: "info@exemplo.com",
    phone: "+351 000 000 000"
  };

  return (
    <footer className="mt-16 border-t bg-background">
      <div className="container py-10 grid gap-8 md:grid-cols-3">
        {/* Company Info Section */}
        <div>
          <h3 className="text-lg font-semibold">
            {heroData?.title || "Keyprog"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {heroData?.description || 
              "Serviços e loja de soluções automóvel focadas em eletrónica e reprogramação."
            }
          </p>
        </div>

        {/* Dynamic Footer Menu Sections */}
        {!isLoading && footerMenu.length > 0 ? (
          footerMenu.slice(0, 2).map((section) => (
            <div key={section.id}>
              <h4 className="text-sm font-medium">{section.title}</h4>
              {section.links && Array.isArray(section.links) && (
                <ul className="mt-3 space-y-2 text-sm">
                  {section.links.map((link: { title: string; url: string }, index: number) => (
                    <li key={index}>
                      <Link 
                        to={link.url || '#'} 
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        ) : (
          /* Fallback sections when Directus is unavailable */
          <>
            <div>
              <h4 className="text-sm font-medium">Serviços</h4>
              <ul className="mt-3 space-y-2 text-sm">
                {fallbackServices.map((service, index) => (
                  <li key={index}>
                    <Link 
                      to={service.link} 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium">Contacto</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Email: {contacts[0]?.email || fallbackContact.email}</li>
                <li>Telefone: {contacts[0]?.phone || fallbackContact.phone}</li>
              </ul>
            </div>
          </>
        )}

        {/* Contact Section - Always show if we have contact data */}
        {!isLoading && contacts.length > 0 && footerMenu.length > 0 && (
          <div>
            <h4 className="text-sm font-medium">Contacto</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {contacts[0]?.email && <li>Email: {contacts[0].email}</li>}
              {contacts[0]?.phone && <li>Telefone: {contacts[0].phone}</li>}
            </ul>
          </div>
        )}
      </div>
      
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {heroData?.title || "Keyprog"} — (c) 2025 Keyprog.
      </div>
    </footer>
  );
};

export default SiteFooter;