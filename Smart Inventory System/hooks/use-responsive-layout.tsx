"use client"

import { useEffect, useState } from "react"
import { useResponsive } from "./use-mobile"

export interface ResponsiveLayoutConfig {
  mobile: {
    columns: number
    gap: string
    padding: string
    fontSize: string
  }
  tablet: {
    columns: number
    gap: string
    padding: string
    fontSize: string
  }
  desktop: {
    columns: number
    gap: string
    padding: string
    fontSize: string
  }
}

const defaultLayoutConfig: ResponsiveLayoutConfig = {
  mobile: {
    columns: 1,
    gap: "gap-3",
    padding: "p-3",
    fontSize: "text-sm",
  },
  tablet: {
    columns: 2,
    gap: "gap-4",
    padding: "p-4",
    fontSize: "text-base",
  },
  desktop: {
    columns: 3,
    gap: "gap-6",
    padding: "p-6",
    fontSize: "text-base",
  },
}

export function useResponsiveLayout(config?: Partial<ResponsiveLayoutConfig>) {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  const [layoutConfig, setLayoutConfig] = useState(defaultLayoutConfig)

  useEffect(() => {
    if (config) {
      setLayoutConfig({
        mobile: { ...defaultLayoutConfig.mobile, ...config.mobile },
        tablet: { ...defaultLayoutConfig.tablet, ...config.tablet },
        desktop: { ...defaultLayoutConfig.desktop, ...config.desktop },
      })
    }
  }, [config])

  const getCurrentLayout = () => {
    if (isMobile) return layoutConfig.mobile
    if (isTablet) return layoutConfig.tablet
    return layoutConfig.desktop
  }

  const getGridClasses = (customColumns?: { mobile?: number; tablet?: number; desktop?: number }) => {
    const current = getCurrentLayout()
    const cols = customColumns
      ? isMobile
        ? customColumns.mobile || current.columns
        : isTablet
        ? customColumns.tablet || current.columns
        : customColumns.desktop || current.columns
      : current.columns

    return `grid grid-cols-${cols} ${current.gap}`
  }

  const getContainerClasses = () => {
    const current = getCurrentLayout()
    return `${current.padding} space-y-3 md:space-y-4 lg:space-y-6`
  }

  const getTextClasses = () => {
    const current = getCurrentLayout()
    return current.fontSize
  }

  const getCardClasses = () => {
    const current = getCurrentLayout()
    return `${current.padding} rounded-lg border shadow-sm`
  }

  const getButtonSize = () => {
    return isMobile ? "sm" : "default"
  }

  const getIconSize = () => {
    return isMobile ? "h-4 w-4" : "h-5 w-5"
  }

  const getSpacing = (type: "xs" | "sm" | "md" | "lg" | "xl") => {
    const spacingMap = {
      xs: isMobile ? "gap-1" : "gap-2",
      sm: isMobile ? "gap-2" : "gap-3",
      md: isMobile ? "gap-3" : "gap-4",
      lg: isMobile ? "gap-4" : "gap-6",
      xl: isMobile ? "gap-6" : "gap-8",
    }
    return spacingMap[type]
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    getCurrentLayout,
    getGridClasses,
    getContainerClasses,
    getTextClasses,
    getCardClasses,
    getButtonSize,
    getIconSize,
    getSpacing,
    layoutConfig,
  }
}

// Utility function for responsive class names
export function responsiveClass(
  mobileClass: string,
  tabletClass?: string,
  desktopClass?: string
) {
  const { isMobile, isTablet } = useResponsive()
  
  if (isMobile) return mobileClass
  if (isTablet && tabletClass) return tabletClass
  return desktopClass || tabletClass || mobileClass
}

// Hook for responsive values
export function useResponsiveValue<T>(
  mobileValue: T,
  tabletValue?: T,
  desktopValue?: T
): T {
  const { isMobile, isTablet } = useResponsive()
  
  if (isMobile) return mobileValue
  if (isTablet && tabletValue !== undefined) return tabletValue
  return desktopValue !== undefined ? desktopValue : (tabletValue !== undefined ? tabletValue : mobileValue)
}

// Hook for responsive breakpoint detection with custom breakpoints
export function useCustomBreakpoint(breakpoint: number) {
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

  return !!matches
}

// Hook for responsive font scaling
export function useResponsiveFontSize(baseSize: number = 16) {
  const { isMobile, isTablet } = useResponsive()
  
  const scale = isMobile ? 0.875 : isTablet ? 0.9375 : 1
  return `${baseSize * scale}px`
}

// Hook for responsive spacing
export function useResponsiveSpacing(baseSpacing: number = 16) {
  const { isMobile, isTablet } = useResponsive()
  
  const scale = isMobile ? 0.75 : isTablet ? 0.875 : 1
  return `${baseSpacing * scale}px`
}
