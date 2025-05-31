
import React, { useState, useEffect } from "react";
import { ModernSidebar } from "./ModernSidebar";
import { ModernHeader } from "./ModernHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { EmailConfirmationBanner } from "../auth/EmailConfirmationBanner";
import { cn } from "@/lib/utils";

export function ModernLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, currentRestaurant, userRestaurants } = useAuth();
  const [sidebarState, setSidebarState] = useState<'open' | 'closed'>('open');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Monitor sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarState(e.detail.isCollapsed ? 'closed' : 'open');
    };
    
    window.addEventListener('sidebarToggle' as any, handleSidebarToggle as any);
    
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
  
  // Loading with safety timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isInitialized) {
        console.log('Forcing initialization after timeout');
        setIsInitialized(true);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isInitialized]);
  
  // Loading state with modern spinner
  if (isLoading && !isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
            <div className="w-12 h-12 rounded-full border-4 border-[#00D887] border-t-transparent absolute top-0 left-0 animate-spin"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Carregando RestaurIA...</p>
          <p className="text-sm text-gray-500 mt-2">Preparando sua experiência inteligente</p>
        </div>
      </div>
    );
  }
  
  // Authentication checks
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (userRestaurants.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }
  
  if (!currentRestaurant && userRestaurants.length > 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
            <div className="w-12 h-12 rounded-full border-4 border-[#1B2C4F] border-t-transparent absolute top-0 left-0 animate-spin"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Configurando restaurante...</p>
          <p className="text-sm text-gray-500 mt-2">Quase lá!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="flex grow flex-col md:flex-row">
        <ModernSidebar />
        
        {/* Main Content Area */}
        <main className={cn(
          "grow transition-all duration-300 ease-out min-h-screen",
          sidebarState === 'open' ? "md:ml-72" : "md:ml-20"
        )}>
          {/* Modern Header */}
          <ModernHeader />
          
          {/* Content Container */}
          <div className="px-4 md:px-8 py-6 mt-16 md:mt-20">
            {/* Email Confirmation Banner */}
            <EmailConfirmationBanner />
            
            {/* Page Content with Error Boundary */}
            <div className="min-h-[calc(100vh-12rem)]">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Modern Error Boundary
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
        <div className="flex items-center justify-center min-h-[400px] text-center bg-white rounded-2xl shadow-lg mx-4 my-8">
          <div className="space-y-6 p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-2xl">⚠️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Algo deu errado</h2>
              <p className="text-gray-600 max-w-md">
                Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-[#00D887] to-[#00B572] text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
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
