'use client'

import React, { useState } from 'react'
import { Search, AlertCircle, CheckCircle } from 'lucide-react'

interface Symptom {
  id: string
  name: string
  severity: 'low' | 'medium' | 'high'
  category: string
}

interface SymptomCheckerProps {
  onSymptomSelect?: (symptoms: Symptom[]) => void
}

export default function SymptomChecker({ onSymptomSelect }: SymptomCheckerProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const commonSymptoms: Symptom[] = [
    { id: '1', name: 'Fever', severity: 'high', category: 'General' },
    { id: '2', name: 'Headache', severity: 'medium', category: 'Neurological' },
    { id: '3', name: 'Cough', severity: 'medium', category: 'Respiratory' },
    { id: '4', name: 'Nausea', severity: 'medium', category: 'Digestive' },
    { id: '5', name: 'Fatigue', severity: 'low', category: 'General' },
    { id: '6', name: 'Dizziness', severity: 'medium', category: 'Neurological' },
    { id: '7', name: 'Chest Pain', severity: 'high', category: 'Cardiovascular' },
    { id: '8', name: 'Shortness of Breath', severity: 'high', category: 'Respiratory' },
  ]

  const filteredSymptoms = commonSymptoms.filter(symptom =>
    symptom.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleSymptom = (symptom: Symptom) => {
    const isSelected = selectedSymptoms.some(s => s.id === symptom.id)
    if (isSelected) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== symptom.id))
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom])
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertCircle className="w-4 h-4" />
      case 'medium': return <AlertCircle className="w-4 h-4" />
      case 'low': return <CheckCircle className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Symptom Checker</h3>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search symptoms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-2 mb-4">
        {filteredSymptoms.map(symptom => (
          <div
            key={symptom.id}
            onClick={() => toggleSymptom(symptom)}
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedSymptoms.some(s => s.id === symptom.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="font-medium">{symptom.name}</span>
              <span className="text-sm text-gray-500">({symptom.category})</span>
            </div>
            <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(symptom.severity)}`}>
              {getSeverityIcon(symptom.severity)}
              <span className="capitalize">{symptom.severity}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedSymptoms.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Selected Symptoms:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedSymptoms.map(symptom => (
              <span
                key={symptom.id}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {symptom.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


