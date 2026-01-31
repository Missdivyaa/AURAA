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
  TrendingUp,
  X
} from 'lucide-react'
import { graphqlRequest } from '@/lib/graphql-client'
import { notificationService } from '@/lib/notification-service'

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
      frequency
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

const MARK_APPOINTMENT_COMPLETED = `
  mutation MarkAppointmentCompleted($id: ID!, $notes: String) {
    markAppointmentCompleted(id: $id, notes: $notes) {
      id
      status
    }
  }
`

const CANCEL_APPOINTMENT = `
  mutation CancelAppointment($id: ID!, $reason: String) {
    cancelAppointment(id: $id, reason: $reason) {
      id
      status
    }
  }
`

export default function RecentActivity({ familyMembers = [] }: RecentActivityProps) {
  const [showAll, setShowAll] = useState(false)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()
  
  // Notification state for appointments
  const [notifiedAppointments, setNotifiedAppointments] = useState<Set<string>>(new Set())
  
  // Check for appointment notifications (1 hour before) using notification service
  useEffect(() => {
    const checkAppointmentNotifications = async () => {
      const now = Date.now()
      
      activities.forEach(async (activity) => {
        if (activity.type === 'appointment' && activity.title === 'Upcoming appointment' && activity.timestamp) {
          const timeUntil = activity.timestamp - now
          const hoursUntil = timeUntil / (1000 * 60 * 60)
          
          // If appointment is within 1 hour and hasn't been notified yet
          if (hoursUntil > 0 && hoursUntil <= 1 && !notifiedAppointments.has(activity.id)) {
            // Extract appointment details from description
            const match = activity.description.match(/(.+?) - (.+?) \((.+?)\)/)
            const memberName = match ? match[1] : 'Family member'
            const doctorName = match ? match[2] : 'Doctor'
            const specialty = match ? match[3] : ''
            
            // Use notification service for background notifications
            await notificationService.scheduleAppointmentReminder(
              activity.appointmentId || activity.id,
              activity.timestamp,
              doctorName,
              specialty,
              memberName
            )
            
            // Mark as notified
            setNotifiedAppointments(prev => new Set(prev).add(activity.id))
          }
        }
      })
    }
    
    // Check every minute
    const interval = setInterval(checkAppointmentNotifications, 60000)
    checkAppointmentNotifications() // Check immediately
    
    return () => clearInterval(interval)
  }, [activities, notifiedAppointments])

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
        // Don't show fallback activities - show empty state instead
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
    
    // Refresh activities every 5 minutes to catch missed appointments
    const interval = setInterval(fetchActivities, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [familyMembers, getToken])
  
  // Handle marking appointment as completed
  const handleMarkCompleted = async (appointmentId: string) => {
    try {
      const token = await getToken()
      if (!token) {
        return
      }
      
      // Mark as completed without asking for notes
      await graphqlRequest(MARK_APPOINTMENT_COMPLETED, { id: appointmentId, notes: '' }, token)
      
      // Refresh activities
      const data = await graphqlRequest(GET_RECENT_ACTIVITIES, {}, token)
      const realActivities = generateRealActivities(data)
      setActivities(realActivities)
    } catch (error) {
      console.error('Error marking appointment as completed:', error)
    }
  }
  
  // Handle marking appointment as missed/cancelled
  const handleMarkMissed = async (appointmentId: string) => {
    try {
      const token = await getToken()
      if (!token) {
        return
      }
      
      // Mark as missed without asking for reason
      await graphqlRequest(CANCEL_APPOINTMENT, { id: appointmentId, reason: 'Missed' }, token)
      
      // Refresh activities
      const data = await graphqlRequest(GET_RECENT_ACTIVITIES, {}, token)
      const realActivities = generateRealActivities(data)
      setActivities(realActivities)
    } catch (error) {
      console.error('Error marking appointment as missed:', error)
    }
  }

  // Generate activities from real backend data
  const generateRealActivities = (data: any) => {
    const activities: any[] = []
    const now = Date.now()
    const nowDate = new Date()
    nowDate.setHours(0, 0, 0, 0) // Set to start of day for accurate comparison (matches HealthOverview logic)
    
    // If no data provided, return empty array (no fallback activities)
    if (!data) {
      return []
    }

    // Process appointments (filter and sort properly)
    if (data.appointments) {
      
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
          
          // Create appointment datetime
          const appointmentDate = new Date(dateStr)
          appointmentDate.setHours(hours, minutes, 0, 0)
          
          // Compare with current time
          return appointmentDate.getTime() < now
        } catch (error) {
          console.error('Error checking appointment date:', error)
          return false
        }
      }
      
      // Separate completed, upcoming, past (missed), and needs confirmation
      const completedAppointments: any[] = []
      const upcomingAppointments: any[] = []
      const missedAppointments: any[] = []
      
      data.appointments.forEach((appt: any) => {
        try {
          const isPast = isAppointmentPast(appt)
          const isNotCancelled = appt.status?.toLowerCase() !== 'cancelled'
          const isCompleted = appt.status?.toLowerCase() === 'completed'
          
          if (isCompleted) {
            completedAppointments.push({ appt })
          } else if (isNotCancelled && !isPast) {
            // Future appointment - upcoming
            upcomingAppointments.push({ appt })
          } else if (isNotCancelled && isPast && !isCompleted) {
            // Past appointment that hasn't been marked as completed - missed
            missedAppointments.push({ appt })
          }
        } catch (error) {
          console.error('Error processing appointment:', appt, error)
        }
      })
      
      // Add completed appointments (most recent first, limit to 5)
      completedAppointments
        .sort((a, b) => new Date(b.appt.updatedAt).getTime() - new Date(a.appt.updatedAt).getTime())
        .slice(0, 5)
        .forEach(({ appt }) => {
          const memberName = appt.member?.name || 'Family member'
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
        })
      
      // Add missed appointments (most recent first, limit to 10)
      missedAppointments
        .sort((a, b) => {
          const aDate = new Date(a.appt.date)
          const bDate = new Date(b.appt.date)
          return bDate.getTime() - aDate.getTime()
        })
        .slice(0, 10)
        .forEach(({ appt }) => {
          const memberName = appt.member?.name || 'Family member'
          const apptDate = new Date(appt.date)
          const timeStr = appt.time || '10:00 AM'
          
          // Parse time
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
          
          apptDate.setHours(hours, minutes, 0, 0)
          
          activities.push({
            id: `appt-missed-${appt.id}`,
            type: 'appointment',
            title: 'Appointment missed',
            description: `${memberName} - ${appt.doctorName} (${appt.specialty})${appt.hospital ? ` at ${appt.hospital}` : ''} at ${timeStr}`,
            time: formatTimeAgo(apptDate),
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            timestamp: apptDate.getTime(),
            appointmentId: appt.id // Store ID for action buttons
          })
        })
      
      // Add upcoming appointments (soonest first, limit to 10)
      upcomingAppointments
        .sort((a, b) => {
          const aDate = new Date(a.appt.date)
          const bDate = new Date(b.appt.date)
          const aTime = a.appt.time || '10:00 AM'
          const bTime = b.appt.time || '10:00 AM'
          
          // Parse times
          const parseTime = (timeStr: string) => {
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
            return { hours, minutes }
          }
          
          const aTimeParsed = parseTime(aTime)
          const bTimeParsed = parseTime(bTime)
          aDate.setHours(aTimeParsed.hours, aTimeParsed.minutes, 0, 0)
          bDate.setHours(bTimeParsed.hours, bTimeParsed.minutes, 0, 0)
          
          return aDate.getTime() - bDate.getTime()
        })
        .slice(0, 10)
        .forEach(({ appt }) => {
          const memberName = appt.member?.name || 'Family member'
          const apptDate = new Date(appt.date)
          const timeStr = appt.time || '10:00 AM'
          
          // Parse time
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
          
          apptDate.setHours(hours, minutes, 0, 0)
          const hoursUntil = Math.floor((apptDate.getTime() - now) / (1000 * 60 * 60))
          const daysUntil = Math.floor((apptDate.getTime() - now) / (1000 * 60 * 60 * 24))
          
          // Check if appointment is within 1 hour (for notification)
          const isWithinOneHour = hoursUntil >= 0 && hoursUntil <= 1
          
          let timeText = ''
          if (daysUntil === 0) {
            if (hoursUntil <= 0) {
              timeText = 'Now'
            } else if (hoursUntil === 1) {
              timeText = 'In 1 hour'
            } else {
              timeText = `Today at ${timeStr}`
            }
          } else if (daysUntil === 1) {
            timeText = 'Tomorrow'
          } else {
            timeText = `In ${daysUntil} days`
          }
          
          activities.push({
            id: `appt-upcoming-${appt.id}`,
            type: 'appointment',
            title: isWithinOneHour ? 'Appointment soon' : 'Upcoming appointment',
            description: `${memberName} - ${appt.doctorName} (${appt.specialty})${appt.hospital ? ` at ${appt.hospital}` : ''} at ${timeStr}`,
            time: timeText,
            icon: Calendar,
            color: isWithinOneHour ? 'text-red-600' : daysUntil <= 7 ? 'text-orange-600' : 'text-blue-600',
            bgColor: isWithinOneHour ? 'bg-red-50' : daysUntil <= 7 ? 'bg-orange-50' : 'bg-blue-50',
            borderColor: isWithinOneHour ? 'border-red-200' : daysUntil <= 7 ? 'border-orange-200' : 'border-blue-200',
            timestamp: apptDate.getTime(),
            appointmentId: appt.id // Store ID for action buttons
          })
        })
    }

    // Process medications
    if (data.medications) {
      data.medications.forEach((med: any) => {
        const memberName = med.member?.name || 'Family member'
        const startDate = new Date(med.startDate)
        const updatedDate = new Date(med.updatedAt)
        const daysSinceStart = Math.floor((now - startDate.getTime()) / (1000 * 60 * 60 * 24))
        const daysSinceUpdate = Math.floor((now - updatedDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (med.status === 'completed') {
          // Medication marked as taken/completed
          activities.push({
            id: `med-taken-${med.id}`,
            type: 'medication',
            title: 'Medication taken',
            description: `${memberName} - ${med.name} (${med.dosage})`,
            time: formatTimeAgo(updatedDate),
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            timestamp: updatedDate.getTime()
          })
        } else if (med.status === 'active') {
          // Active medication added
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
        } else if (med.status === 'discontinued') {
          // Medication discontinued
          activities.push({
            id: `med-discontinued-${med.id}`,
            type: 'medication',
            title: 'Medication discontinued',
            description: `${memberName} - ${med.name} (${med.dosage})`,
            time: formatTimeAgo(updatedDate),
            icon: AlertTriangle,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            timestamp: updatedDate.getTime()
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

    // Process reminders
    if (data.reminders) {
      data.reminders.forEach((reminder: any) => {
        const memberName = reminder.member?.name || 'Family member'
        const reminderDate = new Date(reminder.date)
        const reminderTime = reminder.time || '10:00 AM'
        
        // Parse reminder time to create full datetime
        let reminderDateTime = new Date(reminderDate)
        try {
          // Parse time string (handle both 12-hour and 24-hour formats)
          let hours = 0
          let minutes = 0
          
          if (reminderTime.includes('AM') || reminderTime.includes('PM')) {
            const timeMatch = reminderTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
            if (timeMatch) {
              hours = parseInt(timeMatch[1])
              minutes = parseInt(timeMatch[2])
              const period = timeMatch[3].toUpperCase()
              
              if (period === 'PM' && hours !== 12) hours += 12
              if (period === 'AM' && hours === 12) hours = 0
            }
          } else {
            const timeMatch = reminderTime.match(/(\d{1,2}):(\d{2})/)
            if (timeMatch) {
              hours = parseInt(timeMatch[1])
              minutes = parseInt(timeMatch[2])
            }
          }
          
          reminderDateTime.setHours(hours, minutes, 0, 0)
        } catch (error) {
          // If parsing fails, use default time
          reminderDateTime.setHours(10, 0, 0, 0)
        }
        
        const reminderTimestamp = reminderDateTime.getTime()
        const isPast = reminderTimestamp < now
        const daysDiff = Math.floor((reminderTimestamp - now) / (1000 * 60 * 60 * 24))
        
        if (reminder.status === 'completed') {
          // Reminder completed/fulfilled
          activities.push({
            id: `reminder-completed-${reminder.id}`,
            type: 'reminder',
            title: 'Reminder completed',
            description: `${memberName} - ${reminder.title}`,
            time: formatTimeAgo(new Date(reminder.updatedAt)),
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            timestamp: new Date(reminder.updatedAt).getTime()
          })
        } else if (reminder.status === 'active') {
          if (isPast) {
            // Reminder missed (past date/time and still active)
            activities.push({
              id: `reminder-missed-${reminder.id}`,
              type: 'reminder',
              title: 'Reminder missed',
              description: `${memberName} - ${reminder.title} was not completed`,
              time: formatTimeAgo(reminderDateTime),
              icon: AlertTriangle,
              color: 'text-red-600',
              bgColor: 'bg-red-50',
              borderColor: 'border-red-200',
              timestamp: reminderTimestamp
            })
          } else {
            // Upcoming reminder
            activities.push({
              id: `reminder-upcoming-${reminder.id}`,
              type: 'reminder',
              title: 'Reminder set',
              description: `${memberName} - ${reminder.title}`,
              time: daysDiff === 0 ? 'Today' : daysDiff === 1 ? 'Tomorrow' : daysDiff < 0 ? `${Math.abs(daysDiff)} days ago` : `In ${daysDiff} days`,
              icon: Clock,
              color: daysDiff <= 1 && daysDiff >= 0 ? 'text-red-600' : 'text-purple-600',
              bgColor: daysDiff <= 1 && daysDiff >= 0 ? 'bg-red-50' : 'bg-purple-50',
              borderColor: daysDiff <= 1 && daysDiff >= 0 ? 'border-red-200' : 'border-purple-200',
              timestamp: reminderTimestamp
            })
          }
        } else if (reminder.status === 'cancelled') {
          // Reminder cancelled
          activities.push({
            id: `reminder-cancelled-${reminder.id}`,
            type: 'reminder',
            title: 'Reminder cancelled',
            description: `${memberName} - ${reminder.title}`,
            time: formatTimeAgo(new Date(reminder.updatedAt)),
            icon: AlertTriangle,
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200',
            timestamp: new Date(reminder.updatedAt).getTime()
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
  
  // Use only real activities from backend - no fallback mock data
  const displayActivities = activities

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
          const isMissedAppointment = activity.title === 'Appointment missed' && activity.appointmentId
          
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
                {isMissedAppointment && (
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => handleMarkCompleted(activity.appointmentId)}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Mark as Completed
                    </button>
                    <button
                      onClick={() => handleMarkMissed(activity.appointmentId)}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Mark as Missed
                    </button>
                  </div>
                )}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{activities.length}</div>
            <div className="text-sm text-gray-600">Total Activities</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {activities.filter(activity => 
                activity.title === 'Medication taken' || activity.title === 'Reminder completed'
              ).length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {activities.filter(activity => 
                activity.title === 'Reminder missed' || activity.title === 'Appointment missed'
              ).length}
            </div>
            <div className="text-sm text-gray-600">Missed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {activities.filter(activity => 
                activity.type === 'appointment' && 
                (activity.title === 'Upcoming appointment' || activity.title === 'Appointment soon')
              ).length}
            </div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
