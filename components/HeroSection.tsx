'use client'

import { motion } from 'framer-motion'
import { 
  Shield, 
  Heart, 
  Brain, 
  Smartphone, 
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default function HeroSection() {
  const features = [
    'AI-Powered Health Insights',
    'Family Health Management',
    'Emergency Health ID',
    'Smart Reminders'
  ]

  return (
    <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
              >
                <Shield className="w-4 h-4 mr-2" />
                Open‑source student project • Free for everyone
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
              >
                Your Personal{' '}
                <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Health Guardian
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 leading-relaxed"
              >
                AURAA is not merely a personal health record. It's an integrated platform 
                that serves as a single source of truth for your medical data, powered by 
                predictive analytics for preemptive health management.
              </motion.p>
            </div>

            {/* Feature List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-4"
            >
              {features.map((feature, index) => (
                <div key={feature} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-primary-500 hover:text-primary-600 transition-colors">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center space-x-8 pt-8"
            >
              {/* <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">100K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">256-bit</div>
                <div className="text-sm text-gray-600">Encryption</div>
              </div> */}
            </motion.div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Main Dashboard Mockup */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Health Dashboard</h3>
                      <p className="text-sm text-gray-600">Welcome back, John</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
                </div>

                {/* Health Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-success-50 to-success-100 p-4 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-5 h-5 text-success-600" />
                      <span className="text-sm font-medium text-success-800">Heart Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-success-900 mt-1">72 BPM</div>
                    <div className="text-xs text-success-700">Normal</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-primary-600" />
                      <span className="text-sm font-medium text-primary-800">AI Score</span>
                    </div>
                    <div className="text-2xl font-bold text-primary-900 mt-1">85%</div>
                    <div className="text-xs text-primary-700">Excellent</div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Recent Activity</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Medication taken on time</span>
                      <span className="text-xs text-gray-500 ml-auto">2 min ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Doctor appointment tomorrow</span>
                      <span className="text-xs text-gray-500 ml-auto">1 hour ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-200"
            >
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-medium text-gray-900">Emergency ID</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">QR Code Ready</div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-200"
            >
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-success-600" />
                <span className="text-sm font-medium text-gray-900">AI Insight</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">Risk Assessment</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
