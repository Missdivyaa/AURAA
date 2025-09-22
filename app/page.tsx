'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import HeroSection from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import StatsSection from '@/components/StatsSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import CTASection from '@/components/CTASection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-8">
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
