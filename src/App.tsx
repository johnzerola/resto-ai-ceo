import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataSync } from "@/components/restaurant/DataSync";
import Dashboard from "./pages/Dashboard";
import FichaTecnica from "./pages/FichaTecnica";
import SystemValidation from "./pages/SystemValidation";
import DreCmv from "./pages/DreCmv";
import FluxoDeCaixa from "./pages/FluxoDeCaixa";
import Simulador from "./pages/Simulador";
import Metas from "./pages/Metas";
import Estoque from "./pages/Estoque";
import Cardapio from "./pages/Cardapio";
import AKGunsAbas from "./pages/AKGunsAbas";
import AiAssistant from "./pages/AiAssistant";
import GerenciarUsuarios from "./pages/GerenciarUsuarios";
import Assinatura from "./pages/Assinatura";
import Configuracoes from "./pages/Configuracoes";
import Documentacao from "./pages/Documentacao";
import Privacidade from "./pages/Privacidade";
import StatusSistema from "./pages/StatusSistema";
import Vendas from "./pages/Vendas";
import SecurityCenter from "./pages/SecurityCenter";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import {ProtectedRoute} from "@/contexts/ProtectedRoute";

import SystemAuditPage from "./pages/SystemAuditPage";

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
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projecoes" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dre" element={<ProtectedRoute><DreCmv /></ProtectedRoute>} />
                <Route path="/cmv" element={<ProtectedRoute><DreCmv /></ProtectedRoute>} />
                <Route path="/dre-cmv" element={<ProtectedRoute><DreCmv /></ProtectedRoute>} />
                <Route path="/fluxo-de-caixa" element={<ProtectedRoute><FluxoDeCaixa /></ProtectedRoute>} />
                <Route path="/simulador" element={<ProtectedRoute><Simulador /></ProtectedRoute>} />
                <Route path="/metas" element={<ProtectedRoute><Metas /></ProtectedRoute>} />
                <Route path="/estoque" element={<ProtectedRoute><Estoque /></ProtectedRoute>} />
                <Route path="/cardapio" element={<ProtectedRoute><Cardapio /></ProtectedRoute>} />
                <Route path="/akguns-abas" element={<ProtectedRoute><AKGunsAbas /></ProtectedRoute>} />
                <Route path="/ai-assistant" element={<ProtectedRoute><AiAssistant /></ProtectedRoute>} />
                <Route path="/gerenciar-usuarios" element={<ProtectedRoute><GerenciarUsuarios /></ProtectedRoute>} />
                <Route path="/assinatura" element={<ProtectedRoute><Assinatura /></ProtectedRoute>} />
                <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
                <Route path="/documentacao" element={<ProtectedRoute><Documentacao /></ProtectedRoute>} />
                <Route path="/privacidade" element={<ProtectedRoute><Privacidade /></ProtectedRoute>} />
                <Route path="/status-sistema" element={<ProtectedRoute><StatusSistema /></ProtectedRoute>} />
                <Route path="/vendas" element={<ProtectedRoute><Vendas /></ProtectedRoute>} />
                <Route path="/security-center" element={<ProtectedRoute><SecurityCenter /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/ficha-tecnica-inteligente-completa" element={<ProtectedRoute><FichaTecnica /></ProtectedRoute>} />
                <Route path="/system-validation" element={<ProtectedRoute><SystemValidation /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
                <Route path="/system-audit" element={<SystemAuditPage />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DataSync>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
