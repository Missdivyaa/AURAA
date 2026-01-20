'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useUser, useAuth } from '@clerk/nextjs'
import Navigation from '@/components/Navigation'
import { graphqlRequest } from '@/lib/graphql-client'
import { 
  Search, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User,
  Heart,
  Activity,
  Thermometer,
  Eye,
  Headphones,
  Zap,
  Plus,
  X,
  ArrowRight,
  Info,
  Calendar,
  MapPin
} from 'lucide-react'

interface Symptom {
  id: string
  name: string
  category: string
  description?: string
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
  generalRecommendations: string[]
  urgencyLevel: 'low' | 'medium' | 'high'
  analysisDate: string
  familyMemberId: string
  familyMemberName: string
}

interface CommonSymptom {
  id: string
  name: string
  category: string
  icon: any
}

// GraphQL Queries and Mutations
const GET_SYMPTOM_ANALYSES = `
  query GetSymptomAnalyses {
    symptomAnalyses {
      id
      symptoms
      analysis
      conditions
      urgencyLevel
      createdAt
      memberId
      member {
        id
        name
      }
    }
  }
`

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

const DELETE_SYMPTOM_ANALYSIS = `
  mutation DeleteSymptomAnalysis($id: ID!) {
    deleteSymptomAnalysis(id: $id)
  }
`

