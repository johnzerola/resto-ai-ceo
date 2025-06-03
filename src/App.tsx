
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ModernLayout } from "./components/restaurant/ModernLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { UserRole } from "./services/AuthService";

// Lazy loading otimizado para todas as páginas
const Dashboard = React.lazy(() => import("./pages/Dashboard").then(module => ({ default: module.Dashboard })));
const Index = React.lazy(() => import("./pages/Index"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register").then(module => ({ default: module.Register })));
const DreCmv = React.lazy(() => import("./pages/DreCmv"));
const DRE = React.lazy(() => import("./pages/DRE").then(module => ({ default: module.DRE })));
const CMV = React.lazy(() => import("./pages/CMV").then(module => ({ default: module.CMV })));
const FluxoCaixa = React.lazy(() => import("./pages/FluxoCaixa"));
const FluxoDeCaixa = React.lazy(() => import("./pages/FluxoDeCaixa").then(module => ({ default: module.FluxoDeCaixa })));
const Estoque = React.lazy(() => import("./pages/Estoque"));
const Configuracoes = React.lazy(() => import("./pages/Configuracoes"));
const AkgunsAbasPage = React.lazy(() => import("./pages/AkgunsAbasPage"));
const Metas = React.lazy(() => import("./pages/Metas"));
const Simulador = React.lazy(() => import("./pages/Simulador"));
const AIAssistantPage = React.lazy(() => import("./pages/AIAssistantPage").then(module => ({ default: module.AIAssistantPage })));
const GerenciarUsuarios = React.lazy(() => import("./pages/GerenciarUsuarios"));
const Assinatura = React.lazy(() => import("./pages/Assinatura"));
const Documentacao = React.lazy(() => import("./pages/Documentacao"));
const Privacidade = React.lazy(() => import("./pages/Privacidade"));
const PaginaVendas = React.lazy(() => import("./pages/PaginaVendas"));
const ProjecoesPagina = React.lazy(() => import("./pages/ProjecoesPagina"));
const SecurityCenter = React.lazy(() => import("./pages/SecurityCenter"));
const SystemAdmin = React.lazy(() => import("./pages/SystemAdmin"));
const StatusSistema = React.lazy(() => import("./pages/StatusSistema"));

// Loading component otimizado
const LoadingFallback = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="text-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
        <div className="w-12 h-12 rounded-full border-4 border-[#00D887] border-t-transparent absolute top-0 left-0 animate-spin"></div>
      </div>
      <p className="mt-6 text-lg font-medium text-gray-700">Carregando RestaurIA...</p>
    </div>
  </div>
);

// QueryClient otimizado
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Global error:', error, errorInfo);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dashboard-unificado">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Rotas públicas */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/vendas" element={<PaginaVendas />} />
                  
                  {/* Rotas protegidas com layout moderno */}
                  <Route path="/*" element={
                    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
                      <ModernLayout>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/projecoes" element={<ProjecoesPagina />} />
                          <Route path="/dre" element={<DRE />} />
                          <Route path="/cmv" element={<CMV />} />
                          <Route path="/dre-cmv" element={<DreCmv />} />
                          <Route path="/fluxo-de-caixa" element={<FluxoDeCaixa />} />
                          <Route path="/fluxo-caixa" element={<FluxoCaixa />} />
                          <Route path="/simulador" element={<Simulador />} />
                          <Route path="/metas" element={<Metas />} />
                          <Route path="/estoque" element={<Estoque />} />
                          <Route path="/cardapio" element={<Estoque />} />
                          <Route path="/akguns-abas" element={<AkgunsAbasPage />} />
                          <Route path="/ai-assistant" element={<AIAssistantPage />} />
                          <Route path="/gerenciar-usuarios" element={<GerenciarUsuarios />} />
                          <Route path="/assinatura" element={<Assinatura />} />
                          <Route path="/configuracoes" element={<Configuracoes />} />
                          <Route path="/documentacao" element={<Documentacao />} />
                          <Route path="/privacidade" element={<Privacidade />} />
                          <Route path="/security-center" element={<SecurityCenter />} />
                          <Route path="/admin" element={<SystemAdmin />} />
                          <Route path="/status-sistema" element={<StatusSistema />} />
                          {/* Fallback para rotas não encontradas */}
                          <Route path="*" element={<Index />} />
                        </Routes>
                      </ModernLayout>
                    </ProtectedRoute>
                  } />
                </Routes>
              </Suspense>
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
