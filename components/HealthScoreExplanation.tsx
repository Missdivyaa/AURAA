'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Info, TrendingUp, TrendingDown, Minus, Heart, Calendar, Pill, AlertTriangle } from 'lucide-react'

interface HealthScoreExplanationProps {
  score: number
  status: 'excellent' | 'good' | 'fair' | 'poor'
}

export default function HealthScoreExplanation({ score, status }: HealthScoreExplanationProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200'
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'poor': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return TrendingUp
      case 'good': return Heart
      case 'fair': return Minus
      case 'poor': return TrendingDown
      default: return Heart
    }
  }

  const StatusIcon = getStatusIcon(status)

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(status).split(' ')[1]}`}>
            <StatusIcon className={`w-6 h-6 ${getStatusColor(status).split(' ')[0]}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Health Score</h3>
            <p className="text-sm text-gray-600">Current status: {status}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">{score}%</div>
          <div className="text-sm text-gray-500">out of 100</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Health Score</span>
          <span>{score}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              score >= 90 ? 'bg-green-500' :
              score >= 75 ? 'bg-blue-500' :
              score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* What this means */}
      <div className={`p-4 rounded-lg border ${getStatusColor(status)} mb-4`}>
        <h4 className="font-semibold mb-2">What this means:</h4>
        <p className="text-sm">
          {status === 'excellent' && "Excellent health! Keep up the great work with regular checkups and healthy lifestyle choices."}
          {status === 'good' && "Good health overall. Continue maintaining your current routine and consider preventive care."}
          {status === 'fair' && "Fair health. Focus on improving lifestyle factors and stay consistent with medical appointments."}
          {status === 'poor' && "Health needs attention. Please consult with healthcare providers and prioritize health improvements."}
        </p>
      </div>

      {/* Detailed explanation */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm py-2"
      >
        <Info className="w-4 h-4" />
        <span>{showDetails ? 'Hide' : 'Show'} calculation details</span>
      </button>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 space-y-4"
        >
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">How your health score is calculated:</h4>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Heart className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Base Score: 100 points (perfect health)</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-gray-700">Age adjustments: -5 to -15 points based on age group</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-gray-700">Medical conditions: -5 to -20 points per condition</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Pill className="w-4 h-4 text-blue-500" />
                <span className="text-gray-700">Medications: -10 to -20 points (or +5 for no medications)</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">Preventive care: +10 points for recent checkups, -15 for no checkups</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span className="text-gray-700">Future appointments: +2 to +5 points for scheduled care</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2">💡 Tips to improve your score:</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Schedule regular health checkups (annually recommended)</li>
              <li>• Keep upcoming medical appointments</li>
              <li>• Manage chronic conditions with proper care</li>
              <li>• Maintain a healthy lifestyle</li>
              <li>• Follow medication regimens as prescribed</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> This health score is calculated based on objective health factors like age, 
              medical conditions, medications, and preventive care history. It's designed to help track health 
              trends over time and provide insights for health management. Always consult with healthcare 
              professionals for medical advice.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}


