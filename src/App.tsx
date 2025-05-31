
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ModernLayout } from "./components/restaurant/ModernLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { UserRole } from "./services/AuthService";

// Lazy loading para otimização de performance
const Dashboard = React.lazy(() => import("./pages/Dashboard").then(module => ({ default: module.Dashboard })));
const Index = React.lazy(() => import("./pages/Index"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const DreCmv = React.lazy(() => import("./pages/DreCmv"));
const FluxoCaixa = React.lazy(() => import("./pages/FluxoCaixa"));
const Estoque = React.lazy(() => import("./pages/Estoque"));
const Configuracoes = React.lazy(() => import("./pages/Configuracoes"));

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

// QueryClient otimizado para produção
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Rotas públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Rotas protegidas com layout unificado */}
                <Route path="/*" element={
                  <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
                    <ModernLayout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/dre" element={<DreCmv />} />
                        <Route path="/dre-cmv" element={<DreCmv />} />
                        <Route path="/fluxo-de-caixa" element={<FluxoCaixa />} />
                        <Route path="/estoque" element={<Estoque />} />
                        <Route path="/configuracoes" element={<Configuracoes />} />
                        {/* Fallback para rotas não encontradas */}
                        <Route path="*" element={<Dashboard />} />
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
  );
}

export default App;
