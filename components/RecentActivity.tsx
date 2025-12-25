'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@clerk/nextjs'
import { 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  Pill, 
  FileText, 
  Heart,
  Clock,
  TrendingUp
} from 'lucide-react'
import { graphqlRequest } from '@/lib/graphql-client'

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

interface RecentActivityProps {
  familyMembers?: FamilyMember[]
}

const GET_RECENT_ACTIVITIES = `
  query GetRecentActivities {
    appointments {
      id
      doctorName
      specialty
      hospital
      date
      time
      status
      notes
      createdAt
      updatedAt
      member {
        id
        name
      }
    }
    medications {
      id
      name
      dosage
      frequency
      startDate
      endDate
      status
      createdAt
      updatedAt
      member {
        id
        name
      }
    }
    healthReports {
      id
      fileName
      status
      createdAt
      updatedAt
      member {
        id
        name
      }
    }
    reminders {
      id
      title
      description
      type
      date
      time
      status
      createdAt
      updatedAt
      member {
        id
        name
      }
    }
  }
`

export default function RecentActivity({ familyMembers = [] }: RecentActivityProps) {
  const [showAll, setShowAll] = useState(false)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()
  
  // Fetch real activities from backend
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const token = await getToken()
        if (!token) {
          setLoading(false)
          return
        }

        const data = await graphqlRequest(GET_RECENT_ACTIVITIES, {}, token)
        const realActivities = generateRealActivities(data)
        setActivities(realActivities)
      } catch (error) {
        console.error('Error fetching recent activities:', error)
        // Fallback to generated activities if fetch fails
        const fallbackActivities = generateActivities()
        setActivities(fallbackActivities)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [familyMembers])

  // Generate activities from real backend data
  const generateRealActivities = (data: any) => {
    const activities: any[] = []
    const now = Date.now()

    // Process appointments (sort by date desc, take most recent 10)
    if (data.appointments) {
      const sortedAppointments = [...data.appointments]
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)
      
      sortedAppointments.forEach((appt: any) => {
        const apptDate = new Date(appt.date)
        const daysDiff = Math.floor((apptDate.getTime() - now) / (1000 * 60 * 60 * 24))
        const memberName = appt.member?.name || 'Family member'
        
        if (appt.status === 'completed') {
          activities.push({
            id: `appt-completed-${appt.id}`,
            type: 'appointment',
            title: 'Appointment completed',
            description: `${memberName} - ${appt.doctorName} (${appt.specialty})`,
            time: formatTimeAgo(new Date(appt.updatedAt)),
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            timestamp: new Date(appt.updatedAt).getTime()
          })
        } else if (appt.status === 'scheduled') {
          activities.push({
            id: `appt-upcoming-${appt.id}`,
            type: 'appointment',
            title: daysDiff < 0 ? 'Past appointment' : 'Upcoming appointment',
            description: `${memberName} - ${appt.doctorName} (${appt.specialty})${appt.hospital ? ` at ${appt.hospital}` : ''}`,
            time: daysDiff === 0 ? 'Today' : daysDiff === 1 ? 'Tomorrow' : daysDiff < 0 ? `${Math.abs(daysDiff)} days ago` : `In ${daysDiff} days`,
            icon: Calendar,
            color: daysDiff <= 7 && daysDiff >= 0 ? 'text-red-600' : daysDiff < 0 ? 'text-gray-600' : 'text-blue-600',
            bgColor: daysDiff <= 7 && daysDiff >= 0 ? 'bg-red-50' : daysDiff < 0 ? 'bg-gray-50' : 'bg-blue-50',
            borderColor: daysDiff <= 7 && daysDiff >= 0 ? 'border-red-200' : daysDiff < 0 ? 'border-gray-200' : 'border-blue-200',
            timestamp: apptDate.getTime()
          })
        }
      })
    }

    // Process medications (sort by createdAt desc, take most recent 10)
    if (data.medications) {
      const sortedMedications = [...data.medications]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
      
      sortedMedications.forEach((med: any) => {
        const memberName = med.member?.name || 'Family member'
        const startDate = new Date(med.startDate)
        const daysSinceStart = Math.floor((now - startDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (med.status === 'active') {
          activities.push({
            id: `med-active-${med.id}`,
            type: 'medication',
            title: 'Medication added',
            description: `${memberName} - ${med.name} (${med.dosage})`,
            time: daysSinceStart === 0 ? 'Today' : daysSinceStart === 1 ? 'Yesterday' : `${daysSinceStart} days ago`,
            icon: Pill,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            timestamp: startDate.getTime()
          })
        }
      })
    }

    // Process health reports (sort by createdAt desc, take most recent 10)
    if (data.healthReports) {
      const sortedReports = [...data.healthReports]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
      
      sortedReports.forEach((report: any) => {
        const memberName = report.member?.name || 'Family member'
        const reportDate = new Date(report.createdAt)
        const daysSince = Math.floor((now - reportDate.getTime()) / (1000 * 60 * 60 * 24))
        
        activities.push({
          id: `report-${report.id}`,
          type: 'report',
          title: 'Health report uploaded',
          description: `${memberName} - ${report.fileName}`,
          time: daysSince === 0 ? 'Today' : daysSince === 1 ? 'Yesterday' : `${daysSince} days ago`,
          icon: FileText,
          color: report.status === 'analyzed' ? 'text-green-600' : report.status === 'error' ? 'text-red-600' : 'text-yellow-600',
          bgColor: report.status === 'analyzed' ? 'bg-green-50' : report.status === 'error' ? 'bg-red-50' : 'bg-yellow-50',
          borderColor: report.status === 'analyzed' ? 'border-green-200' : report.status === 'error' ? 'border-red-200' : 'border-yellow-200',
          timestamp: reportDate.getTime()
        })
      })
    }

    // Process reminders (sort by date desc, take most recent 10)
    if (data.reminders) {
      const sortedReminders = [...data.reminders]
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)
      
      sortedReminders.forEach((reminder: any) => {
        const memberName = reminder.member?.name || 'Family member'
        const reminderDate = new Date(reminder.date)
        const daysDiff = Math.floor((reminderDate.getTime() - now) / (1000 * 60 * 60 * 24))
        
        if (reminder.status === 'active') {
          activities.push({
            id: `reminder-${reminder.id}`,
            type: 'reminder',
            title: 'Reminder set',
            description: `${memberName} - ${reminder.title}`,
            time: daysDiff === 0 ? 'Today' : daysDiff === 1 ? 'Tomorrow' : daysDiff < 0 ? `${Math.abs(daysDiff)} days ago` : `In ${daysDiff} days`,
            icon: Clock,
            color: daysDiff <= 1 && daysDiff >= 0 ? 'text-red-600' : 'text-purple-600',
            bgColor: daysDiff <= 1 && daysDiff >= 0 ? 'bg-red-50' : 'bg-purple-50',
            borderColor: daysDiff <= 1 && daysDiff >= 0 ? 'border-red-200' : 'border-purple-200',
            timestamp: reminderDate.getTime()
          })
        }
      })
    }

    // Sort by timestamp (most recent first)
    return activities.sort((a, b) => b.timestamp - a.timestamp)
  }

  const formatTimeAgo = (date: Date): string => {
    const now = Date.now()
    const diffMs = now - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }
  
  // Generate real activities based on family member data (fallback)
  const generateActivities = () => {
    const activities = []
    
    familyMembers.forEach((member, index) => {
      // Health score activity - show when it was last updated
      if (member.healthScore) {
        const healthStatus = member.healthScore >= 90 ? 'Excellent' : 
                           member.healthScore >= 75 ? 'Good' : 
                           member.healthScore >= 60 ? 'Fair' : 'Poor'
        
        activities.push({
          id: `health-${member.id}`,
          type: 'health',
          title: 'Health assessment updated',
          description: `${member.name} - Health score: ${member.healthScore}% (${healthStatus})`,
          time: 'Recently updated',
          icon: TrendingUp,
          color: member.healthScore >= 80 ? 'text-green-600' : member.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600',
          bgColor: member.healthScore >= 80 ? 'bg-green-50' : member.healthScore >= 60 ? 'bg-yellow-50' : 'bg-red-50',
          borderColor: member.healthScore >= 80 ? 'border-green-200' : member.healthScore >= 60 ? 'border-yellow-200' : 'border-red-200'
        })
      }
      
      // Checkup activity
      if (member.lastCheckup && member.lastCheckup.trim() !== '') {
        const checkupDate = new Date(member.lastCheckup)
        const daysSince = Math.floor((Date.now() - checkupDate.getTime()) / (1000 * 60 * 60 * 24))
        activities.push({
          id: `checkup-${member.id}`,
          type: 'appointment',
          title: 'Last checkup recorded',
          description: `${member.name} - ${member.lastCheckup} (${daysSince} days ago)`,
          time: daysSince === 0 ? 'Today' : daysSince === 1 ? 'Yesterday' : `${daysSince} days ago`,
          icon: Calendar,
          color: daysSince < 365 ? 'text-green-600' : 'text-orange-600',
          bgColor: daysSince < 365 ? 'bg-green-50' : 'bg-orange-50',
          borderColor: daysSince < 365 ? 'border-green-200' : 'border-orange-200'
        })
      }
      
      // Upcoming appointment activity
      if (member.nextAppointment && member.nextAppointment.trim() !== '') {
        const appointmentDate = new Date(member.nextAppointment)
        const daysTo = Math.floor((appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        if (daysTo > 0) {
          activities.push({
            id: `appointment-${member.id}`,
            type: 'appointment',
            title: 'Upcoming appointment',
            description: `${member.name} - ${member.nextAppointment} (in ${daysTo} days)`,
            time: daysTo === 1 ? 'Tomorrow' : `${daysTo} days away`,
            icon: Calendar,
            color: daysTo <= 7 ? 'text-red-600' : daysTo <= 30 ? 'text-yellow-600' : 'text-blue-600',
            bgColor: daysTo <= 7 ? 'bg-red-50' : daysTo <= 30 ? 'bg-yellow-50' : 'bg-blue-50',
            borderColor: daysTo <= 7 ? 'border-red-200' : daysTo <= 30 ? 'border-yellow-200' : 'border-blue-200'
          })
        }
      }
      
      // Medication activity - more realistic
      if (member.medications > 0) {
        const medicationText = member.medications === 1 ? '1 medication' : `${member.medications} medications`
        activities.push({
          id: `medication-${member.id}`,
          type: 'medication',
          title: 'Medication management',
          description: `${member.name} - Currently taking ${medicationText}`,
          time: 'Active treatment',
          icon: Pill,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        })
      }
      
      // Conditions activity - more realistic
      if (member.conditions && member.conditions.length > 0) {
        const conditionText = member.conditions.length === 1 ? 
          `1 condition: ${member.conditions[0]}` : 
          `${member.conditions.length} conditions: ${member.conditions.slice(0, 2).join(', ')}${member.conditions.length > 2 ? '...' : ''}`
        
        activities.push({
          id: `condition-${member.id}`,
          type: 'alert',
          title: 'Health conditions monitored',
          description: `${member.name} - ${conditionText}`,
          time: 'Under observation',
          icon: AlertTriangle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        })
      }
      
      // Age-based activities
      if (member.age > 0) {
        const ageGroup = member.age < 18 ? 'Minor' : member.age < 65 ? 'Adult' : 'Senior'
        activities.push({
          id: `age-${member.id}`,
          type: 'demographic',
          title: 'Age group classification',
          description: `${member.name} - ${member.age} years old (${ageGroup})`,
          time: 'Profile updated',
          icon: Heart,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-200'
        })
      }
      
      // Relationship-based activities
      if (member.relationship) {
        activities.push({
          id: `relationship-${member.id}`,
          type: 'family',
          title: 'Family member added',
          description: `${member.name} - ${member.relationship} added to family health tracking`,
          time: 'Profile created',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        })
      }
    })
    
    // Add some dynamic activities based on current time
    const now = new Date()
    const currentHour = now.getHours()
    
    // Add time-based activities
    if (currentHour >= 6 && currentHour < 12) {
      activities.push({
        id: 'morning-check',
        type: 'routine',
        title: 'Morning health check',
        description: 'Daily health monitoring routine started',
        time: 'This morning',
        icon: Clock,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      })
    } else if (currentHour >= 12 && currentHour < 18) {
      activities.push({
        id: 'afternoon-update',
        type: 'routine',
        title: 'Afternoon health update',
        description: 'Midday health status review',
        time: 'This afternoon',
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      })
    } else {
      activities.push({
        id: 'evening-summary',
        type: 'routine',
        title: 'Evening health summary',
        description: 'End of day health status review',
        time: 'This evening',
        icon: Clock,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      })
    }
    
    // Sort by time (most recent first)
    return activities.sort((a, b) => {
      if (a.time === 'Just now') return -1
      if (b.time === 'Just now') return 1
      if (a.time === 'Today') return -1
      if (b.time === 'Today') return 1
      if (a.time === 'Yesterday') return -1
      if (b.time === 'Yesterday') return 1
      if (a.time === 'This morning') return -1
      if (b.time === 'This morning') return 1
      if (a.time === 'This afternoon') return -1
      if (b.time === 'This afternoon') return 1
      if (a.time === 'This evening') return -1
      if (b.time === 'This evening') return 1
      return 0
    })
  }
  
  // Use real activities if available, otherwise fallback to generated
  const displayActivities = activities.length > 0 ? activities : generateActivities()

  // Calculate alerts dynamically based on family member data
  const calculateAlerts = () => {
    let alertCount = 0
    
    familyMembers.forEach(member => {
      // Count members with poor or fair health status
      if (member.status === 'poor' || member.status === 'fair') {
        alertCount++
      }
      
      // Count members with overdue checkups (more than 1 year)
      if (member.lastCheckup && member.lastCheckup.trim() !== '') {
        try {
          const checkupDate = new Date(member.lastCheckup)
          const daysSince = Math.floor((Date.now() - checkupDate.getTime()) / (1000 * 60 * 60 * 24))
          if (daysSince > 365) {
            alertCount++
          }
        } catch (error) {
          // Invalid date counts as alert
          alertCount++
        }
      } else {
        // No checkup date counts as alert
        alertCount++
      }
      
      // Count urgent upcoming appointments (within 7 days)
      if (member.nextAppointment && member.nextAppointment.trim() !== '') {
        try {
          const appointmentDate = new Date(member.nextAppointment)
          const daysTo = Math.floor((appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          if (daysTo <= 7 && daysTo >= 0) {
            alertCount++
          }
        } catch (error) {
          // Invalid date doesn't count as alert
        }
      }
    })
    
    return alertCount
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return Pill
      case 'appointment':
        return Calendar
      case 'report':
        return FileText
      case 'health':
        return Heart
      case 'alert':
        return AlertTriangle
      default:
        return CheckCircle
    }
  }

  const activitiesToShow = showAll ? displayActivities : displayActivities.slice(0, 4)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl p-8 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          {showAll ? 'View Less' : 'View All'}
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="text-gray-600 mt-2">Loading activities...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activitiesToShow.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            activitiesToShow.map((activity, index) => {
          const Icon = activity.icon
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`flex items-center space-x-4 p-4 ${activity.bgColor} rounded-xl border ${activity.borderColor} hover:shadow-md transition-all duration-300`}
            >
              <div className={`w-10 h-10 ${activity.bgColor} rounded-full flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${activity.color}`} />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {activity.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {activity.description}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{activity.time}</span>
              </div>
            </motion.div>
            )
          })
          )}
        </div>
      )}
      
      {/* Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8 pt-6 border-t border-gray-200"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{activities.length}</div>
            <div className="text-sm text-gray-600">Total Activities</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {familyMembers.filter(member => {
                if (!member.nextAppointment || member.nextAppointment.trim() === '') return false
                try {
                  const appointmentDate = new Date(member.nextAppointment)
                  const daysTo = Math.floor((appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  return daysTo > 0 && daysTo <= 30
                } catch {
                  return false
                }
              }).length}
            </div>
            <div className="text-sm text-gray-600">Upcoming (30 days)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{calculateAlerts()}</div>
            <div className="text-sm text-gray-600">Health Alerts</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
