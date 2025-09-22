'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import FamilyMemberCard from '@/components/FamilyMemberCard'
import FamilyMemberEditModal from '@/components/FamilyMemberEditModal'
import HealthOverview from '@/components/HealthOverview'
import RecentActivity from '@/components/RecentActivity'
import QuickActions from '@/components/QuickActions'
import { FamilyMember } from '../../lib/client-data-service'
import { realDataService } from '@/lib/real-data-service'
import { 
  Users, 
  Plus, 
  Heart, 
  Activity, 
  Calendar,
  Bell,
  TrendingUp,
  AlertTriangle,
  X,
  RefreshCw
} from 'lucide-react'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddMember, setShowAddMember] = useState(false)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const loadingRef = useRef(false)
  useEffect(() => { loadingRef.current = loading }, [loading])

  // Load family members using real database
  const loadFamilyMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Loading family members from real database...')
      
      // Get family members using real database service
      const familyMembers = await realDataService.getFamilyMembers('demo-user-123')
      console.log('🔍 Dashboard: Raw API response:', familyMembers)
      
      // Helpers to compute derived fields
      const calculateAge = (dob: string | Date | undefined): number => {
        if (!dob) return 0
        const birth = new Date(dob)
        if (isNaN(birth.getTime())) return 0
        const today = new Date()
        let age = today.getFullYear() - birth.getFullYear()
        const m = today.getMonth() - birth.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
        return Math.max(0, age)
      }

      const computeHealthScore = (member: any): number => {
        const age = calculateAge(member.dob)
        const conditionsCount = Array.isArray(member.conditions) ? member.conditions.length : 0
        let score = 100
        if (age >= 65) score -= 20
        else if (age >= 50) score -= 15
        else if (age >= 35) score -= 10
        else if (age >= 18) score -= 5
        score -= conditionsCount * 8
        return Math.max(0, Math.min(100, score))
      }

      // Convert to the format expected by the UI
      const formattedMembers: FamilyMember[] = familyMembers.map((member: any) => ({
        id: member.id,
        name: member.name,
        relationship: member.relationship,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`,
        healthScore: computeHealthScore(member),
        lastCheckup: new Date(member.createdAt).toISOString(),
        medications: typeof member.medications === 'number' ? member.medications : 0,
        conditions: Array.isArray(member.conditions) ? member.conditions : [],
        allergies: Array.isArray(member.allergies) ? member.allergies : [],
        emergencyContacts: member.emergencyContacts || {},
        insurance: member.insurance || {},
        doctor: member.doctor || {},
        dob: member.dob || '',
        age: calculateAge(member.dob),
        nextAppointment: member.nextAppointment || '',
        status: 'good' as const
      }))
      
      console.log('🔍 Dashboard: Formatted members:', formattedMembers)
      setMembers(formattedMembers)
      console.log(`✅ Loaded ${formattedMembers.length} family members from PostgreSQL:`, formattedMembers)
      setError(null)
      
    } catch (error) {
      console.error('❌ Error loading family members:', error)
      setError('Failed to load family members from database')
      
      // Fallback to empty array
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFamilyMembers()
    
    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loadingRef.current) {
        console.log('Loading timeout - using fallback data')
        setLoading(false)
        setError('Loading timeout. Using fallback data.')
        
        // Try to load from localStorage
        try {
          const saved = localStorage.getItem('auraa_members')
          if (saved) {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMembers(parsed)
            }
          } else {
            // Initialize with default data if nothing exists
            const defaultMembers = [
              {
                id: 'divya-001',
                name: 'Divya',
                age: 25,
                relationship: 'Self',
                avatar: 'https://ui-avatars.com/api/?name=Divya&background=6366f1&color=fff&size=150',
                healthScore: 85,
                lastCheckup: '2024-08-15',
                nextAppointment: '2024-12-15',
                medications: 2,
                conditions: ['Hypertension'],
                status: 'good' as const
              },
              {
                id: 'tushar-002',
                name: 'Tushar',
                age: 28,
                relationship: 'Brother',
                avatar: 'https://ui-avatars.com/api/?name=Tushar&background=10b981&color=fff&size=150',
                healthScore: 92,
                lastCheckup: '2024-09-10',
                nextAppointment: '2025-03-10',
                medications: 0,
                conditions: [],
                status: 'excellent' as const
              }
            ]
            setMembers(defaultMembers)
            localStorage.setItem('auraa_members', JSON.stringify(defaultMembers))
            console.log('Initialized with default family members')
          }
        } catch (err) {
          console.error('Error loading fallback data:', err)
        }
      }
    }, 8000) // 8 second timeout
    
    return () => clearTimeout(timeout)
  }, [])

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member)
  }

  const handleSaveMember = async (updatedMember: FamilyMember) => {
    try {
      // Update via real database service
      await realDataService.updateFamilyMember(updatedMember.id, {
        name: updatedMember.name,
        relationship: updatedMember.relationship,
        dob: updatedMember.lastCheckup,
        conditions: updatedMember.conditions,
        allergies: updatedMember.allergies || [],
        emergencyContacts: updatedMember.emergencyContacts || {},
        insurance: updatedMember.insurance || {},
        doctor: updatedMember.doctor || {}
      })
      
      // Update the dashboard state
      setMembers(members.map(member => 
        member.id === updatedMember.id ? updatedMember : member
      ))
      
      console.log('Saved member:', updatedMember)
    } catch (error) {
      console.error('Error saving member:', error)
      setError('Failed to save member. Please try again.')
    }
  }

  const handleRefresh = async () => {
    console.log('🔄 Refresh button clicked - reloading family members...')
    await loadFamilyMembers()
    console.log('✅ Refresh completed - family members loaded:', members.length)
  }

  const familyMembers = members

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Heart },
    { id: 'family', name: 'Family', icon: Users },
    { id: 'activity', name: 'Activity', icon: Activity },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
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
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Family Health Dashboard
                </h1>
                <p className="text-lg text-gray-600">
                  Manage your family's health records and stay on top of appointments
                </p>
              </div>
              
              <div className="mt-6 lg:mt-0 flex space-x-3">
                <button 
                  onClick={loadFamilyMembers}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors shadow-md disabled:opacity-50 text-sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button onClick={() => setShowAddMember(true)} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-md text-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Family Member
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

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center py-12"
            >
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-6 h-6 animate-spin text-primary-600" />
                <p className="text-gray-600">Loading family health data...</p>
              </div>
            </motion.div>
          )}

          {/* Content */}
          {!loading && activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Health Overview */}
              <HealthOverview familyMembers={familyMembers} />
              
              {/* Quick Actions */}
              <QuickActions />
              
              {/* Recent Activity */}
              <RecentActivity familyMembers={familyMembers} />
            </motion.div>
          )}

          {activeTab === 'family' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Family Members Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {members.map((member, index) => (
                  <FamilyMemberCard 
                    key={member.id} 
                    member={member} 
                    index={index} 
                    onRemove={async (id)=> {
                      try {
                        // Remove via real database service
                        await realDataService.deleteFamilyMember(id)
                        
                        // Remove from dashboard state
                        setMembers(prev => prev.filter(m => m.id !== id))
                        
                        console.log('Deleted member:', id)
                      } catch (error) {
                        console.error('Error deleting member:', error)
                        setError('Failed to delete member. Please try again.')
                      }
                    }} 
                    onEdit={handleEditMember}
                  />
                ))}
                
                {/* Add Member Card */}
                <motion.div onClick={() => setShowAddMember(true)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 card-hover border-2 border-dashed border-gray-300 hover:border-primary-500 group cursor-pointer"
                >
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                      <Plus className="w-8 h-8 text-gray-400 group-hover:text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Add Family Member
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Add a new family member to manage their health records
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Real Health Activity Timeline */}
              <RecentActivity familyMembers={familyMembers} />
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Appointments</h2>
                <div className="space-y-4">
                  {members.filter(member => member.nextAppointment && member.nextAppointment.trim() !== '').length > 0 ? (
                    members
                      .filter(member => member.nextAppointment && member.nextAppointment.trim() !== '')
                      .map((member) => {
                        try {
                          const appointmentDate = new Date(member.nextAppointment)
                          const today = new Date()
                          const diffTime = appointmentDate.getTime() - today.getTime()
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                          
                          let urgencyColor = 'green'
                          let urgencyBg = 'bg-green-50'
                          let urgencyBorder = 'border-green-500'
                          let urgencyText = 'text-green-600'
                          let timeText = `${diffDays} days away`
                          
                          if (diffDays <= 7) {
                            urgencyColor = 'red'
                            urgencyBg = 'bg-red-50'
                            urgencyBorder = 'border-red-500'
                            urgencyText = 'text-red-600'
                            timeText = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : `${diffDays} days away`
                          } else if (diffDays <= 30) {
                            urgencyColor = 'yellow'
                            urgencyBg = 'bg-yellow-50'
                            urgencyBorder = 'border-yellow-500'
                            urgencyText = 'text-yellow-600'
                            timeText = `${diffDays} days away`
                          }
                          
                          return (
                            <div key={member.id} className={`flex items-center justify-between p-4 ${urgencyBg} rounded-lg border-l-4 ${urgencyBorder}`}>
                              <div>
                                <p className="font-medium text-gray-900">General Checkup</p>
                                <p className="text-sm text-gray-600">{member.name} - {member.relationship}</p>
                                <p className="text-xs text-gray-500 mt-1">Health Score: {member.healthScore}%</p>
                              </div>
                              <div className="text-right">
                                <p className={`font-medium ${urgencyText}`}>{timeText}</p>
                                <p className="text-sm text-gray-600">{member.nextAppointment}</p>
                              </div>
                            </div>
                          )
                        } catch (error) {
                          return null
                        }
                      })
                      .filter(Boolean)
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No upcoming appointments scheduled</p>
                      <p className="text-sm text-gray-500">Add appointment dates to family member profiles to see them here</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      {showAddMember && (
        <AddMemberModal
          isOpen={showAddMember}
          onClose={() => setShowAddMember(false)}
          onSubmit={async (m) => {
            try {
              console.log('🔄 Dashboard: Creating member:', m.name)
              
              // Create via real database service
              const newMember = await realDataService.createFamilyMember('demo-user-123', {
                name: m.name,
                relationship: m.relationship,
                dob: m.dob && m.dob.trim() !== '' ? new Date(m.dob).toISOString() : new Date().toISOString(),
                gender: 'Unknown', // Default value
                gender: m.gender || 'Unknown',
                email: m.email || undefined,
                phone: m.countryCode && m.phone ? `${m.countryCode} ${m.phone}` : m.phone || undefined,
                bloodType: m.bloodType || undefined,
                height: m.height ? Number(m.height) : undefined,
                weight: m.weight ? Number(m.weight) : undefined,
                conditions: m.conditions || [],
                allergies: [],
                emergencyContacts: m.emergencyName || m.emergencyPhone ? { name: m.emergencyName, phone: m.emergencyPhone, relationship: m.emergencyRelation } : {},
                insurance: m.insuranceProvider || m.insurancePolicy ? { provider: m.insuranceProvider, policyNumber: m.insurancePolicy } : {},
                doctor: {}
              })
              
              console.log('✅ Dashboard: Created member via service:', newMember.name, newMember.id)
              
              // Reload all members from the service to get updated state
              await loadFamilyMembers()
              console.log('📊 Dashboard: Reloaded members list')
              
              // Clear any previous errors
              setError(null)
              
              console.log('🎉 Dashboard: Member added successfully:', newMember.name)
            } catch (error) {
              console.error('❌ Dashboard: Error creating member:', error)
              setError(`Failed to create member: ${error instanceof Error ? error.message : 'Unknown error'}`)
              throw error // Re-throw to prevent modal from closing
            }
          }}
        />
      )}
      
      {/* Edit Family Member Modal */}
      {editingMember && (
        <FamilyMemberEditModal
          member={editingMember}
          isOpen={!!editingMember}
          onClose={() => setEditingMember(null)}
          onSave={handleSaveMember}
        />
      )}
    </main>
  )
}

// Function to calculate health score automatically
function calculateHealthScore(formData: any): number {
  let score = 100 // Start with perfect score
  
  // Age factor derived from DOB
  let age = 0
  if (formData.dob && formData.dob.trim() !== '') {
    const birth = new Date(formData.dob)
    if (!isNaN(birth.getTime())) {
      const today = new Date()
      age = today.getFullYear() - birth.getFullYear()
      const m = today.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    }
  }
  if (age > 0) {
    if (age >= 65) score -= 20
    else if (age >= 50) score -= 15
    else if (age >= 35) score -= 10
    else if (age >= 18) score -= 5
    else score += 5 // <18
  }
  
  // Medical conditions factor
  const conditions = (formData.conditions || '').split(',').map((s: string) => s.trim()).filter(Boolean)
  score -= conditions.length * 10 // Subtract 10 points per condition
  
  // Medications factor
  const medications = Number(formData.medications) || 0
  score -= medications * 5 // Subtract 5 points per medication
  
  // Checkup factor
  if (formData.lastCheckup && formData.lastCheckup.trim() !== '') {
    try {
      const checkupDate = new Date(formData.lastCheckup)
      const daysSince = Math.floor((Date.now() - checkupDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSince > 365) score -= 15 // No checkup in over a year
      else if (daysSince > 180) score -= 10 // No checkup in over 6 months
      else if (daysSince > 90) score -= 5 // No checkup in over 3 months
      else score += 5 // Recent checkup gets bonus
    } catch (error) {
      score -= 10 // Invalid date gets penalty
    }
  } else {
    score -= 15 // No checkup date gets penalty
  }
  
  // Appointment factor
  if (formData.nextAppointment && formData.nextAppointment.trim() !== '') {
    try {
      const appointmentDate = new Date(formData.nextAppointment)
      const daysTo = Math.floor((appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (daysTo <= 30) score += 5 // Upcoming appointment gets bonus
    } catch (error) {
      // Invalid date doesn't affect score
    }
  } else {
    score -= 5 // No upcoming appointment gets small penalty
  }
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score))
}

// Simple Add Member modal
function AddMemberModal({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (m: any) => void }) {
  const [form, setForm] = useState({
    name: '', relationship: 'Family Member', avatar: '',
    dob: '', gender: '', bloodType: '',
    email: '', countryCode: '+91', phone: '', height: '', weight: '',
    lastCheckup: '',
    nextAppointment: '', medications: 0,
    conditions: '',
    emergencyName: '', emergencyPhone: '', emergencyRelation: '',
    insuranceProvider: '', insurancePolicy: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Calculate health score automatically
  const calculatedHealthScore = calculateHealthScore(form)
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 relative max-h-[85vh] overflow-y-auto">
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold text-gray-900">Add Family Member</h3>
        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm text-gray-700 col-span-1">Name
            <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          </label>
          {/* Age removed; computed from DOB */}
          <label className="text-sm text-gray-700 col-span-2">Relationship
            <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Self / Spouse / Father" value={form.relationship} onChange={e=>setForm({...form, relationship:e.target.value})} />
          </label>
          <label className="text-sm text-gray-700 col-span-2">Avatar URL (optional)
            <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Leave empty for auto-generated avatar" value={form.avatar} onChange={e=>setForm({...form, avatar:e.target.value})} />
            <p className="text-xs text-gray-500 mt-1">If empty, a text-based avatar will be generated automatically</p>
          </label>
          <label className="text-sm text-gray-700 col-span-1">Gender
            <select className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900 bg-white" value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label className="text-sm text-gray-700 col-span-1">Blood Type
            <select className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900 bg-white" value={form.bloodType} onChange={e=>setForm({...form, bloodType:e.target.value})}>
              <option value="">Select</option>
              {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(bt => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-gray-700 col-span-1">Email
            <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
          </label>
          <div className="text-sm text-gray-700 col-span-1">
            <label>Phone</label>
            <div className="mt-1 flex">
              <select className="px-2 py-2 border rounded-l-lg bg-white text-gray-900" value={form.countryCode} onChange={e=>setForm({...form, countryCode:e.target.value})}>
                {['+91','+1','+44','+61','+81','+971'].map(cc => (
                  <option key={cc} value={cc}>{cc}</option>
                ))}
              </select>
              <input className="flex-1 px-3 py-2 border border-l-0 rounded-r-lg text-gray-900" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="Phone number" />
            </div>
          </div>
          <label className="text-sm text-gray-700 col-span-1">Height (cm)
            <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900" type="number" value={form.height} onChange={e=>setForm({...form, height:e.target.value})} />
          </label>
          <label className="text-sm text-gray-700 col-span-1">Weight (kg)
            <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900" type="number" value={form.weight} onChange={e=>setForm({...form, weight:e.target.value})} />
          </label>
          <label className="text-sm text-gray-700 col-span-1">Date of Birth
            <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" type="date" value={form.dob} onChange={e=>setForm({...form, dob:e.target.value})} />
            <p className="text-xs text-gray-500 mt-1">Used to compute age and health score</p>
          </label>
          <label className="text-sm text-gray-700 col-span-1">Last Checkup Date
            <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" type="date" value={form.lastCheckup} onChange={e=>setForm({...form, lastCheckup:e.target.value})} />
            <p className="text-xs text-gray-500 mt-1">Leave empty if no recent checkup</p>
          </label>
          <label className="text-sm text-gray-700 col-span-1">Next Appointment Date
            <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" type="date" value={form.nextAppointment} onChange={e=>setForm({...form, nextAppointment:e.target.value})} />
            <p className="text-xs text-gray-500 mt-1">Leave empty if no upcoming appointment</p>
          </label>
          <label className="text-sm text-gray-700 col-span-1">Medications Count
            <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" type="number" value={form.medications} onChange={e=>setForm({...form, medications:Number(e.target.value)})} />
          </label>
          <label className="text-sm text-gray-700 col-span-1">Health Score
            <div className="mt-1 w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-900 font-medium">
              {calculatedHealthScore}% ({calculatedHealthScore >= 90 ? 'Excellent' : calculatedHealthScore >= 75 ? 'Good' : calculatedHealthScore >= 60 ? 'Fair' : 'Poor'})
            </div>
            <p className="text-xs text-gray-500 mt-1">Auto-calculated from age, conditions, medications, and checkup dates</p>
          </label>
          <label className="text-sm text-gray-700 col-span-2">Conditions (comma separated)
            <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Hypertension, Diabetes" value={form.conditions} onChange={e=>setForm({...form, conditions:e.target.value})} />
          </label>
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <label className="text-sm text-gray-700">Emergency Contact Name
              <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900" value={form.emergencyName} onChange={e=>setForm({...form, emergencyName:e.target.value})} />
            </label>
            <label className="text-sm text-gray-700">Emergency Contact Phone
              <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900" value={form.emergencyPhone} onChange={e=>setForm({...form, emergencyPhone:e.target.value})} />
            </label>
            <label className="text-sm text-gray-700">Emergency Relationship
              <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900" value={form.emergencyRelation} onChange={e=>setForm({...form, emergencyRelation:e.target.value})} />
            </label>
            <label className="text-sm text-gray-700">Insurance Provider
              <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900" value={form.insuranceProvider} onChange={e=>setForm({...form, insuranceProvider:e.target.value})} />
            </label>
            <label className="text-sm text-gray-700">Policy Number
              <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900" value={form.insurancePolicy} onChange={e=>setForm({...form, insurancePolicy:e.target.value})} />
            </label>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={async () => {
              if (isSubmitting) return
              
              setIsSubmitting(true)
              console.log('🔄 Modal: Starting member creation process...')
              
              const member = {
                id: Date.now(),
                name: form.name || 'New Member',
                age: Number(form.age) || 0,
                relationship: form.relationship || 'Family Member',
                avatar: form.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'New Member')}&background=6366f1&color=fff&size=150`,
                healthScore: calculatedHealthScore,
                dob: form.dob,
                lastCheckup: form.lastCheckup,
                nextAppointment: form.nextAppointment,
                medications: Number(form.medications) || 0,
                conditions: (form.conditions || '').split(',').map(s=>s.trim()).filter(Boolean),
                status: (() => {
                  if (calculatedHealthScore >= 90) return 'excellent' as const
                  if (calculatedHealthScore >= 75) return 'good' as const
                  if (calculatedHealthScore >= 60) return 'fair' as const
                  return 'poor' as const
                })()
              }
              
              console.log('📝 Modal: Member data prepared:', member.name, member.age, member.healthScore)
              
              // Add timeout to prevent infinite loading
              const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Operation timed out after 10 seconds')), 10000)
              })
              
              try {
                await Promise.race([onSubmit(member), timeoutPromise])
                console.log('✅ Modal: Member creation completed successfully')
                onClose()
                // Reset form after successful submission
                setForm({
                  name: '', age: '', relationship: 'Family Member', avatar: '',
                  dob: '', lastCheckup: '',
                  nextAppointment: '', medications: 0,
                  conditions: ''
                })
              } catch (error) {
                console.error('❌ Modal: Error adding member:', error)
                // Don't close modal if there's an error
                alert(`Failed to add member: ${error instanceof Error ? error.message : 'Unknown error'}`)
              } finally {
                setIsSubmitting(false)
                console.log('🏁 Modal: Member creation process finished')
              }
            }}
            disabled={isSubmitting}
            className={`px-4 py-2 text-white rounded-lg ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
          >
            {isSubmitting ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </div>
      
    </div>
  )
}
