import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    "2xl"?: number
  }
  gap?: "sm" | "md" | "lg" | "xl"
  children: React.ReactNode
}

const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ className, cols = { default: 1, sm: 1, md: 2, lg: 3, xl: 4 }, gap = "md", children, ...props }, ref) => {
    const gridCols = {
      1: "grid-cols-1",
      2: "grid-cols-2", 
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    }

    const gridGaps = {
      sm: "gap-2 sm:gap-3",
      md: "gap-3 sm:gap-4 md:gap-6",
      lg: "gap-4 sm:gap-6 md:gap-8",
      xl: "gap-6 sm:gap-8 md:gap-10",
    }

    const responsiveClasses = [
      cols.default && gridCols[cols.default as keyof typeof gridCols],
      cols.sm && `sm:${gridCols[cols.sm as keyof typeof gridCols]}`,
      cols.md && `md:${gridCols[cols.md as keyof typeof gridCols]}`,
      cols.lg && `lg:${gridCols[cols.lg as keyof typeof gridCols]}`,
      cols.xl && `xl:${gridCols[cols.xl as keyof typeof gridCols]}`,
      cols["2xl"] && `2xl:${gridCols[cols["2xl"] as keyof typeof gridCols]}`,
    ].filter(Boolean).join(" ")

    return (
      <div
        ref={ref}
        className={cn(
          "grid w-full touch-manipulation",
          responsiveClasses,
          gridGaps[gap],
          // Mobile optimizations
          "auto-rows-max", // Prevent stretching
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ResponsiveGrid.displayName = "ResponsiveGrid"

// Specific grid layouts for common use cases
const DashboardGrid = React.forwardRef<HTMLDivElement, Omit<ResponsiveGridProps, "cols">>(
  ({ className, gap = "md", ...props }, ref) => (
    <ResponsiveGrid
      ref={ref}
      cols={{ default: 1, sm: 1, md: 2, lg: 3, xl: 4 }}
      gap={gap}
      className={cn("mb-6", className)}
      {...props}
    />
  )
)
DashboardGrid.displayName = "DashboardGrid"

const MetricsGrid = React.forwardRef<HTMLDivElement, Omit<ResponsiveGridProps, "cols">>(
  ({ className, gap = "sm", ...props }, ref) => (
    <ResponsiveGrid
      ref={ref}
      cols={{ default: 2, sm: 2, md: 4, lg: 4, xl: 6 }}
      gap={gap}
      className={className}
      {...props}
    />
  )
)
MetricsGrid.displayName = "MetricsGrid"

const ProductGrid = React.forwardRef<HTMLDivElement, Omit<ResponsiveGridProps, "cols">>(
  ({ className, gap = "md", ...props }, ref) => (
    <ResponsiveGrid
      ref={ref}
      cols={{ default: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
      gap={gap}
      className={className}
      {...props}
    />
  )
)
ProductGrid.displayName = "ProductGrid"

export {
  ResponsiveGrid,
  DashboardGrid,
  MetricsGrid,
  ProductGrid,
}