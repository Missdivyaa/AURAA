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
  ArrowRight
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
  possibleConditions: {
    name: string
    probability: number
    description: string
    urgency: 'low' | 'medium' | 'high'
    recommendations: string[]
  }[]
  urgencyLevel: 'low' | 'medium' | 'high'
  analysisDate: string
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
    }
    
    // Check for URL parameter to set active tab
    const tabParam = searchParams.get('tab')
    if (tabParam === 'symptoms') {
      setActiveTab('symptoms')
    }
  }, [searchParams, isLoaded, isSignedIn, user])

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
      const formattedInsights: HealthInsight[] = (data.aiInsights || []).map((insight: any) => {
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
      const formattedPredictions: HealthPrediction[] = formattedInsights
        .filter(i => i.type === 'prediction')
        .map(insight => {
          const insightData = (data.aiInsights || []).find((i: any) => i.id === insight.id);
          const actionItems = insightData?.actionItems || {};
          const allRecommendations = [
            ...(actionItems.immediate || []),
            ...(actionItems.shortTerm || []),
            ...(actionItems.longTerm || [])
          ];

          return {
            memberId: insightData?.memberId || '',
            memberName: insightData?.member?.name || 'Family Member',
            prediction: insight.description,
            riskLevel: insight.severity as 'low' | 'medium' | 'high',
            timeframe: insightData?.data?.timeframe || '5-10 years',
            recommendations: allRecommendations,
            probability: insightData?.data?.probability || 0,
            condition: insightData?.data?.condition || '',
            riskFactors: insightData?.data?.riskFactors || [],
            confidence: insight.confidence
          };
        })
      
      setInsights(formattedInsights)
      setPredictions(formattedPredictions)
      
    } catch (error) {
      console.error('Error loading AI insights:', error)
      setInsights([])
      setPredictions([])
    } finally {
      setLoading(false)
    }
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
      
    } catch (error) {
      console.error('Error generating AI insights:', error)
      alert('Failed to generate insights. Please try again.')
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
      const analysis = result.analysis || {}
      const conditions = result.conditions || []
      
      const formattedAnalysis: SymptomAnalysis = {
        id: result.id,
        symptoms: selectedSymptoms,
        possibleConditions: Array.isArray(conditions) ? conditions.map((cond: any) => ({
          name: cond.name || 'Unknown Condition',
          probability: cond.probability || 50,
          description: cond.description || '',
          urgency: cond.urgency || 'medium' as const,
          recommendations: cond.recommendations || []
        })) : [],
        urgencyLevel: result.urgencyLevel || 'medium' as const,
        analysisDate: result.createdAt
      }

      setSymptomAnalysis(formattedAnalysis)
      
    } catch (error) {
      console.error('Error analyzing symptoms:', error)
      alert('Error analyzing symptoms. Please try again.')
    } finally {
      setAnalyzingSymptoms(false)
    }
  }

  const filteredSymptoms = commonSymptoms.filter(symptom =>
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
              {/* Smart Insights Component */}
              <SmartInsights />
              
              <div className="space-y-3">
                {insights.map((insight, index) => {
                  const SeverityIcon = getSeverityIcon(insight.severity)
                  const TypeIcon = getTypeIcon(insight.type)
                  
                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={`bg-white rounded-xl p-4 shadow-md border-l-4 ${getSeverityColor(insight.severity)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <TypeIcon className="w-4 h-4 text-primary-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-base font-semibold text-gray-900">{insight.title}</h3>
                            <SeverityIcon className="w-3 h-3" />
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Shield className="w-3 h-3 mr-1" />
                              {insight.confidence}% confidence
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(insight.timestamp).toLocaleDateString()}
                            </span>
                            <span className="capitalize">{insight.category}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
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
                        key={prediction.memberId || `prediction-${index}`}
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
              {/* Selected Symptoms */}
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

              {/* Symptom Search */}
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

              {/* Analysis Results */}
              {symptomAnalysis && (
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">AI Analysis Results</h3>
                  
                  <div className="space-y-3">
                    {symptomAnalysis.possibleConditions.map((condition, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="p-3 rounded-lg border-l-4 border-primary-500 bg-primary-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-bold text-gray-900">{condition.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-gray-600">
                              {condition.probability}%
                            </span>
                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-primary-600 rounded-full"
                                style={{ width: `${condition.probability}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{condition.description}</p>
                        <div>
                          <h5 className="text-sm font-semibold text-gray-900 mb-1">Recommendations:</h5>
                          <ul className="space-y-1">
                            {condition.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start space-x-2">
                                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    ))}
                  </div>
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
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <Heart className="w-6 h-6 text-red-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Health Monitoring</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-gray-600">Schedule regular blood pressure monitoring</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-gray-600">Track medication adherence daily</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-gray-600">Monitor sleep patterns and quality</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <Activity className="w-6 h-6 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Lifestyle Changes</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-gray-600">Increase daily physical activity by 30 minutes</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-gray-600">Reduce sodium intake to less than 2g per day</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-gray-600">Practice stress management techniques</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <Calendar className="w-6 h-6 text-purple-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-gray-600">Schedule cardiology consultation within 2 weeks</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-gray-600">Book annual physical examination</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-gray-600">Follow up on blood work results</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <Users className="w-6 h-6 text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Family Health</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-gray-600">Encourage family members to track health metrics</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-gray-600">Schedule family health checkups together</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-gray-600">Share healthy lifestyle habits as a family</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
