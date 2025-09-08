import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverScale, FloatAnimation, PulseGlow } from "@/components/ui/micro-interactions";
import { cn } from "@/lib/utils";

interface ResponsiveCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass' | 'gradient';
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  hover?: 'scale' | 'float' | 'glow' | 'none';
}

const cardVariants = {
  default: "bg-card border-border",
  elevated: "bg-card border-border shadow-lg",
  glass: "bg-card/80 backdrop-blur-sm border-border/50",
  gradient: "bg-gradient-to-br from-card to-card/80 border-border/50"
};

const cardSizes = {
  sm: "p-4",
  md: "p-6", 
  lg: "p-8"
};

export const ResponsiveCard = React.forwardRef<HTMLDivElement, ResponsiveCardProps>(
  ({ 
    title,
    description,
    children,
    className,
    variant = 'default',
    interactive = false,
    size = 'md',
    hover = 'none',
    ...props 
  }, ref) => {
    const CardWrapper = ({ children: wrapperChildren }: { children: React.ReactNode }) => {
      if (!interactive) return <>{wrapperChildren}</>;
      
      switch (hover) {
        case 'scale':
          return <HoverScale scale="sm">{wrapperChildren}</HoverScale>;
        case 'float':
          return <FloatAnimation intensity="subtle">{wrapperChildren}</FloatAnimation>;
        case 'glow':
          return <PulseGlow color="primary" intensity="subtle">{wrapperChildren}</PulseGlow>;
        default:
          return <>{wrapperChildren}</>;
      }
    };

    return (
      <CardWrapper>
        <Card
          ref={ref}
          className={cn(
            "transition-all duration-200",
            cardVariants[variant],
            interactive && "cursor-pointer",
            className
          )}
          {...props}
        >
          {(title || description) && (
            <CardHeader className={cn(
              "space-y-2",
              size === 'sm' && "p-4 pb-2",
              size === 'lg' && "p-8 pb-4"
            )}>
              {title && (
                <CardTitle className={cn(
                  "font-semibold",
                  size === 'sm' && "text-base",
                  size === 'lg' && "text-xl"
                )}>
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription className={cn(
                  size === 'sm' && "text-xs",
                  size === 'lg' && "text-base"
                )}>
                  {description}
                </CardDescription>
              )}
            </CardHeader>
          )}
          
          <CardContent className={cn(
            cardSizes[size],
            (title || description) && "pt-0"
          )}>
            {children}
          </CardContent>
        </Card>
      </CardWrapper>
    );
  }
);

ResponsiveCard.displayName = "ResponsiveCard";