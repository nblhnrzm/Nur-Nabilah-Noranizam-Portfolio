"use client"

import { cn } from "@/lib/utils"
import { useResponsive } from "@/hooks/use-mobile"
import { ReactNode, HTMLAttributes, useEffect, useState } from "react"

// Responsive Show/Hide Components
interface ResponsiveShowProps {
  children: ReactNode
  on?: "mobile" | "tablet" | "desktop" | "mobile-tablet" | "tablet-desktop"
  className?: string
}

export function ResponsiveShow({ children, on = "mobile", className }: ResponsiveShowProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive()

  const shouldShow = () => {
    switch (on) {
      case "mobile":
        return isMobile
      case "tablet":
        return isTablet
      case "desktop":
        return isDesktop
      case "mobile-tablet":
        return isMobile || isTablet
      case "tablet-desktop":
        return isTablet || isDesktop
      default:
        return false
    }
  }

  if (!shouldShow()) return null

  return <div className={className}>{children}</div>
}

export function ResponsiveHide({ children, on = "mobile", className }: ResponsiveShowProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive()

  const shouldHide = () => {
    switch (on) {
      case "mobile":
        return isMobile
      case "tablet":
        return isTablet
      case "desktop":
        return isDesktop
      case "mobile-tablet":
        return isMobile || isTablet
      case "tablet-desktop":
        return isTablet || isDesktop
      default:
        return false
    }
  }

  if (shouldHide()) return null

  return <div className={className}>{children}</div>
}

// Responsive Flex Component
interface ResponsiveFlexProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  direction?: {
    mobile?: "row" | "col"
    tablet?: "row" | "col"
    desktop?: "row" | "col"
  }
  gap?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
  align?: {
    mobile?: "start" | "center" | "end" | "stretch"
    tablet?: "start" | "center" | "end" | "stretch"
    desktop?: "start" | "center" | "end" | "stretch"
  }
  justify?: {
    mobile?: "start" | "center" | "end" | "between" | "around" | "evenly"
    tablet?: "start" | "center" | "end" | "between" | "around" | "evenly"
    desktop?: "start" | "center" | "end" | "between" | "around" | "evenly"
  }
}

export function ResponsiveFlex({
  children,
  direction = { mobile: "col", tablet: "row", desktop: "row" },
  gap = { mobile: "gap-2", tablet: "gap-4", desktop: "gap-6" },
  align = { mobile: "start", tablet: "center", desktop: "center" },
  justify = { mobile: "start", tablet: "start", desktop: "start" },
  className,
  ...props
}: ResponsiveFlexProps) {
  const { isMobile, isTablet } = useResponsive()

  const getDirection = () => {
    if (isMobile) return direction.mobile || "col"
    if (isTablet) return direction.tablet || "row"
    return direction.desktop || "row"
  }

  const getGap = () => {
    if (isMobile) return gap.mobile || "gap-2"
    if (isTablet) return gap.tablet || "gap-4"
    return gap.desktop || "gap-6"
  }

  const getAlign = () => {
    const current = isMobile ? align.mobile : isTablet ? align.tablet : align.desktop
    return current ? `items-${current}` : "items-start"
  }

  const getJustify = () => {
    const current = isMobile ? justify.mobile : isTablet ? justify.tablet : justify.desktop
    return current ? `justify-${current}` : "justify-start"
  }

  const flexClasses = cn(
    "flex",
    `flex-${getDirection()}`,
    getGap(),
    getAlign(),
    getJustify(),
    className
  )

  return (
    <div className={flexClasses} {...props}>
      {children}
    </div>
  )
}

// Responsive Stack Component
interface ResponsiveStackProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  spacing?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
  align?: "start" | "center" | "end" | "stretch"
}

export function ResponsiveStack({
  children,
  spacing = { mobile: "space-y-2", tablet: "space-y-4", desktop: "space-y-6" },
  align = "start",
  className,
  ...props
}: ResponsiveStackProps) {
  const { isMobile, isTablet } = useResponsive()

  const getSpacing = () => {
    if (isMobile) return spacing.mobile || "space-y-2"
    if (isTablet) return spacing.tablet || "space-y-4"
    return spacing.desktop || "space-y-6"
  }

  const stackClasses = cn(
    "flex flex-col",
    `items-${align}`,
    getSpacing(),
    className
  )

  return (
    <div className={stackClasses} {...props}>
      {children}
    </div>
  )
}

// Responsive Columns Component
interface ResponsiveColumnsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
  minWidth?: string
}

export function ResponsiveColumns({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: "gap-3", tablet: "gap-4", desktop: "gap-6" },
  minWidth,
  className,
  ...props
}: ResponsiveColumnsProps) {
  const { isMobile, isTablet } = useResponsive()

  const getCols = () => {
    if (isMobile) return cols.mobile || 1
    if (isTablet) return cols.tablet || 2
    return cols.desktop || 3
  }

  const getGap = () => {
    if (isMobile) return gap.mobile || "gap-3"
    if (isTablet) return gap.tablet || "gap-4"
    return gap.desktop || "gap-6"
  }

  const gridClasses = cn(
    "grid",
    minWidth ? `grid-cols-[repeat(auto-fit,minmax(${minWidth},1fr))]` : `grid-cols-${getCols()}`,
    getGap(),
    className
  )

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  )
}

// Responsive Breakpoint Component
interface ResponsiveBreakpointProps {
  children: ReactNode
  breakpoint: number
  fallback?: ReactNode
}

export function ResponsiveBreakpoint({ children, breakpoint, fallback }: ResponsiveBreakpointProps) {
  const [matches, setMatches] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${breakpoint}px)`)

    const handleChange = () => {
      setMatches(mediaQuery.matches)
    }

    handleChange()
    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [breakpoint])

  if (matches === undefined) return null

  return matches ? <>{children}</> : <>{fallback}</>
}

// Responsive Aspect Ratio Component
interface ResponsiveAspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  ratio?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
}

export function ResponsiveAspectRatio({
  children,
  ratio = { mobile: "aspect-square", tablet: "aspect-video", desktop: "aspect-video" },
  className,
  ...props
}: ResponsiveAspectRatioProps) {
  const { isMobile, isTablet } = useResponsive()

  const getRatio = () => {
    if (isMobile) return ratio.mobile || "aspect-square"
    if (isTablet) return ratio.tablet || "aspect-video"
    return ratio.desktop || "aspect-video"
  }

  return (
    <div className={cn(getRatio(), "relative overflow-hidden", className)} {...props}>
      {children}
    </div>
  )
}