export default function SymptomChecker() {
  const { isSignedIn, user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([])
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('checker')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddSymptom, setShowAddSymptom] = useState(false)
  const [analysisHistory, setAnalysisHistory] = useState<SymptomAnalysis[]>([])

  const commonSymptoms: CommonSymptom[] = [
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
      loadAnalysisHistory()
    }
  }, [isLoaded, isSignedIn, user])

  const loadAnalysisHistory = async () => {
    if (!user) return
    
    try {
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }
      
      const data = await graphqlRequest(GET_SYMPTOM_ANALYSES, {}, token)
      console.log('🔍 Loaded symptom analyses from GraphQL:', data)
      
      // Convert backend data to frontend format
      const formattedHistory: SymptomAnalysis[] = (data.symptomAnalyses || []).map((analysis: any) => {
        const symptoms = Array.isArray(analysis.symptoms) ? analysis.symptoms : []
        const conditions = Array.isArray(analysis.conditions) ? analysis.conditions : []
        const analysisData = analysis.analysis || {}
        
        return {
          id: analysis.id,
          symptoms: symptoms.map((s: any, idx: number) => ({
            id: idx.toString(),
            name: s.name || 'Unknown',
            category: s.category || 'General'
          })),
          possibleConditions: conditions.map((cond: any) => ({
            name: cond.name || 'Unknown Condition',
            probability: cond.probability || 50,
            description: cond.description || '',
            urgency: cond.urgency || 'medium' as const,
            recommendations: cond.recommendations || []
          })),
          generalRecommendations: analysisData.recommendations || [],
          urgencyLevel: analysis.urgencyLevel || 'medium' as const,
          analysisDate: analysis.createdAt,
          familyMemberId: analysis.memberId || '',
          familyMemberName: analysis.member?.name || 'Self'
        }
      })
      
      setAnalysisHistory(formattedHistory)
    } catch (error) {
      console.error('Error loading analysis history:', error)
      setAnalysisHistory([])
    }
  }

  const toggleSymptom = (symptom: CommonSymptom) => {
    const isSelected = selectedSymptoms.some(s => s.name === symptom.name)
    if (isSelected) {
      // Remove symptom
      setSelectedSymptoms(selectedSymptoms.filter(s => s.name !== symptom.name))
    } else {
      // Add symptom
      const newSymptom: Symptom = {
        id: Date.now().toString() + Math.random(),
        name: symptom.name,
        category: symptom.category
      }
      setSelectedSymptoms([...selectedSymptoms, newSymptom])
    }
  }

  const removeSymptom = (symptomId: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== symptomId))
  }


  const analyzeSymptoms = async () => {
    if (!user) return
    
    if (selectedSymptoms.length === 0) {
      alert('Please select at least one symptom to analyze')
      return
    }

    try {
      setLoading(true)
      
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }
      
      // Prepare symptoms data for GraphQL (simplified - no severity/duration/frequency)
      const symptomsData = selectedSymptoms.map(s => ({
        name: s.name,
        category: s.category
      }))
      
      const data = await graphqlRequest(ANALYZE_SYMPTOMS, { 
        symptoms: symptomsData,
        memberId: null 
      }, token)
      
      console.log('🔍 Symptom analysis result:', data)
      
      const result = data.analyzeSymptoms
      const analysisData = result.analysis || {}
      const conditions = result.conditions || []
      const symptoms = Array.isArray(result.symptoms) ? result.symptoms : symptomsData
      
      // Parse conditions from backend response
      let parsedConditions = []
      if (Array.isArray(conditions) && conditions.length > 0) {
        parsedConditions = conditions.map((cond: any) => ({
          name: cond.name || cond || 'Unknown Condition',
          probability: typeof cond === 'object' ? (cond.probability || 50) : 50,
          description: typeof cond === 'object' ? (cond.description || '') : '',
          urgency: typeof cond === 'object' ? (cond.urgency || 'medium') : 'medium',
          recommendations: typeof cond === 'object' ? (cond.recommendations || []) : []
        }))
      } else if (typeof conditions === 'object' && conditions !== null) {
        // Handle object format
        parsedConditions = Object.entries(conditions).map(([name, data]: [string, any]) => ({
          name: name,
          probability: data?.probability || 50,
          description: data?.description || '',
          urgency: data?.urgency || 'medium',
          recommendations: data?.recommendations || []
        }))
      }

      const formattedAnalysis: SymptomAnalysis = {
        id: result.id,
        symptoms: selectedSymptoms,
        possibleConditions: parsedConditions.length > 0 ? parsedConditions : [
          {
            name: 'General Assessment',
            probability: 50,
            description: 'Based on your symptoms, please consult with a healthcare professional for accurate diagnosis.',
            urgency: result.urgencyLevel || 'medium',
            recommendations: analysisData.recommendations || [
              'Get adequate rest',
              'Stay hydrated',
              'Monitor symptoms for changes',
              'Seek medical attention if symptoms persist or worsen'
            ]
          }
        ],
        generalRecommendations: analysisData.recommendations || analysisData.generalRecommendations || [
          'Get adequate rest',
          'Stay hydrated',
          'Monitor symptoms for changes',
          'Seek medical attention if symptoms persist or worsen'
        ],
        urgencyLevel: result.urgencyLevel || 'medium' as const,
        analysisDate: result.createdAt,
        familyMemberId: result.memberId || '',
        familyMemberName: result.member?.name || 'Self'
      }

      setAnalysis(formattedAnalysis)
      setAnalysisHistory([formattedAnalysis, ...analysisHistory])
      
      // Switch to analysis tab to show results
      setActiveTab('analysis')
      
      // Scroll to top to show results
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
    } catch (error) {
      console.error('Error analyzing symptoms:', error)
      alert('Error analyzing symptoms. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAnalysis = async (id: string) => {
    if (!user) return
    
    try {
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }
      
      await graphqlRequest(DELETE_SYMPTOM_ANALYSIS, { id }, token)
      
      // Remove from local state
      setAnalysisHistory(prev => prev.filter(a => a.id !== id))
      if (analysis?.id === id) {
        setAnalysis(null)
      }
      
      console.log('✅ Symptom analysis deleted:', id)
    } catch (error) {
      console.error('Error deleting symptom analysis:', error)
      alert('Failed to delete analysis. Please try again.')
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return AlertTriangle
      case 'medium': return Clock
      case 'low': return CheckCircle
      default: return Info
    }
  }

  const filteredSymptoms = commonSymptoms.filter(symptom =>
    searchTerm === '' ||
    symptom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    symptom.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const tabs = [
    { id: 'checker', name: 'Symptom Checker', icon: Search },
    { id: 'analysis', name: 'Analysis Results', icon: Brain },
    { id: 'history', name: 'History', icon: Calendar },
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
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                  AI Symptom Checker
                </h1>
                <p className="text-base text-gray-600">
                  Get AI-powered health insights based on your symptoms
                </p>
              </div>
              
              <div className="mt-6 lg:mt-0 flex space-x-3">
                <button 
                  onClick={analyzeSymptoms}
                  disabled={loading || selectedSymptoms.length === 0}
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg disabled:opacity-50"
                >
                  <Brain className={`w-5 h-5 mr-2 ${loading ? 'animate-pulse' : ''}`} />
                  {loading ? 'Analyzing...' : 'Analyze Symptoms'}
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
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
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

          {/* Symptom Checker Tab */}
          {activeTab === 'checker' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              {/* Symptom Search and Selector - Above */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search symptoms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[400px] overflow-y-auto">
                  {filteredSymptoms.map((symptom, index) => {
                    const isSelected = selectedSymptoms.some(s => s.name === symptom.name)
                    const Icon = symptom.icon
                    
                    return (
                      <button
                        key={symptom.id}
                        onClick={() => toggleSymptom(symptom)}
                        className={`p-2.5 rounded-lg border transition-all ${
                          isSelected 
                            ? 'bg-primary-500 border-primary-600 text-white shadow-sm' 
                            : 'bg-white border-gray-200 hover:border-primary-400 hover:bg-primary-50'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                          <p className={`text-xs font-medium text-center ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                            {symptom.name}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Selected Symptoms - Below */}
              {selectedSymptoms.length > 0 && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Selected Symptoms ({selectedSymptoms.length})
                    </h3>
                    <button
                      onClick={() => setSelectedSymptoms([])}
                      className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((symptom) => (
                      <div
                        key={symptom.id}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-primary-50 border border-primary-200 text-primary-700 rounded-lg text-sm"
                      >
                        <span>{symptom.name}</span>
                        <button
                          onClick={() => removeSymptom(symptom.id)}
                          className="hover:text-red-600 transition-colors ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Analysis Results Tab */}
          {activeTab === 'analysis' && analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Analysis Summary */}
              <div className={`bg-white rounded-2xl p-6 shadow-lg border-l-4 ${getUrgencyColor(analysis.urgencyLevel)}`}>
                <div className="flex items-center space-x-3 mb-4">
                  {(() => {
                    const Icon = getUrgencyIcon(analysis.urgencyLevel)
                    return <Icon className="w-6 h-6" />
                  })()}
                  <h3 className="text-lg font-semibold text-gray-900">Analysis Summary</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Based on your symptoms, here's what our AI analysis found:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Symptoms Analyzed</h4>
                    <ul className="space-y-1">
                      {analysis.symptoms.map((symptom, idx) => (
                        <li key={idx} className="text-sm text-gray-600">
                          • {symptom.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Urgency Level</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      analysis.urgencyLevel === 'high' ? 'bg-red-100 text-red-800' :
                      analysis.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {analysis.urgencyLevel.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Possible Conditions */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Possible Conditions</h3>
                <div className="space-y-4">
                  {analysis.possibleConditions.map((condition, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-l-4 ${getUrgencyColor(condition.urgency)}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-base font-semibold text-gray-900">{condition.name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600">
                            {condition.probability}% probability
                          </span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-primary-600 rounded-full"
                              style={{ width: `${condition.probability}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{condition.description}</p>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Recommendations:</h5>
                        <ul className="space-y-1">
                          {condition.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* General Recommendations */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">General Recommendations</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {analysis.generalRecommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
                  <div>
                    <h4 className="text-lg font-semibold text-yellow-900 mb-2">
                      Important Medical Disclaimer
                    </h4>
                    <p className="text-yellow-800 text-sm">
                      This AI analysis is for informational purposes only and should not replace professional medical advice. 
                      Always consult with a healthcare provider for proper diagnosis and treatment. 
                      If you're experiencing a medical emergency, call emergency services immediately.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {analysisHistory.length > 0 ? (
                <div className="space-y-4">
                  {analysisHistory.map((analysis, index) => (
                    <motion.div
                      key={analysis.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="bg-white rounded-2xl p-6 shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{analysis.familyMemberName}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(analysis.analysisDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          analysis.urgencyLevel === 'high' ? 'bg-red-100 text-red-800' :
                          analysis.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {analysis.urgencyLevel.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Symptoms:</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.symptoms.map((symptom, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                                {symptom.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Top Condition:</h4>
                          <p className="text-gray-600">
                            {analysis.possibleConditions[0]?.name} ({analysis.possibleConditions[0]?.probability}% probability)
                          </p>
                        </div>
                      </div>
                      
                      <button className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1">
                        <span>View Full Analysis</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No analysis history</h3>
                  <p className="text-gray-600">Your symptom analyses will appear here</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
