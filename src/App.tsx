
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

// Contexts
import { AuthProvider } from "@/contexts/AuthContext";

// Components
import { DataSync } from "@/components/restaurant/DataSync";

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
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/access-denied" element={<AccessDenied />} />
                  <Route path="/fluxo-de-caixa" element={<FluxoCaixa />} />
                  <Route path="/dre" element={<DRE />} />
                  <Route path="/cmv" element={<CMV />} />
                  <Route path="/metas" element={<Metas />} />
                  <Route path="/estoque" element={<Estoque />} />
                  <Route path="/fichas-tecnicas" element={<FichaTecnica />} />
                  <Route path="/ai-assistant" element={<AIAssistantPage />} />
                  <Route path="/gerenciar-usuarios" element={<GerenciarUsuarios />} />
                  <Route path="/privacidade" element={<Privacidade />} />
                  <Route path="/documentacao" element={<Documentacao />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="/assinatura" element={<Assinatura />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Toaster />
            </Router>
          </DataSync>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
