
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
  Outlet,
} from "react-router-dom";

import Index from "./pages/Index";
import { AssinaturaCompleta as Pricing } from "./pages/AssinaturaCompleta";
import Login from "./pages/Login";
import { Register } from "./pages/Register";
import { Integracoes } from "./pages/Integracoes";
import { AssinaturaCompleta as Subscription } from "./pages/AssinaturaCompleta";
import { Dashboard } from "./pages/Dashboard";
import { SystemMonitoring } from "@/pages/SystemMonitoring";
import { AIAssistantPage } from "@/pages/AIAssistantPage";
import { ProjecoesPagina } from "@/pages/ProjecoesPagina";
import FluxoDeCaixa from "@/pages/FluxoDeCaixa";
import NotFound from "@/pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";

// Importing existing pages - using named imports for components that don't have default exports
import { CMV } from "@/pages/CMV";
import { DRE } from "@/pages/DRE";
import Estoque from "@/pages/Estoque";
import FichaTecnica from "@/pages/FichaTecnica";
import { Financeiro } from "@/pages/Financeiro";
import { Receitas } from "@/pages/Receitas";
import Simulador from "@/pages/Simulador";
import { Metas } from "@/pages/Metas";
import Promocoes from "@/pages/Promocoes";
import Cardapio from "@/pages/Cardapio";
import Marketing from "@/pages/Marketing";
import Configuracoes from "@/pages/Configuracoes";
import Onboarding from "@/pages/Onboarding";

// For now, using Dashboard for missing pages until they're created
const Settings = Dashboard;
const Restaurant = Dashboard;
const Restaurants = Dashboard;
const ForgotPassword = Login;
const ResetPassword = Login;
const Logout = Login;

// Simple layout components
const AuthLayout = () => <Outlet />;
const MainLayout = () => <Outlet />;
const RestaurantLayout = () => <Outlet />;

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Index />} />
        <Route path="/pricing" element={<Pricing />} />
      </Route>

      {/* Auth routes - accessible without authentication */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Route>

      {/* Protected routes */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/integracoes" element={<Integracoes />} />
        <Route path="/assinatura" element={<Subscription />} />
        <Route path="/system-monitoring" element={<SystemMonitoring />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/projecoes" element={<ProjecoesPagina />} />
        <Route path="/fluxo-de-caixa" element={<FluxoDeCaixa />} />
        
        {/* Financial routes */}
        <Route path="/cmv" element={<CMV />} />
        <Route path="/dre" element={<DRE />} />
        <Route path="/financeiro" element={<Financeiro />} />
        
        {/* Inventory and recipes */}
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/ficha-tecnica" element={<FichaTecnica />} />
        <Route path="/receitas" element={<Receitas />} />
        
        {/* Business management */}
        <Route path="/simulador" element={<Simulador />} />
        <Route path="/metas" element={<Metas />} />
        <Route path="/promocoes" element={<Promocoes />} />
        <Route path="/cardapio" element={<Cardapio />} />
        <Route path="/marketing" element={<Marketing />} />
      </Route>

      <Route element={<RestaurantLayout />}>
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/restaurants/:id" element={<Restaurant />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </>
  )
);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
