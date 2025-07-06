
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataSync } from "@/components/restaurant/DataSync";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
import Onboarding from "./pages/Onboarding";
import BusinessProfile from "./pages/BusinessProfile";
import { ProjecoesPagina } from "./pages/ProjecoesPagina";

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
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } />
                <Route path="/dados-negocio" element={
                  <ProtectedRoute>
                    <BusinessProfile />
                  </ProtectedRoute>
                } />
                <Route path="/business-profile" element={
                  <ProtectedRoute>
                    <BusinessProfile />
                  </ProtectedRoute>
                } />
                {/* Página inicial de vendas SEM proteção - página pública */}
                <Route path="/" element={<Vendas />} />
                <Route path="/vendas" element={<Vendas />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dre-cmv" element={
                  <ProtectedRoute>
                    <DreCmv />
                  </ProtectedRoute>
                } />
                <Route path="/dre" element={
                  <ProtectedRoute>
                    <DreCmv />
                  </ProtectedRoute>
                } />
                <Route path="/cmv" element={
                  <ProtectedRoute>
                    <DreCmv />
                  </ProtectedRoute>
                } />
                <Route path="/fluxo-de-caixa" element={
                  <ProtectedRoute>
                    <FluxoDeCaixa />
                  </ProtectedRoute>
                } />
                <Route path="/simulador" element={
                  <ProtectedRoute>
                    <Simulador />
                  </ProtectedRoute>
                } />
                <Route path="/metas" element={
                  <ProtectedRoute>
                    <Metas />
                  </ProtectedRoute>
                } />
                <Route path="/estoque" element={
                  <ProtectedRoute>
                    <Estoque />
                  </ProtectedRoute>
                } />
                <Route path="/cardapio" element={
                  <ProtectedRoute>
                    <Cardapio />
                  </ProtectedRoute>
                } />
                <Route path="/assistente-ia" element={
                  <ProtectedRoute>
                    <AiAssistant />
                  </ProtectedRoute>
                } />
                <Route path="/ai-assistant" element={
                  <ProtectedRoute>
                    <AiAssistant />
                  </ProtectedRoute>
                } />
                <Route path="/projecoes" element={
                  <ProtectedRoute>
                    <ProjecoesPagina />
                  </ProtectedRoute>
                } />
                <Route path="/gerenciar-usuarios" element={
                  <ProtectedRoute>
                    <GerenciarUsuarios />
                  </ProtectedRoute>
                } />
                <Route path="/assinatura" element={
                  <ProtectedRoute>
                    <Assinatura />
                  </ProtectedRoute>
                } />
                <Route path="/configuracoes" element={
                  <ProtectedRoute>
                    <Configuracoes />
                  </ProtectedRoute>
                } />
                <Route path="/documentacao" element={
                  <ProtectedRoute>
                    <Documentacao />
                  </ProtectedRoute>
                } />
                <Route path="/privacidade" element={
                  <ProtectedRoute>
                    <Privacidade />
                  </ProtectedRoute>
                } />
                <Route path="/status-sistema" element={
                  <ProtectedRoute>
                    <StatusSistema />
                  </ProtectedRoute>
                } />
                <Route path="/security-center" element={
                  <ProtectedRoute>
                    <SecurityCenter />
                  </ProtectedRoute>
                } />
                <Route path="/ficha-tecnica-inteligente-completa" element={
                  <ProtectedRoute>
                    <FichaTecnicaInteligenteCompleta />
                  </ProtectedRoute>
                } />
                <Route path="/system-validation" element={
                  <ProtectedRoute>
                    <SystemValidation />
                  </ProtectedRoute>
                } />
                <Route path="/system-audit" element={
                  <ProtectedRoute>
                    <SystemAuditPage />
                  </ProtectedRoute>
                } />
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
