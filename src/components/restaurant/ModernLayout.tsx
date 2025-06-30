
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

        {/* Main Content - Corrigido o espaçamento excessivo */}
        <main className="flex-1 ml-0 md:ml-64 transition-all duration-300">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
