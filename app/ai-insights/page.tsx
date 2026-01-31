'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUser, useAuth } from '@clerk/nextjs'
import Navigation from '@/components/Navigation'
import SmartInsights from '@/components/SmartInsights'
import { graphqlRequest } from '@/lib/graphql-client'
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Heart, 
  Activity,
  Calendar,
  Users,
  BarChart3,
  Lightbulb,
  Shield,
  Clock,
  CheckCircle,
  Search,
  Thermometer,
  Eye,
  Zap,
  Plus,
  X,
  ArrowRight,
  RefreshCw
} from 'lucide-react'

interface HealthInsight {
  id: string
  type: 'prediction' | 'recommendation' | 'alert' | 'trend'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  category: 'health' | 'medication' | 'appointment' | 'lifestyle'
  confidence: number
  actionable: boolean
  timestamp: string
}

interface HealthPrediction {
  memberId: string
  memberName: string
  prediction: string
  riskLevel: 'low' | 'medium' | 'high'
  timeframe: string
  recommendations: string[]
  probability?: number
  condition?: string
  riskFactors?: string[]
  confidence?: number
}

interface Symptom {
  id: string
  name: string
  category: string
  severity: 'mild' | 'moderate' | 'severe'
  duration: string
  frequency: string
}

interface SymptomAnalysis {
  id: string
  symptoms: Symptom[]
  overview?: string
  possibleConditions: {
    name: string
    probability: number
    overview?: string
    commonCauses?: {
      strainsAndSprains?: string[]
      structuralIssues?: string[]
      lifestyleFactors?: string[]
      medicalConditions?: string[]
    }
    description: string
    urgency: 'low' | 'medium' | 'high'
    recommendations: string[]
    whenToSeekHelp?: string
  }[]
  urgencyLevel: 'low' | 'medium' | 'high'
  analysisDate?: string
  generalRecommendations?: string[]
  whenToSeekHelp?: string
}

// GraphQL Queries and Mutations
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
      memberId
      member {
        id
        name
      }
      createdAt
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
      member {
        id
        name
      }
    }
  }
`

const DELETE_AI_INSIGHT = `
  mutation DeleteAIInsight($id: ID!) {
    deleteAIInsight(id: $id)
  }
`

const GET_USER_DATA_FOR_RECOMMENDATIONS = `
  query GetUserDataForRecommendations {
    familyMembers {
      id
      name
      dob
      gender
      conditions
      allergies
      medications {
        id
        name
        dosage
        frequency
        status
        startDate
        endDate
      }
      appointments {
        id
        doctorName
        specialty
        date
        time
        status
      }
      healthReports {
        id
        fileName
        createdAt
        status
      }
    }
    medications {
      id
      name
      dosage
      frequency
      status
      startDate
      endDate
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
      member {
        name
      }
    }
    healthReports {
      id
      fileName
      createdAt
      status
      member {
        name
      }
    }
    symptomAnalyses {
      id
      symptoms
      createdAt
      member {
        name
      }
    }
  }
