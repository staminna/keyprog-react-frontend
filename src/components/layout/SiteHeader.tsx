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

const menuLinkClasses = "text-sm";

const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] shadow-elev" />
          <span className="text-xl font-semibold leading-[1.15] text-gradient-primary pr-2 pb-[0.1em] inline-block" style={{letterSpacing: '0.05em'}}>
            Keyprog&nbsp;
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Loja</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-2 p-4 md:w-[540px] lg:w-[720px] md:grid-cols-2">
                    <NavLink to="/loja#emuladores" className={menuLinkClasses}>Emuladores</NavLink>
                    <NavLink to="/loja#equipamentos" className={menuLinkClasses}>Equipamentos</NavLink>
                    <NavLink to="/loja#software" className={menuLinkClasses}>Software</NavLink>
                    <NavLink to="/loja#estabilizadores" className={menuLinkClasses}>Estabilizadores</NavLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Serviços</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-2 p-4 md:w-[620px] lg:w-[820px] md:grid-cols-3">
                    <NavLink to="/servicos#reprogramacao" className={menuLinkClasses}>Reprogramação</NavLink>
                    <NavLink to="/servicos#desbloqueio" className={menuLinkClasses}>Desbloqueio</NavLink>
                    <NavLink to="/servicos#clonagem" className={menuLinkClasses}>Clonagem</NavLink>
                    <NavLink to="/servicos#airbag" className={menuLinkClasses}>Airbag</NavLink>
                    <NavLink to="/servicos#adblue" className={menuLinkClasses}>Depósito de AdBlue</NavLink>
                    <NavLink to="/servicos#diagnostico" className={menuLinkClasses}>Diagnóstico</NavLink>
                    <NavLink to="/servicos#chaves" className={menuLinkClasses}>Chaves</NavLink>
                    <NavLink to="/servicos#quadrantes" className={menuLinkClasses}>Quadrantes</NavLink>
                    <NavLink to="/servicos" className="text-sm font-medium text-primary">Ver todos</NavLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <NavLink to="/file-service" className="px-3 py-2 text-sm">File Service</NavLink>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <NavLink to="/simulador" className="px-3 py-2 text-sm">Simulador</NavLink>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <NavLink to="/noticias" className="px-3 py-2 text-sm">Notícias</NavLink>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <NavLink to="/contactos" className="px-3 py-2 text-sm">Contactos</NavLink>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuIndicator />
              <NavigationMenuViewport />
            </NavigationMenuList>
          </NavigationMenu>

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
              <NavLink to="/loja">Loja</NavLink>
              <NavLink to="/servicos">Serviços</NavLink>
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