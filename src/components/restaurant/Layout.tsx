
import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { UserMenu } from "./UserMenu";
import { RestaurantSelector } from "./RestaurantSelector";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { EmailConfirmationBanner } from "../auth/EmailConfirmationBanner";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, currentRestaurant, userRestaurants } = useAuth();
  const [sidebarState, setSidebarState] = useState<'open' | 'closed'>('open');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Monitora eventos de abertura/fechamento do menu
  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarState(e.detail.isCollapsed ? 'closed' : 'open');
    };
    
    // Registrar ouvinte de evento personalizado
    window.addEventListener('sidebarToggle' as any, handleSidebarToggle as any);
    
    // Inicializar estado baseado no tamanho da tela
    const initializeSidebar = () => {
      const isMobile = window.innerWidth < 768;
      setSidebarState(isMobile ? 'closed' : 'open');
      setIsInitialized(true);
    };
    
    initializeSidebar();
    
    return () => {
      window.removeEventListener('sidebarToggle' as any, handleSidebarToggle as any);
    };
  }, []);
  
  // Loading com timeout de segurança
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isInitialized) {
        console.log('Forcing initialization after timeout');
        setIsInitialized(true);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isInitialized]);
  
  // Se estiver carregando, mostra spinner com timeout
  if (isLoading && !isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Carregando sistema...</p>
        </div>
      </div>
    );
  }
  
  // Se não estiver autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Se não tiver restaurante, redireciona para onboarding
  if (userRestaurants.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // Se não tiver restaurante atual selecionado, mas tiver restaurantes disponíveis
  if (!currentRestaurant && userRestaurants.length > 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Configurando restaurante...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <div className="flex grow flex-col md:flex-row">
        <Sidebar />
        <main className={cn(
          "grow p-4 md:p-6 pt-20 md:pt-6 max-w-7xl mx-auto transition-all duration-300 w-full",
          sidebarState === 'open' ? "md:ml-64" : "md:ml-16"
        )}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              {/* Espaço reservado para breadcrumb ou título da página */}
            </div>
            <div className="flex items-center gap-2">
              <RestaurantSelector />
              <UserMenu />
            </div>
          </div>
          
          {/* Banner de confirmação de email */}
          <EmailConfirmationBanner />
          
          {/* Conteúdo principal com error boundary */}
          <div className="min-h-[60vh]">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}

// Error Boundary simples para capturar erros de renderização
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Layout Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] text-center">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-red-600">Ops! Algo deu errado</h2>
            <p className="text-muted-foreground">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
