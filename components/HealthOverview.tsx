'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@clerk/nextjs'
import { 
  Heart, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Pill
} from 'lucide-react'
import HealthAlertsModal, { HealthAlert } from './HealthAlertsModal'
import UpcomingAppointmentsModal, { UpcomingAppointment } from './UpcomingAppointmentsModal'
import { graphqlRequest } from '@/lib/graphql-client'

const GET_UPCOMING_APPOINTMENTS = `
  query GetUpcomingAppointments {
    appointments {
      id
      doctorName
      specialty
      hospital
      date
      time
      notes
      status
      memberId
      member {
        id
        name
      }
    }
  }
`

interface FamilyMember {
  id: string
  name: string
  age: number
  relationship: string
  avatar: string
  healthScore: number
  lastCheckup: string
  nextAppointment: string
  medications: number
  conditions: string[]
  status: 'excellent' | 'good' | 'fair' | 'poor'
}

interface DashboardStats {
  totalMembers: number
  averageHealthScore: number
  totalMedications: number
  upcomingAppointments: number
  healthAlerts: number
}

interface HealthOverviewProps {
  familyMembers: FamilyMember[]
  dashboardStats?: DashboardStats | null
}

export default function HealthOverview({ familyMembers, dashboardStats }: HealthOverviewProps) {
  const [showAlertsModal, setShowAlertsModal] = useState(false)
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false)
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const { getToken } = useAuth()

  // Fetch appointments on mount and when dashboard stats change to keep count accurate
  useEffect(() => {
    fetchUpcomingAppointments()
  }, [dashboardStats?.upcomingAppointments])

  // Always fetch fresh appointments when modal opens
  useEffect(() => {
    if (showAppointmentsModal) {
      fetchUpcomingAppointments()
    }
  }, [showAppointmentsModal])

  const fetchUpcomingAppointments = async () => {
    try {
      setLoadingAppointments(true)
      const token = await getToken()
      if (!token) {
        console.warn('No auth token available')
        return
      }

      console.log('🔄 Fetching upcoming appointments...')
      const data = await graphqlRequest(GET_UPCOMING_APPOINTMENTS, {}, token)
      
      console.log('📅 Raw appointments data:', data)
      
      if (data?.appointments) {
        const now = new Date()
        
        // Helper function to check if appointment date/time has passed
        const isAppointmentPast = (appt: any): boolean => {
          try {
            const dateStr = appt.date
            const timeStr = appt.time || '10:00 AM'
            
            // Parse time string (handle both 12-hour and 24-hour formats)
            let hours = 0
            let minutes = 0
            
            if (timeStr.includes('AM') || timeStr.includes('PM')) {
              const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
              if (timeMatch) {
                hours = parseInt(timeMatch[1])
                minutes = parseInt(timeMatch[2])
                const period = timeMatch[3].toUpperCase()
                
                if (period === 'PM' && hours !== 12) hours += 12
                if (period === 'AM' && hours === 12) hours = 0
              }
            } else {
              const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/)
              if (timeMatch) {
                hours = parseInt(timeMatch[1])
                minutes = parseInt(timeMatch[2])
              }
            }
            
            const apptDate = new Date(dateStr)
            apptDate.setHours(hours, minutes, 0, 0)
            
            return apptDate.getTime() < now.getTime()
          } catch (error) {
            console.error('Error checking appointment date:', error)
            return false
          }
        }
        
        const upcoming = data.appointments
          .map((appt: any) => {
            try {
              const isPast = isAppointmentPast(appt)
              const isNotCancelled = appt.status?.toLowerCase() !== 'cancelled' && appt.status?.toLowerCase() !== 'completed'
              const isActive = appt.status?.toLowerCase() === 'scheduled' || appt.status?.toLowerCase() === 'confirmed' || appt.status?.toLowerCase() === 'rescheduled'
              
              return {
                appt,
                isUpcoming: isActive && !isPast && isNotCancelled,
                apptDate: new Date(appt.date)
              }
            } catch (error) {
              console.error('Error parsing appointment date:', appt.date, error)
              return { appt, isUpcoming: false, apptDate: null }
            }
          })
          .filter((item: any) => item.isUpcoming)
          .map((item: any) => ({
            id: item.appt.id,
            doctorName: item.appt.doctorName || 'Doctor',
            specialty: item.appt.specialty || 'General',
            hospital: item.appt.hospital || undefined,
            date: item.appt.date,
            time: item.appt.time || '10:00 AM',
            notes: item.appt.notes || undefined,
            status: item.appt.status || 'scheduled',
            memberName: item.appt.member?.name,
            memberId: item.appt.memberId
          }))
        
        console.log(`✅ Found ${upcoming.length} upcoming appointments:`, upcoming)
        setUpcomingAppointments(upcoming)
      } else {
        console.warn('No appointments data in response')
        setUpcomingAppointments([])
      }
    } catch (error) {
      console.error('❌ Error fetching upcoming appointments:', error)
      setUpcomingAppointments([])
    } finally {
      setLoadingAppointments(false)
    }
  }
  
  // Use backend stats if available, otherwise calculate from family members
  const totalMembers = dashboardStats?.totalMembers ?? familyMembers.length
  const averageHealthScore = dashboardStats?.averageHealthScore ?? 
    (familyMembers.length > 0 
      ? Math.round(familyMembers.reduce((sum, member) => sum + member.healthScore, 0) / familyMembers.length)
      : 0)
  const totalMedications = dashboardStats?.totalMedications ?? 
    familyMembers.reduce((sum, member) => sum + member.medications, 0)
  // Calculate upcoming appointments count
  // Use fetched appointments if available (more accurate), otherwise use dashboard stats or calculate from members
  const upcomingAppointmentsCount = upcomingAppointments.length > 0 
    ? upcomingAppointments.length 
    : (dashboardStats?.upcomingAppointments ?? 
      familyMembers.filter(member => {
        if (!member.nextAppointment || member.nextAppointment.trim() === '') return false
        try {
          const nextAppointment = new Date(member.nextAppointment)
          const today = new Date()
          const diffTime = nextAppointment.getTime() - today.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          return diffDays <= 30 && diffDays >= 0
        } catch {
          return false
        }
      }).length)

  // Generate detailed alerts from family member data
  const generateDetailedAlerts = (): HealthAlert[] => {
    const alerts: HealthAlert[] = []
    const now = Date.now()
    
    familyMembers.forEach(member => {
      // Low health score alert
      if (member.status === 'poor' || member.status === 'fair') {
        alerts.push({
          id: `low-health-${member.id}`,
          type: 'low_health_score',
          severity: member.status === 'poor' ? 'high' : 'medium',
          title: `${member.status === 'poor' ? 'Low' : 'Fair'} Health Score`,
          description: `${member.name} has a health score of ${member.healthScore}%, which requires attention. Consider scheduling a checkup or reviewing their health conditions.`,
          memberName: member.name,
          memberId: member.id,
          actionUrl: `/dashboard?tab=overview&memberId=${member.id}&highlight=health`,
          actionText: 'View Health Details'
        })
      }
      
      // Overdue checkup alert
      if (member.lastCheckup && member.lastCheckup.trim() !== '') {
        try {
          const checkupDate = new Date(member.lastCheckup)
          const daysSince = Math.floor((now - checkupDate.getTime()) / (1000 * 60 * 60 * 24))
          if (daysSince > 365) {
            alerts.push({
              id: `overdue-checkup-${member.id}`,
              type: 'overdue_checkup',
              severity: daysSince > 730 ? 'high' : 'medium',
              title: 'Overdue Checkup',
              description: `${member.name}'s last checkup was ${Math.floor(daysSince / 30)} months ago. It's recommended to schedule a routine checkup annually.`,
              memberName: member.name,
              memberId: member.id,
              date: `${Math.floor(daysSince / 30)} months ago`,
              actionUrl: `/appointments?memberId=${member.id}&action=schedule`,
              actionText: 'Schedule Appointment'
            })
          }
        } catch (error) {
          // Invalid date - no checkup recorded
          alerts.push({
            id: `no-checkup-${member.id}`,
            type: 'no_checkup',
            severity: 'medium',
            title: 'No Checkup Recorded',
            description: `No recent checkup date found for ${member.name}. Consider scheduling a routine health checkup.`,
            memberName: member.name,
            memberId: member.id,
            actionUrl: `/appointments?memberId=${member.id}&action=schedule`,
            actionText: 'Schedule Appointment'
          })
        }
      } else {
        // No checkup date
        alerts.push({
          id: `no-checkup-${member.id}`,
          type: 'no_checkup',
          severity: 'medium',
          title: 'No Checkup Recorded',
          description: `No recent checkup date found for ${member.name}. Consider scheduling a routine health checkup.`,
          memberName: member.name,
          memberId: member.id,
          actionUrl: `/appointments?memberId=${member.id}&action=schedule`,
          actionText: 'Schedule Appointment'
        })
      }
      
      // Urgent upcoming appointment alert
      if (member.nextAppointment && member.nextAppointment.trim() !== '') {
        try {
          const appointmentDate = new Date(member.nextAppointment)
          const daysTo = Math.floor((appointmentDate.getTime() - now) / (1000 * 60 * 60 * 24))
          if (daysTo <= 7 && daysTo >= 0) {
            alerts.push({
              id: `urgent-appointment-${member.id}`,
              type: 'urgent_appointment',
              severity: daysTo <= 2 ? 'high' : 'medium',
              title: 'Upcoming Appointment Soon',
              description: `${member.name} has an appointment ${daysTo === 0 ? 'today' : daysTo === 1 ? 'tomorrow' : `in ${daysTo} days`}. Make sure to prepare and attend.`,
              memberName: member.name,
              memberId: member.id,
              date: daysTo === 0 ? 'Today' : daysTo === 1 ? 'Tomorrow' : `In ${daysTo} days`,
              actionUrl: `/appointments?memberId=${member.id}&highlight=upcoming`,
              actionText: 'View Appointment'
            })
          }
        } catch (error) {
          // Invalid date doesn't create alert
        }
      }
    })
    
    // Sort by severity (high first)
    return alerts.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })
  }

  const detailedAlerts = generateDetailedAlerts()
  
  // Always use the actual alert count from generated alerts
  // This ensures the count matches exactly what's displayed in the modal
  // We ignore dashboardStats.healthAlerts because it may count differently
  const healthAlerts = detailedAlerts.length

  const overviewCards = [
    {
      title: 'Average Health Score',
      value: `${averageHealthScore}%`,
      icon: Heart,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      trend: '+2%',
      trendColor: 'text-green-600'
    },
    {
      title: 'Total Medications',
      value: totalMedications.toString(),
      icon: Pill,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trend: 'Stable',
      trendColor: 'text-gray-600'
    },
    {
      title: 'Upcoming Appointments',
      value: upcomingAppointmentsCount.toString(),
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      trend: 'Next 30 days',
      trendColor: 'text-purple-600'
    },
    {
      title: 'Health Alerts',
      value: healthAlerts.toString(),
      icon: AlertTriangle,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      trend: healthAlerts > 0 ? 'Needs attention' : 'All good',
      trendColor: healthAlerts > 0 ? 'text-orange-600' : 'text-green-600',
      clickable: healthAlerts > 0
    }
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl p-8 shadow-lg"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Family Health Overview</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewCards.map((card, index) => {
            const Icon = card.icon
            const isClickable = card.title === 'Total Medications' || 
                               (card.title === 'Health Alerts' && card.clickable) ||
                               (card.title === 'Upcoming Appointments' && parseInt(card.value) > 0)
            
            const handleCardClick = () => {
              if (card.title === 'Health Alerts' && card.clickable) {
                setShowAlertsModal(true)
              } else if (card.title === 'Upcoming Appointments' && parseInt(card.value) > 0) {
                setShowAppointmentsModal(true)
              }
            }
            
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={handleCardClick}
                className={`${card.bgColor} p-6 rounded-xl hover:shadow-lg transition-all duration-300 card-hover group ${isClickable ? 'cursor-pointer' : ''}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${card.trendColor}`}>
                        {card.trend}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {card.value}
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {card.title}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Health Alerts Modal */}
      <HealthAlertsModal
        isOpen={showAlertsModal}
        onClose={() => setShowAlertsModal(false)}
        alerts={detailedAlerts}
        totalAlerts={detailedAlerts.length}
      />

      {/* Upcoming Appointments Modal */}
      <UpcomingAppointmentsModal
        isOpen={showAppointmentsModal}
        onClose={() => setShowAppointmentsModal(false)}
        appointments={upcomingAppointments}
        totalCount={upcomingAppointments.length}
        loading={loadingAppointments}
      />

      {/* Health Status Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-2xl p-8 shadow-lg"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">Family Health Status</h3>
        
        <div className="space-y-4">
          {familyMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{member.name}</h4>
                  <div className="flex items-center space-x-2">
                    {member.status === 'excellent' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {member.status === 'good' && <Heart className="w-5 h-5 text-blue-500" />}
                    {(member.status === 'fair' || member.status === 'poor') && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                    <span className="text-sm font-medium text-gray-600">{member.healthScore}%</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-600">{member.relationship}</span>
                  <span className="text-sm text-gray-600">•</span>
                  <span className="text-sm text-gray-600">{member.age} years</span>
                  {member.medications > 0 && (
                    <>
                      <span className="text-sm text-gray-600">•</span>
                      <a href={`/medications?memberId=${member.id}`} className="text-sm text-primary-700 hover:underline">
                        {member.medications} medications
                      </a>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
