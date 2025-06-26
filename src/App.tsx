
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataSync } from "@/components/restaurant/DataSync";
import Dashboard from "./pages/Dashboard";
import FichaTecnicaInteligenteCompleta from "./pages/FichaTecnicaInteligenteCompleta";
import SystemValidation from "./pages/SystemValidation";
import DreCmv from "./pages/DreCmv";
import FluxoDeCaixa from "./pages/FluxoDeCaixa";
import Simulador from "./pages/Simulador";
import { Metas } from "./pages/Metas";
import Estoque from "./pages/Estoque";
import Cardapio from "./pages/Cardapio";
import GerenciarUsuarios from "./pages/GerenciarUsuarios";
import { Assinatura } from "./pages/Assinatura";
import Configuracoes from "./pages/Configuracoes";
import Documentacao from "./pages/Documentacao";
import { Privacidade } from "./pages/Privacidade";
import StatusSistema from "./pages/StatusSistema";
import SecurityCenter from "./pages/SecurityCenter";
import NotFound from "./pages/NotFound";
import SystemAuditPage from "./pages/SystemAuditPage";
import Login from "./pages/Login";
import Vendas from "./pages/Vendas";
import AiAssistant from "./pages/AiAssistant";
import { ProjecoesPagina } from "./pages/ProjecoesPagina";
import Onboarding from "./pages/Onboarding";

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
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dre-cmv" element={<DreCmv />} />
                <Route path="/dre" element={<DreCmv />} />
                <Route path="/cmv" element={<DreCmv />} />
                <Route path="/projecoes" element={<ProjecoesPagina />} />
                <Route path="/fluxo-de-caixa" element={<FluxoDeCaixa />} />
                <Route path="/simulador" element={<Simulador />} />
                <Route path="/metas" element={<Metas />} />
                <Route path="/estoque" element={<Estoque />} />
                <Route path="/cardapio" element={<Cardapio />} />
                <Route path="/vendas" element={<Vendas />} />
                <Route path="/assistente-ia" element={<AiAssistant />} />
                <Route path="/ai-assistant" element={<AiAssistant />} />
                <Route path="/gerenciar-usuarios" element={<GerenciarUsuarios />} />
                <Route path="/assinatura" element={<Assinatura />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="/documentacao" element={<Documentacao />} />
                <Route path="/privacidade" element={<Privacidade />} />
                <Route path="/status-sistema" element={<StatusSistema />} />
                <Route path="/security-center" element={<SecurityCenter />} />
                <Route path="/ficha-tecnica-inteligente-completa" element={<FichaTecnicaInteligenteCompleta />} />
                <Route path="/system-validation" element={<SystemValidation />} />
                <Route path="/system-audit" element={<SystemAuditPage />} />
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
