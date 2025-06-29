
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { useBreakpoint } from "@/utils/responsive-utils";

interface ResponsiveNavigationProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
}

export function ResponsiveNavigation({ children, trigger }: ResponsiveNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const breakpoint = useBreakpoint();

  // Em desktop, não precisa do sheet
  if (breakpoint === 'desktop') {
    return <>{children}</>;
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Emit close event for sidebar integration
    if (!open) {
      window.dispatchEvent(new CustomEvent('closeMobileMenu'));
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">Menu</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
