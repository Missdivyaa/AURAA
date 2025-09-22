'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { 
  Pill, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Activity,
  Heart,
  Brain,
  Shield,
  Bell,
  Filter,
  Search,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  timing: string[]
  startDate: string
  endDate?: string
  prescribedBy: string
  purpose: string
  sideEffects: string[]
  familyMemberId: string
  familyMemberName: string
  status: 'active' | 'completed' | 'discontinued'
  reminders: {
    id: string
    time: string
    enabled: boolean
  }[]
  adherence: number // percentage
  lastTaken?: string
  nextDose?: string
}

interface MedicationReminder {
  id: string
  medicationId: string
  medicationName: string
  time: string
  familyMemberName: string
  status: 'pending' | 'taken' | 'missed'
  date: string
}

export default function Medications() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [reminders, setReminders] = useState<MedicationReminder[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('medications')
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadMedications()
  }, [])

  const loadMedications = async () => {
    try {
      setLoading(true)
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock medications data
      const mockMedications: Medication[] = [
        {
          id: '1',
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          timing: ['morning'],
          startDate: '2024-01-01',
          prescribedBy: 'Dr. Sarah Johnson',
          purpose: 'Blood pressure management',
          sideEffects: ['Dry cough', 'Dizziness'],
          familyMemberId: 'divya-001',
          familyMemberName: 'Divya',
          status: 'active',
          reminders: [
            { id: '1', time: '08:00', enabled: true }
          ],
          adherence: 95,
          lastTaken: '2024-01-15T08:00:00Z',
          nextDose: '2024-01-16T08:00:00Z'
        },
        {
          id: '2',
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          timing: ['morning', 'evening'],
          startDate: '2024-01-01',
          prescribedBy: 'Dr. Sarah Johnson',
          purpose: 'Diabetes management',
          sideEffects: ['Nausea', 'Diarrhea'],
          familyMemberId: 'divya-001',
          familyMemberName: 'Divya',
          status: 'active',
          reminders: [
            { id: '2', time: '08:00', enabled: true },
            { id: '3', time: '20:00', enabled: true }
          ],
          adherence: 88,
          lastTaken: '2024-01-15T20:00:00Z',
          nextDose: '2024-01-16T08:00:00Z'
        },
        {
          id: '3',
          name: 'Vitamin D3',
          dosage: '1000 IU',
          frequency: 'Once daily',
          timing: ['morning'],
          startDate: '2024-01-10',
          prescribedBy: 'Dr. Michael Chen',
          purpose: 'Vitamin supplementation',
          sideEffects: [],
          familyMemberId: 'tushar-002',
          familyMemberName: 'Tushar',
          status: 'active',
          reminders: [
            { id: '4', time: '09:00', enabled: true }
          ],
          adherence: 100,
          lastTaken: '2024-01-15T09:00:00Z',
          nextDose: '2024-01-16T09:00:00Z'
        }
      ]

      const mockReminders: MedicationReminder[] = [
        {
          id: '1',
          medicationId: '1',
          medicationName: 'Lisinopril',
          time: '08:00',
          familyMemberName: 'Divya',
          status: 'taken',
          date: '2024-01-15'
        },
        {
          id: '2',
          medicationId: '2',
          medicationName: 'Metformin',
          time: '08:00',
          familyMemberName: 'Divya',
          status: 'taken',
          date: '2024-01-15'
        },
        {
          id: '3',
          medicationId: '2',
          medicationName: 'Metformin',
          time: '20:00',
          familyMemberName: 'Divya',
          status: 'pending',
          date: '2024-01-15'
        },
        {
          id: '4',
          medicationId: '3',
          medicationName: 'Vitamin D3',
          time: '09:00',
          familyMemberName: 'Tushar',
          status: 'taken',
          date: '2024-01-15'
        }
      ]

      setMedications(mockMedications)
      setReminders(mockReminders)
      
    } catch (error) {
      console.error('Error loading medications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200'
      case 'completed': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'discontinued': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 90) return 'text-green-600'
    if (adherence >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         med.familyMemberName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || med.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const tabs = [
    { id: 'medications', name: 'Medications', icon: Pill, count: medications.length },
    { id: 'reminders', name: 'Reminders', icon: Bell, count: reminders.filter(r => r.status === 'pending').length },
    { id: 'adherence', name: 'Adherence', icon: TrendingUp },
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
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                  Medications
                </h1>
                <p className="text-base text-gray-600">
                  Track and manage your family's medications
                </p>
              </div>
              
              <div className="mt-6 lg:mt-0 flex space-x-3">
                <button className="inline-flex items-center px-4 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors shadow-lg">
                  <Filter className="w-5 h-5 mr-2" />
                  Filter
                </button>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Medication
                </button>
              </div>
            </div>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search medications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
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
                    {tab.count !== undefined && (
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {tab.count}
                      </span>
                    )}
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
                <Pill className="w-6 h-6 animate-pulse text-primary-600" />
                <p className="text-xl text-gray-600">Loading medications...</p>
              </div>
            </motion.div>
          )}

          {/* Medications Tab */}
          {!loading && activeTab === 'medications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {filteredMedications.length > 0 ? (
                <div className="grid gap-6">
                  {filteredMedications.map((medication, index) => (
                    <motion.div
                      key={medication.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={`bg-white rounded-3xl p-8 shadow-xl border-l-4 ${getStatusColor(medication.status)}`}
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                            <Pill className="w-8 h-8 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{medication.name}</h3>
                            <p className="text-lg text-gray-600 mb-1">{medication.dosage} • {medication.frequency}</p>
                            <p className="text-lg text-gray-500">{medication.familyMemberName}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-3 text-gray-400 hover:text-blue-600 transition-colors">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button className="p-3 text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Purpose</h4>
                            <p className="text-lg text-gray-600">{medication.purpose}</p>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Prescribed By</h4>
                            <p className="text-lg text-gray-600">{medication.prescribedBy}</p>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Timing</h4>
                            <div className="flex flex-wrap gap-2">
                              {medication.timing.map((time, idx) => (
                                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                  {time}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Adherence</h4>
                            <div className="flex items-center space-x-3">
                              <div className="w-24 h-3 bg-gray-200 rounded-full">
                                <div 
                                  className="h-3 bg-primary-600 rounded-full"
                                  style={{ width: `${medication.adherence}%` }}
                                />
                              </div>
                              <span className={`text-lg font-bold ${getAdherenceColor(medication.adherence)}`}>
                                {medication.adherence}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Next Dose</h4>
                            <p className="text-lg text-gray-600">
                              {medication.nextDose ? new Date(medication.nextDose).toLocaleString() : 'Not scheduled'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Side Effects</h4>
                            <div className="flex flex-wrap gap-2">
                              {medication.sideEffects.length > 0 ? (
                                medication.sideEffects.map((effect, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                                    {effect}
                                  </span>
                                ))
                              ) : (
                                <span className="text-lg text-gray-500">None reported</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-lg font-medium">
                          Mark as Taken
                        </button>
                        <button className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors text-lg font-medium">
                          Edit Reminders
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">No medications found</h3>
                  <p className="text-xl text-gray-600 mb-4">Add medications to start tracking</p>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-lg font-medium"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Medication
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Reminders Tab */}
          {!loading && activeTab === 'reminders' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="grid gap-6">
                {reminders.map((reminder, index) => (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`bg-white rounded-3xl p-6 shadow-xl border-l-4 ${
                      reminder.status === 'taken' ? 'border-green-500' :
                      reminder.status === 'missed' ? 'border-red-500' :
                      'border-yellow-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                          <Bell className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{reminder.medicationName}</h3>
                          <p className="text-lg text-gray-600">{reminder.familyMemberName}</p>
                          <p className="text-lg text-gray-500">{reminder.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          reminder.status === 'taken' ? 'bg-green-100 text-green-800' :
                          reminder.status === 'missed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reminder.status}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">{reminder.date}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Adherence Tab */}
          {!loading && activeTab === 'adherence' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {medications.map((medication, index) => (
                  <motion.div
                    key={medication.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-3xl p-6 shadow-xl"
                  >
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{medication.name}</h3>
                      <p className="text-lg text-gray-600">{medication.familyMemberName}</p>
                    </div>
                    
                    <div className="text-center mb-4">
                      <div className="w-24 h-24 mx-auto mb-3 relative">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - medication.adherence / 100)}`}
                            className={getAdherenceColor(medication.adherence)}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-2xl font-bold ${getAdherenceColor(medication.adherence)}`}>
                            {medication.adherence}%
                          </span>
                        </div>
                      </div>
                      <p className="text-lg text-gray-600">Adherence Rate</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last Taken</span>
                        <span className="text-gray-900">
                          {medication.lastTaken ? new Date(medication.lastTaken).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Next Dose</span>
                        <span className="text-gray-900">
                          {medication.nextDose ? new Date(medication.nextDose).toLocaleDateString() : 'Not scheduled'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
