import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/error-boundary'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gestion Stock Vente - Application de Gestion',
  description: 'Application complète de gestion de stock et de ventes pour entreprises. Gérez vos produits, ventes, factures et paramètres d\'entreprise.',
  keywords: ['gestion stock', 'ventes', 'facturation', 'inventaire', 'entreprise'],
  authors: [{ name: 'Gestion Stock Vente' }],
  creator: 'Gestion Stock Vente',
  publisher: 'Gestion Stock Vente',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://gestion-stock-vente.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Gestion Stock Vente',
    description: 'Application complète de gestion de stock et de ventes',
    url: 'https://gestion-stock-vente.vercel.app',
    siteName: 'Gestion Stock Vente',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gestion Stock Vente',
    description: 'Application complète de gestion de stock et de ventes',
    creator: '@gestionstockvente',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
