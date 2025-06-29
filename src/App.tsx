
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

// New pages
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
              <Route
                path="/dashboard"
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
                path="/auditoria"
                element={
                  <ProtectedRoute>
                    <AuditoriaSistema />
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
