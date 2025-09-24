'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
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
  severity: 'mild' | 'moderate' | 'severe'
  duration: string
  frequency: string
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

export default function SymptomChecker() {
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
    loadAnalysisHistory()
  }, [])

  const loadAnalysisHistory = async () => {
    try {
      // Mock analysis history
      const mockHistory: SymptomAnalysis[] = [
        {
          id: '1',
          symptoms: [
            { id: '1', name: 'Fever', category: 'General', severity: 'moderate', duration: '2 days', frequency: 'continuous' },
            { id: '2', name: 'Headache', category: 'Neurological', severity: 'mild', duration: '1 day', frequency: 'intermittent' }
          ],
          possibleConditions: [
            {
              name: 'Viral Infection',
              probability: 75,
              description: 'Common viral infection causing fever and headache',
              urgency: 'medium',
              recommendations: ['Rest and hydration', 'Over-the-counter fever reducers', 'Monitor symptoms']
            },
            {
              name: 'Flu',
              probability: 60,
              description: 'Influenza with typical symptoms',
              urgency: 'medium',
              recommendations: ['Antiviral medication if caught early', 'Rest and fluids', 'Avoid contact with others']
            }
          ],
          generalRecommendations: [
            'Get plenty of rest',
            'Stay hydrated',
            'Monitor temperature regularly',
            'Seek medical attention if symptoms worsen'
          ],
          urgencyLevel: 'medium',
          analysisDate: '2024-01-15T10:30:00Z',
          familyMemberId: 'divya-001',
          familyMemberName: 'Divya'
        }
      ]
      setAnalysisHistory(mockHistory)
    } catch (error) {
      console.error('Error loading analysis history:', error)
    }
  }

  const addSymptom = (symptom: CommonSymptom) => {
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
      setLoading(true)
      
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
            description: 'Influenza A (H1N1) like illness with symptoms such as fever, cough and body aches',
            urgency: 'medium',
            recommendations: ['Consider antiviral if within 48 hours', 'Rest and fluids', 'Monitor temperature and breathing']
          }
        ],
        generalRecommendations: [
          'Get adequate rest',
          'Stay hydrated',
          'Monitor symptoms for changes',
          'Consider over-the-counter symptom relief',
          'Seek medical attention if symptoms persist or worsen'
        ],
        urgencyLevel: 'medium',
        analysisDate: new Date().toISOString(),
        familyMemberId: 'divya-001',
        familyMemberName: 'Divya'
      }

      setAnalysis(mockAnalysis)
      setAnalysisHistory([mockAnalysis, ...analysisHistory])
      
    } catch (error) {
      console.error('Error analyzing symptoms:', error)
      alert('Error analyzing symptoms. Please try again.')
    } finally {
      setLoading(false)
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
              className="space-y-6"
            >
              {/* Selected Symptoms */}
              {selectedSymptoms.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Selected Symptoms</h3>
                  <div className="space-y-3">
                    {selectedSymptoms.map((symptom, index) => (
                      <motion.div
                        key={symptom.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{symptom.name}</h4>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {symptom.category}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="text-xs text-gray-500">Severity</label>
                              <select 
                                value={symptom.severity}
                                onChange={(e) => updateSymptom(symptom.id, { severity: e.target.value as any })}
                                className="w-full text-sm border rounded px-2 py-1"
                              >
                                <option value="mild">Mild</option>
                                <option value="moderate">Moderate</option>
                                <option value="severe">Severe</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Duration</label>
                              <select 
                                value={symptom.duration}
                                onChange={(e) => updateSymptom(symptom.id, { duration: e.target.value })}
                                className="w-full text-sm border rounded px-2 py-1"
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
                              <label className="text-xs text-gray-500">Frequency</label>
                              <select 
                                value={symptom.frequency}
                                onChange={(e) => updateSymptom(symptom.id, { frequency: e.target.value })}
                                className="w-full text-sm border rounded px-2 py-1"
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
                </div>
              )}

              {/* Symptom Search */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search symptoms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
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
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isSelected 
                            ? 'bg-primary-100 border-primary-300 text-primary-700' 
                            : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          {symptom.icon === Thermometer && <Thermometer className="w-4 h-4 mb-1 text-gray-600" />}
                          {symptom.icon === Activity && <Activity className="w-4 h-4 mb-1 text-gray-600" />}
                          {symptom.icon === Heart && <Heart className="w-4 h-4 mb-1 text-gray-600" />}
                          {symptom.icon === Eye && <Eye className="w-4 h-4 mb-1 text-gray-600" />}
                          <p className="text-sm font-medium text-center text-gray-900">{symptom.name}</p>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
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
                          • {symptom.name} ({symptom.severity})
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