`

export default function AIInsights() {
  const searchParams = useSearchParams()
  const { isSignedIn, user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const [insights, setInsights] = useState<HealthInsight[]>([])
  const [predictions, setPredictions] = useState<HealthPrediction[]>([])
  const [symptomAnalysis, setSymptomAnalysis] = useState<SymptomAnalysis | null>(null)
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzingSymptoms, setAnalyzingSymptoms] = useState(false)
  const [activeTab, setActiveTab] = useState('insights')
  const [searchTerm, setSearchTerm] = useState('')
  const [recommendations, setRecommendations] = useState<{
    healthMonitoring: string[]
    lifestyleChanges: string[]
    appointments: string[]
    familyHealth: string[]
  }>({
    healthMonitoring: [],
    lifestyleChanges: [],
    appointments: [],
    familyHealth: []
  })
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)

  const commonSymptoms = [
    { id: '1', name: 'Fever', category: 'Common', icon: Thermometer },
    { id: '2', name: 'Headache', category: 'Common', icon: Activity },
    { id: '3', name: 'Cold', category: 'Common', icon: Activity },
    { id: '4', name: 'Cough', category: 'Common', icon: Activity },
    { id: '5', name: 'Sore Throat', category: 'Common', icon: Activity },
    { id: '6', name: 'Runny Nose', category: 'Common', icon: Activity },
    { id: '7', name: 'Body Aches', category: 'Common', icon: Activity },
    { id: '8', name: 'Tiredness', category: 'Common', icon: Activity },
    { id: '9', name: 'Stomach Pain', category: 'Common', icon: Activity },
    { id: '10', name: 'Nausea', category: 'Common', icon: Activity },
    { id: '11', name: 'Diarrhea', category: 'Common', icon: Activity },
    { id: '12', name: 'Dizziness', category: 'Common', icon: Activity },
    { id: '13', name: 'Chest Pain', category: 'Common', icon: Heart },
    { id: '14', name: 'Trouble Breathing', category: 'Common', icon: Activity },
    { id: '15', name: 'Skin Rash', category: 'Common', icon: Activity },
    { id: '16', name: 'Joint Pain', category: 'Common', icon: Activity },
    { id: '17', name: 'Back Pain', category: 'Common', icon: Activity },
    { id: '18', name: 'Muscle Pain', category: 'Common', icon: Activity },
    { id: '19', name: 'Sneezing', category: 'Common', icon: Activity },
    { id: '20', name: 'Watery Eyes', category: 'Common', icon: Eye },
  ]

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      loadAIInsights()
      loadRecommendations()
    }
    
    // Check for URL parameter to set active tab
    const tabParam = searchParams.get('tab')
    if (tabParam === 'symptoms') {
      setActiveTab('symptoms')
    }
  }, [searchParams, isLoaded, isSignedIn, user])

  // Reload recommendations when tab changes to recommendations
  useEffect(() => {
    if (activeTab === 'recommendations' && isLoaded && isSignedIn && user) {
      loadRecommendations()
    }
  }, [activeTab, isLoaded, isSignedIn, user])

  const loadAIInsights = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Get Clerk token
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }
      
      // Fetch AI insights from GraphQL API
      const data = await graphqlRequest(GET_AI_INSIGHTS, {}, token)
      console.log('🤖 Loaded AI insights from GraphQL:', data)
      
      // Convert backend data to frontend format
      // Filter out predictions here - they will be handled separately for Health Predictions tab
      const allInsights = (data.aiInsights || []).filter((insight: any) => {
        const type = insight.type?.toLowerCase()
        // Keep all insights here - SmartInsights component will filter predictions
        return true
      })
      
      const formattedInsights: HealthInsight[] = allInsights.map((insight: any) => {
        // Calculate confidence from data if available
        let confidence = 85;
        if (insight.data?.confidence) {
          confidence = Math.round(insight.data.confidence * 100);
        } else if (insight.data?.probability) {
          confidence = insight.data.probability;
        }

        return {
          id: insight.id,
          type: insight.type as 'prediction' | 'recommendation' | 'alert' | 'trend',
          title: insight.title,
          description: insight.description,
          severity: insight.severity as 'low' | 'medium' | 'high',
          category: insight.category as 'health' | 'medication' | 'appointment' | 'lifestyle',
          confidence,
          actionable: !!insight.actionItems,
          timestamp: insight.createdAt
        };
      });
      
      // Extract predictions from insights with full data
      // Use a Map to deduplicate predictions by condition (case-insensitive) and memberId
      const predictionsMap = new Map<string, HealthPrediction>();
      
      formattedInsights
        .filter(i => i.type === 'prediction')
        .forEach(insight => {
          const insightData = (data.aiInsights || []).find((i: any) => i.id === insight.id);
          if (!insightData) return;
          
          const actionItems = insightData?.actionItems || {};
          const allRecommendations = [
            ...(actionItems.immediate || []),
            ...(actionItems.shortTerm || []),
            ...(actionItems.longTerm || [])
          ];

          const condition = (insightData?.data?.condition || '').toLowerCase().trim();
          const memberId = insightData?.memberId || '';
          const probability = insightData?.data?.probability || 0;
          
          // Create unique key for deduplication: condition (normalized) + memberId
          // Use 'all' for null memberId to group user-level predictions
          const uniqueKey = `${condition}-${memberId || 'all'}`;
          
          // Only add if not already exists (prevent duplicates)
          // If exists, keep the one with higher probability or more recent
          if (!predictionsMap.has(uniqueKey)) {
            // Calculate risk level from probability (real calculation)
            let riskLevel: 'low' | 'medium' | 'high' = 'low';
            if (probability >= 60) {
              riskLevel = 'high';
            } else if (probability >= 40) {
              riskLevel = 'medium';
            } else {
              riskLevel = 'low';
            }
            
            // Override with severity from insight if it's more accurate
            const severityFromInsight = insight.severity as 'low' | 'medium' | 'high';
            if (severityFromInsight && probability > 0) {
              // Use the more conservative risk level
              if (severityFromInsight === 'high' || riskLevel === 'high') {
                riskLevel = 'high';
              } else if (severityFromInsight === 'medium' || riskLevel === 'medium') {
                riskLevel = 'medium';
              }
            }

            predictionsMap.set(uniqueKey, {
              memberId,
              memberName: insightData?.member?.name || 'Family Member',
              prediction: insight.description,
              riskLevel,
              timeframe: insightData?.data?.timeframe || '',
              recommendations: allRecommendations,
              probability,
              condition: insightData?.data?.condition || condition, // Use original case from data
              riskFactors: insightData?.data?.riskFactors || [],
              confidence: insight.confidence
            });
          } else {
            // If duplicate exists, keep the one with higher probability or more recent timestamp
            const existing = predictionsMap.get(uniqueKey)!;
            if (probability > existing.probability || 
                (probability === existing.probability && new Date(insight.timestamp) > new Date(existing.prediction))) {
              predictionsMap.set(uniqueKey, {
                memberId,
                memberName: insightData?.member?.name || 'Family Member',
                prediction: insight.description,
                riskLevel,
                timeframe: insightData?.data?.timeframe || '',
                recommendations: allRecommendations,
                probability,
                condition: insightData?.data?.condition || condition,
                riskFactors: insightData?.data?.riskFactors || [],
                confidence: insight.confidence
              });
            }
          }
        });
      
      const uniquePredictions = Array.from(predictionsMap.values());
      
      setInsights(formattedInsights)
      setPredictions(uniquePredictions)
      
    } catch (error) {
      console.error('Error loading AI insights:', error)
      setInsights([])
      setPredictions([])
    } finally {
      setLoading(false)
    }
  }

  const loadRecommendations = async () => {
    if (!user) return
    
    try {
      setLoadingRecommendations(true)
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }

      // Fetch comprehensive user data
      const userData = await graphqlRequest(GET_USER_DATA_FOR_RECOMMENDATIONS, {}, token)
      
      // Generate personalized recommendations using AI
      const personalizedRecommendations = await generatePersonalizedRecommendations(userData, token)
      
      setRecommendations(personalizedRecommendations)
    } catch (error) {
      console.error('Error loading recommendations:', error)
      // Fallback to basic recommendations if AI fails
      setRecommendations({
        healthMonitoring: ['Schedule regular health checkups', 'Monitor your health metrics'],
        lifestyleChanges: ['Maintain a balanced diet', 'Stay physically active'],
        appointments: ['Keep track of upcoming appointments'],
        familyHealth: ['Ensure all family members have updated health records']
      })
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const generatePersonalizedRecommendations = async (userData: any, token: string) => {
    try {
      const openAiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
      
      // Prepare user context for AI
      const familyMembers = userData.familyMembers || []
      const medications = userData.medications || []
      const appointments = userData.appointments || []
      const healthReports = userData.healthReports || []
      const symptomAnalyses = userData.symptomAnalyses || []

      // Build comprehensive user context
      const userContext = {
        familyMembers: familyMembers.map((m: any) => ({
          name: m.name,
          age: m.dob ? Math.floor((Date.now() - new Date(m.dob).getTime()) / (1000 * 60 * 60 * 24 * 365)) : null,
          gender: m.gender,
          conditions: m.conditions || [],
          allergies: m.allergies || [],
          activeMedications: (m.medications || []).filter((med: any) => med.status === 'active').length,
          upcomingAppointments: (m.appointments || []).filter((apt: any) => {
            const aptDate = new Date(apt.date)
            return aptDate.getTime() > Date.now() && apt.status !== 'cancelled'
          }).length
        })),
        totalActiveMedications: medications.filter((m: any) => m.status === 'active').length,
        upcomingAppointments: appointments.filter((apt: any) => {
          const aptDate = new Date(apt.date)
          return aptDate.getTime() > Date.now() && apt.status !== 'cancelled'
        }).length,
        recentReports: healthReports.filter((r: any) => {
          const reportDate = new Date(r.createdAt)
          const daysSince = (Date.now() - reportDate.getTime()) / (1000 * 60 * 60 * 24)
          return daysSince <= 30
        }).length,
        recentSymptoms: symptomAnalyses.filter((s: any) => {
          const symptomDate = new Date(s.createdAt)
          const daysSince = (Date.now() - symptomDate.getTime()) / (1000 * 60 * 60 * 24)
          return daysSince <= 7
        }).length
      }

      // If no OpenAI key, generate basic recommendations from data
      if (!openAiKey) {
        return generateBasicRecommendations(userContext)
      }

      // Use AI to generate personalized recommendations
      const prompt = `You are a medical AI assistant. Generate personalized, actionable health recommendations based on the following user data.

