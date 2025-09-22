'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Users,
  Pill,
  Heart,
  Activity,
  Filter,
  Search,
  Repeat,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Settings,
  Zap,
  Star,
  Target,
  MoreVertical,
  X
} from 'lucide-react'

interface Reminder {
  id: string
  title: string
  type: 'medication' | 'appointment' | 'checkup' | 'exercise' | 'measurement' | 'other'
  description: string
  time: string
  date: string
  frequency: 'once' | 'daily' | 'weekly' | 'monthly'
  familyMemberId: string
  familyMemberName: string
  status: 'active' | 'completed' | 'snoozed' | 'missed'
  priority: 'low' | 'medium' | 'high'
  notifications: {
    push: boolean
    email: boolean
    sms: boolean
  }
  createdAt: string
  completedAt?: string
  snoozeUntil?: string
}

interface ReminderStats {
  total: number
  active: number
  completed: number
  missed: number
  today: number
}

export default function Reminders() {
  const searchParams = useSearchParams()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [stats, setStats] = useState<ReminderStats>({
    total: 0,
    active: 0,
    completed: 0,
    missed: 0,
    today: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('today')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  
  // Add Reminder Form State
  const [newReminder, setNewReminder] = useState({
    title: '',
    type: 'medication' as 'medication' | 'appointment' | 'checkup' | 'exercise' | 'measurement' | 'other',
    description: '',
    time: '',
    date: '',
    frequency: 'daily' as 'once' | 'daily' | 'weekly' | 'monthly',
    familyMemberId: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    notifications: {
      push: true,
      email: false,
      sms: false
    }
  })
  
  // Settings State
  const [settings, setSettings] = useState({
    notifications: {
      push: true,
      email: true,
      sms: false
    },
    reminderAdvanceTime: 15, // minutes
    snoozeDuration: 10, // minutes
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  })

  useEffect(() => {
    loadReminders()
    
    // Check for URL parameter to open add reminder modal
    const actionParam = searchParams.get('action')
    if (actionParam === 'create') {
      setShowAddModal(true)
    }
  }, [searchParams])

  const addReminder = async () => {
    try {
      const reminder: Reminder = {
        id: Date.now().toString(),
        ...newReminder,
        familyMemberName: 'Divya', // Default for now
        status: 'active',
        createdAt: new Date().toISOString()
      }
      
      setReminders(prev => [reminder, ...prev])
      setShowAddModal(false)
      setNewReminder({
        title: '',
        type: 'medication',
        description: '',
        time: '',
        date: '',
        frequency: 'daily',
        familyMemberId: '',
        priority: 'medium',
        notifications: {
          push: true,
          email: false,
          sms: false
        }
      })
    } catch (error) {
      console.error('Error adding reminder:', error)
    }
  }
  
  const updateSettings = () => {
    // Save settings logic here
    setShowSettingsModal(false)
  }

  const loadReminders = async () => {
    try {
      setLoading(true)
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock reminders data
      const mockReminders: Reminder[] = [
        {
          id: '1',
          title: 'Take Lisinopril',
          type: 'medication',
          description: 'Blood pressure medication - 10mg',
          time: '08:00',
          date: '2024-01-16',
          frequency: 'daily',
          familyMemberId: 'divya-001',
          familyMemberName: 'Divya',
          status: 'active',
          priority: 'high',
          notifications: { push: true, email: false, sms: true },
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          title: 'Take Metformin',
          type: 'medication',
          description: 'Diabetes medication - 500mg',
          time: '08:00',
          date: '2024-01-16',
          frequency: 'daily',
          familyMemberId: 'divya-001',
          familyMemberName: 'Divya',
          status: 'completed',
          priority: 'high',
          notifications: { push: true, email: false, sms: true },
          createdAt: '2024-01-01T00:00:00Z',
          completedAt: '2024-01-16T08:05:00Z'
        },
        {
          id: '3',
          title: 'Evening Metformin',
          type: 'medication',
          description: 'Diabetes medication - 500mg',
          time: '20:00',
          date: '2024-01-16',
          frequency: 'daily',
          familyMemberId: 'divya-001',
          familyMemberName: 'Divya',
          status: 'active',
          priority: 'high',
          notifications: { push: true, email: false, sms: true },
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '4',
          title: 'Blood Pressure Check',
          type: 'measurement',
          description: 'Daily blood pressure monitoring',
          time: '09:00',
          date: '2024-01-16',
          frequency: 'daily',
          familyMemberId: 'divya-001',
          familyMemberName: 'Divya',
          status: 'active',
          priority: 'medium',
          notifications: { push: true, email: false, sms: false },
          createdAt: '2024-01-10T00:00:00Z'
        },
        {
          id: '5',
          title: 'Doctor Appointment',
          type: 'appointment',
          description: 'Annual physical examination with Dr. Sarah Johnson',
          time: '10:00',
          date: '2024-01-20',
          frequency: 'once',
          familyMemberId: 'divya-001',
          familyMemberName: 'Divya',
          status: 'active',
          priority: 'high',
          notifications: { push: true, email: true, sms: true },
          createdAt: '2024-01-08T00:00:00Z'
        },
        {
          id: '6',
          title: 'Exercise Routine',
          type: 'exercise',
          description: '30 minutes of cardio exercise',
          time: '18:00',
          date: '2024-01-16',
          frequency: 'daily',
          familyMemberId: 'tushar-002',
          familyMemberName: 'Tushar',
          status: 'active',
          priority: 'medium',
          notifications: { push: true, email: false, sms: false },
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '7',
          title: 'Vitamin D3',
          type: 'medication',
          description: 'Vitamin supplement - 1000 IU',
          time: '09:00',
          date: '2024-01-16',
          frequency: 'daily',
          familyMemberId: 'tushar-002',
          familyMemberName: 'Tushar',
          status: 'completed',
          priority: 'low',
          notifications: { push: true, email: false, sms: false },
          createdAt: '2024-01-10T00:00:00Z',
          completedAt: '2024-01-16T09:10:00Z'
        }
      ]

      // Calculate stats
      const today = new Date().toISOString().split('T')[0]
      const todayReminders = mockReminders.filter(r => r.date === today)
      
      const calculatedStats: ReminderStats = {
        total: mockReminders.length,
        active: mockReminders.filter(r => r.status === 'active').length,
        completed: mockReminders.filter(r => r.status === 'completed').length,
        missed: mockReminders.filter(r => r.status === 'missed').length,
        today: todayReminders.length
      }

      setReminders(mockReminders)
      setStats(calculatedStats)
      
    } catch (error) {
      console.error('Error loading reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medication': return Pill
      case 'appointment': return Calendar
      case 'checkup': return Heart
      case 'exercise': return Activity
      case 'measurement': return Target
      case 'other': return Bell
      default: return Bell
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medication': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'appointment': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'checkup': return 'text-red-600 bg-red-50 border-red-200'
      case 'exercise': return 'text-green-600 bg-green-50 border-green-200'
      case 'measurement': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'other': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'missed': return AlertTriangle
      case 'snoozed': return Clock
      case 'active': return Bell
      default: return Bell
    }
  }

  const filteredReminders = reminders.filter(reminder => {
    const matchesTab = (() => {
      const today = new Date().toISOString().split('T')[0]
      switch (activeTab) {
        case 'today': return reminder.date === today
        case 'active': return reminder.status === 'active'
        case 'completed': return reminder.status === 'completed'
        case 'missed': return reminder.status === 'missed'
        default: return true
      }
    })()
    
    const matchesType = filterType === 'all' || reminder.type === filterType
    const matchesSearch = reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reminder.familyMemberName.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesTab && matchesType && matchesSearch
  })

  const tabs = [
    { id: 'today', name: 'Today', icon: Calendar, count: stats.today },
    { id: 'active', name: 'Active', icon: Bell, count: stats.active },
    { id: 'completed', name: 'Completed', icon: CheckCircle, count: stats.completed },
    { id: 'missed', name: 'Missed', icon: AlertTriangle, count: stats.missed },
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
                  Reminders
                </h1>
                <p className="text-base text-gray-600">
                  Stay on top of your health tasks and appointments
                </p>
              </div>
              
              <div className="mt-6 lg:mt-0 flex space-x-3">
                <button 
                  onClick={() => setShowSettingsModal(true)}
                  className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors shadow-md text-sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-md text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reminder
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl p-4 shadow-md text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{stats.total}</h3>
                <p className="text-sm text-gray-600">Total Reminders</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md text-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{stats.completed}</h3>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md text-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{stats.active}</h3>
                <p className="text-sm text-gray-600">Active</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md text-center">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{stats.missed}</h3>
                <p className="text-sm text-gray-600">Missed</p>
              </div>
            </div>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search reminders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Types</option>
                    <option value="medication">Medication</option>
                    <option value="appointment">Appointment</option>
                    <option value="exercise">Exercise</option>
                    <option value="measurement">Measurement</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
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
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
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
                <Bell className="w-6 h-6 animate-pulse text-primary-600" />
                <p className="text-xl text-gray-600">Loading reminders...</p>
              </div>
            </motion.div>
          )}

          {/* Reminders List */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {filteredReminders.length > 0 ? (
                <div className="space-y-3">
                  {filteredReminders.map((reminder, index) => {
                    const TypeIcon = getTypeIcon(reminder.type)
                    const StatusIcon = getStatusIcon(reminder.status)
                    
                    return (
                      <motion.div
                        key={reminder.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className={`bg-white rounded-xl p-4 shadow-md border-l-4 ${getTypeColor(reminder.type)}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <TypeIcon className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-base font-semibold text-gray-900 truncate">{reminder.title}</h3>
                                <StatusIcon className="w-3 h-3 flex-shrink-0" />
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(reminder.priority)} flex-shrink-0`}>
                                  {reminder.priority}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 truncate">{reminder.description}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">{new Date(reminder.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">{reminder.time}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Repeat className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500 capitalize">{reminder.frequency}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Three-dot menu */}
                          <div className="relative">
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {/* Dropdown menu would go here */}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">No reminders found</h3>
                  <p className="text-xl text-gray-600 mb-4">Create reminders to stay on track</p>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reminder
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New Reminder</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); addReminder(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Take medication"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={newReminder.type}
                  onChange={(e) => setNewReminder({...newReminder, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="medication">Medication</option>
                  <option value="appointment">Appointment</option>
                  <option value="checkup">Checkup</option>
                  <option value="exercise">Exercise</option>
                  <option value="measurement">Measurement</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Additional details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={newReminder.date}
                    onChange={(e) => setNewReminder({...newReminder, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                  <input
                    type="time"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select
                  value={newReminder.frequency}
                  onChange={(e) => setNewReminder({...newReminder, frequency: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="once">Once</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newReminder.priority}
                  onChange={(e) => setNewReminder({...newReminder, priority: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add Reminder
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Reminder Settings</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.notifications.push}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {...settings.notifications, push: e.target.checked}
                      })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Push Notifications</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {...settings.notifications, email: e.target.checked}
                      })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Email Notifications</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.notifications.sms}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {...settings.notifications, sms: e.target.checked}
                      })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">SMS Notifications</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Timing</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reminder Advance Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.reminderAdvanceTime}
                      onChange={(e) => setSettings({...settings, reminderAdvanceTime: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="1"
                      max="60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Snooze Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.snoozeDuration}
                      onChange={(e) => setSettings({...settings, snoozeDuration: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="5"
                      max="60"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Quiet Hours</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.quietHours.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        quietHours: {...settings.quietHours, enabled: e.target.checked}
                      })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Enable Quiet Hours</span>
                  </label>
                  {settings.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-3 ml-7">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={settings.quietHours.start}
                          onChange={(e) => setSettings({
                            ...settings,
                            quietHours: {...settings.quietHours, start: e.target.value}
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">End Time</label>
                        <input
                          type="time"
                          value={settings.quietHours.end}
                          onChange={(e) => setSettings({
                            ...settings,
                            quietHours: {...settings.quietHours, end: e.target.value}
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateSettings}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  )
}
