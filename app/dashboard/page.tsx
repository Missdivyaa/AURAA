'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import FamilyMemberCard from '@/components/FamilyMemberCard'
import FamilyMemberEditModal from '@/components/FamilyMemberEditModal'
import HealthOverview from '@/components/HealthOverview'
import RecentActivity from '@/components/RecentActivity'
import QuickActions from '@/components/QuickActions'
import { 
  Users, 
  User,
  Plus, 
  Heart, 
  Activity, 
  Calendar,
  Bell,
  TrendingUp,
  AlertTriangle,
  X,
  RefreshCw,
  LogOut,
  Phone
} from 'lucide-react'
import { FamilyMember } from '@/lib/client-data-service'
import { graphqlRequest } from '@/lib/graphql-client'

const GET_FAMILY_MEMBERS = `
  query GetFamilyMembers {
    familyMembers {
      id
      name
      relationship
      dob
      gender
      bloodType
      height
      weight
      conditions
      allergies
      emergencyContacts
      insurance
      doctor
      createdAt
      updatedAt
      medications {
        id
        status
      }
    }
  }
`

const CREATE_FAMILY_MEMBER = `
  mutation CreateFamilyMember($input: CreateFamilyMemberInput!) {
    createFamilyMember(input: $input) {
      id
      name
      relationship
      dob
      gender
      bloodType
      height
      weight
      conditions
      allergies
      emergencyContacts
      insurance
      doctor
      createdAt
      updatedAt
    }
  }
`

const UPDATE_FAMILY_MEMBER = `
  mutation UpdateFamilyMember($id: ID!, $input: UpdateFamilyMemberInput!) {
    updateFamilyMember(id: $id, input: $input) {
      id
      name
      relationship
      dob
      gender
      bloodType
      height
      weight
      conditions
      allergies
      emergencyContacts
      insurance
      doctor
      createdAt
      updatedAt
    }
  }
`

const DELETE_FAMILY_MEMBER = `
  mutation DeleteFamilyMember($id: ID!) {
    deleteFamilyMember(id: $id)
  }
`

const GET_APPOINTMENTS = `
  query GetAppointments {
    appointments {
      id
      date
      time
      status
      memberId
    }
  }
`

const GET_DASHBOARD_STATS = `
  query GetDashboardStats {
    dashboardStats {
      totalMembers
      averageHealthScore
      totalMedications
      upcomingAppointments
      healthAlerts
      totalAppointments
      totalReminders
      totalHealthReports
    }
  }
`

