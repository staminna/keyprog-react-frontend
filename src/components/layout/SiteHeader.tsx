import { Link, NavLink } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { DirectusService } from "@/services/directusService";
import type { DirectusHeaderMenu } from "@/lib/directus";

const menuLinkClasses = "text-sm";

const SiteHeader = () => {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [headerMenu, setHeaderMenu] = useState<DirectusHeaderMenu[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settings, menu] = await Promise.all([
          DirectusService.getSettings(),
          DirectusService.getHeaderMenu()
        ]);
        
        if (settings.logo) {
          setLogoUrl(DirectusService.getImageUrl(settings.logo));
        }
        
        setHeaderMenu(menu);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Keyprog Logo" 
              className="h-8 w-8 rounded-full object-cover shadow-elev"
              onError={(e) => {
                // Fallback to the original styled div if image fails to load
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
          ) : null}
          <div 
            className="h-8 w-8 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] shadow-elev" 
            style={{ display: logoUrl ? 'none' : 'block' }}
          />
          <span className="text-xl font-semibold leading-[1.15] text-gradient-primary pr-2 pb-[0.1em] inline-block" style={{letterSpacing: '0.05em'}}>
            Keyprog&nbsp;
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {!isLoading && (
            <NavigationMenu>
              <NavigationMenuList>
                {headerMenu.map((menuItem) => (
                  <NavigationMenuItem key={menuItem.id}>
                    {menuItem.sub_menu && menuItem.sub_menu.length > 0 ? (
                      <>
                        <NavigationMenuTrigger>{menuItem.title}</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="grid gap-2 p-4 md:w-[540px] lg:w-[720px] md:grid-cols-2">
                            {menuItem.sub_menu.map((subItem, index) => (
                              <NavLink 
                                key={index}
                                to={subItem.link} 
                                className={menuLinkClasses}
                              >
                                {subItem.title}
                              </NavLink>
                            ))}
                            {menuItem.link && (
                              <NavLink 
                                to={menuItem.link} 
                                className="text-sm font-medium text-primary"
                              >
                                Ver todos
                              </NavLink>
                            )}
                          </div>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink asChild>
                        <NavLink 
                          to={menuItem.link || '#'} 
                          className="px-3 py-2 text-sm"
                        >
                          {menuItem.title}
                        </NavLink>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          )}

          <div className="hidden lg:flex items-center gap-2">
            <Input placeholder="Pesquisar..." className="w-64" />
            <Button variant="default">Pesquisar</Button>
          </div>
        </div>

        <Sheet>
          <SheetTrigger className="md:hidden" aria-label="Abrir menu">
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <nav className="mt-6 grid gap-4">
              {!isLoading && headerMenu.map((menuItem) => (
                <div key={menuItem.id}>
                  <NavLink to={menuItem.link || '#'} className="font-medium">
                    {menuItem.title}
                  </NavLink>
                  {menuItem.sub_menu && menuItem.sub_menu.length > 0 && (
                    <div className="ml-4 mt-2 grid gap-2">
                      {menuItem.sub_menu.map((subItem, index) => (
                        <NavLink 
                          key={index}
                          to={subItem.link} 
                          className="text-sm text-muted-foreground"
                        >
                          {subItem.title}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <NavLink to="/file-service">File Service</NavLink>
              <NavLink to="/simulador">Simulador</NavLink>
              <NavLink to="/noticias">Notícias</NavLink>
              <NavLink to="/contactos">Contactos</NavLink>
              <div className="pt-2">
                <Input placeholder="Pesquisar..." className="w-full" />
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default SiteHeader;