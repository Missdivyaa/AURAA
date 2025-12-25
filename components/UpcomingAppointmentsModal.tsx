'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  X, 
  Clock,
  MapPin,
  User,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export interface UpcomingAppointment {
  id: string
  doctorName: string
  specialty: string
  hospital?: string
  date: string
  time: string
  notes?: string
  status: string
  memberName?: string
  memberId?: string
}

interface UpcomingAppointmentsModalProps {
  isOpen: boolean
  onClose: () => void
  appointments: UpcomingAppointment[]
  totalCount: number
}

export default function UpcomingAppointmentsModal({ isOpen, onClose, appointments, totalCount, loading = false }: UpcomingAppointmentsModalProps) {
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      const dateOnly = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      const todayStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      const tomorrowStr = tomorrow.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      
      if (dateOnly === todayStr) return `Today, ${dateStr}`
      if (dateOnly === tomorrowStr) return `Tomorrow, ${dateStr}`
      return dateStr
    } catch {
      return dateString
    }
  }

  const getDaysUntil = (dateString: string): number => {
    try {
      const date = new Date(dateString)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      date.setHours(0, 0, 0, 0)
      const diffTime = date.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return 0
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-800'
        }
      case 'confirmed':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          badge: 'bg-green-100 text-green-800'
        }
      case 'rescheduled':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-800'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-800'
        }
    }
  }

  // Sort appointments by date (soonest first)
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateA - dateB
  })

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
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Upcoming Appointments</h2>
                      <p className="text-purple-100 text-sm mt-1">
                        {totalCount} {totalCount === 1 ? 'appointment' : 'appointments'} scheduled
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
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-600">Loading appointments...</p>
                  </div>
                ) : sortedAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Appointments</h3>
                    <p className="text-gray-600 mb-4">You don't have any scheduled appointments.</p>
                    <a
                      href="/appointments"
                      onClick={onClose}
                      className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <span>Schedule an Appointment</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedAppointments.map((appointment, index) => {
                      const colors = getStatusColor(appointment.status)
                      const daysUntil = getDaysUntil(appointment.date)
                      const isUrgent = daysUntil <= 2 && daysUntil >= 0
                      
                      return (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`${colors.bg} ${colors.border} border rounded-xl p-5 hover:shadow-md transition-all duration-300 ${isUrgent ? 'ring-2 ring-red-200' : ''}`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <Calendar className={`w-6 h-6 ${colors.icon}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="font-semibold text-gray-900">{appointment.doctorName}</h3>
                                    <span className={`${colors.badge} text-xs font-medium px-2 py-0.5 rounded-full capitalize`}>
                                      {appointment.status}
                                    </span>
                                    {isUrgent && (
                                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                        {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {appointment.memberName && (
                                    <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                                      <User className="w-4 h-4" />
                                      <span>{appointment.memberName}</span>
                                    </div>
                                  )}
                                  
                                  <div className="space-y-1.5">
                                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                                      <span className="font-medium">Specialty:</span>
                                      <span>{appointment.specialty}</span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                                      <Clock className="w-4 h-4 text-gray-400" />
                                      <span className="font-medium">{formatDate(appointment.date)}</span>
                                      <span className="text-gray-500">at</span>
                                      <span className="font-medium">{appointment.time}</span>
                                    </div>
                                    
                                    {appointment.hospital && (
                                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{appointment.hospital}</span>
                                      </div>
                                    )}
                                    
                                    {appointment.notes && (
                                      <div className="mt-2 pt-2 border-t border-gray-200">
                                        <p className="text-sm text-gray-600">{appointment.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <a
                                href={`/appointments?highlight=${appointment.id}`}
                                onClick={(e) => {
                                  e.preventDefault()
                                  onClose()
                                  setTimeout(() => {
                                    window.location.href = `/appointments?highlight=${appointment.id}`
                                  }, 200)
                                }}
                                className="inline-flex items-center space-x-1 text-sm font-medium text-primary-600 hover:text-primary-700 mt-2 transition-colors"
                              >
                                <span>View Details</span>
                                <ChevronRight className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
                <a
                  href="/appointments"
                  onClick={onClose}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All Appointments →
                </a>
                <button
                  onClick={onClose}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-xl transition-colors"
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

