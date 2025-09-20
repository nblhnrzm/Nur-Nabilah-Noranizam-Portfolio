"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ResponsiveErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo })
    this.props.onError?.(error, errorInfo)
    
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by ResponsiveErrorBoundary:", error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleGoHome = () => {
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <ResponsiveErrorFallback 
        error={this.state.error}
        onRetry={this.handleRetry}
        onGoHome={this.handleGoHome}
      />
    }

    return this.props.children
  }
}

interface ResponsiveErrorFallbackProps {
  error?: Error
  onRetry?: () => void
  onGoHome?: () => void
  className?: string
}

export function ResponsiveErrorFallback({
  error,
  onRetry,
  onGoHome,
  className,
}: ResponsiveErrorFallbackProps) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center",
      isMobile ? "p-4" : "p-8",
      className
    )}>
      <Card className={cn(
        "w-full max-w-md text-center",
        isMobile ? "mx-4" : "mx-auto"
      )}>
        <CardHeader className={cn(isMobile ? "p-4" : "p-6")}>
          <div className="flex justify-center mb-4">
            <AlertTriangle className={cn(
              "text-destructive",
              isMobile ? "h-12 w-12" : "h-16 w-16"
            )} />
          </div>
          <CardTitle className={cn(
            "text-destructive",
            isMobile ? "text-lg" : "text-2xl"
          )}>
            Something went wrong
          </CardTitle>
          <CardDescription className={cn(
            isMobile ? "text-sm" : "text-base"
          )}>
            We encountered an unexpected error. Please try refreshing the page or go back to the home page.
          </CardDescription>
        </CardHeader>

        {process.env.NODE_ENV === "development" && error && (
          <CardContent className={cn(isMobile ? "p-4 pt-0" : "p-6 pt-0")}>
            <details className="text-left">
              <summary className={cn(
                "cursor-pointer text-muted-foreground hover:text-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}>
                Error Details (Development)
              </summary>
              <pre className={cn(
                "mt-2 p-2 bg-muted rounded text-destructive overflow-auto",
                isMobile ? "text-xs" : "text-sm"
              )}>
                {error.message}
                {error.stack && (
                  <>
                    {"\n\n"}
                    {error.stack}
                  </>
                )}
              </pre>
            </details>
          </CardContent>
        )}

        <CardFooter className={cn(
          "flex gap-2",
          isMobile ? "p-4 pt-0 flex-col" : "p-6 pt-0 justify-center"
        )}>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="default"
              size={isMobile ? "sm" : "default"}
              className={cn(
                "touch-target",
                isMobile ? "w-full" : ""
              )}
            >
              <RefreshCw className={cn(
                "mr-2",
                isMobile ? "h-3 w-3" : "h-4 w-4"
              )} />
              <span className={isMobile ? "text-xs" : undefined}>
                Try Again
              </span>
            </Button>
          )}
          
          {onGoHome && (
            <Button
              onClick={onGoHome}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className={cn(
                "touch-target",
                isMobile ? "w-full" : ""
              )}
            >
              <Home className={cn(
                "mr-2",
                isMobile ? "h-3 w-3" : "h-4 w-4"
              )} />
              <span className={isMobile ? "text-xs" : undefined}>
                Go Home
              </span>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

// Hook for error handling
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    setError(error)
    console.error("Error handled:", error)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  const throwError = React.useCallback((error: Error) => {
    throw error
  }, [])

  return {
    error,
    handleError,
    clearError,
    throwError,
  }
}

// Async error boundary for handling promise rejections
export function AsyncErrorBoundary({ children }: { children: ReactNode }) {
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason)
      // You could show a toast notification here
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  return <>{children}</>
}

// Error boundary wrapper with retry functionality
interface RetryErrorBoundaryProps {
  children: ReactNode
  maxRetries?: number
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export function RetryErrorBoundary({ 
  children, 
  maxRetries = 3,
  onError 
}: RetryErrorBoundaryProps) {
  const [retryCount, setRetryCount] = React.useState(0)
  const [key, setKey] = React.useState(0)

  const handleRetry = React.useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1)
      setKey(prev => prev + 1)
    }
  }, [retryCount, maxRetries])

  const handleError = React.useCallback((error: Error, errorInfo: ErrorInfo) => {
    onError?.(error, errorInfo)
  }, [onError])

  return (
    <ResponsiveErrorBoundary
      key={key}
      onError={handleError}
      fallback={
        <ResponsiveErrorFallback
          onRetry={retryCount < maxRetries ? handleRetry : undefined}
          onGoHome={() => window.location.href = "/"}
        />
      }
    >
      {children}
    </ResponsiveErrorBoundary>
  )
}
