
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Dashboard } from "./pages/Dashboard";
import Login from "./pages/Login";
import { Register } from "./pages/Register";
import { Financeiro } from "./pages/Financeiro";
import { CMV } from "./pages/CMV";
import { FluxoDeCaixa } from "./pages/FluxoDeCaixa";
import { DRE } from "./pages/DRE";
import FichaTecnica from "./pages/FichaTecnica";
import { GerenciarEstoque } from "./pages/GerenciarEstoque";
import { Receitas } from "./pages/Receitas";
import { Despesas } from "./pages/Despesas";
import { Fornecedores } from "./pages/Fornecedores";
import { Funcionarios } from "./pages/Funcionarios";
import { Clientes } from "./pages/Clientes";
import { Metas } from "./pages/Metas";
import { Integracoes } from "./pages/Integracoes";
import Configuracoes from "./pages/Configuracoes";
import GerenciarUsuarios from "./pages/GerenciarUsuarios";
import Documentacao from "./pages/Documentacao";
import { AIAssistantPage } from "./pages/AIAssistantPage";
import Index from "./pages/Index";
import { ConsentBanner } from "@/components/security/ConsentBanner";
import { SecurityMiddleware } from "@/components/security/SecurityMiddleware";
import Privacidade from "./pages/Privacidade";
import SecurityCenter from "./pages/SecurityCenter";
import PaginaVendas from "./pages/PaginaVendas";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { UserRole } from "./services/AuthService";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SecurityMiddleware>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50">
              <Toaster />
              <Routes>
                <Route path="/" element={<PaginaVendas />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Rota de onboarding que redireciona para dashboard se autenticado */}
                <Route 
                  path="/onboarding" 
                  element={
                    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
                      <Navigate to="/dashboard" replace />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Dashboard principal */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Rotas financeiras */}
                <Route 
                  path="/financeiro" 
                  element={
                    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
                      <Financeiro />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/cmv" 
                  element={
                    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
                      <CMV />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/fluxo-de-caixa" 
                  element={
                    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
                      <FluxoDeCaixa />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/dre" 
                  element={
                    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
                      <DRE />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Rotas operacionais */}
                <Route 
                  path="/fichas-tecnicas" 
                  element={
                    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
                      <FichaTecnica />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/gerenciar-estoque" 
                  element={
                    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
                      <GerenciarEstoque />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/receitas" 
                  element={
                    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
                      <Receitas />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/despesas" 
                  element={
                    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
                      <Despesas />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/fornecedores" 
                  element={
                    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
                      <Fornecedores />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/funcionarios" 
                  element={
                    <ProtectedRoute requiredRole={UserRole.MANAGER}>
                      <Funcionarios />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/clientes" 
                  element={
                    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
                      <Clientes />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/metas" 
                  element={
                    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
                      <Metas />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Rotas administrativas */}
                <Route 
                  path="/integracoes" 
                  element={
                    <ProtectedRoute requiredRole={UserRole.MANAGER}>
                      <Integracoes />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/configuracoes" 
                  element={
                    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
                      <Configuracoes />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/gerenciar-usuarios" 
                  element={
                    <ProtectedRoute requiredRole={UserRole.OWNER}>
                      <GerenciarUsuarios />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/documentacao" 
                  element={
                    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
                      <Documentacao />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/ai-assistant" 
                  element={
                    <ProtectedRoute requiredRole={UserRole.EMPLOYEE}>
                      <AIAssistantPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Rotas públicas */}
                <Route path="/privacidade" element={<Privacidade />} />
                <Route path="/security-center" element={<SecurityCenter />} />
              </Routes>
              <ConsentBanner />
            </div>
          </AuthProvider>
        </SecurityMiddleware>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
