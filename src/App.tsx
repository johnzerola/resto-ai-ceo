
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataSync } from "@/components/restaurant/DataSync";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import { EnhancedErrorBoundary } from "@/components/error/EnhancedErrorBoundary";
import { PerformanceMonitor } from "@/components/performance/PerformanceMonitor";
// Lazy loading otimizado para performance
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Páginas críticas (não lazy)
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

// Lazy loading para páginas pesadas
const Dashboard = lazy(() => import("./pages/Dashboard"));
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

// Import optimized branded loader
import { PageBrandedLoader } from "@/components/common/BrandedLoader";

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
          <DataSync>
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
                {/* Página inicial de vendas SEM proteção - página pública */}
                <Route path="/" element={
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
                    <Suspense fallback={<PageLoader />}>
                      <Dashboard />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dre-cmv" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <DreCmv />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/dre" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <DreCmv />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/cmv" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <DreCmv />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/fluxo-de-caixa" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <FluxoDeCaixa />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/simulador" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <Simulador />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/metas" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <Metas />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/estoque" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <Estoque />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/cardapio" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <Cardapio />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/assistente-ia" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <AiAssistant />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/ai-assistant" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <AiAssistant />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/projecoes" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <ProjecoesPagina />
                    </Suspense>
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
                    <Suspense fallback={<PageLoader />}>
                      <Assinatura />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/configuracoes" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <Configuracoes />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/gestao-tarefas" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <GestaoTarefas />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/tarefas" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <GestaoTarefas />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/documentacao" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <Documentacao />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/privacidade" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <Privacidade />
                    </Suspense>
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
                    <Suspense fallback={<PageLoader />}>
                      <DeveloperDashboard />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/branding" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <BrandingGuide />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/affiliate" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <AffiliateSystem />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
          </DataSync>
        </AuthProvider>
      </EnhancedErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