USER DATA:
${JSON.stringify(userContext, null, 2)}

Generate recommendations in the following JSON format:
{
  "healthMonitoring": [
    "Specific recommendation 1 based on user's conditions/medications",
    "Specific recommendation 2",
    ...
  ],
  "lifestyleChanges": [
    "Specific lifestyle recommendation 1 based on user's health status",
    "Specific lifestyle recommendation 2",
    ...
  ],
  "appointments": [
    "Specific appointment recommendation 1 based on user's conditions/medications",
    "Specific appointment recommendation 2",
    ...
  ],
  "familyHealth": [
    "Specific family health recommendation 1",
    "Specific family health recommendation 2",
    ...
  ]
}

CRITICAL REQUIREMENTS:
- Recommendations MUST be specific to the user's actual data (conditions, medications, reports, symptoms)
- Be precise and actionable - not generic advice
- Health Monitoring: Based on their conditions (e.g., if diabetes: "Monitor blood glucose levels daily")
- Lifestyle Changes: Based on their conditions/medications (e.g., if hypertension: "Reduce sodium intake to less than 2g per day")
- Appointments: Based on their conditions/medications (e.g., if diabetes: "Schedule annual eye exam for diabetic retinopathy screening")
- Family Health: Based on family members' data
- Update recommendations based on recent reports, medications, symptoms
- Each recommendation should be helpful and directly related to their health data
- Maximum 4-5 recommendations per category
- Return ONLY valid JSON, no additional text.`;

      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a medical AI assistant that generates personalized, actionable health recommendations based on user data. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1500
        })
      })

      if (!aiResponse.ok) {
        throw new Error('AI API error')
      }

      const aiData = await aiResponse.json()
      const aiContent = aiData.choices[0]?.message?.content || '{}'
      
      // Parse AI response
      try {
        const cleanedContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const aiRecommendations = JSON.parse(cleanedContent)
        
        return {
          healthMonitoring: aiRecommendations.healthMonitoring || [],
          lifestyleChanges: aiRecommendations.lifestyleChanges || [],
          appointments: aiRecommendations.appointments || [],
          familyHealth: aiRecommendations.familyHealth || []
        }
      } catch (parseError) {
        console.error('Error parsing AI recommendations:', parseError)
        return generateBasicRecommendations(userContext)
      }
    } catch (error) {
      console.error('Error generating AI recommendations:', error)
      return generateBasicRecommendations(userContext)
    }
  }

  const generateBasicRecommendations = (userContext: any) => {
    const recommendations: any = {
      healthMonitoring: [],
      lifestyleChanges: [],
      appointments: [],
      familyHealth: []
    }

    // Health Monitoring recommendations based on conditions
    const allConditions = new Set<string>()
    userContext.familyMembers.forEach((member: any) => {
      (member.conditions || []).forEach((cond: string) => allConditions.add(cond.toLowerCase()))
    })

    if (allConditions.has('diabetes') || allConditions.has('type 2 diabetes')) {
      recommendations.healthMonitoring.push('Monitor blood glucose levels daily')
      recommendations.healthMonitoring.push('Track HbA1c levels every 3 months')
    }
    if (allConditions.has('hypertension') || allConditions.has('high blood pressure')) {
      recommendations.healthMonitoring.push('Monitor blood pressure at least twice weekly')
      recommendations.healthMonitoring.push('Track blood pressure readings in a log')
    }
    if (userContext.totalActiveMedications > 0) {
      recommendations.healthMonitoring.push('Track medication adherence daily')
    }
    if (userContext.recentReports === 0) {
      recommendations.healthMonitoring.push('Upload recent health reports for better insights')
    }
    if (recommendations.healthMonitoring.length === 0) {
      recommendations.healthMonitoring.push('Schedule regular health checkups')
      recommendations.healthMonitoring.push('Monitor your health metrics regularly')
    }

    // Lifestyle Changes based on conditions
    if (allConditions.has('diabetes')) {
      recommendations.lifestyleChanges.push('Follow a diabetes-friendly diet (low glycemic index foods)')
      recommendations.lifestyleChanges.push('Engage in at least 150 minutes of moderate exercise per week')
    }
    if (allConditions.has('hypertension')) {
      recommendations.lifestyleChanges.push('Reduce sodium intake to less than 2g per day')
      recommendations.lifestyleChanges.push('Limit alcohol consumption')
    }
    if (userContext.totalActiveMedications >= 3) {
      recommendations.lifestyleChanges.push('Maintain consistent meal times to optimize medication effectiveness')
    }
    if (recommendations.lifestyleChanges.length === 0) {
      recommendations.lifestyleChanges.push('Maintain a balanced diet with plenty of fruits and vegetables')
      recommendations.lifestyleChanges.push('Stay physically active - aim for 30 minutes daily')
    }

    // Appointment recommendations
    if (allConditions.has('diabetes')) {
      recommendations.appointments.push('Schedule annual eye exam for diabetic retinopathy screening')
      recommendations.appointments.push('Book quarterly diabetes management consultation')
    }
    if (allConditions.has('hypertension')) {
      recommendations.appointments.push('Schedule cardiology consultation within 2 weeks')
    }
    if (userContext.upcomingAppointments === 0) {
      recommendations.appointments.push('Schedule annual physical examination')
    }
    if (userContext.recentReports > 0) {
      recommendations.appointments.push('Follow up on recent health report findings with your doctor')
    }
    if (recommendations.appointments.length === 0) {
      recommendations.appointments.push('Keep track of upcoming appointments')
      recommendations.appointments.push('Schedule routine health checkups')
    }

    // Family Health recommendations
    if (userContext.familyMembers.length > 1) {
      recommendations.familyHealth.push('Ensure all family members have updated health records')
      recommendations.familyHealth.push('Schedule family health checkups together when possible')
    }
    if (userContext.familyMembers.length > 0) {
      recommendations.familyHealth.push('Encourage family members to track health metrics')
      recommendations.familyHealth.push('Share healthy lifestyle habits as a family')
    }

    return recommendations
  }

  const handleGenerateInsights = async (memberId?: string) => {
    if (!user) return
    
    try {
      setLoading(true)
      
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }
      
      const data = await graphqlRequest(GENERATE_HEALTH_INSIGHTS, { memberId: memberId || null }, token)
      console.log('✅ Generated AI insights:', data)
      
      // Reload insights
      await loadAIInsights()
      
    } catch (error: any) {
      console.error('Error generating AI insights:', error)
      const errorMessage = error?.message || error?.toString() || 'Unknown error occurred'
      console.error('Full error details:', error)
      
      // Show more helpful error message
      alert(`Failed to generate insights: ${errorMessage}. Please check the console for more details or try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteInsight = async (id: string) => {
    if (!user) return
    
    try {
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }
      
      await graphqlRequest(DELETE_AI_INSIGHT, { id }, token)
      
      // Remove from local state
      setInsights(prev => prev.filter(i => i.id !== id))
      
      console.log('✅ AI insight deleted:', id)
    } catch (error) {
      console.error('Error deleting AI insight:', error)
      alert('Failed to delete insight. Please try again.')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return AlertTriangle
      case 'medium': return TrendingUp
      case 'low': return CheckCircle
      default: return Activity
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prediction': return Brain
      case 'recommendation': return Lightbulb
      case 'alert': return AlertTriangle
      case 'trend': return BarChart3
      default: return Activity
    }
  }

  const addSymptom = (symptom: any) => {
    const newSymptom: Symptom = {
      id: Date.now().toString(),
      name: symptom.name,
      category: symptom.category,
      severity: 'mild',
      duration: '1 day',
      frequency: 'intermittent'
    }
    setSelectedSymptoms([...selectedSymptoms, newSymptom])
  }

  const removeSymptom = (symptomId: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== symptomId))
  }

  const updateSymptom = (symptomId: string, updates: Partial<Symptom>) => {
    setSelectedSymptoms(selectedSymptoms.map(s => 
      s.id === symptomId ? { ...s, ...updates } : s
    ))
  }

  const clearSymptomAnalysis = () => {
    setSymptomAnalysis(null)
    setSelectedSymptoms([])
    setSearchTerm('')
  }

  const analyzeSymptoms = async () => {
    if (!user) return
    
    if (selectedSymptoms.length === 0) {
      alert('Please select at least one symptom to analyze')
      return
    }

    try {
      setAnalyzingSymptoms(true)
      
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }
      
      // Prepare symptoms data for GraphQL
      const symptomsData = selectedSymptoms.map(s => ({
        name: s.name,
        category: s.category,
        severity: s.severity,
        duration: s.duration,
        frequency: s.frequency
      }))
      
      const ANALYZE_SYMPTOMS = `
        mutation AnalyzeSymptoms($symptoms: JSON!, $memberId: ID) {
          analyzeSymptoms(symptoms: $symptoms, memberId: $memberId) {
            id
            symptoms
            analysis
            conditions
            urgencyLevel
            createdAt
            member {
              id
              name
            }
          }
        }
      `
      
      const data = await graphqlRequest(ANALYZE_SYMPTOMS, { 
        symptoms: symptomsData,
        memberId: null 
      }, token)
      
      console.log('🔍 Symptom analysis result:', data)
      
      const result = data.analyzeSymptoms
      if (!result) {
        throw new Error('No analysis result returned from server')
      }

      // Parse conditions - can be in result.conditions or result.analysis.possibleConditions
      let conditions = [];
      if (Array.isArray(result.conditions) && result.conditions.length > 0) {
        conditions = result.conditions;
      } else if (result.analysis && Array.isArray(result.analysis.possibleConditions)) {
        conditions = result.analysis.possibleConditions;
      } else if (typeof result.conditions === 'object' && result.conditions !== null && !Array.isArray(result.conditions)) {
        // Handle object format
        conditions = Object.entries(result.conditions).map(([name, data]: [string, any]) => ({
          name: name,
          probability: data?.probability || 50,
          description: data?.description || '',
          urgency: data?.urgency || 'medium',
          recommendations: data?.recommendations || []
        }));
      }
      
      // Ensure we have at least one condition
      if (conditions.length === 0) {
        conditions = [{
          name: 'Analysis in Progress',
          probability: 50,
          description: 'Please wait while we analyze your symptoms...',
          urgency: 'medium' as const,
          recommendations: ['Please try again in a moment']
        }];
      }
      
      // Parse overview and additional fields from analysis
      const analysisData = result.analysis || {};
      const overview = analysisData.overview || result.overview || null;
      const generalRecommendations = analysisData.generalRecommendations || result.generalRecommendations || [];
      const whenToSeekHelp = analysisData.whenToSeekHelp || result.whenToSeekHelp || null;

      const formattedAnalysis: SymptomAnalysis = {
        id: result.id,
        symptoms: selectedSymptoms,
        overview: overview,
        possibleConditions: conditions.map((cond: any) => ({
          name: cond.name || 'Unknown Condition',
          probability: typeof cond.probability === 'number' ? cond.probability : parseInt(cond.probability) || 50,
          overview: cond.overview || null,
          commonCauses: cond.commonCauses || null,
          description: cond.description || 'No description available',
          urgency: (cond.urgency || result.urgencyLevel || 'medium') as 'low' | 'medium' | 'high',
          recommendations: Array.isArray(cond.recommendations) ? cond.recommendations : [],
          whenToSeekHelp: cond.whenToSeekHelp || null
        })),
        urgencyLevel: (result.urgencyLevel || 'medium') as 'low' | 'medium' | 'high',
        analysisDate: result.createdAt,
        generalRecommendations: generalRecommendations,
        whenToSeekHelp: whenToSeekHelp
      }

      console.log('✅ Formatted analysis:', formattedAnalysis)
      setSymptomAnalysis(formattedAnalysis)
      
    } catch (error: any) {
      console.error('Error analyzing symptoms:', error)
      const errorMessage = error?.message || error?.toString() || 'Unknown error occurred'
      console.error('Full error details:', error)
      
      // Show user-friendly error message
      alert(`Error analyzing symptoms: ${errorMessage}. Please check the console for details or try again.`)
      
      // Clear any previous analysis on error
      setSymptomAnalysis(null)
    } finally {
      setAnalyzingSymptoms(false)
    }
  }

  const filteredSymptoms = commonSymptoms.filter(symptom =>
    searchTerm === '' ||
    symptom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    symptom.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const tabs = [
    { id: 'insights', name: 'AI Insights', icon: Brain },
    { id: 'predictions', name: 'Health Predictions', icon: TrendingUp },
    { id: 'symptoms', name: 'Symptom Checker', icon: Search },
    { id: 'recommendations', name: 'Recommendations', icon: Lightbulb },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-8">
      <Navigation />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  AI Health Insights
                </h1>
                <p className="text-lg text-gray-600">
                  Intelligent analysis of your family's health data with predictive insights
                </p>
              </div>
              
              <div className="mt-6 lg:mt-0 flex space-x-3">
                <button 
                  onClick={() => handleGenerateInsights()}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-md disabled:opacity-50 text-sm"
                >
                  <Zap className={`w-4 h-4 mr-2 ${loading ? 'animate-pulse' : ''}`} />
                  Generate Insights
                </button>
                <button 
                  onClick={loadAIInsights}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors shadow-md disabled:opacity-50 text-sm"
                >
                  <Brain className={`w-4 h-4 mr-2 ${loading ? 'animate-pulse' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center py-12"
            >
              <div className="flex items-center space-x-3">
                <Brain className="w-6 h-6 animate-pulse text-primary-600" />
                <p className="text-gray-600">Analyzing health data with AI...</p>
              </div>
            </motion.div>
          )}

          {/* AI Insights Tab */}
          {!loading && activeTab === 'insights' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Smart Insights Component - Shows actionable insights, recommendations, alerts */}
              {/* Predictions are filtered out and shown in Health Predictions tab */}
              <SmartInsights />
            </motion.div>
          )}

          {/* Health Predictions Tab */}
          {!loading && activeTab === 'predictions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {predictions.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center shadow-md">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Predictions Available</h3>
                  <p className="text-gray-600 mb-4">Generate insights to see health predictions based on your uploaded reports, medications, and health data.</p>
                  <button
                    onClick={() => handleGenerateInsights()}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Predictions
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {predictions.map((prediction, index) => {
                    const riskBorderColor = prediction.riskLevel === 'high' ? 'border-red-500' :
                                           prediction.riskLevel === 'medium' ? 'border-yellow-500' : 'border-green-500';
                    
                    return (
                      <motion.div
                        key={`${prediction.condition}-${prediction.memberId}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className={`bg-white rounded-2xl p-6 shadow-lg border-l-4 ${riskBorderColor}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2 flex-wrap">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {prediction.condition || 'Health Prediction'}
                              </h3>
                              {prediction.memberName && prediction.memberName !== 'Family Member' && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                  {prediction.memberName}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">{prediction.prediction}</p>
                            
                            {/* Probability and Timeframe */}
                            <div className="flex items-center space-x-4 mt-3 flex-wrap gap-2">
                              {prediction.probability !== undefined && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-700">Probability:</span>
                                  <span className={`text-lg font-bold ${
                                    prediction.probability >= 60 ? 'text-red-600' :
                                    prediction.probability >= 40 ? 'text-yellow-600' : 'text-green-600'
                                  }`}>
                                    {prediction.probability}%
                                  </span>
                                </div>
                              )}
                              {prediction.timeframe && (
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">{prediction.timeframe}</span>
                                </div>
                              )}
                              {prediction.confidence !== undefined && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600">Confidence: {prediction.confidence}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ml-4 whitespace-nowrap ${
                            prediction.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                            prediction.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {prediction.riskLevel.toUpperCase()} RISK
                          </div>
                        </div>
                        
                        {/* Risk Factors */}
                        {prediction.riskFactors && prediction.riskFactors.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-2">Risk Factors:</h4>
                            <div className="flex flex-wrap gap-2">
                              {prediction.riskFactors.map((factor, idx) => (
                                <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                                  {factor}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Recommendations */}
                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-medium text-gray-900 mb-3">Prevention & Recommendations:</h4>
                          <ul className="space-y-2">
                            {prediction.recommendations && prediction.recommendations.length > 0 ? (
                              prediction.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-600">{rec}</span>
                                </li>
                              ))
                            ) : (
                              <li className="text-gray-500 text-sm">No specific recommendations available</li>
                            )}
                          </ul>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Symptom Checker Tab */}
          {!loading && activeTab === 'symptoms' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Symptom Search - Always at the top */}
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <div className="flex items-center space-x-4 mb-6">
                  <Search className="w-8 h-8 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search symptoms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-6 py-4 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredSymptoms.map((symptom, index) => {
                    const isSelected = selectedSymptoms.some(s => s.name === symptom.name)
                    
                    return (
                      <motion.button
                        key={symptom.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        onClick={() => addSymptom(symptom)}
                        disabled={isSelected}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isSelected 
                            ? 'bg-primary-100 border-primary-300 text-primary-700' 
                            : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          {symptom.icon === Thermometer && <Thermometer className="w-5 h-5 mb-2 text-gray-600" />}
                          {symptom.icon === Activity && <Activity className="w-5 h-5 mb-2 text-gray-600" />}
                          {symptom.icon === Heart && <Heart className="w-5 h-5 mb-2 text-gray-600" />}
                          {symptom.icon === Eye && <Eye className="w-5 h-5 mb-2 text-gray-600" />}
                          <p className="text-sm font-medium text-center text-gray-900">{symptom.name}</p>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Selected Symptoms - Appears below search box */}
              {selectedSymptoms.length > 0 && (
                <div className="bg-white rounded-3xl p-8 shadow-xl">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Selected Symptoms</h3>
                  <div className="space-y-4">
                    {selectedSymptoms.map((symptom, index) => (
                      <motion.div
                        key={symptom.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h4 className="text-base font-semibold text-gray-900">{symptom.name}</h4>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs font-medium text-gray-500 mb-1 block">Severity</label>
                              <select 
                                value={symptom.severity}
                                onChange={(e) => updateSymptom(symptom.id, { severity: e.target.value as any })}
                                className="w-full text-sm border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                              >
                                <option value="mild">Mild</option>
                                <option value="moderate">Moderate</option>
                                <option value="severe">Severe</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-500 mb-1 block">Duration</label>
                              <select 
                                value={symptom.duration}
                                onChange={(e) => updateSymptom(symptom.id, { duration: e.target.value })}
                                className="w-full text-sm border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                              >
                                <option value="< 1 hour">Less than 1 hour</option>
                                <option value="1-6 hours">1-6 hours</option>
                                <option value="1 day">1 day</option>
                                <option value="2-3 days">2-3 days</option>
                                <option value="1 week">1 week</option>
                                <option value="> 1 week">More than 1 week</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-500 mb-1 block">Frequency</label>
                              <select 
                                value={symptom.frequency}
                                onChange={(e) => updateSymptom(symptom.id, { frequency: e.target.value })}
                                className="w-full text-sm border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                              >
                                <option value="continuous">Continuous</option>
                                <option value="intermittent">Intermittent</option>
                                <option value="occasional">Occasional</option>
                                <option value="rare">Rare</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeSymptom(symptom.id)}
                          className="ml-4 p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <button 
                      onClick={analyzeSymptoms}
                      disabled={analyzingSymptoms}
                      className="w-full py-2.5 px-4 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <Brain className={`w-4 h-4 ${analyzingSymptoms ? 'animate-pulse' : ''}`} />
                      <span>{analyzingSymptoms ? 'Analyzing Symptoms...' : 'Analyze Symptoms with AI'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Analysis Results */}
              {symptomAnalysis && (
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">AI Analysis Results</h3>
                    <button
                      onClick={clearSymptomAnalysis}
                      className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Clear all symptoms and analysis"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear All</span>
                    </button>
                  </div>
                  
                  {/* Overview Section */}
                  {symptomAnalysis.overview && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-base text-gray-800 leading-relaxed">{symptomAnalysis.overview}</p>
                    </div>
                  )}

                  {symptomAnalysis.possibleConditions && symptomAnalysis.possibleConditions.length > 0 ? (
                    <div className="space-y-6">
                      {symptomAnalysis.possibleConditions.map((condition, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="p-5 rounded-lg border-l-4 border-primary-500 bg-white shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-bold text-gray-900">{condition.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-gray-600">
                              {condition.probability}%
                            </span>
                            <div className="w-20 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-primary-600 rounded-full"
                                style={{ width: `${condition.probability}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Condition Overview */}
                        {condition.overview && (
                          <p className="text-sm text-gray-700 mb-4 leading-relaxed">{condition.overview}</p>
                        )}

                        {/* Common Causes Section */}
                        {condition.commonCauses && (
                          <div className="mb-4">
                            <h5 className="text-base font-semibold text-gray-900 mb-3">Common Causes</h5>
                            
                            {condition.commonCauses.strainsAndSprains && condition.commonCauses.strainsAndSprains.length > 0 && (
                              <div className="mb-3">
                                <h6 className="text-sm font-semibold text-gray-800 mb-2">Strains and Sprains:</h6>
                                <p className="text-sm text-gray-700 mb-1">{condition.commonCauses.strainsAndSprains.join('; ')}</p>
                              </div>
                            )}

                            {condition.commonCauses.structuralIssues && condition.commonCauses.structuralIssues.length > 0 && (
                              <div className="mb-3">
                                <h6 className="text-sm font-semibold text-gray-800 mb-2">Structural Issues:</h6>
                                <p className="text-sm text-gray-700 mb-1">{condition.commonCauses.structuralIssues.join('; ')}</p>
                              </div>
                            )}

                            {condition.commonCauses.lifestyleFactors && condition.commonCauses.lifestyleFactors.length > 0 && (
                              <div className="mb-3">
                                <h6 className="text-sm font-semibold text-gray-800 mb-2">Lifestyle Factors:</h6>
                                <p className="text-sm text-gray-700 mb-1">{condition.commonCauses.lifestyleFactors.join('; ')}</p>
                              </div>
                            )}

                            {condition.commonCauses.medicalConditions && condition.commonCauses.medicalConditions.length > 0 && (
                              <div className="mb-3">
                                <h6 className="text-sm font-semibold text-gray-800 mb-2">Medical Conditions:</h6>
                                <p className="text-sm text-gray-700 mb-1">{condition.commonCauses.medicalConditions.join('; ')}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Description */}
                        {condition.description && (
                          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{condition.description}</p>
                        )}

                        {/* Recommendations */}
                        {condition.recommendations && condition.recommendations.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-semibold text-gray-900 mb-2">Recommendations:</h5>
                            <ul className="space-y-1.5">
                              {condition.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start space-x-2">
                                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* When to Seek Help */}
                        {condition.whenToSeekHelp && (
                          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                            <h6 className="text-sm font-semibold text-yellow-800 mb-1">When to Seek Medical Help:</h6>
                            <p className="text-sm text-yellow-700">{condition.whenToSeekHelp}</p>
                          </div>
                        )}
                      </motion.div>
                      ))}

                      {/* General Recommendations */}
                      {symptomAnalysis.generalRecommendations && symptomAnalysis.generalRecommendations.length > 0 && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <h5 className="text-base font-semibold text-gray-900 mb-3">General Recommendations</h5>
                          <ul className="space-y-2">
                            {symptomAnalysis.generalRecommendations.map((rec, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* When to Seek Help (General) */}
                      {symptomAnalysis.whenToSeekHelp && (
                        <div className="mt-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                          <h6 className="text-sm font-semibold text-red-800 mb-2">⚠️ When to Seek Immediate Medical Attention:</h6>
                          <p className="text-sm text-red-700">{symptomAnalysis.whenToSeekHelp}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No analysis results available</p>
                      <p className="text-sm text-gray-500">Please try analyzing your symptoms again.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Recommendations Tab */}
          {!loading && activeTab === 'recommendations' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {loadingRecommendations ? (
                <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                  <Brain className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-600">Generating personalized recommendations...</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Health Monitoring */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <Heart className="w-6 h-6 text-red-500" />
                      <h3 className="text-lg font-semibold text-gray-900">Health Monitoring</h3>
                    </div>
                    {recommendations.healthMonitoring.length > 0 ? (
                      <ul className="space-y-3">
                        {recommendations.healthMonitoring.map((rec, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">No specific monitoring recommendations at this time.</p>
                    )}
                  </div>

                  {/* Lifestyle Changes */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <Activity className="w-6 h-6 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-900">Lifestyle Changes</h3>
                    </div>
                    {recommendations.lifestyleChanges.length > 0 ? (
                      <ul className="space-y-3">
                        {recommendations.lifestyleChanges.map((rec, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">No specific lifestyle recommendations at this time.</p>
                    )}
                  </div>

                  {/* Appointments */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-6 h-6 text-purple-500" />
                      <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
                    </div>
                    {recommendations.appointments.length > 0 ? (
                      <ul className="space-y-3">
                        {recommendations.appointments.map((rec, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">No specific appointment recommendations at this time.</p>
                    )}
                  </div>

                  {/* Family Health */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <Users className="w-6 h-6 text-green-500" />
                      <h3 className="text-lg font-semibold text-gray-900">Family Health</h3>
                    </div>
                    {recommendations.familyHealth.length > 0 ? (
                      <ul className="space-y-3">
                        {recommendations.familyHealth.map((rec, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">No specific family health recommendations at this time.</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Refresh Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={loadRecommendations}
                  disabled={loadingRecommendations}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingRecommendations ? 'animate-spin' : ''}`} />
                  <span>{loadingRecommendations ? 'Updating...' : 'Refresh Recommendations'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
