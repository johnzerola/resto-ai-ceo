
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import FichaTecnica from "./pages/FichaTecnica";
import Estoque from "./pages/Estoque";
import DreCmv from "./pages/DreCmv";
import FluxoCaixa from "./pages/FluxoCaixa";
import Promocoes from "./pages/Promocoes";
import Simulador from "./pages/Simulador";
import Marketing from "./pages/Marketing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ficha-tecnica" element={<FichaTecnica />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/dre-cmv" element={<DreCmv />} />
          <Route path="/fluxo-caixa" element={<FluxoCaixa />} />
          <Route path="/promocoes" element={<Promocoes />} />
          <Route path="/simulador" element={<Simulador />} />
          <Route path="/marketing" element={<Marketing />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
