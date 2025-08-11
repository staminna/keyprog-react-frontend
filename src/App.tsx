import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Loja from "./pages/Loja";
import Servicos from "./pages/Servicos";
import FileService from "./pages/FileService";
import Simulador from "./pages/Simulador";
import Noticias from "./pages/Noticias";
import Contactos from "./pages/Contactos";
import Editor from "./pages/Editor";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SiteHeader />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/loja" element={<Loja />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/file-service" element={<FileService />} />
          <Route path="/simulador" element={<Simulador />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/contactos" element={<Contactos />} />
          <Route path="/editor" element={<Editor />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SiteFooter />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
