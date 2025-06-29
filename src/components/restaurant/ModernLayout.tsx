
import { useState } from "react";
import { ModernSidebar } from "./ModernSidebar";
import { SystemHealthIndicator } from "@/components/system/SystemHealthIndicator";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";

interface ModernLayoutProps {
  children: React.ReactNode;
}

export function ModernLayout({ children }: ModernLayoutProps) {
  const [showHealthIndicator, setShowHealthIndicator] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      <div className="lg:grid lg:grid-cols-[280px_1fr]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block border-r bg-muted/10">
          <ModernSidebar />
        </div>

        {/* Main Content */}
        <div className="flex flex-col">
          {/* Desktop Header with Health Indicator */}
          <div className="hidden lg:flex items-center justify-between p-4 border-b">
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHealthIndicator(!showHealthIndicator)}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              Sistema
            </Button>
          </div>

          {/* Health Indicator Panel */}
          {showHealthIndicator && (
            <div className="border-b bg-muted/5 p-4">
              <SystemHealthIndicator />
            </div>
          )}

          {/* Page Content with proper spacing for mobile sidebar */}
          <main className="flex-1 lg:ml-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
