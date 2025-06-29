
import { useState } from "react";
import { ModernSidebar } from "./ModernSidebar";
import { SystemHealthIndicator } from "@/components/system/SystemHealthIndicator";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Activity } from "lucide-react";

interface ModernLayoutProps {
  children: React.ReactNode;
}

export function ModernLayout({ children }: ModernLayoutProps) {
  const [showHealthIndicator, setShowHealthIndicator] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <ModernSidebar />
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHealthIndicator(!showHealthIndicator)}
          >
            <Activity className="h-5 w-5" />
          </Button>
        </div>
      </div>

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

          {/* Page Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
