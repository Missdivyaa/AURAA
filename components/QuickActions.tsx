'use client'

import { motion } from 'framer-motion'
import { 
  Plus, 
  Calendar, 
  Pill, 
  FileText, 
  Bell, 
  QrCode,
  Activity,
  Stethoscope,
  Brain,
  Shield
} from 'lucide-react'

export default function QuickActions() {
  const actions = [
    {
      title: 'Add Medication',
      description: 'Record new medication',
      icon: Pill,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      href: '/medications/add'
    },
    {
      title: 'Schedule Appointment',
      description: 'Book doctor visit',
      icon: Calendar,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      href: '/appointments/schedule'
    },
    {
      title: 'Upload Report',
      description: 'Add lab results',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      href: '/reports/upload'
    },
    {
      title: 'Set Reminder',
      description: 'Create health reminder',
      icon: Bell,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      href: '/reminders?action=create'
    },
    {
      title: 'Emergency ID',
      description: 'View QR code',
      icon: QrCode,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      href: '/emergency-id'
    },
    {
      title: 'AI Insights',
      description: 'Get health analysis',
      icon: Brain,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      href: '/ai-insights'
    },
    {
      title: 'Wearable Sync',
      description: 'Connect device',
      icon: Activity,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      href: '/wearables'
    },
    {
      title: 'Symptom Check',
      description: 'AI symptom analysis',
      icon: Stethoscope,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
      href: '/ai-insights?tab=symptoms'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl p-8 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Shield className="w-4 h-4" />
          <span>Secure & Private</span>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.a
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              href={action.href}
              className={`${action.bgColor} p-6 rounded-xl hover:shadow-lg transition-all duration-300 card-hover group text-left w-full`}
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-800 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {action.description}
                  </p>
                </div>
              </div>
            </motion.a>
          )
        })}
      </div>
    </motion.div>
  )
}
