'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useUser, useAuth } from '@clerk/nextjs'
import Navigation from '@/components/Navigation'
import { graphqlRequest } from '@/lib/graphql-client'
import { 
  QrCode, 
  Download, 
  Share, 
  Printer, 
  User, 
  Phone, 
  Heart, 
  AlertTriangle,
  Shield,
  Copy,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Camera,
  Smartphone,
  Eye,
  Scan,
  Pill,
  Calendar,
  Activity,
  RefreshCw,
  ChevronDown,
  X
} from 'lucide-react'

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
  allergies: string[]
  emergencyContacts: any
  insurance: any
  doctor: any
  bloodType?: string
  phone?: string
  email?: string
  address?: string
  gender?: string
  height?: number
  weight?: number
  status: 'excellent' | 'good' | 'fair' | 'poor'
}

interface EmergencyData {
  id: string
  familyMemberId: string
  familyMemberName: string
  bloodType: string
  allergies: string[]
  medications: string[]
  medicalConditions: string[]
  emergencyContacts: {
    name: string
    relationship: string
    phone: string
    isPrimary: boolean
  }[]
  insuranceInfo: {
    provider: string
    policyNumber: string
    groupNumber?: string
  }
  doctorInfo: {
    name: string
    specialty: string
    phone: string
  }
  lastUpdated: string
}

