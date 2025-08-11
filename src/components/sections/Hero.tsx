import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="bg-hero">
        <div className="container flex min-h-[60vh] flex-col items-start justify-center py-16">
          <p className="mb-2 inline-flex items-center rounded-full border px-3 py-1 text-xs tracking-wide text-primary">
            Especialistas em eletrónica automóvel
          </p>
          <h1 className="max-w-3xl text-balance text-4xl font-extrabold leading-tight text-gradient-primary md:text-6xl">
            Performance, diagnóstico e soluções para a sua centralina
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Reprogramação, desbloqueio, clonagem, reparações e uma loja completa
            de equipamentos, emuladores e software.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="hero">
              <Link to="/servicos">Ver Serviços</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/loja">Ir para a Loja</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(600px_circle_at_10%_0%,hsla(var(--primary),0.12),transparent_60%),radial-gradient(700px_circle_at_90%_0%,hsla(var(--primary),0.08),transparent_60%)]" />
    </section>
  );
};

export default Hero;