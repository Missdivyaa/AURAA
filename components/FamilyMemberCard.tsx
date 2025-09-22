'use client'

import { motion } from 'framer-motion'
import { 
  Heart, 
  Calendar, 
  Pill, 
  AlertTriangle, 
  CheckCircle,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Info,
  X
} from 'lucide-react'
import { useState } from 'react'
import HealthScoreExplanation from './HealthScoreExplanation'

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

interface FamilyMemberCardProps {
  member: FamilyMember
  index: number
  onRemove?: (id: string) => void
  onEdit?: (member: FamilyMember) => void
}

export default function FamilyMemberCard({ member, index, onRemove, onEdit }: FamilyMemberCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showHealthScore, setShowHealthScore] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'from-green-500 to-green-600'
      case 'good':
        return 'from-blue-500 to-blue-600'
      case 'fair':
        return 'from-yellow-500 to-yellow-600'
      case 'poor':
        return 'from-red-500 to-red-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return CheckCircle
      case 'good':
        return Heart
      case 'fair':
        return AlertTriangle
      case 'poor':
        return AlertTriangle
      default:
        return Heart
    }
  }

  const StatusIcon = getStatusIcon(member.status)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 card-hover group relative"
    >
      {/* Menu Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute top-12 right-4 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 w-full text-left">
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
          <button 
            onClick={() => { setShowMenu(false); onEdit?.(member) }}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 w-full text-left"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button onClick={() => { setShowMenu(false); onRemove?.(member.id) }} className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left">
            <Trash2 className="w-4 h-4" />
            <span>Remove</span>
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <img
            src={member.avatar}
            alt={member.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
            <p className="text-sm text-gray-600">{member.age} years • {member.relationship}</p>
          </div>
        </div>

        {/* Health Score */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Health Score</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowHealthScore(!showHealthScore)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                title="View health score details"
              >
                <Info className="w-4 h-4 text-gray-500" />
              </button>
              <div className={`w-6 h-6 bg-gradient-to-r ${getStatusColor(member.status)} rounded-full flex items-center justify-center`}>
                <StatusIcon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 bg-gradient-to-r ${getStatusColor(member.status)} rounded-full transition-all duration-500`}
                style={{ width: `${member.healthScore}%` }}
              />
            </div>
            <span className="text-sm font-bold text-gray-900">{member.healthScore}%</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Pill className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-900">{member.medications}</div>
            <div className="text-xs text-blue-700">Medications</div>
          </div>
          {member.nextAppointment && member.nextAppointment.trim() !== '' && (
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-green-900">
                {new Date(member.nextAppointment).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-xs text-green-700">Next Visit</div>
            </div>
          )}
        </div>

        {/* Conditions */}
        {member.conditions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Conditions</h4>
            <div className="flex flex-wrap gap-2">
              {member.conditions.slice(0, 2).map((condition, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                >
                  {condition}
                </span>
              ))}
              {member.conditions.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{member.conditions.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Last Checkup */}
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Last Checkup</div>
          <div className="font-medium text-gray-900">
            {new Date(member.lastCheckup).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Health Score Explanation Modal */}
      {showHealthScore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Health Score Details - {member.name}
                </h3>
                <button
                  onClick={() => setShowHealthScore(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <HealthScoreExplanation score={member.healthScore} status={member.status} />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
