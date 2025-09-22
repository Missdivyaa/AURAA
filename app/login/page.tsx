'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus,
  Heart,
  Shield,
  Activity,
  Brain,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock authentication - in real app, this would call your auth API
      if (formData.email && formData.password) {
        // Store user session (mock)
        localStorage.setItem('user', JSON.stringify({
          email: formData.email,
          name: formData.email.split('@')[0],
          id: 'user-123'
        }))
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        setError('Please fill in all fields')
      }
    } catch (err) {
      setError('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
                Aegis Health
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

        {/* Right Side - Login Form */}
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
                Aegis Health
              </h1>
              <p className="text-lg text-gray-600">
                Family Health Management
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-lg text-gray-600">
                  {isLogin ? 'Sign in to your account' : 'Join Aegis Health today'}
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-12 py-4 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-lg text-gray-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      className="text-lg text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-primary-600 text-white text-lg font-semibold rounded-2xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-3"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-lg text-gray-600">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </p>
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="mt-2 text-lg text-primary-600 hover:text-primary-700 font-semibold flex items-center justify-center space-x-2 mx-auto"
                >
                  <span>{isLogin ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-500 mb-4">
                  Or continue with
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button className="py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 bg-blue-600 rounded"></div>
                    <span className="text-gray-700">Google</span>
                  </button>
                  <button className="py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 bg-blue-800 rounded"></div>
                    <span className="text-gray-700">Microsoft</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Demo Account Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4"
            >
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Demo Account</h4>
                  <p className="text-sm text-blue-800">
                    Use any email and password to explore the platform. This is a demo environment.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
