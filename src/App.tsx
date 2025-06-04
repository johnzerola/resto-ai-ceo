
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FluxoDeCaixa from "./pages/FluxoDeCaixa";
import DRE from "./pages/DRE";
import CMV from "./pages/CMV";
import Metas from "./pages/Metas";
import Estoque from "./pages/Estoque";
import Cardapio from "./pages/Cardapio";
import AIAssistantPage from "./pages/AIAssistantPage";
import Assinatura from "./pages/Assinatura";
import Configuracoes from "./pages/Configuracoes";
import Privacidade from "./pages/Privacidade";
import ProjecoesPagina from "./pages/ProjecoesPagina";
import Simulador from "./pages/Simulador";
import NotFound from "./pages/NotFound";
import PaginaVendas from "./pages/PaginaVendas";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/apresentacao" element={<PaginaVendas />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fluxo-de-caixa"
                element={
                  <ProtectedRoute>
                    <FluxoDeCaixa />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projecoes"
                element={
                  <ProtectedRoute>
                    <ProjecoesPagina />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dre"
                element={
                  <ProtectedRoute>
                    <DRE />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cmv"
                element={
                  <ProtectedRoute>
                    <CMV />
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
                path="/metas"
                element={
                  <ProtectedRoute>
                    <Metas />
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
              <Route
                path="/cardapio"
                element={
                  <ProtectedRoute>
                    <Cardapio />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-assistant"
                element={
                  <ProtectedRoute>
                    <AIAssistantPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assinatura"
                element={
                  <ProtectedRoute>
                    <Assinatura />
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
              <Route
                path="/privacidade"
                element={
                  <ProtectedRoute>
                    <Privacidade />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