export default function EmergencyID() {
  const { isSignedIn, user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [emergencyData, setEmergencyData] = useState<EmergencyData[]>([])
  const [selectedMember, setSelectedMember] = useState<string>('')
  const [showQRModal, setShowQRModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showEditContactsModal, setShowEditContactsModal] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<string>('')
  const [editingContactType, setEditingContactType] = useState<'primary' | 'relative' | 'add' | null>(null)
  const [contactForm, setContactForm] = useState({
    primaryContactName: '',
    primaryContactPhone: '',
    primaryContactCountryCode: '+91',
    relativeContactName: '',
    relativeContactPhone: '',
    relativeContactRelation: '',
    relativeContactCountryCode: '+91'
  })

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      loadFamilyMembers()
    }
  }, [isLoaded, isSignedIn, user])

  useEffect(() => {
    if (familyMembers.length > 0) {
      loadEmergencyData()
    }
  }, [familyMembers])

  const loadFamilyMembers = async () => {
    if (!user) return
    
    try {
      // Get Clerk token
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }
      
      // Load user data and family members from GraphQL
      const GET_USER_DATA = `
        query GetUserData {
          me {
            id
            name
            email
            phone
            profileImage
          }
          familyMembers {
            id
            name
            dob
            gender
            relationship
            bloodType
            phone
            email
            height
            weight
            conditions
            allergies
            emergencyContacts
            insurance
            doctor
            createdAt
          }
        }
      `
      
      const data = await graphqlRequest(GET_USER_DATA, {}, token)
      console.log('🏥 Emergency ID: Loaded user and family members from GraphQL:', data)
      
      // Convert backend data to frontend format
      const formattedMembers: FamilyMember[] = (data.familyMembers || []).map((member: any) => ({
        id: member.id,
        name: member.name,
        age: calculateAge(member.dob),
        relationship: member.relationship,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`,
        healthScore: calculateHealthScore(member),
        lastCheckup: new Date(member.createdAt).toISOString(),
        nextAppointment: '',
        medications: 0, // Will be loaded separately
        conditions: Array.isArray(member.conditions) ? member.conditions : [],
        allergies: Array.isArray(member.allergies) ? member.allergies : [],
        emergencyContacts: member.emergencyContacts || {},
        insurance: member.insurance || {},
        doctor: member.doctor || {},
        bloodType: member.bloodType || 'Unknown',
        phone: member.phone || undefined,
        email: member.email || undefined,
        address: member.address || (member.insurance?.address) || undefined,
        gender: member.gender || undefined,
        height: member.height || undefined,
        weight: member.weight || undefined,
        status: 'good' as const
      }))
      
      setFamilyMembers(formattedMembers)
      if (formattedMembers.length > 0 && !selectedMember) {
        setSelectedMember(formattedMembers[0].id)
      }
    } catch (error) {
      console.error('Error loading family members:', error)
      setFamilyMembers([])
    }
  }

  // Helper function to calculate age
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

  // Helper function to calculate health score
  const calculateHealthScore = (member: any): number => {
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

  const loadEmergencyData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Get Clerk token
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }
      
      // Load medications from GraphQL
      const GET_MEDICATIONS = `
        query GetMedications {
          medications {
            id
            name
            dosage
            frequency
            status
            memberId
            member {
              id
              name
            }
          }
        }
      `
      
      const medicationsData = await graphqlRequest(GET_MEDICATIONS, {}, token)
      const medications = medicationsData.medications || []
      console.log('💊 Emergency ID: Loaded medications from GraphQL:', medications)
      
      // Generate emergency data from family members and medications
      const emergencyDataList: EmergencyData[] = familyMembers.map((member) => {
        // Get medications for this family member (only active medications)
        const memberMedications = medications.filter((med: any) => 
          med.memberId === member.id && med.status === 'active'
        )
        // Format medications with name, dosage, and frequency
        const medicationNames = memberMedications.map((med: any) => {
          const parts = [med.name]
          if (med.dosage && med.dosage.trim() !== 'N/A') {
            parts.push(med.dosage)
          }
          if (med.frequency && med.frequency.trim() !== 'N/A') {
            parts.push(`(${med.frequency})`)
          }
          return parts.join(' ')
        })
        
        // Parse emergency contacts from member data
        const emergencyContacts = []
        if (member.emergencyContacts) {
          try {
            // Handle array format
            if (Array.isArray(member.emergencyContacts)) {
              member.emergencyContacts.forEach((contact: any, index: number) => {
                if (contact && (contact.name || contact.phone)) {
                  emergencyContacts.push({
                    name: contact.name || 'Emergency Contact',
                    relationship: contact.relationship || contact.relation || 'Emergency Contact',
                    phone: contact.phone || contact.phoneNumber || 'N/A',
                    isPrimary: index === 0 || contact.isPrimary === true
                  })
                }
              })
            } 
            // Handle object format (single contact or object with contacts array)
            else if (typeof member.emergencyContacts === 'object') {
              // Check if it's an object with a contacts array
              if (member.emergencyContacts.contacts && Array.isArray(member.emergencyContacts.contacts)) {
                member.emergencyContacts.contacts.forEach((contact: any, index: number) => {
                  if (contact && (contact.name || contact.phone)) {
                    emergencyContacts.push({
                      name: contact.name || 'Emergency Contact',
                      relationship: contact.relationship || contact.relation || 'Emergency Contact',
                      phone: contact.phone || contact.phoneNumber || 'N/A',
                      isPrimary: index === 0 || contact.isPrimary === true
                    })
                  }
                })
              }
              // Single contact object
              else if (member.emergencyContacts.name || member.emergencyContacts.phone) {
                emergencyContacts.push({
                  name: member.emergencyContacts.name || 'Emergency Contact',
                  relationship: member.emergencyContacts.relationship || member.emergencyContacts.relation || 'Emergency Contact',
                  phone: member.emergencyContacts.phone || member.emergencyContacts.phoneNumber || 'N/A',
                  isPrimary: true
                })
              }
            }
          } catch (error) {
            console.error('Error parsing emergency contacts:', error)
          }
        }
        
        // Add user's own phone as emergency contact if available and no contacts exist
        if (emergencyContacts.length === 0 && user?.phoneNumbers && user.phoneNumbers.length > 0) {
          emergencyContacts.push({
            name: user.firstName || user.name || 'Self',
            relationship: 'Self',
            phone: user.phoneNumbers[0].phoneNumber || 'N/A',
            isPrimary: true
          })
        }
        
        // Add default emergency contact only if absolutely no contacts exist
        if (emergencyContacts.length === 0) {
          emergencyContacts.push({
            name: 'Emergency Contact',
            relationship: 'Please add contact',
            phone: 'Not provided',
            isPrimary: true
          })
        }
        
        // Parse insurance info
        const insuranceInfo = {
          provider: member.insurance?.provider || 'Unknown',
          policyNumber: member.insurance?.policyNumber || 'N/A',
          groupNumber: member.insurance?.groupNumber || 'N/A'
        }
        
        // Parse doctor info
        const doctorInfo = {
          name: member.doctor?.name || 'Primary Care Physician',
          specialty: member.doctor?.specialty || 'General Practice',
          phone: member.doctor?.phone || 'Contact Hospital'
        }
        
        return {
          id: `emergency-${member.id}`,
          familyMemberId: member.id,
          familyMemberName: member.name,
          bloodType: member.bloodType || 'Unknown',
          allergies: member.allergies || [],
          medications: medicationNames,
          medicalConditions: member.conditions || [],
          emergencyContacts,
          insuranceInfo,
          doctorInfo,
          lastUpdated: new Date().toISOString()
        }
      })

      setEmergencyData(emergencyDataList)
      console.log('🚨 Emergency ID: Generated emergency data:', emergencyDataList)
    } catch (error) {
      console.error('Error loading emergency data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate human-readable QR data for emergency responders
  const generateQRData = (member: FamilyMember) => {
    const emergencyInfo = emergencyData.find(data => data.familyMemberId === member.id)
    if (!emergencyInfo) return ''

    let qrText = ''
    
    // Basic Information
    qrText += `PATIENT: ${member.name}\n`
    qrText += `AGE: ${member.age} years\n`
    if (member.gender) {
      qrText += `GENDER: ${member.gender}\n`
    }
    qrText += `RELATIONSHIP: ${member.relationship}\n`
    qrText += `BLOOD TYPE: ${emergencyInfo.bloodType}\n`
    if (member.height) {
      qrText += `HEIGHT: ${member.height} cm\n`
    }
    if (member.weight) {
      qrText += `WEIGHT: ${member.weight} kg\n`
    }
    if (emergencyInfo.medicalConditions && emergencyInfo.medicalConditions.length > 0) {
      qrText += `MEDICAL CONDITIONS: ${emergencyInfo.medicalConditions.length} condition(s)\n`
    }
    if (emergencyInfo.allergies && emergencyInfo.allergies.length > 0) {
      qrText += `KNOWN ALLERGIES: ${emergencyInfo.allergies.length} allergy/allergies\n`
    }
    if (emergencyInfo.medications && emergencyInfo.medications.length > 0) {
      qrText += `ACTIVE MEDICATIONS: ${emergencyInfo.medications.length} medication(s)\n`
    }
    qrText += '\n'
    
    // Medical Conditions
    if (emergencyInfo.medicalConditions && emergencyInfo.medicalConditions.length > 0) {
      qrText += `MEDICAL CONDITIONS:\n`
      emergencyInfo.medicalConditions.forEach(condition => {
        qrText += `• ${condition}\n`
      })
      qrText += '\n'
    }
    
    // Allergies - CRITICAL INFORMATION
    if (emergencyInfo.allergies && emergencyInfo.allergies.length > 0) {
      qrText += `⚠️ ALLERGIES (CRITICAL):\n`
      emergencyInfo.allergies.forEach(allergy => {
        qrText += `• ${allergy}\n`
      })
      qrText += '\n'
    } else {
      qrText += `⚠️ ALLERGIES: None known\n\n`
    }
    
    // Current Medications
    if (emergencyInfo.medications && emergencyInfo.medications.length > 0) {
      qrText += `CURRENT MEDICATIONS:\n`
      emergencyInfo.medications.forEach(medication => {
        qrText += `• ${medication}\n`
      })
      qrText += '\n'
    }
    
    // Emergency Contacts
    if (emergencyInfo.emergencyContacts && emergencyInfo.emergencyContacts.length > 0) {
      qrText += `EMERGENCY CONTACTS:\n`
      emergencyInfo.emergencyContacts.forEach(contact => {
        qrText += `• ${contact.name} (${contact.relationship}): ${contact.phone}\n`
      })
      qrText += '\n'
    }
    
    // Doctor Information
    if (emergencyInfo.doctorInfo && emergencyInfo.doctorInfo.name !== 'Primary Care Physician') {
      qrText += `DOCTOR:\n`
      qrText += `• ${emergencyInfo.doctorInfo.name}\n`
      qrText += `• Specialty: ${emergencyInfo.doctorInfo.specialty}\n`
      qrText += `• Phone: ${emergencyInfo.doctorInfo.phone}\n\n`
    }
    
    // Insurance Information
    if (emergencyInfo.insuranceInfo && emergencyInfo.insuranceInfo.provider !== 'Unknown') {
      qrText += `INSURANCE:\n`
      qrText += `• Provider: ${emergencyInfo.insuranceInfo.provider}\n`
      qrText += `• Policy: ${emergencyInfo.insuranceInfo.policyNumber}\n\n`
    }
    
    // Footer
    qrText += `Generated by AURAA Health System\n`
    qrText += `Updated: ${new Date().toLocaleDateString()}`

    return qrText
  }

  // Generate QR code URL
  const generateQRCodeUrl = (data: string, size: number = 300) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`
  }

  const downloadQRCode = (member: FamilyMember) => {
    const qrData = generateQRData(member)
    const qrUrl = generateQRCodeUrl(qrData, 400)
    
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = `${member.name}-emergency-qr.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const printQRCode = (member: FamilyMember) => {
    const qrData = generateQRData(member)
    const qrUrl = generateQRCodeUrl(qrData, 400)
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Emergency QR Code - ${member.name}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .qr-container { margin: 20px 0; }
              .info { margin: 10px 0; font-size: 14px; color: #666; }
              .emergency { color: #dc2626; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Emergency QR Code</h1>
            <h2>${member.name}</h2>
            <div class="qr-container">
              <img src="${qrUrl}" alt="Emergency QR Code" style="max-width: 300px;" />
            </div>
            <div class="info">
              <p class="emergency">Scan this QR code in case of emergency</p>
              <p>Contains complete health information and emergency contacts</p>
              <p>Generated by AURAA Health System</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const selectedMemberData = familyMembers.find(m => m.id === selectedMember)
  const selectedEmergencyData = emergencyData.find(d => d.familyMemberId === selectedMember)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-8">
      <Navigation />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
        </motion.div>

        {/* Family Member Selection - Custom Dropdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                Select Family Member:
              </label>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-[200px]"
              >
                {selectedMemberData && (
                  <>
                    <img
                      src={selectedMemberData.avatar}
                      alt={selectedMemberData.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedMemberData.name} ({selectedMemberData.relationship})
                    </span>
                  </>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  {familyMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        setSelectedMember(member.id)
                        setShowDropdown(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedMember === member.id ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <div>
                        <div className="text-sm font-medium">{member.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{member.relationship} - Age {member.age}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            </div>
            <button
              onClick={() => {
                loadEmergencyData()
              }}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors shadow-md disabled:opacity-50 text-sm ml-4"
              title="Refresh medications and emergency data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* QR Code Display */}
        {selectedMemberData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            {/* QR Code Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Emergency QR Code - {selectedMemberData.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Scan this QR code to access complete health information
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* QR Code - Left Side */}
                <div className="text-center">
                  <div className="inline-block p-6 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg">
                    <img
                      src={generateQRCodeUrl(generateQRData(selectedMemberData), 300)}
                      alt={`Emergency QR Code for ${selectedMemberData.name}`}
                      className="mx-auto"
                    />
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => downloadQRCode(selectedMemberData)}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download QR</span>
                    </button>
                    <button
                      onClick={() => printQRCode(selectedMemberData)}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors ml-2"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print QR</span>
                    </button>
                  </div>
                </div>

                {/* User Details - Right Side */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Health Information Summary</h3>
                  
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Basic Information</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-800 dark:text-gray-200">
                        <div><strong className="text-gray-900 dark:text-white">Name:</strong> <span className="text-gray-700 dark:text-gray-300">{selectedMemberData.name || 'Not provided'}</span></div>
                        <div><strong className="text-gray-900 dark:text-white">Age:</strong> <span className="text-gray-700 dark:text-gray-300">{selectedMemberData.age ? `${selectedMemberData.age} years` : 'Not provided'}</span></div>
                        {selectedMemberData.gender ? (
                          <div><strong className="text-gray-900 dark:text-white">Gender:</strong> <span className="text-gray-700 dark:text-gray-300">{selectedMemberData.gender}</span></div>
                        ) : (
                          <div><strong className="text-gray-900 dark:text-white">Gender:</strong> <span className="text-gray-500 dark:text-gray-400">Not specified</span></div>
                        )}
                        {selectedEmergencyData ? (
                          <div><strong className="text-gray-900 dark:text-white">Blood Type:</strong> <span className="text-gray-700 dark:text-gray-300">{selectedEmergencyData.bloodType && selectedEmergencyData.bloodType !== 'Unknown' ? selectedEmergencyData.bloodType : 'Not specified'}</span></div>
                        ) : (
                          <div><strong className="text-gray-900 dark:text-white">Blood Type:</strong> <span className="text-gray-500 dark:text-gray-400">Not specified</span></div>
                        )}
                        {selectedMemberData.height ? (
                          <div><strong className="text-gray-900 dark:text-white">Height:</strong> <span className="text-gray-700 dark:text-gray-300">{selectedMemberData.height} cm</span></div>
                        ) : null}
                        {selectedMemberData.weight ? (
                          <div><strong className="text-gray-900 dark:text-white">Weight:</strong> <span className="text-gray-700 dark:text-gray-300">{selectedMemberData.weight} kg</span></div>
                        ) : null}
                        <div><strong className="text-gray-900 dark:text-white">Relationship:</strong> <span className="text-gray-700 dark:text-gray-300">{selectedMemberData.relationship || 'Not specified'}</span></div>
                        {selectedEmergencyData && selectedEmergencyData.medicalConditions && selectedEmergencyData.medicalConditions.length > 0 ? (
                          <div className="col-span-2 text-gray-800 dark:text-gray-200">
                            <strong className="text-gray-900 dark:text-white">Medical Conditions:</strong> <span className="text-gray-700 dark:text-gray-300">{selectedEmergencyData.medicalConditions.length} condition{selectedEmergencyData.medicalConditions.length !== 1 ? 's' : ''}</span>
                            {selectedEmergencyData.allergies && selectedEmergencyData.allergies.length > 0 && (
                              <span className="ml-2 text-orange-600 dark:text-orange-400">• {selectedEmergencyData.allergies.length} known allerg{selectedEmergencyData.allergies.length !== 1 ? 'ies' : 'y'}</span>
                            )}
                          </div>
                        ) : (
                          <div className="col-span-2 text-gray-800 dark:text-gray-200"><strong className="text-gray-900 dark:text-white">Medical Conditions:</strong> <span className="text-gray-500 dark:text-gray-400">0 conditions</span></div>
                        )}
                        {selectedEmergencyData && selectedEmergencyData.medications && selectedEmergencyData.medications.length > 0 ? (
                          <div className="col-span-2 text-gray-800 dark:text-gray-200">
                            <strong className="text-gray-900 dark:text-white">Active Medications:</strong> <span className="text-gray-700 dark:text-gray-300">{selectedEmergencyData.medications.length} medication{selectedEmergencyData.medications.length !== 1 ? 's' : ''}</span>
                          </div>
                        ) : (
                          <div className="col-span-2 text-gray-800 dark:text-gray-200"><strong className="text-gray-900 dark:text-white">Active Medications:</strong> <span className="text-gray-500 dark:text-gray-400">0 medications</span></div>
                        )}
                        {selectedMemberData.phone ? (
                          <div className="text-gray-800 dark:text-gray-200"><strong className="text-gray-900 dark:text-white">Phone:</strong> <span className="text-gray-700 dark:text-gray-300">{selectedMemberData.phone}</span></div>
                        ) : null}
                        {selectedMemberData.email ? (
                          <div className="text-gray-800 dark:text-gray-200"><strong className="text-gray-900 dark:text-white">Email:</strong> <span className="text-gray-700 dark:text-gray-300">{selectedMemberData.email}</span></div>
                        ) : null}
                        {selectedMemberData.address ? (
                          <div className="col-span-2 text-gray-800 dark:text-gray-200"><strong className="text-gray-900 dark:text-white">Address:</strong> <span className="text-gray-700 dark:text-gray-300">{selectedMemberData.address}</span></div>
                        ) : null}
                      </div>
                    </div>

                    {/* Medical Conditions */}
                    {selectedEmergencyData && selectedEmergencyData.medicalConditions && selectedEmergencyData.medicalConditions.length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                        <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2 flex items-center space-x-2">
                          <Heart className="w-4 h-4" />
                          <span>Medical Conditions</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedEmergencyData.medicalConditions.map((condition, index) => (
                            <span key={index} className="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded-full text-sm">
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Allergies */}
                    {selectedEmergencyData && selectedEmergencyData.allergies && selectedEmergencyData.allergies.length > 0 && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                        <h4 className="font-semibold text-orange-900 dark:text-orange-300 mb-2 flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Allergies</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedEmergencyData.allergies.map((allergy, index) => (
                            <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Medications - Always show this section */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center space-x-2">
                        <Pill className="w-4 h-4" />
                        <span>Current Medications</span>
                        {selectedEmergencyData && selectedEmergencyData.medications && selectedEmergencyData.medications.length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-200 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                            {selectedEmergencyData.medications.length}
                          </span>
                        )}
                      </h4>
                      {selectedEmergencyData && selectedEmergencyData.medications && selectedEmergencyData.medications.length > 0 ? (
                        <div className="space-y-2">
                          {selectedEmergencyData.medications.map((medication, index) => (
                            <div key={index} className="flex items-start space-x-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800">
                              <Pill className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-200">
                                  {medication}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-blue-700 dark:text-blue-300 italic py-2">
                          No active medications recorded for {selectedMemberData.name}
                        </div>
                      )}
                    </div>

                    {/* Emergency Contacts */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                      <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2 flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>Emergency Contacts</span>
                        {selectedEmergencyData && selectedEmergencyData.emergencyContacts && selectedEmergencyData.emergencyContacts.length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-green-200 dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                            {selectedEmergencyData.emergencyContacts.length}
                          </span>
                        )}
                      </h4>
                      {selectedEmergencyData && selectedEmergencyData.emergencyContacts && selectedEmergencyData.emergencyContacts.length > 0 ? (
                        <div className="space-y-2">
                          {selectedEmergencyData.emergencyContacts.map((contact: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="flex-1">
                                <div className="font-medium text-green-900 dark:text-green-200 flex items-center space-x-2">
                                  {contact.name}
                                  {contact.isPrimary && (
                                    <span className="px-1.5 py-0.5 bg-green-200 text-green-800 rounded text-xs">Primary</span>
                                  )}
                                </div>
                                <div className="text-sm text-green-700">{contact.relationship}</div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="text-sm text-green-800 font-mono">
                                  {contact.phone && contact.phone !== 'N/A' && contact.phone !== 'Not provided' ? (
                                    <a href={`tel:${contact.phone}`} className="hover:text-green-600">
                                      {contact.phone}
                                    </a>
                                  ) : (
                                    <span className="text-gray-500">{contact.phone || 'Not provided'}</span>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    setEditingMemberId(selectedEmergencyData.familyMemberId)
                                    // Helper function to extract phone number and country code
                                    const extractPhone = (phone: string) => {
                                      if (!phone || phone === 'N/A' || phone === 'Not provided' || phone.toLowerCase().includes('not')) {
                                        return { phone: '', countryCode: '+91' }
                                      }
                                      const match = phone.match(/^(\+\d+)(.+)/)
                                      if (match) {
                                        return { phone: match[2], countryCode: match[1] }
                                      }
                                      return { phone: phone.replace(/^\+\d+/, ''), countryCode: phone.match(/^\+\d+/)?.[0] || '+91' }
                                    }
                                    
                                    const phoneData = extractPhone(contact.phone || '')
                                    
                                    if (contact.isPrimary) {
                                      setContactForm({
                                        primaryContactName: contact.name || '',
                                        primaryContactPhone: phoneData.phone,
                                        primaryContactCountryCode: phoneData.countryCode,
                                        relativeContactName: '',
                                        relativeContactPhone: '',
                                        relativeContactRelation: '',
                                        relativeContactCountryCode: '+91'
                                      })
                                      setEditingContactType('primary')
                                    } else {
                                      setContactForm({
                                        primaryContactName: '',
                                        primaryContactPhone: '',
                                        primaryContactCountryCode: '+91',
                                        relativeContactName: contact.name || '',
                                        relativeContactPhone: phoneData.phone,
                                        relativeContactRelation: contact.relationship || '',
                                        relativeContactCountryCode: phoneData.countryCode
                                      })
                                      setEditingContactType('relative')
                                    }
                                    setShowEditContactsModal(true)
                                  }}
                                  className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                  title={`Edit ${contact.isPrimary ? 'primary' : 'relative'} contact`}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-green-700 italic py-2">
                          No emergency contacts provided. Please add emergency contacts.
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setEditingMemberId(selectedEmergencyData?.familyMemberId || selectedMember)
                          setEditingContactType('add') // Set to 'add' mode for adding new contacts
                          // Initialize form with empty values for adding new contacts
                          setContactForm({
                            primaryContactName: '',
                            primaryContactPhone: '',
                            primaryContactCountryCode: '+91',
                            relativeContactName: '',
                            relativeContactPhone: '',
                            relativeContactRelation: '',
                            relativeContactCountryCode: '+91'
                          })
                          setShowEditContactsModal(true)
                        }}
                        className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Emergency Contact</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        ) : selectedMemberData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Emergency QR Code - {selectedMemberData.name}
                </h2>
                <p className="text-gray-600">
                  Loading emergency data...
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Family Member Selected</h3>
            <p className="text-gray-600">Please select a family member to view their emergency QR code.</p>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-6 h-6 animate-spin text-primary-600" />
              <p className="text-gray-600">Loading emergency data...</p>
            </div>
          </div>
        )}

        {/* Instructions - Moved to Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Scan className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-800 mb-2">How Emergency QR Codes Work</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
                <div>
                  <p className="mb-2">• <strong>Print & Carry:</strong> Keep QR codes in wallet, phone case, or emergency bag</p>
                  <p className="mb-2">• <strong>Instant Access:</strong> Scan with any smartphone camera to view complete health data</p>
                </div>
                <div>
                  <p className="mb-2">• <strong>Emergency Ready:</strong> Share with paramedics, doctors, or emergency responders</p>
                  <p className="mb-2">• <strong>Auto-Updated:</strong> QR codes update automatically when health information changes</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </div>

      {/* Edit Emergency Contacts Modal */}
      {showEditContactsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 relative max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setShowEditContactsModal(false)} 
              className="absolute right-3 top-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingContactType === 'add' ? 'Add Emergency Contact' : 'Edit Emergency Contacts'}
            </h3>
            
            {/* Get existing contacts */}
            {(() => {
              const selectedData = emergencyData.find(e => e.familyMemberId === editingMemberId)
              const existingContacts = selectedData?.emergencyContacts || []
              const primaryContact = existingContacts.find((c: any) => c.isPrimary)
              const relativeContact = existingContacts.find((c: any) => !c.isPrimary)
              
              // Helper function to extract phone number and country code
              const extractPhone = (phone: string) => {
                if (!phone || phone === 'N/A' || phone === 'Not provided' || phone.toLowerCase().includes('not')) {
                  return { phone: '', countryCode: '+91', display: '' }
                }
                const match = phone.match(/^(\+\d+)(.+)/)
                if (match) {
                  return { phone: match[2], countryCode: match[1], display: phone }
                }
                return { phone: phone.replace(/^\+\d+/, ''), countryCode: phone.match(/^\+\d+/)?.[0] || '+91', display: phone }
              }
              
              const hasValidPrimary = primaryContact && primaryContact.name && primaryContact.name !== 'Not provided' && primaryContact.name !== 'Emergency Contact' && !primaryContact.name.toLowerCase().includes('not') && primaryContact.phone && primaryContact.phone !== 'Not provided' && primaryContact.phone !== 'N/A'
              const hasValidRelative = relativeContact && relativeContact.name && relativeContact.name !== 'Not provided' && relativeContact.name !== 'Emergency Contact' && !relativeContact.name.toLowerCase().includes('not') && relativeContact.phone && relativeContact.phone !== 'Not provided' && relativeContact.phone !== 'N/A'
              
              // If in "add" mode, only show input fields for contacts that don't exist yet
              const isAddMode = editingContactType === 'add'
              
              return (
                <>
                  {/* Primary Contact - Only show in add mode if it doesn't exist, otherwise display read-only */}
                  {isAddMode ? (
                    hasValidPrimary ? (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <label className="text-xs font-medium text-blue-900 mb-2 block">Primary Contact (Your Contact)</label>
                        <div className="p-3 bg-white rounded-lg border border-blue-200">
                          <div className="font-medium text-gray-900">{primaryContact.name}</div>
                          <div className="text-sm text-gray-600">{extractPhone(primaryContact.phone).display}</div>
                          <div className="text-xs text-gray-500 mt-1">Edit via pencil icon next to contact above</div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <label className="text-xs font-medium text-blue-900 mb-2 block">Primary Contact (Your Contact)</label>
                        <div className="space-y-2">
                          <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-lg text-gray-900 text-sm"
                            placeholder="Your name"
                            value={contactForm.primaryContactName}
                            onChange={e => setContactForm({...contactForm, primaryContactName: e.target.value})}
                            onFocus={(e) => {
                              if (e.target.value === 'Not provided' || e.target.value.toLowerCase().includes('not')) {
                                e.target.value = ''
                                setContactForm({...contactForm, primaryContactName: ''})
                              }
                            }}
                          />
                          <div className="flex gap-2">
                            <select
                              className="w-20 px-2 py-2 border rounded-lg bg-white text-gray-900 text-sm"
                              value={contactForm.primaryContactCountryCode}
                              onChange={e => setContactForm({ ...contactForm, primaryContactCountryCode: e.target.value })}
                            >
                              {['+91','+1','+44','+61','+81','+971'].map(cc => (
                                <option key={cc} value={cc}>{cc}</option>
                              ))}
                            </select>
                            <input
                              type="tel"
                              className="flex-1 px-3 py-2 border rounded-lg text-gray-900 text-sm"
                              placeholder="Your phone"
                              value={contactForm.primaryContactPhone}
                              onChange={e => {
                                const value = e.target.value.replace(/[^\d]/g, '')
                                setContactForm({...contactForm, primaryContactPhone: value})
                              }}
                              onFocus={(e) => {
                                if (e.target.value === 'Not provided' || e.target.value.toLowerCase().includes('not') || e.target.value === 'N/A') {
                                  e.target.value = ''
                                  setContactForm({...contactForm, primaryContactPhone: ''})
                                }
                              }}
                            />
                          </div>
                          <button
                            onClick={() => {
                              setContactForm({...contactForm, primaryContactName: '', primaryContactPhone: ''})
                            }}
                            className="text-xs text-gray-600 hover:text-gray-800"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <label className="text-xs font-medium text-blue-900 mb-2 block">Primary Contact (Your Contact)</label>
                      {hasValidPrimary && editingContactType !== 'primary' ? (
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{primaryContact.name}</div>
                            <div className="text-sm text-gray-600">{extractPhone(primaryContact.phone).display}</div>
                          </div>
                          <button
                            onClick={() => {
                              const phoneData = extractPhone(primaryContact.phone)
                              setContactForm({
                                ...contactForm,
                                primaryContactName: primaryContact.name,
                                primaryContactPhone: phoneData.phone,
                                primaryContactCountryCode: phoneData.countryCode
                              })
                              setEditingContactType('primary')
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit primary contact"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-lg text-gray-900 text-sm"
                            placeholder="Your name"
                            value={contactForm.primaryContactName}
                            onChange={e => setContactForm({...contactForm, primaryContactName: e.target.value})}
                            onFocus={(e) => {
                              if (e.target.value === 'Not provided' || e.target.value.toLowerCase().includes('not')) {
                                e.target.value = ''
                                setContactForm({...contactForm, primaryContactName: ''})
                              }
                            }}
                          />
                          <div className="flex gap-2">
                            <select
                              className="w-20 px-2 py-2 border rounded-lg bg-white text-gray-900 text-sm"
                              value={contactForm.primaryContactCountryCode}
                              onChange={e => setContactForm({ ...contactForm, primaryContactCountryCode: e.target.value })}
                            >
                              {['+91','+1','+44','+61','+81','+971'].map(cc => (
                                <option key={cc} value={cc}>{cc}</option>
                              ))}
                            </select>
                            <input
                              type="tel"
                              className="flex-1 px-3 py-2 border rounded-lg text-gray-900 text-sm"
                              placeholder="Your phone"
                              value={contactForm.primaryContactPhone}
                              onChange={e => {
                                const value = e.target.value.replace(/[^\d]/g, '')
                                setContactForm({...contactForm, primaryContactPhone: value})
                              }}
                              onFocus={(e) => {
                                if (e.target.value === 'Not provided' || e.target.value.toLowerCase().includes('not') || e.target.value === 'N/A') {
                                  e.target.value = ''
                                  setContactForm({...contactForm, primaryContactPhone: ''})
                                }
                              }}
                            />
                          </div>
                          {editingContactType === 'primary' && (
                            <button
                              onClick={() => {
                                setEditingContactType(null)
                              }}
                              className="text-xs text-gray-600 hover:text-gray-800"
                            >
                              Cancel editing
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Relative Contact - In add mode, only show input fields for adding new relative */}
                  <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <label className="text-xs font-medium text-green-900 mb-2 block">
                      {isAddMode ? 'Add New Relative Contact' : 'Relative Contact (To Inform Relatives)'}
                    </label>
                    {!isAddMode && hasValidRelative && editingContactType !== 'relative' ? (
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{relativeContact.name}</div>
                          <div className="text-sm text-gray-600">{relativeContact.relationship}</div>
                          <div className="text-sm text-gray-500">{extractPhone(relativeContact.phone).display}</div>
                        </div>
                        <button
                          onClick={() => {
                            const phoneData = extractPhone(relativeContact.phone)
                            setContactForm({
                              ...contactForm,
                              relativeContactName: relativeContact.name,
                              relativeContactPhone: phoneData.phone,
                              relativeContactCountryCode: phoneData.countryCode,
                              relativeContactRelation: relativeContact.relationship
                            })
                            setEditingContactType('relative')
                          }}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Edit relative contact"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-lg text-gray-900 text-sm"
                          placeholder="Relative name"
                          value={contactForm.relativeContactName}
                          onChange={e => setContactForm({...contactForm, relativeContactName: e.target.value})}
                          onFocus={(e) => {
                            if (e.target.value === 'Not provided' || e.target.value.toLowerCase().includes('not')) {
                              e.target.value = ''
                              setContactForm({...contactForm, relativeContactName: ''})
                            }
                          }}
                        />
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-lg text-gray-900 text-sm"
                          placeholder="Relationship (e.g., Spouse, Parent)"
                          value={contactForm.relativeContactRelation}
                          onChange={e => setContactForm({...contactForm, relativeContactRelation: e.target.value})}
                          onFocus={(e) => {
                            if (e.target.value === 'Not provided' || e.target.value === 'Please add contact' || e.target.value.toLowerCase().includes('not')) {
                              e.target.value = ''
                              setContactForm({...contactForm, relativeContactRelation: ''})
                            }
                          }}
                        />
                        <div className="flex gap-2">
                          <select
                            className="w-20 px-2 py-2 border rounded-lg bg-white text-gray-900 text-sm"
                            value={contactForm.relativeContactCountryCode}
                            onChange={e => setContactForm({ ...contactForm, relativeContactCountryCode: e.target.value })}
                          >
                            {['+91','+1','+44','+61','+81','+971'].map(cc => (
                              <option key={cc} value={cc}>{cc}</option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            className="flex-1 px-3 py-2 border rounded-lg text-gray-900 text-sm"
                            placeholder="Relative phone"
                            value={contactForm.relativeContactPhone}
                            onChange={e => {
                              const value = e.target.value.replace(/[^\d]/g, '')
                              setContactForm({...contactForm, relativeContactPhone: value})
                            }}
                            onFocus={(e) => {
                              if (e.target.value === 'Not provided' || e.target.value.toLowerCase().includes('not') || e.target.value === 'N/A') {
                                e.target.value = ''
                                setContactForm({...contactForm, relativeContactPhone: ''})
                              }
                            }}
                          />
                        </div>
                        {!isAddMode && editingContactType === 'relative' && (
                          <button
                            onClick={() => {
                              if (hasValidRelative) {
                                setEditingContactType(null)
                              } else {
                                setContactForm({...contactForm, relativeContactName: '', relativeContactPhone: '', relativeContactRelation: ''})
                              }
                            }}
                            className="text-xs text-gray-600 hover:text-gray-800"
                          >
                            Cancel editing
                          </button>
                        )}
                        {isAddMode && (
                          <button
                            onClick={() => {
                              setContactForm({...contactForm, relativeContactName: '', relativeContactPhone: '', relativeContactRelation: ''})
                            }}
                            className="text-xs text-gray-600 hover:text-gray-800"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )
            })()}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowEditContactsModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const token = await getToken()
                    if (!token) throw new Error('No authentication token available')

                    const UPDATE_FAMILY_MEMBER = `
                      mutation UpdateFamilyMember($id: ID!, $input: UpdateFamilyMemberInput!) {
                        updateFamilyMember(id: $id, input: $input) {
                          id
                          emergencyContacts
                        }
                      }
                    `

                    // Get existing contacts
                    const selectedData = emergencyData.find(e => e.familyMemberId === editingMemberId)
                    const existingContacts = selectedData?.emergencyContacts || []
                    
                    // Build contacts array - merge existing with new/updated
                    const contactsArray = []
                    
                    if (editingContactType === 'add') {
                      // Add mode: keep all existing contacts and add new ones
                      contactsArray.push(...existingContacts)
                      
                      // In add mode, only add primary contact if it doesn't exist
                      const hasPrimary = existingContacts.some((c: any) => c.isPrimary)
                      if (!hasPrimary && contactForm.primaryContactName && contactForm.primaryContactPhone) {
                        contactsArray.push({
                          name: contactForm.primaryContactName,
                          phone: `${contactForm.primaryContactCountryCode}${contactForm.primaryContactPhone}`,
                          relationship: 'Self',
                          isPrimary: true
                        })
                      }
                      
                      // In add mode, add new relative contact if provided
                      if (contactForm.relativeContactName && contactForm.relativeContactPhone) {
                        contactsArray.push({
                          name: contactForm.relativeContactName,
                          phone: `${contactForm.relativeContactCountryCode}${contactForm.relativeContactPhone}`,
                          relationship: contactForm.relativeContactRelation || 'Relative',
                          isPrimary: false
                        })
                      }
                    } else {
                      // Edit mode: replace edited contact, keep others
                      // Add existing contacts that weren't edited
                      if (editingContactType !== 'primary') {
                        const existingPrimary = existingContacts.find((c: any) => c.isPrimary)
                        if (existingPrimary && existingPrimary.name && existingPrimary.name !== 'Not provided') {
                          contactsArray.push(existingPrimary)
                        }
                      }
                      if (editingContactType !== 'relative') {
                        const existingRelative = existingContacts.find((c: any) => !c.isPrimary)
                        if (existingRelative && existingRelative.name && existingRelative.name !== 'Not provided') {
                          contactsArray.push(existingRelative)
                        }
                      }
                      
                      // Add updated primary contact
                      if (contactForm.primaryContactName && contactForm.primaryContactPhone) {
                        contactsArray.push({
                          name: contactForm.primaryContactName,
                          phone: `${contactForm.primaryContactCountryCode}${contactForm.primaryContactPhone}`,
                          relationship: 'Self',
                          isPrimary: true
                        })
                      }
                      
                      // Add updated relative contact
                      if (contactForm.relativeContactName && contactForm.relativeContactPhone) {
                        contactsArray.push({
                          name: contactForm.relativeContactName,
                          phone: `${contactForm.relativeContactCountryCode}${contactForm.relativeContactPhone}`,
                          relationship: contactForm.relativeContactRelation || 'Relative',
                          isPrimary: false
                        })
                      }
                    }
                    
                    const emergencyContacts = {
                      contacts: contactsArray
                    }

                    await graphqlRequest(UPDATE_FAMILY_MEMBER, {
                      id: editingMemberId,
                      input: { emergencyContacts }
                    }, token)

                    // Reload data
                    await loadFamilyMembers()
                    setShowEditContactsModal(false)
                    alert('Emergency contacts updated successfully!')
                  } catch (error) {
                    console.error('Error updating emergency contacts:', error)
                    alert('Failed to update emergency contacts. Please try again.')
                  }
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Save Contacts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}