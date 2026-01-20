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
  ChevronDown
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
        status: 'good' as const
      }))
      
      setFamilyMembers(formattedMembers)
      if (formattedMembers.length > 0) {
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
    qrText += `RELATIONSHIP: ${member.relationship}\n`
    qrText += `BLOOD TYPE: ${emergencyInfo.bloodType}\n\n`
    
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-8">
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
              <label className="text-base font-semibold text-gray-900 whitespace-nowrap">
                Select Family Member:
              </label>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white hover:bg-gray-50 transition-colors min-w-[200px]"
              >
                {selectedMemberData && (
                  <>
                    <img
                      src={selectedMemberData.avatar}
                      alt={selectedMemberData.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {selectedMemberData.name} ({selectedMemberData.relationship})
                    </span>
                  </>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {familyMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        setSelectedMember(member.id)
                        setShowDropdown(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        selectedMember === member.id ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                      }`}
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <div>
                        <div className="text-sm font-medium">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.relationship} - Age {member.age}</div>
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
        {selectedMemberData && selectedEmergencyData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            {/* QR Code Card */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Emergency QR Code - {selectedMemberData.name}
                </h2>
                <p className="text-gray-600">
                  Scan this QR code to access complete health information
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* QR Code - Left Side */}
                <div className="text-center">
                  <div className="inline-block p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-lg">
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
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Health Information Summary</h3>
                  
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Basic Information</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>Name:</strong> {selectedMemberData.name}</div>
                        <div><strong>Age:</strong> {selectedMemberData.age} years</div>
                        <div><strong>Blood Type:</strong> {selectedEmergencyData.bloodType !== 'Unknown' ? selectedEmergencyData.bloodType : 'Not specified'}</div>
                        <div><strong>Relationship:</strong> {selectedMemberData.relationship}</div>
                        {selectedMemberData.phone && (
                          <div><strong>Phone:</strong> {selectedMemberData.phone}</div>
                        )}
                        {selectedMemberData.email && (
                          <div><strong>Email:</strong> {selectedMemberData.email}</div>
                        )}
                        {selectedMemberData.address && (
                          <div className="col-span-2"><strong>Address:</strong> {selectedMemberData.address}</div>
                        )}
                        <div><strong>Status:</strong> 
                          <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                            selectedMemberData.status === 'excellent' ? 'bg-green-100 text-green-800' :
                            selectedMemberData.status === 'good' ? 'bg-blue-100 text-blue-800' :
                            selectedMemberData.status === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {selectedMemberData.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Medical Conditions */}
                    {selectedEmergencyData.medicalConditions.length > 0 && (
                      <div className="bg-red-50 rounded-xl p-4">
                        <h4 className="font-semibold text-red-900 mb-2 flex items-center space-x-2">
                          <Heart className="w-4 h-4" />
                          <span>Medical Conditions</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedEmergencyData.medicalConditions.map((condition, index) => (
                            <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Allergies */}
                    {selectedEmergencyData.allergies.length > 0 && (
                      <div className="bg-orange-50 rounded-xl p-4">
                        <h4 className="font-semibold text-orange-900 mb-2 flex items-center space-x-2">
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
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
                        <Pill className="w-4 h-4" />
                        <span>Current Medications</span>
                        {selectedEmergencyData.medications.length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full text-xs font-medium">
                            {selectedEmergencyData.medications.length}
                          </span>
                        )}
                      </h4>
                      {selectedEmergencyData.medications.length > 0 ? (
                        <div className="space-y-2">
                          {selectedEmergencyData.medications.map((medication, index) => (
                            <div key={index} className="flex items-start space-x-2 p-2 bg-white rounded-lg border border-blue-200">
                              <Pill className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-blue-900">
                                  {medication}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-blue-700 italic py-2">
                          No active medications recorded for {selectedMemberData.name}
                        </div>
                      )}
                    </div>

                    {/* Emergency Contacts */}
                    <div className="bg-green-50 rounded-xl p-4">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>Emergency Contacts</span>
                        {selectedEmergencyData.emergencyContacts.length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-green-200 text-green-800 rounded-full text-xs font-medium">
                            {selectedEmergencyData.emergencyContacts.length}
                          </span>
                        )}
                      </h4>
                      {selectedEmergencyData.emergencyContacts.length > 0 ? (
                        <div className="space-y-2">
                          {selectedEmergencyData.emergencyContacts.map((contact: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-green-200">
                              <div className="flex-1">
                                <div className="font-medium text-green-900 flex items-center space-x-2">
                                  {contact.name}
                                  {contact.isPrimary && (
                                    <span className="px-1.5 py-0.5 bg-green-200 text-green-800 rounded text-xs">Primary</span>
                                  )}
                                </div>
                                <div className="text-sm text-green-700">{contact.relationship}</div>
                              </div>
                              <div className="text-sm text-green-800 font-mono">
                                {contact.phone && contact.phone !== 'N/A' && contact.phone !== 'Not provided' ? (
                                  <a href={`tel:${contact.phone}`} className="hover:text-green-600">
                                    {contact.phone}
                                  </a>
                                ) : (
                                  <span className="text-gray-500">{contact.phone || 'Not provided'}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-green-700 italic py-2">
                          No emergency contacts provided. Please add emergency contacts in family member settings.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
    </div>
  )
}