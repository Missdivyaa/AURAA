'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import SmartInsights from '@/components/SmartInsights'
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

export default function AIInsights() {
  const searchParams = useSearchParams()
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
    loadAIInsights()
    
    // Check for URL parameter to set active tab
    const tabParam = searchParams.get('tab')
    if (tabParam === 'symptoms') {
      setActiveTab('symptoms')
    }
  }, [searchParams])

  const loadAIInsights = async () => {
    try {
      setLoading(true)
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock AI insights data
      const mockInsights: HealthInsight[] = [
        {
          id: '1',
          type: 'alert',
          title: 'Blood Pressure Trend Alert',
          description: 'Divya\'s blood pressure readings show an upward trend over the past 2 weeks. Consider scheduling a consultation.',
          severity: 'high',
          category: 'health',
          confidence: 87,
          actionable: true,
          timestamp: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          type: 'recommendation',
          title: 'Medication Optimization',
          description: 'Based on your health patterns, consider taking your hypertension medication in the morning for better effectiveness.',
          severity: 'medium',
          category: 'medication',
          confidence: 92,
          actionable: true,
          timestamp: '2024-01-15T09:15:00Z'
        },
        {
          id: '3',
          type: 'trend',
          title: 'Exercise Pattern Analysis',
          description: 'Your activity levels have decreased by 15% this week. Regular exercise can help manage hypertension.',
          severity: 'medium',
          category: 'lifestyle',
          confidence: 78,
          actionable: true,
          timestamp: '2024-01-14T16:45:00Z'
        },
        {
          id: '4',
          type: 'prediction',
          title: 'Health Score Projection',
          description: 'If current trends continue, your health score may drop to 78% by next month. Focus on medication adherence.',
          severity: 'medium',
          category: 'health',
          confidence: 85,
          actionable: true,
          timestamp: '2024-01-14T14:20:00Z'
        }
      ]

      const mockPredictions: HealthPrediction[] = [
        {
          memberId: 'divya-001',
          memberName: 'Divya',
          prediction: 'Risk of elevated blood pressure in next 30 days',
          riskLevel: 'medium',
          timeframe: 'Next 30 days',
          recommendations: [
            'Monitor blood pressure daily',
            'Maintain low-sodium diet',
            'Increase physical activity',
            'Ensure medication adherence'
          ]
        },
        {
          memberId: 'tushar-002',
          memberName: 'Tushar',
          prediction: 'Excellent health trajectory maintained',
          riskLevel: 'low',
          timeframe: 'Next 3 months',
          recommendations: [
            'Continue current lifestyle',
            'Maintain regular checkups',
            'Keep up exercise routine'
          ]
        }
      ]

      setInsights(mockInsights)
      setPredictions(mockPredictions)
      
    } catch (error) {
      console.error('Error loading AI insights:', error)
    } finally {
      setLoading(false)
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
    if (selectedSymptoms.length === 0) {
      alert('Please select at least one symptom to analyze')
      return
    }

    try {
      setAnalyzingSymptoms(true)
      
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock AI analysis
      const mockAnalysis: SymptomAnalysis = {
        id: Date.now().toString(),
        symptoms: selectedSymptoms,
        possibleConditions: [
          {
            name: 'Common Cold',
            probability: 85,
            description: 'Viral upper respiratory infection',
            urgency: 'low',
            recommendations: ['Rest and hydration', 'Over-the-counter cold medicine', 'Warm liquids']
          },
          {
            name: 'Swine Flu',
            probability: 60,
            description: 'Influenza A (H1N1) like illness with fever, cough, sore throat, body aches',
            urgency: 'medium',
            recommendations: ['Consider antivirals within 48 hours', 'Rest and fluids', 'Monitor temperature and breathing']
          }
        ],
        urgencyLevel: 'medium',
        analysisDate: new Date().toISOString()
      }

      setSymptomAnalysis(mockAnalysis)
      
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
                  onClick={loadAIInsights}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-md disabled:opacity-50 text-sm"
                >
                  <Brain className={`w-4 h-4 mr-2 ${loading ? 'animate-pulse' : ''}`} />
                  Refresh Insights
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
              <div className="grid gap-6">
                {predictions.map((prediction, index) => (
                  <motion.div
                    key={prediction.memberId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {prediction.memberName}
                        </h3>
                        <p className="text-gray-600">{prediction.prediction}</p>
                        <p className="text-sm text-gray-500 mt-1">Timeframe: {prediction.timeframe}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        prediction.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                        prediction.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {prediction.riskLevel} risk
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Recommendations:</h4>
                      <ul className="space-y-2">
                        {prediction.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
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
