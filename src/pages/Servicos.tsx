import { Button } from "@/components/ui/button";

const Servicos = () => {
  const sections = [
    { id: "reprogramacao", title: "Reprogramação" },
    { id: "desbloqueio", title: "Desbloqueio" },
    { id: "clonagem", title: "Clonagem" },
    { id: "airbag", title: "Airbag" },
    { id: "adblue", title: "Depósito de AdBlue" },
    { id: "diagnostico", title: "Diagnóstico" },
    { id: "chaves", title: "Chaves" },
    { id: "quadrantes", title: "Quadrantes" },
  ];

  return (
    <main className="container py-12">
      <h1 className="text-3xl font-bold">Serviços</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Soluções especializadas em eletrónica automóvel. Selecione um serviço
        abaixo para saber mais.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Atendimento profissional, diagnóstico avançado e garantia de
              qualidade.
            </p>
            <div className="mt-4">
              <Button variant="hero">Pedir orçamento</Button>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
};

export default Servicos;