"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error?: Error
  resetError: () => void
}

export function DefaultErrorFallback({ error, resetError }: DefaultErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-card-foreground">
            Une erreur s'est produite
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Désolé, quelque chose s'est mal passé. Veuillez réessayer.
          </p>
          {error && process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-muted p-3 rounded-md text-sm">
              <summary className="cursor-pointer font-medium">Détails de l'erreur</summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-destructive">
                {error.message}
              </pre>
            </details>
          )}
          <div className="flex gap-3 justify-center">
            <Button onClick={resetError} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="border-border bg-transparent"
            >
              Accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}