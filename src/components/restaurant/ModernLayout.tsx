
import { ModernSidebar } from "./ModernSidebar";

interface ModernLayoutProps {
  children: React.ReactNode;
}

export function ModernLayout({ children }: ModernLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <ModernSidebar />

        {/* Main Content - Corrigido o espaçamento excessivo completamente */}
        <main className="flex-1 transition-all duration-300 ease-in-out">
          <div className="p-3 sm:p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
