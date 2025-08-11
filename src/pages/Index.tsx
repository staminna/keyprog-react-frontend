import Hero from "@/components/sections/Hero";
import EditableServices from "@/components/editor/EditableServices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import emuladoresImg from "@/assets/cat-emuladores.jpg";
import equipamentosImg from "@/assets/cat-equipamentos.jpg";
import softwareImg from "@/assets/cat-software.jpg";
import estabilizadoresImg from "@/assets/cat-estabilizadores.jpg";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <main>
      <Hero />

        <section className="container py-14" aria-labelledby="categorias-heading">
          <header className="mb-8 text-center">
            <h2 id="categorias-heading" className="text-3xl font-bold">
              Categorias Principais
            </h2>
            <p className="mt-2 text-muted-foreground">
              Produtos e softwares selecionados para profissionais de diagnóstico.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Emuladores", img: emuladoresImg, href: "/loja#emuladores" },
              { title: "Equipamentos", img: equipamentosImg, href: "/loja#equipamentos" },
              { title: "Software", img: softwareImg, href: "/loja#software" },
              { title: "Estabilizadores", img: estabilizadoresImg, href: "/loja#estabilizadores" },
            ].map((item) => (
              <Card key={item.title} className="group overflow-hidden transition-all hover:shadow-elev">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link to={item.href} aria-label={item.title}>
                    <img
                      src={item.img}
                      alt={`${item.title} – categoria da loja SC Centralinas`}
                      loading="lazy"
                      className="h-40 w-full rounded-md object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button asChild variant="subtle">
              <Link to="/loja">Ver todos os produtos</Link>
            </Button>
          </div>
        </section>

        <EditableServices isEditing={false} />
    </main>
  );
};

export default Index;
