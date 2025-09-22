'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { aiAnalysisService } from '@/lib/ai-analysis-service'
import { 
  Brain,
  Upload,
  FileText,
  Pill,
  Calendar,
  Heart,
  AlertTriangle,
  Activity,
  CheckCircle,
  Zap,
  ArrowRight,
  Play,
  RefreshCw
} from 'lucide-react'

export default function AIDemo() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)

  const demoSteps = [
    {
      title: 'Upload Report',
      description: 'User uploads a blood test report',
      icon: Upload,
      color: 'bg-blue-500'
    },
    {
      title: 'OCR Processing',
      description: 'AI extracts text and data from the document',
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      title: 'AI Analysis',
      description: 'AI analyzes health data and identifies patterns',
      icon: Brain,
      color: 'bg-purple-500'
    },
    {
      title: 'Auto Actions',
      description: 'AI creates medications, appointments, and reminders',
      icon: Zap,
      color: 'bg-orange-500'
    },
    {
      title: 'Predictions',
      description: 'AI generates health predictions and recommendations',
      icon: Heart,
      color: 'bg-red-500'
    }
  ]

  const runDemo = async () => {
    setIsProcessing(true)
    setCurrentStep(0)
    setShowResults(false)

    // Simulate each step
    for (let i = 0; i < demoSteps.length; i++) {
      setCurrentStep(i)
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    // Generate demo results
    const demoResults = {
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          confidence: 0.95,
          actionTaken: true
        },
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          confidence: 0.88,
          actionTaken: true
        }
      ],
      appointments: [
        {
          specialty: 'Cardiology',
          reason: 'Follow-up for high blood pressure',
          urgency: 'medium',
          suggestedDate: '2024-02-15',
          confidence: 0.92,
          actionTaken: true
        }
      ],
      conditions: [
        {
          name: 'Hypertension',
          severity: 'moderate',
          status: 'active',
          confidence: 0.89
        }
      ],
      predictions: [
        {
          condition: 'Cardiovascular Disease',
          probability: 0.75,
          timeframe: '5-10 years',
          confidence: 0.85
        }
      ],
      alerts: [
        {
          message: 'High cholesterol detected (220 mg/dL)',
          severity: 'warning',
          actionRequired: true,
          confidence: 0.98
        }
      ]
    }

    setResults(demoResults)
    setShowResults(true)
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-8">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  AI Health Assistant Demo
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  See how AI automatically analyzes your health reports
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Demo Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How AI Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {demoSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep >= index
              const isCurrent = currentStep === index
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-6 rounded-2xl border-2 transition-all ${
                    isCurrent 
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                      : isActive 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                      isCurrent ? 'bg-blue-500' : isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className={`font-bold text-lg mb-2 ${
                      isCurrent ? 'text-blue-800' : isActive ? 'text-green-800' : 'text-gray-600'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm ${
                      isCurrent ? 'text-blue-600' : isActive ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  
                  {isCurrent && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 text-white animate-spin" />
                    </div>
                  )}
                  
                  {isActive && !isCurrent && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  {index < demoSteps.length - 1 && (
                    <div className="absolute top-1/2 -right-2 transform -translate-y-1/2">
                      <ArrowRight className={`w-4 h-4 ${
                        isActive ? 'text-green-500' : 'text-gray-300'
                      }`} />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Demo Button */}
        <div className="text-center mb-12">
          <button
            onClick={runDemo}
            disabled={isProcessing}
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span>AI Processing...</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                <span>Run AI Demo</span>
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {showResults && results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              AI Analysis Results
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Medications */}
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center space-x-2">
                  <Pill className="w-5 h-5" />
                  <span>Medications ({results.medications.length})</span>
                </h3>
                <div className="space-y-3">
                  {results.medications.map((med: any, index: number) => (
                    <div key={index} className="bg-white rounded-xl p-4">
                      <div className="font-semibold text-blue-900">{med.name} {med.dosage}</div>
                      <div className="text-sm text-blue-700">{med.frequency}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-blue-600">
                          Confidence: {Math.round(med.confidence * 100)}%
                        </span>
                        {med.actionTaken && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Appointments */}
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Appointments ({results.appointments.length})</span>
                </h3>
                <div className="space-y-3">
                  {results.appointments.map((apt: any, index: number) => (
                    <div key={index} className="bg-white rounded-xl p-4">
                      <div className="font-semibold text-green-900">{apt.specialty}</div>
                      <div className="text-sm text-green-700">{apt.reason}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-green-600">
                          Suggested: {apt.suggestedDate}
                        </span>
                        {apt.actionTaken && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
                <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center space-x-2">
                  <Heart className="w-5 h-5" />
                  <span>Conditions ({results.conditions.length})</span>
                </h3>
                <div className="space-y-3">
                  {results.conditions.map((condition: any, index: number) => (
                    <div key={index} className="bg-white rounded-xl p-4">
                      <div className="font-semibold text-orange-900">{condition.name}</div>
                      <div className="text-sm text-orange-700">Severity: {condition.severity}</div>
                      <div className="text-xs text-orange-600 mt-1">
                        Confidence: {Math.round(condition.confidence * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Predictions */}
              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Predictions ({results.predictions.length})</span>
                </h3>
                <div className="space-y-3">
                  {results.predictions.map((pred: any, index: number) => (
                    <div key={index} className="bg-white rounded-xl p-4">
                      <div className="font-semibold text-purple-900">{pred.condition}</div>
                      <div className="text-sm text-purple-700">
                        {Math.round(pred.probability * 100)}% probability
                      </div>
                      <div className="text-xs text-purple-600 mt-1">
                        Timeframe: {pred.timeframe}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Alerts ({results.alerts.length})</span>
                </h3>
                <div className="space-y-3">
                  {results.alerts.map((alert: any, index: number) => (
                    <div key={index} className="bg-white rounded-xl p-4">
                      <div className="font-semibold text-red-900">{alert.message}</div>
                      <div className="text-sm text-red-700">Severity: {alert.severity}</div>
                      <div className="text-xs text-red-600 mt-1">
                        Action Required: {alert.actionRequired ? 'Yes' : 'No'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                🤖 AI Actions Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {results.medications.length}
                  </div>
                  <div className="text-gray-700">Medications Added</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {results.appointments.length}
                  </div>
                  <div className="text-gray-700">Appointments Scheduled</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {results.predictions.length}
                  </div>
                  <div className="text-gray-700">Predictions Generated</div>
                </div>
              </div>
              <p className="text-center text-gray-600 mt-6">
                <strong>All actions were taken automatically by AI!</strong> No manual input required.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
