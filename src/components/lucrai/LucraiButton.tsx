import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// 🎨 Componente Botão Personalizado Lucraí
interface LucraiButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'success' | 'outline' | 'ghost';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  motiveText?: string; // Texto motivacional adicional
}

export function LucraiButton({ 
  children, 
  variant = 'primary',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  motiveText,
  className,
  disabled,
  ...props 
}: LucraiButtonProps) {
  const variantMap = {
    primary: 'lucrai-primary',
    secondary: 'lucrai-secondary', 
    success: 'lucrai-success',
    outline: 'lucrai-outline',
    ghost: 'lucrai-ghost'
  };

  return (
    <div className="group">
      <Button
        variant={variantMap[variant] as any}
        disabled={disabled || loading}
        className={cn(
          "relative overflow-hidden",
          loading && "lucrai-loading",
          className
        )}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        )}
        
        {Icon && iconPosition === 'left' && (
          <Icon className={cn(
            "h-4 w-4",
            loading && "animate-spin"
          )} />
        )}
        
        <span className="relative z-10">{children}</span>
        
        {Icon && iconPosition === 'right' && (
          <Icon className={cn(
            "h-4 w-4",
            loading && "animate-spin"
          )} />
        )}
      </Button>
      
      {motiveText && (
        <p className="text-xs text-muted-foreground mt-1 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {motiveText}
        </p>
      )}
    </div>
  );
}

// Componentes de conveniência
export function LucraiPrimaryButton(props: Omit<LucraiButtonProps, 'variant'>) {
  return <LucraiButton variant="primary" {...props} />;
}

export function LucraiSuccessButton(props: Omit<LucraiButtonProps, 'variant'>) {
  return <LucraiButton variant="success" {...props} />;
}

export function LucraiOutlineButton(props: Omit<LucraiButtonProps, 'variant'>) {
  return <LucraiButton variant="outline" {...props} />;
}