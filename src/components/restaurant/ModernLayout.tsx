
import React, { useState, useEffect, memo } from "react";
import { ModernSidebar } from "./ModernSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { EmailConfirmationBanner } from "../auth/EmailConfirmationBanner";

import { FeedbackSystem } from "@/components/feedback/FeedbackSystem";
import { EnhancedErrorBoundary } from "@/components/common/EnhancedErrorBoundary";
import { cn } from "@/lib/utils";

const LoadingSpinner = memo(({ message }: { message: string }) => (
  <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-background to-muted/20">
    <div className="text-center">
      <div className="relative mx-auto w-12 h-12 mb-6">
        <div className="w-12 h-12 rounded-full border-4 border-muted"></div>
        <div className="w-12 h-12 rounded-full border-4 border-[#00D887] border-t-transparent absolute top-0 left-0 animate-spin"></div>
      </div>
      <p className="text-lg font-medium text-foreground">{message}</p>
      <p className="text-sm text-muted-foreground mt-2">Preparando sua experiência inteligente</p>
    </div>
  </div>
));

const ErrorFallback = memo(() => (
  <div className="flex items-center justify-center min-h-[400px] text-center bg-card rounded-2xl shadow-lg mx-4 my-8">
    <div className="space-y-6 p-8">
      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
        <span className="text-white text-2xl">⚠️</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Oops! Algo deu errado</h2>
        <p className="text-muted-foreground max-w-md">
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
));

export function ModernLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, currentRestaurant, userRestaurants } = useAuth();
  const [sidebarState, setSidebarState] = useState<'open' | 'closed'>('open');
  const [isInitialized, setIsInitialized] = useState(false);
  
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
    
    requestAnimationFrame(initializeSidebar);
    
    return () => {
      window.removeEventListener('sidebarToggle' as any, handleSidebarToggle as any);
    };
  }, []);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isInitialized) {
        console.warn('Layout initialization timeout - forcing render');
        setIsInitialized(true);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isInitialized]);
  
  if (isLoading && !isInitialized) {
    return <LoadingSpinner message="Carregando Lucraí..." />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (userRestaurants.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }
  
  if (!currentRestaurant && userRestaurants.length > 0) {
    return <LoadingSpinner message="Configurando restaurante..." />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <ModernSidebar />
      
      {/* Premium Fixed Header with Theme Toggle */}
      <header className="fixed top-0 right-0 left-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 md:left-60 transition-all duration-300 shadow-sm">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-muted-foreground hidden md:block">
              Lucraí Premium
            </div>
          </div>
          <div className="flex items-center gap-3">
            
          </div>
        </div>
      </header>


      <main className={cn(
        "flex-1 transition-all duration-300 ease-out min-h-screen relative",
        // Add top margin for premium header
        "pt-16",
        sidebarState === 'open' ? "md:ml-60" : "md:ml-16"
      )}>
        
        <EmailConfirmationBanner />
        
        <div className="min-h-screen p-6">
          <React.Suspense fallback={<LoadingSpinner message="Carregando conteúdo..." />}>
            <EnhancedErrorBoundary>
              {children}
            </EnhancedErrorBoundary>
          </React.Suspense>
        </div>
        
        {/* Integrated Feedback System */}
        <FeedbackSystem />
      </main>
    </div>
  );
}

