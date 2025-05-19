
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import FichaTecnica from "./pages/FichaTecnica";
import Estoque from "./pages/Estoque";
import DreCmv from "./pages/DreCmv";
import FluxoCaixa from "./pages/FluxoCaixa";
import Promocoes from "./pages/Promocoes";
import Simulador from "./pages/Simulador";
import Marketing from "./pages/Marketing";
import GerenteIA from "./pages/GerenteIA";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AccessDenied from "./pages/AccessDenied";
import GerenciarUsuarios from "./pages/GerenciarUsuarios";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { UserRole } from "./services/AuthService";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/acesso-negado" element={<AccessDenied />} />
            
            {/* Rotas protegidas - acesso geral */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ficha-tecnica" 
              element={
                <ProtectedRoute>
                  <FichaTecnica />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/estoque" 
              element={
                <ProtectedRoute>
                  <Estoque />
                </ProtectedRoute>
              }
            />
            
            {/* Rotas protegidas - acesso gerencial */}
            <Route 
              path="/dre-cmv" 
              element={
                <ProtectedRoute requiredRole={UserRole.MANAGER}>
                  <DreCmv />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/fluxo-caixa" 
              element={
                <ProtectedRoute requiredRole={UserRole.MANAGER}>
                  <FluxoCaixa />
                </ProtectedRoute>
              }
            />
            
            {/* Rotas protegidas - acesso proprietário */}
            <Route 
              path="/promocoes" 
              element={
                <ProtectedRoute>
                  <Promocoes />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/simulador" 
              element={
                <ProtectedRoute>
                  <Simulador />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/marketing" 
              element={
                <ProtectedRoute>
                  <Marketing />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/gerente-ia" 
              element={
                <ProtectedRoute>
                  <GerenteIA />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/configuracoes" 
              element={
                <ProtectedRoute>
                  <Configuracoes />
                </ProtectedRoute>
              }
            />
            
            {/* Gerenciamento de usuários - apenas proprietário */}
            <Route 
              path="/gerenciar-usuarios" 
              element={
                <ProtectedRoute requiredRole={UserRole.OWNER}>
                  <GerenciarUsuarios />
                </ProtectedRoute>
              }
            />
            
            {/* Redirecionar "/" para "/login" quando não estiver autenticado */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
