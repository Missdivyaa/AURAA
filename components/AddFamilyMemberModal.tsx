'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Loader } from 'lucide-react'

interface AddFamilyMemberModalProps {
  isOpen: boolean
  onClose: () => void
  patientName: string
  patientInfo?: {
    age?: number
    gender?: string
    bloodType?: string
  }
  onConfirm: (relationship: string) => Promise<void>
}

const RELATIONSHIPS = [
  'Self',
  'Spouse',
  'Child',
  'Parent',
  'Sibling',
  'Grandparent',
  'Grandchild',
  'Other'
]

export default function AddFamilyMemberModal({
  isOpen,
  onClose,
  patientName,
  patientInfo,
  onConfirm
}: AddFamilyMemberModalProps) {
  const [selectedRelationship, setSelectedRelationship] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!selectedRelationship) {
      setError('Please select a relationship')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onConfirm(selectedRelationship)
      // Reset state
      setSelectedRelationship('')
      setError(null)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to add family member')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedRelationship('')
      setError(null)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-xl">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Add Family Member</h2>
                    <p className="text-sm text-gray-500">We found a report for someone not in your family list</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Patient Info */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Report Patient:</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-semibold text-gray-900">{patientName}</span>
                    </div>
                    {patientInfo?.age && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Age:</span>
                        <span className="font-semibold text-gray-900">{patientInfo.age} years</span>
                      </div>
                    )}
                    {patientInfo?.gender && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-semibold text-gray-900">{patientInfo.gender}</span>
                      </div>
                    )}
                    {patientInfo?.bloodType && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Blood Type:</span>
                        <span className="font-semibold text-gray-900">{patientInfo.bloodType}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Relationship Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    What is {patientName}'s relationship to you?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {RELATIONSHIPS.map((relationship) => (
                      <button
                        key={relationship}
                        type="button"
                        onClick={() => {
                          setSelectedRelationship(relationship)
                          setError(null)
                        }}
                        disabled={isSubmitting}
                        className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                          selectedRelationship === relationship
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {relationship}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!selectedRelationship || isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <span>Add & Continue</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

