import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { InlineEditorProvider } from '@/components/universal/InlineEditorProvider';
import { GlobalEditingProvider } from '@/hooks/useGlobalEditingState.tsx';
import SEOEditor from '@/components/SEOEditor';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Loja from "./pages/Loja";
import Servicos from "./pages/Servicos";
import FileService from "./pages/FileService";
import Simulador from "./pages/Simulador";
import Noticias from "./pages/Noticias";
import Contactos from "./pages/Contactos";
import Suporte from "./pages/Suporte";
// Old editor removed
import SearchPage from './pages/SearchPage';
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
import { EditableContentProvider } from "@/contexts/EditableContentProvider";
import EditableContentWrapper from "@/components/layout/EditableContentWrapper";

// Service Pages
import DiagnosticoPage from "./pages/servicos/DiagnosticoPage";
import ReparacaoPage from "./pages/servicos/ReparacaoPage";
import ReprogramacaoPage from "./pages/servicos/ReprogramacaoPage";
import DesbloqueioPage from "./pages/servicos/DesbloqueioPage";
import ClonagemPage from "./pages/servicos/ClonagemPage";


const App = () => (
  <HelmetProvider>
      <AuthProvider>
        <EditableContentProvider>
          <GlobalEditingProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <InlineEditorProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <SiteHeader />
                <EditableContentWrapper>
                  <Routes>
                    <Route path="/editor" element={<Navigate to="/" replace />} />
                    <Route path="/" element={<Index />} />
                    <Route path="/loja" element={<Loja />} />
                    <Route path="/loja/produtos/:slug" element={<ProductDetail />} />
                    <Route path="/loja/:slug" element={<SubMenuContent />} />
                    <Route path="/servicos" element={<Servicos />} />
                    <Route path="/servicos/detalhes/:slug" element={<ServiceDetail />} />
                    <Route path="/servicos/diagnostico" element={<DiagnosticoPage />} />
                    <Route path="/servicos/reparacao" element={<ReparacaoPage />} />
                    <Route path="/servicos/reprogramacao" element={<ReprogramacaoPage />} />
                    <Route path="/servicos/desbloqueio" element={<DesbloqueioPage />} />
                    <Route path="/servicos/clonagem" element={<ClonagemPage />} />
                    <Route path="/servicos/:slug" element={<SubMenuContent />} />
                    <Route path="/suporte/:slug" element={<SubMenuContent />} />
                    <Route path="/file-service" element={<FileService />} />
                    <Route path="/simulador" element={<Simulador />} />
                    <Route path="/noticias" element={<Noticias />} />
                    <Route path="/noticias/:id" element={<NewsDetail />} />
                    <Route path="/contactos" element={<Contactos />} />
                    <Route path="/suporte" element={<Suporte />} />
                    <Route path="/pesquisa" element={<SearchPage />} />
                    <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                    <Route path="/pages/:slug" element={<DynamicPage />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <SiteFooter />
                </EditableContentWrapper>
                <SEOEditor />
              </BrowserRouter>
              </InlineEditorProvider>
            </TooltipProvider>
          </GlobalEditingProvider>
        </EditableContentProvider>
      </AuthProvider>
  </HelmetProvider>
);

export default App;
