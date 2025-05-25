
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { ConsentBanner } from "@/components/security/ConsentBanner";
import { SecurityMiddleware } from "@/components/security/SecurityMiddleware";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import Privacidade from "./pages/Privacidade";
import SecurityCenter from "./pages/SecurityCenter";
import PaginaVendas from "./pages/PaginaVendas";

const queryClient = new QueryClient();

// Component that uses security monitoring inside AuthProvider
function AppWithSecurity() {
  useSecurityMonitoring();

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <Routes>
        <Route path="/" element={<PaginaVendas />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/financeiro" element={<Financeiro />} />
        <Route path="/cmv" element={<CMV />} />
        <Route path="/fluxo-de-caixa" element={<FluxoDeCaixa />} />
        <Route path="/dre" element={<DRE />} />
        
        <Route path="/fichas-tecnicas" element={<FichaTecnica />} />
        <Route path="/gerenciar-estoque" element={<GerenciarEstoque />} />
        
        <Route path="/receitas" element={<Receitas />} />
        <Route path="/despesas" element={<Despesas />} />
        <Route path="/fornecedores" element={<Fornecedores />} />
        <Route path="/funcionarios" element={<Funcionarios />} />
        <Route path="/clientes" element={<Clientes />} />
        
        <Route path="/metas" element={<Metas />} />
        <Route path="/integracoes" element={<Integracoes />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/gerenciar-usuarios" element={<GerenciarUsuarios />} />
        
        <Route path="/documentacao" element={<Documentacao />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/security-center" element={<SecurityCenter />} />
      </Routes>
      <ConsentBanner />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SecurityMiddleware>
        <BrowserRouter>
          <AuthProvider>
            <AppWithSecurity />
          </AuthProvider>
        </BrowserRouter>
      </SecurityMiddleware>
    </QueryClientProvider>
  );
}

export default App;
