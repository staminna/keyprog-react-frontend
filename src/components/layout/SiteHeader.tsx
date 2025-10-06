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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Edit3, X, UserCircle, LogOut, Eye } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useState, useEffect } from "react";
import { DirectusService } from "@/services/directusService";
import type { DirectusHeaderMenu } from "@/lib/directus";
import { useInlineEditor } from '@/components/universal/inline-editor-context';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuLinkClasses = "text-sm";

const SiteHeader = () => {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [headerMenu, setHeaderMenu] = useState<DirectusHeaderMenu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isInlineEditingEnabled, setInlineEditingEnabled } = useInlineEditor();
  const { isAuthenticated, user, logout, canEdit } = useUnifiedAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get header menu from Directus
        const menu = await DirectusService.getHeaderMenu();
        
        // Use local Keyprog logo
        const logoUrl = '/keyprog-logo.png';
        
        // Note: If local logo fails to load, the onError handler will show the fallback circle
        setLogoUrl(logoUrl);
        
        // Use Directus menu if available, otherwise use fallback
        if (menu && menu.length > 0) {
          setHeaderMenu(menu);
        } else {
          // Use fallback menu only if Directus data is not available
          setHeaderMenu([
            {
              id: 'servicos',
              title: 'Serviços',
              link: '/servicos',
              sub_menu: [
                { title: 'Reprogramação', link: '/servicos/reprogramacao' },
                { title: 'Diagnóstico', link: '/servicos/diagnostico' },
                { title: 'Reparação', link: '/servicos/reparacao' },
                { title: 'Desbloqueio', link: '/servicos/desbloqueio' },
                { title: 'Clonagem', link: '/servicos/clonagem' },
                { title: 'Airbag', link: '/servicos/airbag' },
                { title: 'AdBlue', link: '/servicos/adblue' },
                { title: 'Chaves', link: '/servicos/chaves' },
                { title: 'Quadrantes', link: '/servicos/quadrantes' }
              ]
            },
            {
              id: 'file-service',
              title: 'File Service',
              link: '/file-service',
              sub_menu: []
            },
            {
              id: 'simulador',
              title: 'Simulador',
              link: '/simulador',
              sub_menu: []
            },
            {
              id: 'noticias',
              title: 'Notícias',
              link: '/noticias',
              sub_menu: []
            },
            {
              id: 'contactos',
              title: 'Contactos',
              link: '/contactos',
              sub_menu: []
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Use fallback menu on error
        setHeaderMenu([
          {
            id: 'servicos',
            title: 'Serviços',
            link: '/servicos',
            sub_menu: [
              { title: 'Reprogramação', link: '/servicos/reprogramacao' },
              { title: 'Diagnóstico', link: '/servicos/diagnostico' },
              { title: 'Reparação', link: '/servicos/reparacao' },
              { title: 'Desbloqueio', link: '/servicos/desbloqueio' },
              { title: 'Clonagem', link: '/servicos/clonagem' },
              { title: 'Airbag', link: '/servicos/airbag' },
              { title: 'AdBlue', link: '/servicos/adblue' },
              { title: 'Chaves', link: '/servicos/chaves' },
              { title: 'Quadrantes', link: '/servicos/quadrantes' }
            ]
          },
          {
            id: 'file-service',
            title: 'File Service',
            link: '/file-service',
            sub_menu: []
          },
          {
            id: 'simulador',
            title: 'Simulador',
            link: '/simulador',
            sub_menu: []
          },
          {
            id: 'noticias',
            title: 'Notícias',
            link: '/noticias',
            sub_menu: []
          },
          {
            id: 'contactos',
            title: 'Contactos',
            link: '/contactos',
            sub_menu: []
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-4 md:px-6 lg:px-8 flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Keyprog Logo" 
              className="h-12 w-auto object-contain shadow-elev"
              onError={(e) => {
                // Fallback to the original styled div if image fails to load
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
          ) : null}
          <div 
            className="h-12 w-12 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] shadow-elev" 
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
            <CartDrawer />
            <ThemeToggle />
            {canEdit && (
              <Button
                variant={isInlineEditingEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInlineEditingEnabled(!isInlineEditingEnabled)}
                title={isInlineEditingEnabled ? 'Desativar edição inline' : 'Ativar edição inline'}
              >
                {isInlineEditingEnabled ? (
                  <>
                    <Edit3 className="mr-2 h-4 w-4" />
                    <span>Modo Edição</span>
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    <span>Modo Visualização</span>
                  </>
                )}
              </Button>
            )}
            <div id="site-header-toolbar" className="flex items-center gap-2"></div>
            {/* Cliente authentication dropdown */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <UserCircle className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user.email || 'Cliente'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/registo">Registar</Link>
                </Button>
              </div>
            )}
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
              <div className="pt-4 border-t">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">{user.email}</div>
                    <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button size="sm" asChild className="w-full">
                      <Link to="/registo">Registar</Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default SiteHeader;