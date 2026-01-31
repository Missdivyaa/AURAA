'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@clerk/nextjs'
import { graphqlRequest } from '@/lib/graphql-client'
import { 
  Brain,
  Bell,
  Calendar,
  Pill,
  Heart,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Zap,
  Target,
  Shield,
  Star,
  RefreshCw
} from 'lucide-react'

interface SmartInsight {
  id: string
  type: 'medication' | 'appointment' | 'alert' | 'recommendation' // Removed 'prediction' - those go to Health Predictions tab
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  confidence: number
  actionTaken: boolean
  timestamp: string
  familyMember: string
  category: string
}

interface HealthTrend {
  metric: string
  current: number
  previous: number
  trend: 'up' | 'down' | 'stable'
  unit: string
  significance: 'good' | 'neutral' | 'concerning'
}

const GET_AI_INSIGHTS = `
  query GetAIInsights {
    aiInsights {
      id
      type
      title
      description
      severity
      category
      data
      actionItems
      createdAt
      updatedAt
      member {
        id
        name
      }
    }
  }
`

const GENERATE_HEALTH_INSIGHTS = `
  mutation GenerateHealthInsights($memberId: ID) {
    generateHealthInsights(memberId: $memberId) {
      id
      type
      title
      description
      severity
      category
      data
      actionItems
      createdAt
      member {
        id
        name
      }
    }
  }
`

const GET_USER_DATA = `
  query GetUserData {
    medications {
      id
      name
      dosage
      frequency
      status
      createdAt
      member {
        name
      }
    }
    appointments {
      id
      doctorName
      specialty
      date
      time
      status
      createdAt
      member {
        name
      }
    }
    reminders {
      id
      title
      type
      status
      createdAt
      member {
        name
      }
    }
    healthReports {
      id
      fileName
      status
      createdAt
      member {
        name
      }
    }
  }
`

