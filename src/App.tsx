
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { UserRole } from "./services/AuthService";

const Dashboard = React.lazy(() => import("./pages/Dashboard").then(module => ({ default: module.Dashboard })));
const Index = React.lazy(() => import("./pages/Index"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register").then(module => ({ default: module.Register })));
const DRE = React.lazy(() => import("./pages/DRE").then(module => ({ default: module.DRE })));
const CMV = React.lazy(() => import("./pages/CMV").then(module => ({ default: module.CMV })));
const FluxoDeCaixa = React.lazy(() => import("./pages/FluxoDeCaixa").then(module => ({ default: module.FluxoDeCaixa })));
const Estoque = React.lazy(() => import("./pages/Estoque"));
const Configuracoes = React.lazy(() => import("./pages/Configuracoes"));
const Metas = React.lazy(() => import("./pages/Metas").then(module => ({ default: module.Metas })));
const Simulador = React.lazy(() => import("./pages/Simulador"));
const AIAssistantPage = React.lazy(() => import("./pages/AIAssistantPage").then(module => ({ default: module.AIAssistantPage })));
const Assinatura = React.lazy(() => import("./pages/Assinatura").then(module => ({ default: module.Assinatura })));
const Privacidade = React.lazy(() => import("./pages/Privacidade"));
const ProjecoesPagina = React.lazy(() => import("./pages/ProjecoesPagina").then(module => ({ default: module.ProjecoesPagina })));
const Cardapio = React.lazy(() => import("./pages/Cardapio").then(module => ({ default: module.Cardapio })));

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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  <Route path="/*" element={
                    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/projecoes" element={<ProjecoesPagina />} />
                        <Route path="/dre" element={<DRE />} />
                        <Route path="/cmv" element={<CMV />} />
                        <Route path="/fluxo-de-caixa" element={<FluxoDeCaixa />} />
                        <Route path="/simulador" element={<Simulador />} />
                        <Route path="/metas" element={<Metas />} />
                        <Route path="/estoque" element={<Estoque />} />
                        <Route path="/cardapio" element={<Cardapio />} />
                        <Route path="/ai-assistant" element={<AIAssistantPage />} />
                        <Route path="/assinatura" element={<Assinatura />} />
                        <Route path="/configuracoes" element={<Configuracoes />} />
                        <Route path="/privacidade" element={<Privacidade />} />
                        <Route path="*" element={<Index />} />
                      </Routes>
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
