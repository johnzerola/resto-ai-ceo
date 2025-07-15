
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import { EnhancedErrorBoundary } from "@/components/error/EnhancedErrorBoundary";
import { PerformanceMonitor } from "@/components/performance/PerformanceMonitor";
// Lazy loading otimizado para performance
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Páginas críticas carregamento direto para performance
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard"; // Dashboard direto para performance

// Lazy loading apenas para páginas secundárias
const FichaTecnicaInteligenteCompleta = lazy(() => import("./pages/FichaTecnicaInteligenteCompleta"));
const SystemValidation = lazy(() => import("./pages/SystemValidation"));
const DreCmv = lazy(() => import("./pages/DreCmv"));
const FluxoDeCaixa = lazy(() => import("./pages/FluxoDeCaixa"));
const Simulador = lazy(() => import("./pages/Simulador"));
const Metas = lazy(() => import("./pages/Metas").then(module => ({ default: module.Metas })));
const Estoque = lazy(() => import("./pages/Estoque"));
const Cardapio = lazy(() => import("./pages/Cardapio"));
const GerenciarUsuarios = lazy(() => import("./pages/GerenciarUsuarios"));
const Assinatura = lazy(() => import("./pages/Assinatura").then(module => ({ default: module.Assinatura })));
const GestaoTarefas = lazy(() => import("./pages/GestaoTarefas"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const Documentacao = lazy(() => import("./pages/Documentacao"));
const Privacidade = lazy(() => import("./pages/Privacidade").then(module => ({ default: module.Privacidade })));
const StatusSistema = lazy(() => import("./pages/StatusSistema"));
const SecurityCenter = lazy(() => import("./pages/SecurityCenter"));
const SystemAuditPage = lazy(() => import("./pages/SystemAuditPage"));
const Vendas = lazy(() => import("./pages/Vendas"));
const AiAssistant = lazy(() => import("./pages/AiAssistant"));
const BusinessProfile = lazy(() => import("./pages/BusinessProfile"));
const ProjecoesPagina = lazy(() => import("./pages/ProjecoesPagina").then(module => ({ default: module.ProjecoesPagina })));
const Integracoes = lazy(() => import("./pages/Integracoes").then(module => ({ default: module.Integracoes })));
const OnboardingGuiado = lazy(() => import("./pages/OnboardingGuiado").then(module => ({ default: module.OnboardingGuiado })));

// New feature pages
const DeveloperDashboard = lazy(() => import("./components/developer/DeveloperDashboard").then(module => ({ default: module.DeveloperDashboard })));
const BrandingGuide = lazy(() => import("./components/branding/BrandingGuide").then(module => ({ default: module.BrandingGuide })));
const AffiliateSystem = lazy(() => import("./components/affiliate/AffiliateSystem").then(module => ({ default: module.AffiliateSystem })));
const Index = lazy(() => import("./pages/Index"));

// Import optimized branded loader
import { PageBrandedLoader } from "@/components/common/BrandedLoader";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

// Loading component otimizado com branding Lucraí
const PageLoader = ({ message }: { message?: string }) => (
  <PageBrandedLoader message={message} />
);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PerformanceMonitor />
      <EnhancedErrorBoundary>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                  <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } />
                <Route path="/dados-negocio" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <BusinessProfile />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/business-profile" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <BusinessProfile />
                    </Suspense>
                  </ProtectedRoute>
                } />
                {/* Landing Page como página inicial */}
                <Route path="/" element={
                  <Suspense fallback={<PageLoader />}>
                    <Index />
                  </Suspense>
                } />
                {/* Página de vendas alternativa */}
                <Route path="/sistema" element={
                  <Suspense fallback={<PageLoader />}>
                    <Vendas />
                  </Suspense>
                } />
                <Route path="/vendas" element={
                  <Suspense fallback={<PageLoader />}>
                    <Vendas />
                  </Suspense>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dre-cmv" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <DreCmv />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dre" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <DreCmv />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dri" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <DreCmv />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/cmv" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <DreCmv />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/fluxo-caixa" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <FluxoDeCaixa />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/fluxo-de-caixa" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <FluxoDeCaixa />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/assinaturas" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <Assinatura />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/projecao" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <ProjecoesPagina />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/simulador" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <Simulador />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/metas" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <Metas />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/estoque" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <Estoque />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/cardapio" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <Cardapio />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/assistente-ia" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <AiAssistant />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/ai-assistant" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <AiAssistant />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/projecoes" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <ProjecoesPagina />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/gerenciar-usuarios" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <GerenciarUsuarios />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/assinatura" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <Assinatura />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/configuracoes" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <Configuracoes />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/gestao-tarefas" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <GestaoTarefas />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/tarefas" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <GestaoTarefas />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/documentacao" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <Documentacao />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/privacidade" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <Privacidade />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/status-sistema" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <StatusSistema />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/security-center" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <SecurityCenter />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/ficha-tecnica-inteligente-completa" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <FichaTecnicaInteligenteCompleta />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/system-validation" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <SystemValidation />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/system-audit" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <SystemAuditPage />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/integracoes" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <Integracoes />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/onboarding-guiado" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <OnboardingGuiado />
                    </Suspense>
                  </ProtectedRoute>
                } />
                {/* New Feature Routes */}
                <Route path="/developer" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <DeveloperDashboard />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/branding" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <BrandingGuide />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/affiliate" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Suspense fallback={<PageLoader />}>
                        <AffiliateSystem />
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
        </AuthProvider>
      </EnhancedErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
