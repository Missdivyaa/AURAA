'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import HeroSection from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import StatsSection from '@/components/StatsSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import CTASection from '@/components/CTASection'
import Footer from '@/components/Footer'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { isSignedIn, user, isLoaded } = useUser()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && user) {
        // User is authenticated, redirect to their personal dashboard
        setIsRedirecting(true)
        router.push('/dashboard')
      } else {
        // User is not authenticated, redirect to login
        setIsRedirecting(true)
        router.push('/login')
      }
    }
  }, [isLoaded, isSignedIn, user, router])

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading AURAA...</p>
        </div>
      </main>
    )
  }

  // Show redirecting state
  if (isRedirecting) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Redirecting to your dashboard...</p>
        </div>
      </main>
    )
  }

  // Show public homepage for non-authenticated users
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pb-8">
      <Navigation />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <TestimonialsSection />
        <CTASection />
        <Footer />
      </motion.div>
    </main>
  )
}