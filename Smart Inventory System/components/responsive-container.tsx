"use client"

import { cn } from "@/lib/utils"
import { useResponsive } from "@/hooks/use-mobile"
import { ReactNode } from "react"

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  mobileClassName?: string
  tabletClassName?: string
  desktopClassName?: string
  fullWidth?: boolean
  padding?: "none" | "sm" | "md" | "lg" | "xl"
}

export function ResponsiveContainer({
  children,
  className,
  mobileClassName,
  tabletClassName,
  desktopClassName,
  fullWidth = false,
  padding = "md",
}: ResponsiveContainerProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive()

  const paddingClasses = {
    none: "",
    sm: isMobile ? "p-2" : "p-3 md:p-4",
    md: isMobile ? "p-3" : "p-4 md:p-6",
    lg: isMobile ? "p-4" : "p-6 md:p-8",
    xl: isMobile ? "p-6" : "p-8 md:p-12",
  }

  const baseClasses = cn(
    fullWidth ? "w-full max-w-none" : "container mx-auto",
    paddingClasses[padding],
    "space-y-3 md:space-y-4 lg:space-y-6"
  )

  const responsiveClasses = cn(
    baseClasses,
    className,
    isMobile && mobileClassName,
    isTablet && tabletClassName,
    isDesktop && desktopClassName
  )

  return <div className={responsiveClasses}>{children}</div>
}

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: "sm" | "md" | "lg"
}

export function ResponsiveGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "md",
}: ResponsiveGridProps) {
  const { isMobile, isTablet } = useResponsive()

  const gapClasses = {
    sm: "gap-2 md:gap-3",
    md: "gap-3 md:gap-4",
    lg: "gap-4 md:gap-6",
  }

  const gridClasses = cn(
    "grid",
    gapClasses[gap],
    isMobile
      ? `grid-cols-${cols.mobile}`
      : isTablet
      ? `grid-cols-${cols.tablet}`
      : `grid-cols-${cols.desktop}`,
    className
  )

  return <div className={gridClasses}>{children}</div>
}

interface ResponsiveTextProps {
  children: ReactNode
  className?: string
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl"
  weight?: "normal" | "medium" | "semibold" | "bold"
}

export function ResponsiveText({
  children,
  className,
  size = "base",
  weight = "normal",
}: ResponsiveTextProps) {
  const { isMobile } = useResponsive()

  const sizeClasses = {
    xs: isMobile ? "text-2xs" : "text-xs",
    sm: isMobile ? "text-xs" : "text-sm",
    base: isMobile ? "text-sm" : "text-base",
    lg: isMobile ? "text-base" : "text-lg",
    xl: isMobile ? "text-lg" : "text-xl",
    "2xl": isMobile ? "text-xl" : "text-2xl",
    "3xl": isMobile ? "text-2xl" : "text-3xl",
  }

  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  }

  return (
    <span className={cn(sizeClasses[size], weightClasses[weight], className)}>
      {children}
    </span>
  )
}

interface ResponsiveCardProps {
  children: ReactNode
  className?: string
  padding?: "sm" | "md" | "lg"
  header?: ReactNode
  footer?: ReactNode
}

export function ResponsiveCard({
  children,
  className,
  padding = "md",
  header,
  footer,
}: ResponsiveCardProps) {
  const { isMobile } = useResponsive()

  const paddingClasses = {
    sm: isMobile ? "p-2" : "p-3 md:p-4",
    md: isMobile ? "p-3" : "p-4 md:p-6",
    lg: isMobile ? "p-4" : "p-6 md:p-8",
  }

  return (
    <div className={cn("bg-card text-card-foreground rounded-lg border shadow-sm", className)}>
      {header && (
        <div className={cn("border-b", paddingClasses[padding], "pb-2 md:pb-3")}>
          {header}
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
      {footer && (
        <div className={cn("border-t", paddingClasses[padding], "pt-2 md:pt-3")}>
          {footer}
        </div>
      )}
    </div>
  )
}
