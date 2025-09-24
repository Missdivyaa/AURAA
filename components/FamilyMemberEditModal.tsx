'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Plus, Trash2, Save, User, Pill, Activity, FileText, AlertTriangle } from 'lucide-react'
import { calculateHealthScore, getHealthStatus } from '@/lib/health-score-calculator'

interface Medication {
  name: string
  dosage: string
  frequency: string
  startDate: string
  purpose: string
}

interface Condition {
  name: string
  diagnosisDate: string
  severity: 'mild' | 'moderate' | 'severe'
  status: 'active' | 'inactive' | 'managed'
  doctor: string
}

interface LabResult {
  testName: string
  result: string
  normalRange: string
  date: string
  status: 'normal' | 'abnormal' | 'borderline'
}

interface VitalSign {
  type: string
  value: string
  unit: string
  recordedDate: string
  notes?: string
}

import { FamilyMember } from '@/lib/client-data-service'

interface FamilyMemberEditModalProps {
  member: FamilyMember
  isOpen: boolean
  onClose: () => void
  onSave: (updatedMember: FamilyMember) => void
}

export default function FamilyMemberEditModal({ member, isOpen, onClose, onSave }: FamilyMemberEditModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'medications' | 'conditions' | 'labs' | 'vitals' | 'symptoms' | 'allergies'>('basic')
  const [editedMember, setEditedMember] = useState<FamilyMember>(member)

  useEffect(() => {
    setEditedMember(prev => ({
      ...prev,
      ...member
    }))
  }, [member])

  // Auto-calculate health score when data changes
  useEffect(() => {
    const breakdown = calculateHealthScore(editedMember)
    setEditedMember(prev => ({
      ...prev,
      healthScore: breakdown.finalScore,
      status: getHealthStatus(breakdown.finalScore)
    }))
  }, [editedMember.conditions, editedMember.medications, editedMember.age, editedMember.lastCheckup, editedMember.nextAppointment])

  const handleSave = () => {
    onSave(editedMember)
    onClose()
  }

  // Medication management is simplified to a single count field on the Basic tab.

  const addCondition = () => {
    setEditedMember(prev => ({
      ...prev,
      conditions: [...prev.conditions, {
        name: '',
        diagnosisDate: new Date().toISOString().split('T')[0],
        severity: 'mild',
        status: 'active',
        doctor: ''
      }]
    }))
  }

  const updateCondition = (index: number, field: keyof Condition, value: string) => {
    setEditedMember(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      )
    }))
  }

  const removeCondition = (index: number) => {
    setEditedMember(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }))
  }

  const addLabResult = () => {
    setEditedMember(prev => ({
      ...prev,
      labResults: [...prev.labResults, {
        testName: '',
        result: '',
        normalRange: '',
        date: new Date().toISOString().split('T')[0],
        status: 'normal'
      }]
    }))
  }

  const updateLabResult = (index: number, field: keyof LabResult, value: string) => {
    setEditedMember(prev => ({
      ...prev,
      labResults: prev.labResults.map((lab, i) => 
        i === index ? { ...lab, [field]: value } : lab
      )
    }))
  }

  const removeLabResult = (index: number) => {
    setEditedMember(prev => ({
      ...prev,
      labResults: prev.labResults.filter((_, i) => i !== index)
    }))
  }

  const addVitalSign = () => {
    setEditedMember(prev => ({
      ...prev,
      vitalSigns: [...prev.vitalSigns, {
        type: '',
        value: '',
        unit: '',
        recordedDate: new Date().toISOString().split('T')[0],
        notes: ''
      }]
    }))
  }

  const updateVitalSign = (index: number, field: keyof VitalSign, value: string) => {
    setEditedMember(prev => ({
      ...prev,
      vitalSigns: prev.vitalSigns.map((vital, i) => 
        i === index ? { ...vital, [field]: value } : vital
      )
    }))
  }

  const removeVitalSign = (index: number) => {
    setEditedMember(prev => ({
      ...prev,
      vitalSigns: prev.vitalSigns.filter((_, i) => i !== index)
    }))
  }

  const addSymptom = () => {
    setEditedMember(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, {
        symptom: '',
        severity: 1,
        duration: '',
        recordedDate: new Date().toISOString().split('T')[0],
        triggers: []
      }]
    }))
  }

  const updateSymptom = (index: number, field: string, value: any) => {
    setEditedMember(prev => ({
      ...prev,
      symptoms: prev.symptoms.map((symptom, i) => 
        i === index ? { ...symptom, [field]: value } : symptom
      )
    }))
  }

  const removeSymptom = (index: number) => {
    setEditedMember(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }))
  }

  const addAllergy = () => {
    setEditedMember(prev => ({
      ...prev,
      allergies: [...prev.allergies, {
        allergen: '',
        reaction: '',
        severity: 'mild'
      }]
    }))
  }

  const updateAllergy = (index: number, field: keyof Allergy, value: string) => {
    setEditedMember(prev => ({
      ...prev,
      allergies: prev.allergies.map((allergy, i) => 
        i === index ? { ...allergy, [field]: value } : allergy
      )
    }))
  }

  const removeAllergy = (index: number) => {
    setEditedMember(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Edit {editedMember.name}'s Health Information
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'basic', label: 'Basic Info', icon: User },
            { id: 'medications', label: 'Medications', icon: Pill },
            { id: 'conditions', label: 'Conditions', icon: AlertTriangle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editedMember.name}
                    onChange={(e) => setEditedMember(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editedMember.dob ? editedMember.dob.split('T')[0] : ''}
                    onChange={(e) => {
                      const value = e.target.value
                      const birth = new Date(value)
                      let computedAge = 0
                      if (!isNaN(birth.getTime())) {
                        const today = new Date()
                        computedAge = today.getFullYear() - birth.getFullYear()
                        const m = today.getMonth() - birth.getMonth()
                        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) computedAge--
                      }
                      setEditedMember(prev => ({ 
                        ...prev, 
                        dob: value,
                        age: Math.max(0, computedAge) 
                      }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Age will be calculated automatically from DOB</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    value={editedMember.relationship}
                    onChange={(e) => setEditedMember(prev => ({ ...prev, relationship: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Health Score</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                    {editedMember.healthScore}% ({editedMember.status})
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Auto-calculated based on age, conditions, medications, and checkup history</p>
                  
                  {/* Health Score Breakdown */}
                  <details className="mt-2">
                    <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                      View calculation details
                    </summary>
                    <div className="mt-2 p-3 bg-blue-50 rounded-md text-xs">
                      {(() => {
                        const breakdown = calculateHealthScore(editedMember)
                        return (
                          <div>
                            <div className="font-medium mb-2">Score Breakdown:</div>
                            <div className="space-y-1">
                              <div>Base Score: 100</div>
                              {breakdown.ageAdjustment !== 0 && (
                                <div className={breakdown.ageAdjustment > 0 ? 'text-green-600' : 'text-red-600'}>
                                  Age: {breakdown.ageAdjustment > 0 ? '+' : ''}{breakdown.ageAdjustment}
                                </div>
                              )}
                              {breakdown.conditionPenalty !== 0 && (
                                <div className="text-red-600">
                                  Conditions: {breakdown.conditionPenalty}
                                </div>
                              )}
                              {breakdown.medicationPenalty !== 0 && (
                                <div className={breakdown.medicationPenalty > 0 ? 'text-green-600' : 'text-red-600'}>
                                  Medications: {breakdown.medicationPenalty > 0 ? '+' : ''}{breakdown.medicationPenalty}
                                </div>
                              )}
                              {breakdown.checkupBonus !== 0 && (
                                <div className={breakdown.checkupBonus > 0 ? 'text-green-600' : 'text-red-600'}>
                                  Checkups: {breakdown.checkupBonus > 0 ? '+' : ''}{breakdown.checkupBonus}
                                </div>
                              )}
                              {breakdown.appointmentBonus !== 0 && (
                                <div className={breakdown.appointmentBonus > 0 ? 'text-green-600' : 'text-red-600'}>
                                  Appointments: {breakdown.appointmentBonus > 0 ? '+' : ''}{breakdown.appointmentBonus}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </details>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Checkup</label>
                  <input
                    type="date"
                    value={editedMember.lastCheckup}
                    onChange={(e) => setEditedMember(prev => ({ ...prev, lastCheckup: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Appointment</label>
                  <input
                    type="date"
                    value={editedMember.nextAppointment}
                    onChange={(e) => setEditedMember(prev => ({ ...prev, nextAppointment: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'medications' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Medications</h3>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                  <div>
                    <div className="text-sm text-gray-600">Current count</div>
                    <div className="text-xl font-semibold text-gray-900">{editedMember.medications}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/medications?memberId=${editedMember.id}`} className="px-3 py-2 text-sm rounded-md border text-gray-700 hover:bg-gray-100">
                      View
                    </Link>
                    <Link href={`/medications?action=create&memberId=${editedMember.id}`} className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">
                      Add
                    </Link>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Manage medicines on the Medications page. The count updates automatically.</p>
              </div>
            </div>
          )}

          {activeTab === 'conditions' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Medical Conditions</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conditions (comma-separated)</label>
                  <input
                    type="text"
                    value={editedMember.conditions.join(', ')}
                    onChange={(e) => setEditedMember(prev => ({ 
                      ...prev, 
                      conditions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Type 2 Diabetes, Hypertension, High Cholesterol"
                  />
                  <p className="text-sm text-gray-500 mt-1">Enter medical conditions separated by commas</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
