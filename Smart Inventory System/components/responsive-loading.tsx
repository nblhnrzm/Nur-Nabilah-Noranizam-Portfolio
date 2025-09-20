"use client"

import { cn } from "@/lib/utils"
import { useResponsive } from "@/hooks/use-mobile"
import { Loader2 } from "lucide-react"

interface ResponsiveLoadingProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
  variant?: "spinner" | "skeleton" | "dots" | "pulse"
}

export function ResponsiveLoading({
  className,
  size = "md",
  text,
  variant = "spinner",
}: ResponsiveLoadingProps) {
  const { isMobile } = useResponsive()

  const getSizeClasses = () => {
    const sizeMap = {
      sm: isMobile ? "h-4 w-4" : "h-5 w-5",
      md: isMobile ? "h-6 w-6" : "h-8 w-8",
      lg: isMobile ? "h-8 w-8" : "h-12 w-12",
      xl: isMobile ? "h-12 w-12" : "h-16 w-16",
    }
    return sizeMap[size]
  }

  const getTextSize = () => {
    return isMobile ? "text-sm" : "text-base"
  }

  if (variant === "spinner") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-2 md:gap-3", className)}>
        <Loader2 className={cn("animate-spin text-primary", getSizeClasses())} />
        {text && (
          <p className={cn("text-muted-foreground", getTextSize())}>{text}</p>
        )}
      </div>
    )
  }

  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="loading-skeleton h-4 w-3/4 rounded"></div>
        <div className="loading-skeleton h-4 w-1/2 rounded"></div>
        <div className="loading-skeleton h-4 w-5/6 rounded"></div>
      </div>
    )
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center gap-1", className)}>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
        {text && (
          <p className={cn("ml-3 text-muted-foreground", getTextSize())}>{text}</p>
        )}
      </div>
    )
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className={cn("bg-primary rounded-full animate-pulse", getSizeClasses())}></div>
        {text && (
          <p className={cn("ml-3 text-muted-foreground", getTextSize())}>{text}</p>
        )}
      </div>
    )
  }

  return null
}

interface ResponsiveSkeletonProps {
  className?: string
  lines?: number
  avatar?: boolean
  button?: boolean
}

export function ResponsiveSkeleton({
  className,
  lines = 3,
  avatar = false,
  button = false,
}: ResponsiveSkeletonProps) {
  const { isMobile } = useResponsive()

  return (
    <div className={cn("space-y-3", className)}>
      {avatar && (
        <div className="flex items-center gap-3">
          <div className={cn(
            "loading-skeleton rounded-full",
            isMobile ? "h-8 w-8" : "h-10 w-10"
          )}></div>
          <div className="space-y-2 flex-1">
            <div className="loading-skeleton h-3 w-1/3 rounded"></div>
            <div className="loading-skeleton h-2 w-1/4 rounded"></div>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "loading-skeleton rounded",
              isMobile ? "h-3" : "h-4",
              i === lines - 1 ? "w-2/3" : "w-full"
            )}
          ></div>
        ))}
      </div>

      {button && (
        <div className={cn(
          "loading-skeleton rounded",
          isMobile ? "h-8 w-20" : "h-10 w-24"
        )}></div>
      )}
    </div>
  )
}

interface ResponsiveCardSkeletonProps {
  className?: string
  count?: number
}

export function ResponsiveCardSkeleton({
  className,
  count = 3,
}: ResponsiveCardSkeletonProps) {
  const { isMobile, isTablet } = useResponsive()

  const getGridCols = () => {
    if (isMobile) return "grid-cols-1"
    if (isTablet) return "grid-cols-2"
    return "grid-cols-3"
  }

  return (
    <div className={cn(
      "grid gap-4",
      getGridCols(),
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "loading-skeleton rounded",
              isMobile ? "h-12 w-12" : "h-16 w-16"
            )}></div>
            <div className="space-y-2 flex-1">
              <div className="loading-skeleton h-4 w-3/4 rounded"></div>
              <div className="loading-skeleton h-3 w-1/2 rounded"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="loading-skeleton h-3 w-full rounded"></div>
            <div className="loading-skeleton h-3 w-2/3 rounded"></div>
          </div>
          <div className="flex gap-2">
            <div className={cn(
              "loading-skeleton rounded",
              isMobile ? "h-7 w-16" : "h-8 w-20"
            )}></div>
            <div className={cn(
              "loading-skeleton rounded",
              isMobile ? "h-7 w-16" : "h-8 w-20"
            )}></div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface ResponsiveTableSkeletonProps {
  className?: string
  rows?: number
  columns?: number
}

export function ResponsiveTableSkeleton({
  className,
  rows = 5,
  columns = 4,
}: ResponsiveTableSkeletonProps) {
  const { isMobile } = useResponsive()

  if (isMobile) {
    // Mobile card layout skeleton
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="border rounded-lg p-3 space-y-2">
            <div className="loading-skeleton h-4 w-3/4 rounded"></div>
            <div className="loading-skeleton h-3 w-1/2 rounded"></div>
            <div className="loading-skeleton h-3 w-2/3 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  // Desktop table layout skeleton
  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="border-b p-4 bg-muted/50">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="loading-skeleton h-4 w-3/4 rounded"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, j) => (
                <div key={j} className="loading-skeleton h-4 w-full rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Loading overlay component
interface ResponsiveLoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  text?: string
  className?: string
}

export function ResponsiveLoadingOverlay({
  isLoading,
  children,
  text = "Loading...",
  className,
}: ResponsiveLoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <ResponsiveLoading text={text} />
        </div>
      )}
    </div>
  )
}
