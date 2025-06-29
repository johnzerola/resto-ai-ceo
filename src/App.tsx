
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Page imports
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import FluxoCaixa from "@/pages/FluxoCaixa";
import DreCmv from "@/pages/DreCmv";
import SystemAuditPage from "@/pages/SystemAuditPage";
import NotFound from "@/pages/NotFound";

// Additional pages
import { ContasAPagar } from "@/pages/ContasAPagar";
import { AuditoriaSistema } from "@/pages/AuditoriaSistema";
import { Precificacao } from "@/pages/Precificacao";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes matching sidebar navigation */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projecoes"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fluxo-caixa"
                element={
                  <ProtectedRoute>
                    <FluxoCaixa />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dre"
                element={
                  <ProtectedRoute>
                    <DreCmv />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cmv"
                element={
                  <ProtectedRoute>
                    <DreCmv />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/simulador"
                element={
                  <ProtectedRoute>
                    <Precificacao />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/metas"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/estoque"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cardapio"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-assistant"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assinatura"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/configuracoes"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/auditoria"
                element={
                  <ProtectedRoute>
                    <SystemAuditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/privacidade"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Legacy routes for backward compatibility */}
              <Route
                path="/contas"
                element={
                  <ProtectedRoute>
                    <ContasAPagar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/precificacao"
                element={
                  <ProtectedRoute>
                    <Precificacao />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audit"
                element={
                  <ProtectedRoute>
                    <SystemAuditPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Catch-all route - display a 404 page for unknown paths */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
