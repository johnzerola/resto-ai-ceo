import {
  BrowserRouter,
  Routes,
  Route,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "./services/AuthService";
import Index from "./pages/Index";
import FluxoCaixa from "./pages/FluxoCaixa";
import FichaTecnica from "./pages/FichaTecnica";
import Estoque from "./pages/Estoque";
import DreCmv from "./pages/DreCmv";
import StatusSistema from "./pages/StatusSistema";
import ManualUsuario from "./pages/ManualUsuario";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import ContasFinanceiras from "./pages/ContasFinanceiras";

const queryClient = new QueryClient();

function App() {
  return (
    <div className="min-h-screen bg-background">
      <ThemeProvider defaultTheme="light" storageKey="resto-ai-theme">
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={createAppRouter()} />
            <Toaster richColors position="top-center" />
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}

function createAppRouter() {
  return createBrowserRouter([
    {
      path: "/",
      element: <Index />,
    },
    {
      path: "/fluxo-caixa",
      element: <FluxoCaixa />,
    },
    {
      path: "/ficha-tecnica",
      element: <FichaTecnica />,
    },
    {
      path: "/estoque",
      element: <Estoque />,
    },
    {
      path: "/dre-cmv",
      element: <DreCmv />,
    },
    {
      path: "/status-sistema",
      element: <StatusSistema />,
    },
    {
      path: "/manual-usuario",
      element: <ManualUsuario />,
    },
    {
      path: "/contas-financeiras",
      element: <ContasFinanceiras />
    },
  ]);
}

export default App;
