import React, { useState, useEffect, memo } from 'react';
import { ModernSidebar } from '@/components/restaurant/ModernSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { EmailConfirmationBanner } from '@/components/auth/EmailConfirmationBanner';
import { TrialBanner } from '@/components/trial/TrialBanner';
import { DataSync } from '@/components/restaurant/DataSync';
import { FeedbackSystem } from '@/components/feedback/FeedbackSystem';
import { EnhancedErrorBoundary } from '@/components/error/EnhancedErrorBoundary';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const LoadingSpinner = memo(({ message }: { message: string }) => (
  <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-background to-muted/20">
    <div className="text-center">
      <div className="relative mx-auto w-12 h-12 mb-6">
        <div className="w-12 h-12 rounded-full border-4 border-muted"></div>
        <div className="w-12 h-12 rounded-full border-4 border-lucrai-green-primary border-t-transparent absolute top-0 left-0 animate-spin"></div>
      </div>
      <p className="text-lg font-medium text-foreground">{message}</p>
      <p className="text-sm text-muted-foreground mt-2">Preparando seu dashboard inteligente</p>
    </div>
  </div>
));

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading, currentRestaurant, userRestaurants } = useAuth();
  const [sidebarState, setSidebarState] = useState<'open' | 'closed'>('open');
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent) => {
      const { isCollapsed, isMobileOpen } = e.detail;
      setSidebarState(isCollapsed && !isMobileOpen ? 'closed' : 'open');
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
        console.warn('Dashboard initialization timeout - forcing render');
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
    <DataSync>
      <div className="flex min-h-screen w-full bg-lucrai-gradient-subtle">
        <ModernSidebar />
        
        <main className={cn(
          "flex-1 transition-all duration-300 ease-out min-h-screen",
          sidebarState === 'open' ? "md:ml-72" : "md:ml-16"
        )}>
          <div className="space-y-4 p-4 md:p-6">
            <EmailConfirmationBanner />
            <TrialBanner />
            
            <React.Suspense fallback={<LoadingSpinner message="Carregando conteúdo..." />}>
              <EnhancedErrorBoundary>
                {children}
              </EnhancedErrorBoundary>
            </React.Suspense>
          </div>
          
          <FeedbackSystem />
        </main>
      </div>
    </DataSync>
  );
};