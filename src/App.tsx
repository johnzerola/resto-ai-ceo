
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataSync } from "@/components/restaurant/DataSync";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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

// Loading component otimizado
const PageLoader = () => (
  <div className="min-h-screen p-6">
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    </div>
  </div>
);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
                    <BusinessProfile />
                  </ProtectedRoute>
                } />
                <Route path="/business-profile" element={
                  <ProtectedRoute>
                    <BusinessProfile />
                  </ProtectedRoute>
                } />
                {/* Página inicial de vendas SEM proteção - página pública */}
                <Route path="/" element={<Vendas />} />
                <Route path="/vendas" element={<Vendas />} />
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
                    <GerenciarUsuarios />
                  </ProtectedRoute>
                } />
                <Route path="/assinatura" element={
                  <ProtectedRoute>
                    <Assinatura />
                  </ProtectedRoute>
                } />
                <Route path="/configuracoes" element={
                  <ProtectedRoute>
                    <Configuracoes />
                  </ProtectedRoute>
                } />
                <Route path="/documentacao" element={
                  <ProtectedRoute>
                    <Documentacao />
                  </ProtectedRoute>
                } />
                <Route path="/privacidade" element={
                  <ProtectedRoute>
                    <Privacidade />
                  </ProtectedRoute>
                } />
                <Route path="/status-sistema" element={
                  <ProtectedRoute>
                    <StatusSistema />
                  </ProtectedRoute>
                } />
                <Route path="/security-center" element={
                  <ProtectedRoute>
                    <SecurityCenter />
                  </ProtectedRoute>
                } />
                <Route path="/ficha-tecnica-inteligente-completa" element={
                  <ProtectedRoute>
                    <FichaTecnicaInteligenteCompleta />
                  </ProtectedRoute>
                } />
                <Route path="/system-validation" element={
                  <ProtectedRoute>
                    <SystemValidation />
                  </ProtectedRoute>
                } />
                <Route path="/system-audit" element={
                  <ProtectedRoute>
                    <SystemAuditPage />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DataSync>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
