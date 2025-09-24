'use client'

import { motion } from 'framer-motion'
import { 
  Heart, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Pill
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

interface HealthOverviewProps {
  familyMembers: FamilyMember[]
}

export default function HealthOverview({ familyMembers }: HealthOverviewProps) {
  const totalMembers = familyMembers.length
  const averageHealthScore = Math.round(familyMembers.reduce((sum, member) => sum + member.healthScore, 0) / totalMembers)
  const totalMedications = familyMembers.reduce((sum, member) => sum + member.medications, 0)
  const upcomingAppointments = familyMembers.filter(member => {
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
  }).length

  // Calculate alerts using the same logic as RecentActivity
  const calculateHealthAlerts = () => {
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

  const healthAlerts = calculateHealthAlerts()

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
      value: upcomingAppointments.toString(),
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
      trendColor: healthAlerts > 0 ? 'text-orange-600' : 'text-green-600'
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
            return (
              <motion.a
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                href={card.title === 'Total Medications' ? '/medications' : undefined}
                className={`${card.bgColor} p-6 rounded-xl hover:shadow-lg transition-all duration-300 card-hover group ${card.title === 'Total Medications' ? 'cursor-pointer' : ''}`}
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
              </motion.a>
            )
          })}
        </div>
      </motion.div>

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
