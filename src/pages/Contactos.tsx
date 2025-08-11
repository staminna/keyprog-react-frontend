const Contactos = () => {
  return (
    <main className="container py-12">
      <h1 className="text-3xl font-bold">Contactos</h1>
      <p className="mt-2 text-muted-foreground">
        Fale connosco para pedidos, dúvidas e parcerias.
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Email</h2>
          <p className="mt-2 text-sm">info@exemplo.com</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Telefone</h2>
          <p className="mt-2 text-sm">+351 000 000 000</p>
        </div>
      </div>
    </main>
  );
};

export default Contactos;