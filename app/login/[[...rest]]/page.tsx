'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { SignIn, SignUp } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'
import { 
  Heart,
  Shield,
  Activity,
  Brain,
  ArrowRight
} from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const [isSignUp, setIsSignUp] = useState(false)

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // User is already signed in, redirect to dashboard
      router.push('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    // Check URL for signup parameter
    const params = new URLSearchParams(window.location.search)
    if (params.get('signup') === 'true') {
      setIsSignUp(true)
    }
  }, [])

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  const features = [
    {
      icon: Heart,
      title: 'Health Tracking',
      description: 'Monitor your family\'s health metrics and trends'
    },
    {
      icon: Brain,
      title: 'AI Insights',
      description: 'Get intelligent health predictions and recommendations'
    },
    {
      icon: Shield,
      title: 'Emergency ID',
      description: 'Quick access to critical health information'
    },
    {
      icon: Activity,
      title: 'Wearable Integration',
      description: 'Connect and sync with your health devices'
    }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-8">
      <div className="flex min-h-screen">
        {/* Left Side - Features */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-md"
          >
            <div className="mb-8">
              <h1 className="text-5xl font-bold text-white mb-4">
                AURAA Health
              </h1>
              <p className="text-xl text-primary-100">
                Your comprehensive family health management platform
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-primary-100">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Right Side - Clerk Auth */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                AURAA Health
              </h1>
              <p className="text-lg text-gray-600">
                Family Health Management
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-lg text-gray-600">
                  {isSignUp ? 'Join AURAA Health today' : 'Sign in to your account'}
                </p>
              </div>

              {/* Clerk Sign In/Sign Up Component */}
              <div className="flex justify-center">
                {isSignUp ? (
                  <SignUp 
                    routing="path"
                    path="/login"
                    signInUrl="/login"
                    afterSignUpUrl="/dashboard"
                    afterSignInUrl="/dashboard"
                    fallbackRedirectUrl="/dashboard"
                    appearance={{
                      elements: {
                        rootBox: "mx-auto",
                        card: "shadow-none",
                      }
                    }}
                  />
                ) : (
                  <SignIn 
                    routing="path"
                    path="/login"
                    signUpUrl="/login?signup=true"
                    afterSignInUrl="/dashboard"
                    fallbackRedirectUrl="/dashboard"
                    appearance={{
                      elements: {
                        rootBox: "mx-auto",
                        card: "shadow-none",
                      }
                    }}
                  />
                )}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-lg text-primary-600 hover:text-primary-700 font-semibold flex items-center justify-center space-x-2 mx-auto"
                >
                  <span>{isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
