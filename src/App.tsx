import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

// Contexts
import { AuthProvider } from "@/contexts/AuthContext";

// Components
import { DataSync } from "@/components/restaurant/DataSync";

// Modern Layout
import { ModernLayout } from "@/components/restaurant/ModernLayout";

// Pages
import { Dashboard } from "@/pages/Dashboard";
import Login from "@/pages/Login";
import { Register } from "@/pages/Register";
import Onboarding from "@/pages/Onboarding";
import AccessDenied from "@/pages/AccessDenied";
import FluxoCaixa from "@/pages/FluxoCaixa";
import { DRE } from "@/pages/DRE";
import { CMV } from "@/pages/CMV";
import { Metas } from "@/pages/Metas";
import Estoque from "@/pages/Estoque";
import FichaTecnica from "@/pages/FichaTecnica";
import { AIAssistantPage } from "@/pages/AIAssistantPage";
import GerenciarUsuarios from "@/pages/GerenciarUsuarios";
import Privacidade from "@/pages/Privacidade";
import Documentacao from "@/pages/Documentacao";
import Configuracoes from "@/pages/Configuracoes";
import NotFound from "@/pages/NotFound";
import { Assinatura } from "@/pages/Assinatura";
import Simulador from "@/pages/Simulador";
import PaginaVendas from "@/pages/PaginaVendas";
import { ProjecoesPagina } from "@/pages/ProjecoesPagina";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AuthProvider>
          <DataSync>
            <Router>
              <div className="min-h-screen bg-background">
                <Routes>
                  {/* Public sales page */}
                  <Route path="/vendas" element={<PaginaVendas />} />
                  
                  {/* Auth routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/access-denied" element={<AccessDenied />} />
                  
                  {/* Protected routes with modern layout */}
                  <Route path="/" element={<ModernLayout><Dashboard /></ModernLayout>} />
                  <Route path="/dashboard" element={<ModernLayout><Dashboard /></ModernLayout>} />
                  
                  {/* Financial routes */}
                  <Route path="/fluxo-de-caixa" element={<ModernLayout><FluxoCaixa /></ModernLayout>} />
                  <Route path="/fluxo-caixa" element={<ModernLayout><FluxoCaixa /></ModernLayout>} />
                  <Route path="/cash-flow" element={<ModernLayout><FluxoCaixa /></ModernLayout>} />
                  <Route path="/dre" element={<ModernLayout><DRE /></ModernLayout>} />
                  <Route path="/cmv" element={<ModernLayout><CMV /></ModernLayout>} />
                  
                  {/* Projections and forecasting */}
                  <Route path="/projecoes" element={<ModernLayout><ProjecoesPagina /></ModernLayout>} />
                  <Route path="/projections" element={<ModernLayout><ProjecoesPagina /></ModernLayout>} />
                  <Route path="/forecasting" element={<ModernLayout><ProjecoesPagina /></ModernLayout>} />
                  
                  {/* Management routes */}
                  <Route path="/metas" element={<ModernLayout><Metas /></ModernLayout>} />
                  <Route path="/goals" element={<ModernLayout><Metas /></ModernLayout>} />
                  <Route path="/estoque" element={<ModernLayout><Estoque /></ModernLayout>} />
                  <Route path="/inventory" element={<ModernLayout><Estoque /></ModernLayout>} />
                  
                  {/* Menu and recipes */}
                  <Route path="/fichas-tecnicas" element={<ModernLayout><FichaTecnica /></ModernLayout>} />
                  <Route path="/recipes" element={<ModernLayout><FichaTecnica /></ModernLayout>} />
                  <Route path="/cardapio" element={<ModernLayout><FichaTecnica /></ModernLayout>} />
                  <Route path="/menu" element={<ModernLayout><FichaTecnica /></ModernLayout>} />
                  
                  {/* Simulator routes */}
                  <Route path="/simulador" element={<ModernLayout><Simulador /></ModernLayout>} />
                  <Route path="/simulator" element={<ModernLayout><Simulador /></ModernLayout>} />
                  <Route path="/price-simulator" element={<ModernLayout><Simulador /></ModernLayout>} />
                  
                  {/* Other features */}
                  <Route path="/ai-assistant" element={<ModernLayout><AIAssistantPage /></ModernLayout>} />
                  <Route path="/gerenciar-usuarios" element={<ModernLayout><GerenciarUsuarios /></ModernLayout>} />
                  <Route path="/privacidade" element={<ModernLayout><Privacidade /></ModernLayout>} />
                  <Route path="/documentacao" element={<ModernLayout><Documentacao /></ModernLayout>} />
                  <Route path="/configuracoes" element={<ModernLayout><Configuracoes /></ModernLayout>} />
                  <Route path="/assinatura" element={<ModernLayout><Assinatura /></ModernLayout>} />
                  
                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Toaster 
                position="top-right"
                expand={false}
                richColors
                closeButton
                className="z-[100]"
              />
            </Router>
          </DataSync>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
