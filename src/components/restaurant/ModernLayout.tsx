
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

        {/* Main Content */}
        <main className="flex-1 ml-0 md:ml-72">
          {children}
        </main>
      </div>
    </div>
  );
}
