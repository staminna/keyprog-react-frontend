import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

const Loja = () => {
  return (
    <div>
      <main className="container py-12">
        <h1 className="text-3xl font-bold">Loja</h1>
        <p className="mt-2 text-muted-foreground">
          Explore emuladores, equipamentos, software e estabilizadores.
        </p>
        <div id="emuladores" className="mt-12">
          <h2 className="text-xl font-semibold">Emuladores</h2>
          <p className="text-sm text-muted-foreground">Catálogo em breve.</p>
        </div>
        <div id="equipamentos" className="mt-10">
          <h2 className="text-xl font-semibold">Equipamentos</h2>
          <p className="text-sm text-muted-foreground">Catálogo em breve.</p>
        </div>
        <div id="software" className="mt-10">
          <h2 className="text-xl font-semibold">Software</h2>
          <p className="text-sm text-muted-foreground">Catálogo em breve.</p>
        </div>
        <div id="estabilizadores" className="mt-10">
          <h2 className="text-xl font-semibold">Estabilizadores</h2>
          <p className="text-sm text-muted-foreground">Catálogo em breve.</p>
        </div>
      </main>
    </div>
  );
};

export default Loja;