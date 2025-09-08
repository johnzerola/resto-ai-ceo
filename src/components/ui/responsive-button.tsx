import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const responsiveButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-95",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-95",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-95",
        link: "text-primary underline-offset-4 hover:underline active:opacity-70",
      },
      size: {
        default: "h-10 px-4 py-2 min-h-[44px] sm:min-h-[40px]", // Touch-friendly heights
        sm: "h-9 rounded-md px-3 min-h-[40px] sm:min-h-[36px]",
        lg: "h-11 rounded-md px-8 min-h-[48px] sm:min-h-[44px]",
        icon: "h-10 w-10 min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px]",
        "icon-sm": "h-8 w-8 min-h-[40px] min-w-[40px] sm:min-h-[32px] sm:min-w-[32px]",
        "icon-lg": "h-12 w-12 min-h-[48px] min-w-[48px] sm:min-h-[48px] sm:min-w-[48px]",
      },
      responsive: {
        default: "",
        "mobile-full": "w-full sm:w-auto", // Full width on mobile, auto on desktop
        "mobile-stack": "w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-0", // Stack on mobile
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      responsive: "default",
    },
  }
)

export interface ResponsiveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof responsiveButtonVariants> {
  asChild?: boolean
}

const ResponsiveButton = React.forwardRef<HTMLButtonElement, ResponsiveButtonProps>(
  ({ className, variant, size, responsive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(responsiveButtonVariants({ variant, size, responsive, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
ResponsiveButton.displayName = "ResponsiveButton"

export { ResponsiveButton, responsiveButtonVariants }