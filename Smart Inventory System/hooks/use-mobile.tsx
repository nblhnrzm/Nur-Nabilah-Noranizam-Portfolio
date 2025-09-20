"use client"

import { useEffect, useState } from "react"

// Breakpoint constants
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export function useMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md)
    }

    // Initial check
    checkIfMobile()

    // Use matchMedia for better performance
    const mediaQuery = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`)
    const handleChange = () => setIsMobile(window.innerWidth < BREAKPOINTS.md)

    mediaQuery.addEventListener("change", handleChange)

    // Clean up
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  return !!isMobile
}

export function useTablet() {
  const [isTablet, setIsTablet] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const checkIfTablet = () => {
      const width = window.innerWidth
      setIsTablet(width >= BREAKPOINTS.md && width < BREAKPOINTS.lg)
    }

    checkIfTablet()

    const mediaQuery = window.matchMedia(`(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`)
    const handleChange = () => {
      const width = window.innerWidth
      setIsTablet(width >= BREAKPOINTS.md && width < BREAKPOINTS.lg)
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  return !!isTablet
}

export function useDesktop() {
  const [isDesktop, setIsDesktop] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= BREAKPOINTS.lg)
    }

    checkIfDesktop()

    const mediaQuery = window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`)
    const handleChange = () => setIsDesktop(window.innerWidth >= BREAKPOINTS.lg)

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  return !!isDesktop
}

// Combined hook for responsive design
export function useResponsive() {
  const isMobile = useMobile()
  const isTablet = useTablet()
  const isDesktop = useDesktop()

  return {
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet: isMobile || isTablet,
  }
}
