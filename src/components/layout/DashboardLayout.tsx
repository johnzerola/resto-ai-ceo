import React from 'react';
import { ModernSidebar } from '@/components/restaurant/ModernSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-lucrai-gradient-subtle flex">
      {/* Sidebar Fixo */}
      <ModernSidebar />
      
      {/* Conteúdo Principal com Margem Responsiva */}
      <main className="flex-1 ml-0 md:ml-16 lg:ml-72 transition-all duration-300 ease-out">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
};