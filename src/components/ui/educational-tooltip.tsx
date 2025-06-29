
import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Info } from "lucide-react";

interface EducationalTooltipProps {
  children: ReactNode;
  title: string;
  content: string;
  example?: string;
  variant?: 'help' | 'info';
}

export function EducationalTooltip({ 
  children, 
  title, 
  content, 
  example, 
  variant = 'help' 
}: EducationalTooltipProps) {
  const Icon = variant === 'help' ? HelpCircle : Info;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-help">
            {children}
            <Icon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-4">
          <div className="space-y-2">
            <h4 className="font-semibold">{title}</h4>
            <p className="text-sm">{content}</p>
            {example && (
              <div className="mt-2 p-2 bg-muted rounded text-xs">
                <strong>Exemplo:</strong> {example}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
