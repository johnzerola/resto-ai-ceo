import * as React from "react";
import { cn } from "@/lib/utils";

interface HoverScaleProps extends React.HTMLAttributes<HTMLDivElement> {
  scale?: 'sm' | 'md' | 'lg';
  duration?: 'fast' | 'normal' | 'slow';
}

export const HoverScale = React.forwardRef<HTMLDivElement, HoverScaleProps>(
  ({ className, scale = 'sm', duration = 'normal', children, ...props }, ref) => {
    const scaleValues = {
      sm: 'hover:scale-[1.02]',
      md: 'hover:scale-[1.05]',
      lg: 'hover:scale-[1.08]'
    };

    const durationValues = {
      fast: 'transition-transform duration-150',
      normal: 'transition-transform duration-200',
      slow: 'transition-transform duration-300'
    };

    return (
      <div
        ref={ref}
        className={cn(
          "transform-gpu cursor-pointer",
          scaleValues[scale],
          durationValues[duration],
          "active:scale-[0.98]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

HoverScale.displayName = "HoverScale";

interface FloatAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: 'subtle' | 'normal' | 'strong';
  delay?: number;
}

export const FloatAnimation = React.forwardRef<HTMLDivElement, FloatAnimationProps>(
  ({ className, intensity = 'normal', delay = 0, children, ...props }, ref) => {
    const intensityValues = {
      subtle: 'hover:translate-y-[-2px]',
      normal: 'hover:translate-y-[-4px]',
      strong: 'hover:translate-y-[-6px]'
    };

    return (
      <div
        ref={ref}
        className={cn(
          "transform-gpu transition-transform duration-200 ease-out",
          intensityValues[intensity],
          className
        )}
        style={{ animationDelay: `${delay}ms` }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FloatAnimation.displayName = "FloatAnimation";

interface PulseGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: 'primary' | 'success' | 'warning' | 'error';
  intensity?: 'subtle' | 'normal' | 'strong';
}

export const PulseGlow = React.forwardRef<HTMLDivElement, PulseGlowProps>(
  ({ className, color = 'primary', intensity = 'normal', children, ...props }, ref) => {
    const glowColors = {
      primary: 'shadow-primary/25',
      success: 'shadow-success/25',
      warning: 'shadow-warning/25',
      error: 'shadow-destructive/25'
    };

    const intensityValues = {
      subtle: 'hover:shadow-md',
      normal: 'hover:shadow-lg',
      strong: 'hover:shadow-xl'
    };

    return (
      <div
        ref={ref}
        className={cn(
          "transition-shadow duration-200",
          intensityValues[intensity],
          `hover:${glowColors[color]}`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PulseGlow.displayName = "PulseGlow";

interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'left' | 'right' | 'up' | 'down';
  speed?: 'slow' | 'normal' | 'fast';
}

export const Shimmer = React.forwardRef<HTMLDivElement, ShimmerProps>(
  ({ className, direction = 'right', speed = 'normal', children, ...props }, ref) => {
    const directionValues = {
      left: 'bg-gradient-to-l',
      right: 'bg-gradient-to-r',
      up: 'bg-gradient-to-t',
      down: 'bg-gradient-to-b'
    };

    const speedValues = {
      slow: 'animate-[shimmer_3s_ease-in-out_infinite]',
      normal: 'animate-[shimmer_2s_ease-in-out_infinite]',
      fast: 'animate-[shimmer_1s_ease-in-out_infinite]'
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          "before:absolute before:inset-0",
          "before:translate-x-[-100%] hover:before:translate-x-[100%]",
          "before:transition-transform before:duration-1000 before:ease-out",
          directionValues[direction],
          "before:from-transparent before:via-white/20 before:to-transparent",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Shimmer.displayName = "Shimmer";