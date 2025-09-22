'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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

export default function RecentActivity({ familyMembers = [] }: RecentActivityProps) {
  const [showAll, setShowAll] = useState(false)
  
  // Generate real activities based on family member data
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
  
  const activities = generateActivities()

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

  const activitiesToShow = showAll ? activities : activities.slice(0, 4)

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
      
      <div className="space-y-4">
        {activitiesToShow.map((activity, index) => {
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
        })}
      </div>
      
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
