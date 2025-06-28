
import React, { useState, useEffect } from 'react';
import { ModernSidebar } from '@/components/restaurant/ModernSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { EmailConfirmationBanner } from '@/components/auth/EmailConfirmationBanner';
import { ResponsiveWrapper } from './ResponsiveWrapper';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface EnhancedResponsiveLayoutProps {
  children: React.ReactNode;
}

export function EnhancedResponsiveLayout({ children }: EnhancedResponsiveLayoutProps) {
  const { isAuthenticated, isLoading, currentRestaurant, userRestaurants } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const handleOverlayClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center">
          <div className="relative mx-auto w-12 h-12 mb-6">
            <div className="w-12 h-12 rounded-full border-4 border-muted"></div>
            <div className="w-12 h-12 rounded-full border-4 border-[#00D887] border-t-transparent absolute top-0 left-0 animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-foreground">Carregando RestaurIA...</p>
          <p className="text-sm text-muted-foreground mt-2">Preparando sua experiência inteligente</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRestaurants.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background overflow-x-hidden">
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm border"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={handleOverlayClick}
        />
      )}

      <div className={cn(
        "transition-all duration-300 ease-in-out z-40",
        isMobile ? [
          "fixed top-0 left-0 h-full",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        ] : [
          "relative",
          sidebarOpen ? "w-72" : "w-16"
        ]
      )}>
        <ModernSidebar isCollapsed={!sidebarOpen} />
      </div>

      <main className={cn(
        "flex-1 transition-all duration-300 ease-out min-h-screen",
        "w-full max-w-full overflow-x-hidden",
        isMobile ? "pt-16" : "pt-0"
      )}>
        <EmailConfirmationBanner />
        
        <ResponsiveWrapper>
          <div className="min-h-screen">
            <React.Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }>
              {children}
            </React.Suspense>
          </div>
        </ResponsiveWrapper>
      </main>
    </div>
  );
}
