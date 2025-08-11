const SiteFooter = () => {
  return (
    <footer className="mt-16 border-t bg-background">
      <div className="container py-10 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-semibold">SC Centralinas</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Clone não-oficial para demonstração. Serviços e loja de soluções
            automóvel focadas em eletrónica e reprogramação.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium">Serviços</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Reprogramação</li>
            <li>Desbloqueio</li>
            <li>Clonagem</li>
            <li>Airbag</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium">Contacto</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Email: info@exemplo.com</li>
            <li>Telefone: +351 000 000 000</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SC Centralinas — Clone para uso educativo.
      </div>
    </footer>
  );
};

export default SiteFooter;