export default function UserDashboard() {
  const { isSignedIn, user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddMember, setShowAddMember] = useState(false)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [dashboardStats, setDashboardStats] = useState<{
    totalMembers: number
    averageHealthScore: number
    totalMedications: number
    upcomingAppointments: number
    healthAlerts: number
    totalAppointments: number
    totalReminders: number
    totalHealthReports: number
  } | null>(null)
  const loadingRef = useRef(false)
  useEffect(() => { loadingRef.current = loading }, [loading])

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/')
    }
  }, [isLoaded, isSignedIn, router])

  // Load family members from backend
  const loadFamilyMembers = async () => {
    if (!user) {
      console.log('⚠️ Dashboard: No user, skipping load')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Loading family members from backend...')
      console.log('🔍 GraphQL Endpoint:', process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql')
      
      // Get session token from Clerk
      let token: string | null = null
      try {
        token = await getToken()
      } catch (tokenError: any) {
        console.error('❌ Error getting token:', tokenError)
        throw new Error('Failed to get authentication token. Please try logging in again.')
      }
      
      if (!token) {
        throw new Error('No authentication token available')
      }
      
      console.log('✅ Got authentication token')
      
      // Fetch family members, appointments, and dashboard stats from GraphQL API
      const data = await graphqlRequest(GET_FAMILY_MEMBERS, {}, token)
      const appointmentsData = await graphqlRequest(GET_APPOINTMENTS, {}, token)
      const statsData = await graphqlRequest(GET_DASHBOARD_STATS, {}, token)
      
      console.log('🔍 Dashboard: Raw family members response:', data)
      console.log('🔍 Dashboard: Raw appointments response:', appointmentsData)
      console.log('🔍 Dashboard: Raw stats response:', statsData)
      
      // Set dashboard stats
      if (statsData && statsData.dashboardStats) {
        setDashboardStats(statsData.dashboardStats)
      }
      
      if (!data || !data.familyMembers) {
        throw new Error('Invalid response from backend')
      }
      
      // Helper functions
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

      const appointments = Array.isArray(appointmentsData?.appointments)
        ? appointmentsData.appointments
        : []

      // Convert to the format expected by the UI
      const formattedMembers: FamilyMember[] = data.familyMembers.map((member: any) => ({
        id: member.id,
        name: member.name,
        relationship: member.relationship,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`,
        healthScore: computeHealthScore(member),
        lastCheckup: (() => {
          const memberAppointments = appointments.filter((appt: any) => appt.memberId === member.id)
          const pastAppointments = memberAppointments.filter((appt: any) => {
            const d = new Date(appt.date)
            return d.getTime() <= Date.now()
          })
          if (pastAppointments.length === 0) return new Date(member.createdAt).toISOString()
          const latest = pastAppointments.reduce((latest: any, appt: any) => {
            const d = new Date(appt.date)
            return !latest || d.getTime() > new Date(latest.date).getTime() ? appt : latest
          }, null as any)
          return new Date(latest.date).toISOString()
        })(),
        medications: Array.isArray(member.medications) 
          ? member.medications.filter((med: any) => med.status === 'active').length 
          : 0,
        conditions: Array.isArray(member.conditions) ? member.conditions : [],
        allergies: Array.isArray(member.allergies) ? member.allergies : [],
        emergencyContacts: member.emergencyContacts || {},
        insurance: member.insurance || {},
        doctor: member.doctor || {},
        dob: member.dob || '',
        age: calculateAge(member.dob),
        nextAppointment: (() => {
          const memberAppointments = appointments.filter((appt: any) => appt.memberId === member.id)
          const upcoming = memberAppointments.filter((appt: any) => {
            const d = new Date(appt.date)
            return d.getTime() > Date.now() && appt.status !== 'cancelled'
          })
          if (upcoming.length === 0) return ''
          const next = upcoming.reduce((earliest: any, appt: any) => {
            const d = new Date(appt.date)
            return !earliest || d.getTime() < new Date(earliest.date).getTime() ? appt : earliest
          }, null as any)
          return new Date(next.date).toISOString()
        })(),
        status: (() => {
          const score = computeHealthScore(member)
          if (score >= 90) return 'excellent' as const
          if (score >= 75) return 'good' as const
          if (score >= 60) return 'fair' as const
          return 'poor' as const
        })()
      }))
      
      console.log('🔍 Dashboard: Formatted members:', formattedMembers)
      setMembers(formattedMembers)
      console.log(`✅ Loaded ${formattedMembers.length} family members from backend:`, formattedMembers)
      setError(null)
      
    } catch (error: any) {
      console.error('❌ Error loading family members:', error)
      const errorMessage = error?.message || 'Failed to load family members from backend'
      setError(errorMessage)
      
      // Fallback to empty array
      setMembers([])
      
      // Show more helpful error message
      if (errorMessage.includes('timeout')) {
        setError('Backend server is not responding. Please ensure the backend is running on port 4000.')
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Cannot connect to backend server. Please check if the backend is running.')
      } else if (errorMessage.includes('token')) {
        setError('Authentication error. Please try logging out and logging back in.')
      }
    } finally {
      setLoading(false)
      console.log('🏁 Dashboard: Loading finished, loading state:', false)
    }
  }

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      console.log('✅ Dashboard: Auth ready, loading family members...')
      loadFamilyMembers()
    } else if (isLoaded && !isSignedIn) {
      console.log('⚠️ Dashboard: Not signed in, setting loading to false')
      setLoading(false)
    }
  }, [isLoaded, isSignedIn, user])

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member)
  }

  const handleSaveMember = async (updatedMember: FamilyMember) => {
    if (!user) return

    try {
      const token = await getToken()
      
      await graphqlRequest(UPDATE_FAMILY_MEMBER, {
        id: updatedMember.id,
        input: {
          name: updatedMember.name,
          relationship: updatedMember.relationship,
          dob: updatedMember.dob,
          conditions: updatedMember.conditions,
          allergies: updatedMember.allergies || [],
          emergencyContacts: updatedMember.emergencyContacts || {},
          insurance: updatedMember.insurance || {},
          doctor: updatedMember.doctor || {}
        }
      }, token)
      
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

  const handleDeleteMember = async (id: string) => {
    if (!user) return

    try {
      const token = await getToken()
      
      await graphqlRequest(DELETE_FAMILY_MEMBER, { id }, token)
      
      // Remove from dashboard state
      setMembers(prev => prev.filter(m => m.id !== id))
      
      console.log('Deleted member:', id)
    } catch (error) {
      console.error('Error deleting member:', error)
      setError('Failed to delete member. Please try again.')
    }
  }

  const handleRefresh = async () => {
    console.log('🔄 Refresh button clicked - reloading family members...')
    await loadFamilyMembers()
    console.log('✅ Refresh completed - family members loaded:', members.length)
  }

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </main>
    )
  }

  // Redirect if not authenticated
  if (!isSignedIn) {
    return null
  }

  const familyMembers = members

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Heart },
    { id: 'family', name: 'Family', icon: Users },
    { id: 'activity', name: 'Activity', icon: Activity },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pb-8">
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
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome back, {user.firstName || 'User'}!
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
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
            <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm">
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
              <HealthOverview 
                familyMembers={familyMembers} 
                dashboardStats={dashboardStats}
                onRefresh={loadFamilyMembers}
              />
              
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
                    onRemove={handleDeleteMember} 
                    onEdit={handleEditMember}
                  />
                ))}
                
                {/* Add Member Card */}
                <motion.div onClick={() => setShowAddMember(true)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 card-hover border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 group cursor-pointer"
                >
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                      <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Add Family Member
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
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
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upcoming Appointments</h2>
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
      
      {/* Add Member Modal */}
      {showAddMember && (
        <AddMemberModal
          isOpen={showAddMember}
          onClose={() => setShowAddMember(false)}
          onSubmit={async (memberData) => {
            if (!user) return

            try {
              console.log('🔄 Dashboard: Creating member:', memberData.name)
              
              const token = await getToken()
              
              const newMember = await graphqlRequest(CREATE_FAMILY_MEMBER, {
                input: {
                  name: memberData.name,
                  relationship: memberData.relationship,
                  dob: memberData.dob && memberData.dob.trim() !== '' ? new Date(memberData.dob).toISOString() : new Date('1990-01-01').toISOString(),
                  gender: memberData.gender || 'Unknown',
                  email: memberData.email || undefined,
                  phone: memberData.countryCode && memberData.phone ? `${memberData.countryCode} ${memberData.phone}` : memberData.phone || undefined,
                  bloodType: memberData.bloodType || undefined,
                  height: memberData.height ? Number(memberData.height) : undefined,
                  weight: memberData.weight ? Number(memberData.weight) : undefined,
                  conditions: memberData.conditions || [],
                  allergies: memberData.allergies || [],
                  emergencyContacts: memberData.emergencyContacts || {},
                  insurance: memberData.insurance || {},
                  doctor: memberData.doctor || {}
                }
              }, token)
              
              console.log('✅ Dashboard: Created member via backend:', newMember.createFamilyMember.name, newMember.createFamilyMember.id)
              
              // Reload all members from the backend
              await loadFamilyMembers()
              console.log('📊 Dashboard: Reloaded members list')
              
              // Clear any previous errors
              setError(null)
              
              console.log('🎉 Dashboard: Member added successfully:', newMember.createFamilyMember.name)
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

// Simple Add Member modal with smart suggestions and profile reuse
function AddMemberModal({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (m: any) => void }) {
  const { user } = useUser()

  const commonConditions = [
    'Hypertension',
    'Diabetes',
    'Asthma',
    'High Cholesterol',
    'Heart Disease',
    'Thyroid Disorder',
    'Kidney Disease',
  ]

  const commonAllergies = [
    'Penicillin',
    'Sulfa Drugs',
    'Peanuts',
    'Shellfish',
    'Egg',
    'Milk',
    'Dust',
    'Pollen',
    'Latex',
  ]

  const [form, setForm] = useState({
    name: '', relationship: 'Family Member', avatar: '',
    dob: '', gender: '', bloodType: '',
    email: '', countryCode: '+91', phone: '', height: '', weight: '',
    lastCheckup: '',
    nextAppointment: '', medications: 0,
    conditions: '',
    allergies: '',
    // Primary contact (user's own contact)
    primaryContactName: '', primaryContactPhone: '', primaryContactCountryCode: '+91',
    // Relative contact
    relativeContactName: '', relativeContactPhone: '', relativeContactRelation: '', relativeContactCountryCode: '+91',
    insuranceProvider: '', insurancePolicy: '',
    doctorName: '', doctorPhone: '', doctorSpecialty: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleCondition = (condition: string) => {
    const current = (form.conditions || '').split(',').map(s => s.trim()).filter(Boolean)
    const exists = current.includes(condition)
    const next = exists ? current.filter(c => c !== condition) : [...current, condition]
    setForm({
      ...form,
      conditions: next.join(', ')
    })
  }

  const toggleAllergy = (allergy: string) => {
    const current = (form.allergies || '').split(',').map(s => s.trim()).filter(Boolean)
    const exists = current.includes(allergy)
    const next = exists ? current.filter(a => a !== allergy) : [...current, allergy]
    setForm({
      ...form,
      allergies: next.join(', ')
    })
  }

  const useMyDetails = () => {
    if (!user) return
    const email = (user.primaryEmailAddress || user.emailAddresses?.[0])?.emailAddress || form.email
    const phoneRaw = (user.primaryPhoneNumber || user.phoneNumbers?.[0])?.phoneNumber || ''
    const userName = user.firstName || user.name || ''
    let countryCode = form.countryCode
    let phone = form.phone
    let primaryContactCountryCode = form.primaryContactCountryCode
    let primaryContactPhone = form.primaryContactPhone

    if (phoneRaw.startsWith('+91')) {
      countryCode = '+91'
      phone = phoneRaw.replace('+91', '')
      primaryContactCountryCode = '+91'
      primaryContactPhone = phoneRaw.replace('+91', '')
    } else if (phoneRaw.startsWith('+')) {
      // Extract country code
      const match = phoneRaw.match(/^(\+\d+)(.+)/)
      if (match) {
        primaryContactCountryCode = match[1]
        primaryContactPhone = match[2]
      }
      // Fallback: keep full phone in number field
      phone = phoneRaw
    }

    setForm({
      ...form,
      email,
      countryCode,
      phone,
      primaryContactName: userName,
      primaryContactPhone,
      primaryContactCountryCode,
    })
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md md:max-w-lg space-y-4 relative max-h-[85vh] overflow-y-auto overflow-x-hidden">
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">Add Family Member</h3>
          {user && (
            <button
              type="button"
              onClick={useMyDetails}
              className="text-xs px-2 py-1 rounded-lg border border-primary-200 text-primary-700 hover:bg-primary-50"
            >
              Use my details
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm text-gray-700 md:col-span-1">Name
            <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          </label>
          <label className="text-sm text-gray-700 md:col-span-2">Relationship
            <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Self / Spouse / Father" value={form.relationship} onChange={e=>setForm({...form, relationship:e.target.value})} />
          </label>
          <label className="text-sm text-gray-700 md:col-span-1">Gender
            <select className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900 bg-white" value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label className="text-sm text-gray-700 md:col-span-1">Blood Type
            <select className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900 bg-white" value={form.bloodType} onChange={e=>setForm({...form, bloodType:e.target.value})}>
              <option value="">Select</option>
              {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(bt => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-gray-700 md:col-span-1">Email
            <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
          </label>
          <div className="text-sm text-gray-700 md:col-span-1">
            <label>Phone</label>
            <div className="mt-1 flex flex-col sm:flex-row gap-2 w-full">
              <select
                className="w-full sm:w-24 px-2 py-2 border rounded-lg sm:rounded-l-lg sm:rounded-r-none bg-white text-gray-900"
                value={form.countryCode}
                onChange={e => setForm({ ...form, countryCode: e.target.value })}
              >
                {['+91','+1','+44','+61','+81','+971'].map(cc => (
                  <option key={cc} value={cc}>{cc}</option>
                ))}
              </select>
              <input
                className="w-full flex-1 min-w-0 px-3 py-2 border sm:border-l-0 rounded-lg sm:rounded-l-none sm:rounded-r-lg text-gray-900"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
          </div>
          <label className="text-sm text-gray-700 md:col-span-1">Height (cm)
            <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900" type="number" value={form.height} onChange={e=>setForm({...form, height:e.target.value})} />
          </label>
          <label className="text-sm text-gray-700 md:col-span-1">Weight (kg)
            <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900" type="number" value={form.weight} onChange={e=>setForm({...form, weight:e.target.value})} />
          </label>
          <label className="text-sm text-gray-700 md:col-span-1">Date of Birth *
            <input className="mt-1 w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" type="date" value={form.dob} onChange={e=>setForm({...form, dob:e.target.value})} required />
            <p className="text-xs text-gray-500 mt-1">Required - Used to compute age and health score</p>
          </label>
          <label className="text-sm text-gray-700 md:col-span-2">
            Conditions
            <div className="mt-1 flex flex-wrap gap-2">
              {commonConditions.map((cond) => {
                const active = (form.conditions || '').toLowerCase().includes(cond.toLowerCase())
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => toggleCondition(cond)}
                    className={`px-2 py-1 rounded-full text-xs border ${
                      active
                        ? 'bg-primary-100 border-primary-400 text-primary-800'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {cond}
                  </button>
                )
              })}
            </div>
            <input
              className="mt-2 w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Other conditions (comma separated)"
              value={form.conditions}
              onChange={e => setForm({ ...form, conditions: e.target.value })}
            />
          </label>
          <label className="text-sm text-gray-700 md:col-span-2">
            Allergies ⚠️
            <div className="mt-1 flex flex-wrap gap-2">
              {commonAllergies.map((allergy) => {
                const active = (form.allergies || '').toLowerCase().includes(allergy.toLowerCase())
                return (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleAllergy(allergy)}
                    className={`px-2 py-1 rounded-full text-xs border ${
                      active
                        ? 'bg-red-100 border-red-400 text-red-800'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {allergy}
                  </button>
                )
              })}
            </div>
            <input
              className="mt-2 w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Other allergies (comma separated)"
              value={form.allergies}
              onChange={e => setForm({ ...form, allergies: e.target.value })}
            />
            <p className="text-xs text-red-600 mt-1">
              ⚠️ Important for emergency situations - list all known allergies
            </p>
          </label>
          
          {/* Emergency Contacts Section */}
          <div className="md:col-span-2 border-t pt-4 mt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <Phone className="w-4 h-4 text-green-600" />
              <span>Emergency Contacts</span>
            </h4>
            <p className="text-xs text-gray-500 mb-4">Add your own contact and a relative's contact for emergency situations</p>
            
            {/* Primary Contact (User's Own Contact) */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <label className="text-xs font-medium text-blue-900 mb-2 block">Primary Contact (Your Contact)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 text-sm"
                  placeholder="Your name"
                  value={form.primaryContactName}
                  onChange={e => setForm({...form, primaryContactName: e.target.value})}
                  onFocus={(e) => {
                    if (e.target.value === 'Not provided' || e.target.value.toLowerCase().includes('not')) {
                      e.target.value = ''
                      setForm({...form, primaryContactName: ''})
                    }
                  }}
                />
                <div className="flex gap-2">
                  <select
                    className="w-20 px-2 py-2 border rounded-lg bg-white text-gray-900 text-sm"
                    value={form.primaryContactCountryCode}
                    onChange={e => setForm({ ...form, primaryContactCountryCode: e.target.value })}
                  >
                    {['+91','+1','+44','+61','+81','+971'].map(cc => (
                      <option key={cc} value={cc}>{cc}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    className="flex-1 px-3 py-2 border rounded-lg text-gray-900 text-sm"
                    placeholder="Your phone"
                    value={form.primaryContactPhone}
                    onChange={e => {
                      // Only allow numbers and prevent appending to "Not provided"
                      const value = e.target.value.replace(/[^\d]/g, '')
                      setForm({...form, primaryContactPhone: value})
                    }}
                    onFocus={(e) => {
                      if (e.target.value === 'Not provided' || e.target.value.toLowerCase().includes('not') || e.target.value === 'N/A') {
                        e.target.value = ''
                        setForm({...form, primaryContactPhone: ''})
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Relative Contact */}
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <label className="text-xs font-medium text-green-900 mb-2 block">Relative Contact (To Inform Relatives)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 text-sm"
                  placeholder="Relative name"
                  value={form.relativeContactName}
                  onChange={e => setForm({...form, relativeContactName: e.target.value})}
                  onFocus={(e) => {
                    if (e.target.value === 'Not provided' || e.target.value.toLowerCase().includes('not')) {
                      e.target.value = ''
                      setForm({...form, relativeContactName: ''})
                    }
                  }}
                />
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 text-sm"
                  placeholder="Relationship (e.g., Spouse, Parent)"
                  value={form.relativeContactRelation}
                  onChange={e => setForm({...form, relativeContactRelation: e.target.value})}
                  onFocus={(e) => {
                    if (e.target.value === 'Not provided' || e.target.value === 'Please add contact' || e.target.value.toLowerCase().includes('not')) {
                      e.target.value = ''
                      setForm({...form, relativeContactRelation: ''})
                    }
                  }}
                />
                <div className="flex gap-2">
                  <select
                    className="w-20 px-2 py-2 border rounded-lg bg-white text-gray-900 text-sm"
                    value={form.relativeContactCountryCode}
                    onChange={e => setForm({ ...form, relativeContactCountryCode: e.target.value })}
                  >
                    {['+91','+1','+44','+61','+81','+971'].map(cc => (
                      <option key={cc} value={cc}>{cc}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    className="flex-1 px-3 py-2 border rounded-lg text-gray-900 text-sm"
                    placeholder="Relative phone"
                    value={form.relativeContactPhone}
                    onChange={e => {
                      // Only allow numbers and prevent appending to "Not provided"
                      const value = e.target.value.replace(/[^\d]/g, '')
                      setForm({...form, relativeContactPhone: value})
                    }}
                    onFocus={(e) => {
                      if (e.target.value === 'Not provided' || e.target.value.toLowerCase().includes('not') || e.target.value === 'N/A') {
                        e.target.value = ''
                        setForm({...form, relativeContactPhone: ''})
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={async () => {
              if (isSubmitting) return
              
              // Validate required fields
              if (!form.name.trim()) {
                alert('Please enter a name')
                return
              }
              if (!form.dob) {
                alert('Please enter a date of birth')
                return
              }
              
              setIsSubmitting(true)
              console.log('🔄 Modal: Starting member creation process...')
              
              const member = {
                name: form.name || 'New Member',
                relationship: form.relationship || 'Family Member',
                dob: form.dob,
                gender: form.gender || '',
                bloodType: form.bloodType || '',
                email: form.email || '',
                phone: form.phone ? `${form.countryCode}${form.phone}` : '',
                height: form.height || '',
                weight: form.weight || '',
                conditions: (form.conditions || '').split(',').map(s=>s.trim()).filter(Boolean),
                allergies: (form.allergies || '').split(',').map(s=>s.trim()).filter(Boolean),
                emergencyContacts: {
                  contacts: [
                    // Primary contact (user's own contact)
                    ...(form.primaryContactName && form.primaryContactPhone ? [{
                      name: form.primaryContactName,
                      phone: `${form.primaryContactCountryCode}${form.primaryContactPhone}`,
                      relationship: 'Self',
                      isPrimary: true
                    }] : []),
                    // Relative contact
                    ...(form.relativeContactName && form.relativeContactPhone ? [{
                      name: form.relativeContactName,
                      phone: `${form.relativeContactCountryCode}${form.relativeContactPhone}`,
                      relationship: form.relativeContactRelation || 'Relative',
                      isPrimary: false
                    }] : [])
                  ]
                },
                insurance: {
                  provider: form.insuranceProvider || '',
                  policyNumber: form.insurancePolicy || ''
                },
                doctor: {
                  name: form.doctorName || '',
                  phone: form.doctorPhone || '',
                  specialty: form.doctorSpecialty || ''
                }
              }
              
              console.log('📝 Modal: Member data prepared:', member.name)
              
              try {
                await onSubmit(member)
                console.log('✅ Modal: Member creation completed successfully')
                onClose()
                // Reset form after successful submission
                setForm({
                  name: '', relationship: 'Family Member', avatar: '',
                  dob: '', gender: '', bloodType: '',
                  email: '', countryCode: '+91', phone: '', height: '', weight: '',
                  lastCheckup: '',
                  nextAppointment: '', medications: 0,
                  conditions: '',
                  allergies: '',
                  primaryContactName: '', primaryContactPhone: '', primaryContactCountryCode: '+91',
                  relativeContactName: '', relativeContactPhone: '', relativeContactRelation: '', relativeContactCountryCode: '+91',
                  insuranceProvider: '', insurancePolicy: '',
                  doctorName: '', doctorPhone: '', doctorSpecialty: ''
                })
              } catch (error) {
                console.error('❌ Modal: Error adding member:', error)
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