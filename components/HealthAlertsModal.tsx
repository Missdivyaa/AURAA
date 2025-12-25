'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, 
  X, 
  Calendar, 
  Heart, 
  Clock,
  User,
  ChevronRight
} from 'lucide-react'

export interface HealthAlert {
  id: string
  type: 'low_health_score' | 'overdue_checkup' | 'urgent_appointment' | 'no_checkup' | 'medication_due'
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  memberName?: string
  memberId?: string
  date?: string
  actionUrl?: string
  actionText?: string
}

interface HealthAlertsModalProps {
  isOpen: boolean
  onClose: () => void
  alerts: HealthAlert[]
  totalAlerts: number
}

export default function HealthAlertsModal({ isOpen, onClose, alerts, totalAlerts }: HealthAlertsModalProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-800'
        }
      case 'medium':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: 'text-orange-600',
          badge: 'bg-orange-100 text-orange-800'
        }
      default:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-800'
        }
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'urgent_appointment':
      case 'overdue_checkup':
        return Calendar
      case 'low_health_score':
        return Heart
      case 'medication_due':
        return Clock
      default:
        return AlertTriangle
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'High Priority'
      case 'medium':
        return 'Medium Priority'
      default:
        return 'Low Priority'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Health Alerts</h2>
                      <p className="text-orange-100 text-sm mt-1">
                        {totalAlerts} {totalAlerts === 1 ? 'alert' : 'alerts'} requiring attention
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {alerts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">All Good!</h3>
                    <p className="text-gray-600">No health alerts at this time.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert, index) => {
                      const colors = getSeverityColor(alert.severity)
                      const Icon = getAlertIcon(alert.type)
                      
                      return (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`${colors.bg} ${colors.border} border rounded-xl p-5 hover:shadow-md transition-all duration-300`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-6 h-6 ${colors.icon}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                                    <span className={`${colors.badge} text-xs font-medium px-2 py-0.5 rounded-full`}>
                                      {getSeverityLabel(alert.severity)}
                                    </span>
                                  </div>
                                  {alert.memberName && (
                                    <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                                      <User className="w-4 h-4" />
                                      <span>{alert.memberName}</span>
                                    </div>
                                  )}
                                  <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                                  {alert.date && (
                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                      <Clock className="w-3 h-3" />
                                      <span>{alert.date}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {alert.actionUrl && alert.actionText && (
                                <a
                                  href={alert.actionUrl}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    onClose()
                                    // Small delay to allow modal to close smoothly
                                    setTimeout(() => {
                                      window.location.href = alert.actionUrl!
                                    }, 200)
                                  }}
                                  className="inline-flex items-center space-x-1 text-sm font-medium text-primary-600 hover:text-primary-700 mt-2 transition-colors"
                                >
                                  <span>{alert.actionText}</span>
                                  <ChevronRight className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <button
                  onClick={onClose}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