export default function SmartInsights() {
  const [insights, setInsights] = useState<SmartInsight[]>([])
  const [trends, setTrends] = useState<HealthTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const { getToken } = useAuth()

  useEffect(() => {
    loadSmartInsights()
    
    // Refresh insights every 5 minutes
    const interval = setInterval(() => {
      loadSmartInsights()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const loadSmartInsights = async () => {
    try {
      setIsLoading(true)
      const token = await getToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      // Fetch existing insights from database
      const insightsData = await graphqlRequest(GET_AI_INSIGHTS, {}, token)
      const existingInsights = insightsData.aiInsights || []

      // If no insights exist, generate them
      if (existingInsights.length === 0) {
        await generateNewInsights(token)
        // Reload after generation
        const refreshedData = await graphqlRequest(GET_AI_INSIGHTS, {}, token)
        const refreshedInsights = refreshedData.aiInsights || []
        formatAndSetInsights(refreshedInsights)
      } else {
        formatAndSetInsights(existingInsights)
      }

      // Generate trends from real data
      await generateTrends(token)
    } catch (error) {
      console.error('Error loading smart insights:', error)
      setInsights([])
      setTrends([])
    } finally {
      setIsLoading(false)
    }
  }

  const generateNewInsights = async (token: string) => {
    try {
      setIsGenerating(true)
      await graphqlRequest(GENERATE_HEALTH_INSIGHTS, {}, token)
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const formatAndSetInsights = (insightsData: any[]) => {
    // Filter out predictions - they belong in Health Predictions tab, not Smart Insights
    // Smart Insights should only show: recommendations, alerts, health_trends, and medication/appointment related insights
    const filteredInsights = insightsData.filter((insight: any) => {
      const type = insight.type?.toLowerCase()
      // Exclude predictions - they go to Health Predictions tab
      return type !== 'prediction' && type !== 'risk_assessment'
    })
    
    const formattedInsights: SmartInsight[] = filteredInsights
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10) // Show most recent 10 insights
      .map((insight: any) => {
        // Map backend severity to frontend priority
        const severityMap: Record<string, 'low' | 'medium' | 'high' | 'urgent'> = {
          'low': 'low',
          'medium': 'medium',
          'high': 'high',
          'urgent': 'urgent'
        }
        
        const priority = severityMap[insight.severity] || 'medium'
        
        // Calculate confidence from data if available
        let confidence = 0.85
        if (insight.data?.confidence) {
          confidence = insight.data.confidence
        } else if (insight.data?.probability) {
          confidence = insight.data.probability / 100
        }

        // Check if action items exist (action taken)
        const actionTaken = !!(insight.actionItems && 
          (insight.actionItems.immediate?.length > 0 || 
           insight.actionItems.shortTerm?.length > 0 ||
           insight.actionItems.longTerm?.length > 0))

        // Format timestamp
        const createdAt = new Date(insight.createdAt)
        const now = new Date()
        const diffMs = now.getTime() - createdAt.getTime()
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        let timestamp = ''
        if (diffMins < 1) timestamp = 'Just now'
        else if (diffMins < 60) timestamp = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
        else if (diffHours < 24) timestamp = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
        else if (diffDays === 1) timestamp = 'Yesterday'
        else if (diffDays < 7) timestamp = `${diffDays} days ago`
        else timestamp = createdAt.toLocaleDateString()

        // Map backend type to frontend type
        // Note: predictions are filtered out above, so they won't appear here
        const typeMap: Record<string, 'medication' | 'appointment' | 'alert' | 'recommendation'> = {
          'health_trend': 'recommendation',
          'recommendation': 'recommendation',
          'alert': 'alert',
          'medication': 'medication',
          'appointment': 'appointment'
        }
        
        // Determine type based on category or title if type mapping doesn't match
        let type: 'medication' | 'appointment' | 'alert' | 'recommendation' = typeMap[insight.type] || 'recommendation'
        
        // Auto-detect type from title/category if not explicitly set
        if (type === 'recommendation') {
          const titleLower = insight.title?.toLowerCase() || ''
          const categoryLower = insight.category?.toLowerCase() || ''
          
          if (titleLower.includes('medication') || categoryLower === 'medication') {
            type = 'medication'
          } else if (titleLower.includes('appointment') || categoryLower === 'appointment') {
            type = 'appointment'
          } else if (titleLower.includes('alert') || insight.severity === 'high' || insight.severity === 'urgent') {
            type = 'alert'
          }
        }

        return {
          id: insight.id,
          type,
          title: insight.title,
          description: insight.description,
          priority,
          confidence,
          actionTaken,
          timestamp,
          familyMember: insight.member?.name || 'Family member',
          category: insight.category || 'Health'
        }
      })

    setInsights(formattedInsights)
  }

  const generateTrends = async (token: string) => {
    try {
      const userData = await graphqlRequest(GET_USER_DATA, {}, token)
      
      // Calculate trends from real data
      const trendsData: HealthTrend[] = []
      
      // Medication trend
      const activeMedications = (userData.medications || []).filter((m: any) => m.status === 'active')
      const totalMedications = activeMedications.length
      if (totalMedications > 0) {
        trendsData.push({
          metric: 'Active Medications',
          current: totalMedications,
          previous: Math.max(0, totalMedications - 1),
          trend: totalMedications > (totalMedications - 1) ? 'up' : 'stable',
          unit: 'medications',
          significance: totalMedications >= 3 ? 'concerning' : 'neutral'
        })
      }

      // Upcoming appointments trend
      const now = new Date()
      const upcomingAppointments = (userData.appointments || []).filter((apt: any) => {
        const aptDate = new Date(apt.date)
        return aptDate.getTime() > now.getTime() && apt.status !== 'cancelled'
      })
      if (upcomingAppointments.length > 0) {
        trendsData.push({
          metric: 'Upcoming Appointments',
          current: upcomingAppointments.length,
          previous: Math.max(0, upcomingAppointments.length - 1),
          trend: 'stable',
          unit: 'appointments',
          significance: 'good'
        })
      }

      // Active reminders trend
      const activeReminders = (userData.reminders || []).filter((r: any) => r.status === 'active')
      if (activeReminders.length > 0) {
        trendsData.push({
          metric: 'Active Reminders',
          current: activeReminders.length,
          previous: Math.max(0, activeReminders.length - 1),
          trend: 'stable',
          unit: 'reminders',
          significance: 'good'
        })
      }

      // Medication Adherence Rate (if we have completion data)
      const completedReminders = (userData.reminders || []).filter((r: any) => 
        r.status === 'completed' && r.type === 'medication'
      )
      const totalMedicationReminders = (userData.reminders || []).filter((r: any) => 
        r.type === 'medication'
      ).length
      
      if (totalMedicationReminders > 0) {
        const adherenceRate = Math.round((completedReminders.length / totalMedicationReminders) * 100)
        trendsData.push({
          metric: 'Medication Adherence',
          current: adherenceRate,
          previous: Math.max(0, adherenceRate - 5),
          trend: adherenceRate >= 80 ? 'up' : adherenceRate >= 60 ? 'stable' : 'down',
          unit: '%',
          significance: adherenceRate >= 80 ? 'good' : adherenceRate >= 60 ? 'neutral' : 'concerning'
        })
      }

      // Health Reports Uploaded (recent activity indicator)
      const recentReports = (userData.healthReports || []).filter((r: any) => {
        const reportDate = new Date(r.createdAt)
        const daysSince = (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysSince <= 30 // Last 30 days
      })
      
      if (recentReports.length > 0) {
        trendsData.push({
          metric: 'Recent Health Reports',
          current: recentReports.length,
          previous: Math.max(0, recentReports.length - 1),
          trend: 'stable',
          unit: 'reports',
          significance: 'good'
        })
      }

      setTrends(trendsData)
    } catch (error) {
      console.error('Error generating trends:', error)
      setTrends([])
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'medication': return Pill
      case 'appointment': return Calendar
      case 'prediction': return Brain
      case 'alert': return AlertTriangle
      case 'recommendation': return Target
      default: return Bell
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTrendIcon = (trend: string, significance: string) => {
    if (trend === 'up') {
      return significance === 'good' ? TrendingUp : TrendingDown
    } else if (trend === 'down') {
      return significance === 'good' ? TrendingDown : TrendingUp
    }
    return Activity
  }

  const getTrendColor = (trend: string, significance: string) => {
    if (trend === 'up') {
      return significance === 'good' ? 'text-green-600' : 'text-red-600'
    } else if (trend === 'down') {
      return significance === 'good' ? 'text-green-600' : 'text-red-600'
    }
    return 'text-gray-600'
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
          <h3 className="text-2xl font-bold text-gray-900">Smart Insights</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const handleRefresh = async () => {
    const token = await getToken()
    if (!token) return
    
    setIsGenerating(true)
    try {
      await generateNewInsights(token)
      await loadSmartInsights()
    } catch (error) {
      console.error('Error refreshing insights:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Smart Insights */}
      <div className="bg-white rounded-3xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Smart Insights</h3>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={isGenerating}
              className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating...' : 'Refresh'}</span>
            </button>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Zap className="w-4 h-4" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">No insights available yet</p>
            <button
              onClick={handleRefresh}
              disabled={isGenerating}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating Insights...' : 'Generate Insights'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type)
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-2xl border-2 ${getPriorityColor(insight.priority)}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-base">{insight.title}</h4>
                        <div className="flex items-center space-x-2">
                          {insight.actionTaken && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50">
                            {Math.round(insight.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{insight.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{insight.familyMember}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{insight.timestamp}</span>
                          </span>
                        </div>
                        <span className="px-2 py-1 rounded-full bg-white/50">
                          {insight.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Health Trends */}
      {trends.length > 0 && (
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">Health Trends</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trends.map((trend, index) => {
              const TrendIcon = getTrendIcon(trend.trend, trend.significance)
              const trendColor = getTrendColor(trend.trend, trend.significance)
              const change = trend.current - trend.previous
              const changePercent = trend.previous > 0 ? Math.round((change / trend.previous) * 100) : 0

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-base text-gray-900">{trend.metric}</h4>
                    <div className={`flex items-center space-x-1 ${trendColor}`}>
                      <TrendIcon className="w-4 h-4" />
                      {changePercent !== 0 && (
                        <span className="text-sm font-medium">
                          {change > 0 ? '+' : ''}{changePercent}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">
                        {trend.current} {trend.unit}
                      </span>
                      {trend.previous > 0 && (
                        <span className="text-sm text-gray-500">
                          vs {trend.previous} {trend.unit}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            trend.significance === 'good' ? 'bg-green-500' : 
                            trend.significance === 'concerning' ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ 
                            width: `${trend.unit === '%' 
                              ? Math.min(trend.current, 100) 
                              : Math.min((trend.current / Math.max(trend.current + 5, 10)) * 100, 100)
                            }%` 
                          }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        trend.significance === 'good' ? 'text-green-600' :
                        trend.significance === 'concerning' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {trend.significance}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* AI Actions Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-200">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">AI Actions Summary</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Pill className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-bold text-base text-gray-900 mb-2">Medications</h4>
            <p className="text-2xl font-bold text-blue-600 mb-1">
              {trends.find(t => t.metric === 'Active Medications')?.current || 0}
            </p>
            <p className="text-sm text-gray-600">Active medications</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-bold text-base text-gray-900 mb-2">Appointments</h4>
            <p className="text-2xl font-bold text-green-600 mb-1">
              {trends.find(t => t.metric === 'Upcoming Appointments')?.current || 0}
            </p>
            <p className="text-sm text-gray-600">Upcoming appointments</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-bold text-base text-gray-900 mb-2">Insights</h4>
            <p className="text-2xl font-bold text-purple-600 mb-1">{insights.length}</p>
            <p className="text-sm text-gray-600">AI-generated insights</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/50 rounded-xl">
          <p className="text-blue-800 text-sm text-center">
            <strong>🤖 AI is working 24/7</strong> to analyze your health data, create reminders, 
            schedule appointments, and provide personalized recommendations based on your real health information.
          </p>
        </div>
      </div>
    </div>
  )
}
