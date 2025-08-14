import * as React from "react"
import { cn } from "@/lib/utils"

const ResponsiveCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "mobile-stack" | "mobile-full"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 touch-manipulation",
      // Responsive variants
      variant === "mobile-stack" && "flex flex-col sm:flex-row",
      variant === "mobile-full" && "w-full",
      // Mobile optimizations
      "hover:shadow-md active:scale-[0.98] sm:active:scale-100",
      "p-4 sm:p-6", // Responsive padding
      className
    )}
    {...props}
  />
))
ResponsiveCard.displayName = "ResponsiveCard"

const ResponsiveCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 pb-4 sm:pb-6",
      "touch-manipulation",
      className
    )}
    {...props}
  />
))
ResponsiveCardHeader.displayName = "ResponsiveCardHeader"

const ResponsiveCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg sm:text-xl font-semibold leading-none tracking-tight",
      "break-words", // Prevent text overflow
      className
    )}
    {...props}
  />
))
ResponsiveCardTitle.displayName = "ResponsiveCardTitle"

const ResponsiveCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground leading-relaxed",
      "break-words", // Prevent text overflow
      className
    )}
    {...props}
  />
))
ResponsiveCardDescription.displayName = "ResponsiveCardDescription"

const ResponsiveCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "space-y-3 sm:space-y-4",
      "touch-manipulation",
      className
    )} 
    {...props} 
  />
))
ResponsiveCardContent.displayName = "ResponsiveCardContent"

const ResponsiveCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-4 sm:pt-6",
      "touch-manipulation",
      className
    )}
    {...props}
  />
))
ResponsiveCardFooter.displayName = "ResponsiveCardFooter"

export {
  ResponsiveCard,
  ResponsiveCardHeader,
  ResponsiveCardFooter,
  ResponsiveCardTitle,
  ResponsiveCardDescription,
  ResponsiveCardContent,
}