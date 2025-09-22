'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
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
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [emergencyData, setEmergencyData] = useState<EmergencyData[]>([])
  const [selectedMember, setSelectedMember] = useState<string>('divya-001')
  const [showQRModal, setShowQRModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    loadFamilyMembers()
    loadEmergencyData()
  }, [])

  const loadFamilyMembers = async () => {
    try {
      // Mock family members data
      const mockMembers: FamilyMember[] = [
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
      setFamilyMembers(mockMembers)
      if (mockMembers.length > 0) {
        setSelectedMember(mockMembers[0].id)
      }
    } catch (error) {
      console.error('Error loading family members:', error)
    }
  }

  const loadEmergencyData = async () => {
    try {
      setLoading(true)
      
      // Mock emergency data
      const mockEmergencyData: EmergencyData[] = [
        {
          id: 'emergency-001',
          familyMemberId: 'divya-001',
          familyMemberName: 'Divya',
          bloodType: 'O+',
          allergies: ['Penicillin', 'Shellfish'],
          medications: ['Lisinopril 10mg', 'Metformin 500mg'],
          medicalConditions: ['Hypertension', 'Type 2 Diabetes'],
          emergencyContacts: [
            { name: 'Tushar', relationship: 'Brother', phone: '+1-555-0123', isPrimary: true },
            { name: 'Dr. Sarah Johnson', relationship: 'Doctor', phone: '+1-555-5678', isPrimary: false }
          ],
          insuranceInfo: {
            provider: 'HealthPlus Insurance',
            policyNumber: 'HP123456789',
            groupNumber: 'GRP001'
          },
          doctorInfo: {
            name: 'Dr. Sarah Johnson',
            specialty: 'Internal Medicine',
            phone: '+1-555-5678'
          },
          lastUpdated: '2024-01-15T09:15:00Z'
        },
        {
          id: 'emergency-002',
          familyMemberId: 'tushar-002',
          familyMemberName: 'Tushar',
          bloodType: 'A+',
          allergies: ['Peanuts'],
          medications: [],
          medicalConditions: [],
          emergencyContacts: [
            { name: 'Divya', relationship: 'Sister', phone: '+1-555-0124', isPrimary: true },
            { name: 'Dr. Michael Chen', relationship: 'Doctor', phone: '+1-555-5679', isPrimary: false }
          ],
          insuranceInfo: {
            provider: 'HealthPlus Insurance',
            policyNumber: 'HP123456790',
            groupNumber: 'GRP001'
          },
          doctorInfo: {
            name: 'Dr. Michael Chen',
            specialty: 'General Practice',
            phone: '+1-555-5679'
          },
          lastUpdated: '2024-01-15T09:15:00Z'
        }
      ]

      setEmergencyData(mockEmergencyData)
    } catch (error) {
      console.error('Error loading emergency data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate comprehensive QR data for a family member
  const generateQRData = (member: FamilyMember) => {
    const emergencyInfo = emergencyData.find(data => data.familyMemberId === member.id)
    if (!emergencyInfo) return ''

    const qrData = {
      // Basic Info
      name: member.name,
      age: member.age,
      relationship: member.relationship,
      
      // Medical Info
      bloodType: emergencyInfo.bloodType,
      allergies: emergencyInfo.allergies,
      medications: emergencyInfo.medications,
      medicalConditions: emergencyInfo.medicalConditions,
      
      // Emergency Contacts
      emergencyContacts: emergencyInfo.emergencyContacts,
      
      // Insurance & Doctor
      insuranceInfo: emergencyInfo.insuranceInfo,
      doctorInfo: emergencyInfo.doctorInfo,
      
      // Metadata
      timestamp: new Date().toISOString(),
      generatedBy: 'AURAA Health System',
      version: '1.0'
    }

    return JSON.stringify(qrData, null, 2)
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
      
      <div className="container mx-auto px-4 pt-24 pb-8">
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
                        <div><strong>Age:</strong> {selectedMemberData.age}</div>
                        <div><strong>Blood Type:</strong> {selectedEmergencyData.bloodType}</div>
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

                    {/* Medications */}
                    {selectedEmergencyData.medications.length > 0 && (
                      <div className="bg-blue-50 rounded-xl p-4">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
                          <Pill className="w-4 h-4" />
                          <span>Current Medications</span>
                        </h4>
                        <div className="space-y-1">
                          {selectedEmergencyData.medications.map((medication, index) => (
                            <div key={index} className="text-sm text-blue-800">
                              {medication}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Emergency Contacts */}
                    <div className="bg-green-50 rounded-xl p-4">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>Emergency Contacts</span>
                      </h4>
                      <div className="space-y-2">
                        {selectedEmergencyData.emergencyContacts.map((contact, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-green-900">{contact.name}</div>
                              <div className="text-sm text-green-700">{contact.relationship}</div>
                            </div>
                            <div className="text-sm text-green-800 font-mono">{contact.phone}</div>
                          </div>
                        ))}
                      </div>
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
  )
}