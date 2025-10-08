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
import SearchPage from './pages/SearchPage';
import DynamicPage from "@/components/DynamicPage";
import ServiceDetail from "@/components/ServiceDetail";
import NewsDetail from "@/components/NewsDetail";
import ProductDetail from '@/components/ProductDetail';
import SubMenuContent from '@/components/SubMenuContent';
import Admin from '@/pages/Admin';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoginPage from '@/pages/auth/LoginPage';
import EditorPage from '@/pages/auth/EditorPage';
import AdminPage from '@/pages/auth/AdminPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import PasswordResetPage from '@/pages/auth/PasswordResetPage';
import EmailVerificationPage from '@/pages/auth/EmailVerificationPage';
import RegistrationPage from '@/pages/customer/RegistrationPage';
import ClienteDashboard from '@/pages/customer/ClienteDashboard';
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { UnifiedAuthProvider } from "@/contexts/UnifiedAuthContext";
import { EditableContentProvider } from "@/contexts/EditableContentProvider";
import { CartProvider } from "@/contexts/CartContext";
import EditableContentWrapper from "@/components/layout/EditableContentWrapper";
import HashRedirect from "@/components/HashRedirect";
import InlineEditingToggle from "@/components/InlineEditingToggle";

// Service Pages
import DiagnosticoPage from "./pages/servicos/DiagnosticoPage";
import ReparacaoPage from "./pages/servicos/ReparacaoPage";
import ReprogramacaoPage from "./pages/servicos/ReprogramacaoPage";
import DesbloqueioPage from "./pages/servicos/DesbloqueioPage";
import ClonagemPage from "./pages/servicos/ClonagemPage";
import AirbagPage from "./pages/servicos/AirbagPage";
import AdBluePage from "./pages/servicos/AdBluePage";
import ChavesPage from "./pages/servicos/ChavesPage";
import QuadrantesPage from "./pages/servicos/QuadrantesPage";

// Checkout Pages
import CheckoutPage from "./pages/checkout/CheckoutPage";
import CheckoutSuccessPage from "./pages/checkout/CheckoutSuccessPage";
import CheckoutCancelPage from "./pages/checkout/CheckoutCancelPage";


const App = () => (
  <HelmetProvider>
      <UnifiedAuthProvider>
        <CartProvider>
          <EditableContentProvider>
          <GlobalEditingProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <InlineEditorProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <HashRedirect />
                <SiteHeader />
                <EditableContentWrapper>
                  <Routes>
                    {/* Auth Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/registo" element={<RegistrationPage />} />
                    <Route path="/verify-email" element={<EmailVerificationPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<PasswordResetPage />} />
                    
                    {/* Cliente Routes */}
                    <Route path="/conta" element={<ClienteDashboard />} />
                    <Route path="/minha-conta" element={<ClienteDashboard />} />
                    
                    {/* Checkout Routes */}
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                    <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
                    
                    {/* Protected Admin Routes */}
                    <Route path="/admin" element={
                      <ProtectedRoute requiredRoles={['admin', 'administrator']}>
                        <AdminPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Protected Editor Routes */}
                    <Route path="/editor" element={
                      <ProtectedRoute requiredRoles={['admin', 'administrator', 'editor', 'editor-user']}>
                        <EditorPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Public Routes */}
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
                    <Route path="/servicos/airbag" element={<AirbagPage />} />
                    <Route path="/servicos/adblue" element={<AdBluePage />} />
                    <Route path="/servicos/chaves" element={<ChavesPage />} />
                    <Route path="/servicos/quadrantes" element={<QuadrantesPage />} />
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
                    <Route path="/termos" element={<DynamicPage />} />
                    <Route path="/privacidade" element={<DynamicPage />} />
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
        </CartProvider>
      </UnifiedAuthProvider>
  </HelmetProvider>
);

export default App;
