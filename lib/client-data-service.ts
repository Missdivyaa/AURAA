// Client-side data service for family member management
// This provides the data structure and types used throughout the application

export interface Condition {
  id: string
  name: string
  severity: 'mild' | 'moderate' | 'severe'
  diagnosedDate: string
  status: 'active' | 'resolved' | 'chronic'
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  prescribedBy: string
  purpose: string
}

export interface FamilyMember {
  id: string
  name: string
  age: number
  dob?: string
  relationship: string
  avatar: string
  healthScore: number
  lastCheckup: string
  nextAppointment: string
  medications: number
  conditions: string[]
  allergies?: string[]
  emergencyContacts?: any
  insurance?: any
  doctor?: any
  status: 'excellent' | 'good' | 'fair' | 'poor'
}

// Mock data for development
export const mockFamilyMembers: FamilyMember[] = [
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
    status: 'good'
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
    status: 'excellent'
  }
]

// Helper functions
export const getFamilyMemberById = (id: string): FamilyMember | undefined => {
  return mockFamilyMembers.find(member => member.id === id)
}

export const getAllFamilyMembers = (): FamilyMember[] => {
  return mockFamilyMembers
}

export const getFamilyMembersByStatus = (status: FamilyMember['status']): FamilyMember[] => {
  return mockFamilyMembers.filter(member => member.status === status)
}

export const calculateAverageHealthScore = (): number => {
  const totalScore = mockFamilyMembers.reduce((sum, member) => sum + member.healthScore, 0)
  return Math.round(totalScore / mockFamilyMembers.length)
}
