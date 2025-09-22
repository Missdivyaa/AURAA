'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  Shield, 
  Brain, 
  Heart,
  Zap,
  Lock,
  Clock
} from 'lucide-react'

export default function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const stats = [
    {
      icon: Shield,
      value: 'Open‑source',
      label: 'Project Type',
      description: 'Student‑built, community‑friendly',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Brain,
      value: 'AI‑ready',
      label: 'Insights',
      description: 'Predictive analytics scaffolding',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Heart,
      value: 'Family',
      label: 'Focus',
      description: 'Multi‑member health management',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Zap,
      value: 'Reminders',
      label: 'Care',
      description: 'Medication & appointments',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Lock,
      value: 'Private',
      label: 'Security',
      description: 'Strong encryption approach',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: Clock,
      value: 'Free',
      label: 'Pricing',
      description: 'No fees — built to help',
      color: 'from-blue-500 to-blue-600'
    }
  ]

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Designed to Protect,{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Built to Serve
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our health monitoring platform combines advanced AI with robust security 
            to provide reliable emergency response and health tracking.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 card-hover group"
              >
                <div className="space-y-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : { scale: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                      className="text-3xl lg:text-4xl font-bold text-gray-900"
                    >
                      {stat.value}
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-gray-900">
                      {stat.label}
                    </h3>
                    
                    <p className="text-gray-600">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}