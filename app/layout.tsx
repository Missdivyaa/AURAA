import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ClerkProvider } from '@clerk/nextjs'
import NotificationProvider from '@/components/NotificationProvider'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { UserProfileProvider } from '@/contexts/UserProfileContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AURAA - Your Personal Health Guardian',
  description: 'An integrated platform that serves as a single source of truth for your medical data, powered by predictive analytics for preemptive health management.',
  keywords: 'health, medical records, AI health insights, family health, emergency health ID',
  authors: [{ name: 'AURAA Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AURAA',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider dynamic>
      <html lang="en">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#3b82f6" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="AURAA" />
        </head>
        <body className={inter.className}>
          <ThemeProvider>
            <UserProfileProvider>
              <NotificationProvider>
                {children}
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    className: 'dark:bg-gray-800 dark:text-white',
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                  }}
                />
              </NotificationProvider>
            </UserProfileProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
