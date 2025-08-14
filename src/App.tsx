import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Loja from "./pages/Loja";
import Servicos from "./pages/Servicos";
import FileService from "./pages/FileService";
import Simulador from "./pages/Simulador";
import Noticias from "./pages/Noticias";
import Contactos from "./pages/Contactos";
import Suporte from "./pages/Suporte";
import ProtectedEditor from "./pages/ProtectedEditor";
import DynamicPage from "@/components/DynamicPage";
import ServiceDetail from "@/components/ServiceDetail";
import NewsDetail from "@/components/NewsDetail";
import ProductDetail from '@/components/ProductDetail';
import SubMenuContent from '@/components/SubMenuContent';
import Admin from '@/pages/Admin';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <SiteHeader />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/loja" element={<Loja />} />
            <Route path="/loja/produtos/:slug" element={<ProductDetail />} />
            <Route path="/loja/:slug" element={<SubMenuContent />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/servicos/detalhes/:slug" element={<ServiceDetail />} />
            <Route path="/servicos/:slug" element={<SubMenuContent />} />
            <Route path="/suporte/:slug" element={<SubMenuContent />} />
            <Route path="/file-service" element={<FileService />} />
            <Route path="/simulador" element={<Simulador />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/noticias/:id" element={<NewsDetail />} />
            <Route path="/contactos" element={<Contactos />} />
            <Route path="/suporte" element={<Suporte />} />
            <Route path="/editor" element={<ProtectedEditor />} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/pages/:slug" element={<DynamicPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <SiteFooter />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
