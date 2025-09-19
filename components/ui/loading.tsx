"use client"

import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface LoadingProps {
  message?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Loading({ message = "Chargement...", size = "md", className = "" }: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-center space-y-4">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary mx-auto`} />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export function LoadingCard({ message = "Chargement des données..." }: { message?: string }) {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardContent className="p-8">
        <Loading message={message} />
      </CardContent>
    </Card>
  )
}

export function LoadingPage({ message = "Chargement..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground text-lg">{message}</p>
      </div>
    </div>
  )
}