'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser, useAuth } from '@clerk/nextjs'
import Navigation from '@/components/Navigation'
import AddFamilyMemberModal from '@/components/AddFamilyMemberModal'
import { graphqlRequest } from '@/lib/graphql-client'
import {
  ArrowLeft,
  Upload,
  File,
  Image,
  FileText,
  X,
  CheckCircle,
  User,
  Cloud,
  Brain,
  AlertCircle,
  Loader
} from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  size: string
  type: string
  category: string
  uploadDate: string
  familyMemberId: string
  familyMemberName: string
  description: string
  tags: string[]
  url: string
  medicalScore: number
  matchedTerms: string[]
  uploaded: boolean
  rejectionReason?: string
}

interface FamilyMember {
  id: string
  name: string
  relationship: string
}

const GET_FAMILY_MEMBERS = `
  query GetFamilyMembers {
    familyMembers {
      id
      name
      relationship
    }
  }
`

const CREATE_HEALTH_REPORT = `
  mutation CreateHealthReport($input: CreateHealthReportInput!) {
    createHealthReport(input: $input) {
      id
      fileName
      fileType
      fileUrl
      fileSize
      status
      validationStatus
      accuracyScore
      matchedTerms
      rejectionReason
      extractedText
      analysis
      memberId
      createdAt
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
      createdAt
    }
  }
`

export default function UploadReports() {
  const { isSignedIn, user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [selectedMember, setSelectedMember] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State for patient name modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [pendingFileData, setPendingFileData] = useState<{
    file: File
    fileInfo: any
    validation: any
    index: number
    extractedPatientName?: string
    extractedPatientInfo?: {
      age?: number
      gender?: string
      bloodType?: string
    }
  } | null>(null)

  useEffect(() => {
    const loadMembers = async () => {
      if (!isLoaded || !isSignedIn || !user) return
      
      try {
        const token = await getToken()
        if (!token) return
        
        // Load family members from GraphQL backend
        const data = await graphqlRequest(GET_FAMILY_MEMBERS, {}, token)
        if (data && data.familyMembers) {
          const members = data.familyMembers.map((m: any) => ({
            id: m.id,
            name: m.name || '',
            relationship: m.relationship || 'Family Member'
          }))
          setFamilyMembers(members)
          if (members.length > 0) {
            setSelectedMember(members[0].id)
          }
        }
      } catch (error) {
        console.error('Error loading family members:', error)
        // Fallback to empty array
        setFamilyMembers([])
      }
    }
    
    if (isLoaded && isSignedIn && user) {
      loadMembers()
    }
  }, [isLoaded, isSignedIn, user, getToken])

  // Helper function to extract patient name from text
  const extractPatientName = (text: string): string => {
    if (!text) return ''
    
    // Try common patterns for patient name
    const patterns = [
      /patient\s+name[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /name[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /patient[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }
    
    return ''
  }

  // Helper function to extract patient info (age, gender, bloodType)
  const extractPatientInfo = (text: string) => {
    const info: { age?: number; gender?: string; bloodType?: string } = {}
    
    const ageMatch = text.match(/age[:\s]+(\d+)/i)
    if (ageMatch) info.age = parseInt(ageMatch[1])
    
    const genderMatch = text.match(/gender[:\s]+(male|female|other)/i)
    if (genderMatch) info.gender = genderMatch[1]
    
    const bloodTypeMatch = text.match(/blood\s*type[:\s]+([ABO][+-]?|ab[+-]?)/i)
    if (bloodTypeMatch) info.bloodType = bloodTypeMatch[1].toUpperCase()
    
    return info
  }

  // Helper function to check if patient name matches any family member
  const findMatchingMember = (patientName: string): string | null => {
    if (!patientName) return null
    
    const normalizedPatientName = patientName.toLowerCase().trim()
    
    for (const member of familyMembers) {
      const normalizedMemberName = member.name.toLowerCase().trim()
      // Check for exact match or if patient name contains member name or vice versa
      if (
        normalizedPatientName === normalizedMemberName ||
        normalizedPatientName.includes(normalizedMemberName) ||
        normalizedMemberName.includes(normalizedPatientName)
      ) {
        return member.id
      }
    }
    
    return null
  }

  // Function to create family member and continue with report upload
  const handleAddFamilyMember = async (relationship: string) => {
    if (!pendingFileData || !user) {
      throw new Error('Missing file data or user')
    }

    const token = await getToken()
    if (!token) {
      throw new Error('No authentication token available')
    }

    const { extractedPatientName, extractedPatientInfo, file, fileInfo, validation, index } = pendingFileData
    
    if (!extractedPatientName) {
      throw new Error('Patient name not found in report')
    }

    // Calculate date of birth from age if available
    let dob = new Date('1990-01-01') // Default DOB
    if (extractedPatientInfo?.age) {
      const currentYear = new Date().getFullYear()
      dob = new Date(currentYear - extractedPatientInfo.age, 0, 1)
    }

    // Create family member
    const memberData = await graphqlRequest(CREATE_FAMILY_MEMBER, {
      input: {
        name: extractedPatientName,
        relationship,
        dob: dob.toISOString(),
        gender: extractedPatientInfo?.gender || 'Unknown',
        bloodType: extractedPatientInfo?.bloodType || undefined,
      }
    }, token)

    const newMemberId = memberData.createFamilyMember.id
    const newMemberName = memberData.createFamilyMember.name

    // Reload family members
    const data = await graphqlRequest(GET_FAMILY_MEMBERS, {}, token)
    if (data && data.familyMembers) {
      const members = data.familyMembers.map((m: any) => ({
        id: m.id,
        name: m.name || '',
        relationship: m.relationship || 'Family Member'
      }))
      setFamilyMembers(members)
      // Update selected member to the newly created one
      setSelectedMember(newMemberId)
    }

    // Continue with report upload using the new member ID
    try {
      await processFileUpload(file, fileInfo, validation, index, newMemberId, newMemberName)
      console.log(`✅ Successfully uploaded report for newly added family member: ${newMemberName}`)
    } catch (error: any) {
      console.error('Error uploading report after adding family member:', error)
      // Add to rejected files
      const rejectedFile: UploadedFile = {
        id: `file-${Date.now()}-${index}`,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        category: 'general',
        uploadDate: new Date().toISOString().split('T')[0],
        familyMemberId: newMemberId,
        familyMemberName: newMemberName,
        description: '',
        tags: [],
        medicalScore: validation.accuracyScore,
        matchedTerms: validation.matchedTerms || [],
        uploaded: false,
        rejectionReason: `Failed to save report: ${error.message || 'Unknown error'}`,
        url: ''
      }
      setUploadedFiles(prev => [...prev, rejectedFile])
      throw error
    }

    // Clear pending data
    setPendingFileData(null)
  }

  // Function to process file upload (extracted from handleFiles)
  const processFileUpload = async (
    file: File,
    fileInfo: any,
    validation: any,
    index: number,
    memberId: string,
    memberName: string
  ) => {
    const token = await getToken()
    if (!token) {
      throw new Error('No authentication token available')
    }

    try {
      const reportData = await graphqlRequest(CREATE_HEALTH_REPORT, {
        input: {
          memberId,
          fileName: fileInfo.fileName,
          fileType: fileInfo.fileType,
          fileUrl: fileInfo.fileUrl,
          fileSize: fileInfo.fileSize,
          extractedText: fileInfo.extractedText,
          autoExtract: true
        }
      }, token)

      const report = reportData.createHealthReport

      const uploadedFile: UploadedFile = {
        id: report.id,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        category: 'medical',
        uploadDate: new Date().toISOString().split('T')[0],
        familyMemberId: memberId,
        familyMemberName: memberName,
        description: '',
        tags: [],
        medicalScore: report.accuracyScore || validation.accuracyScore,
        matchedTerms: report.matchedTerms || validation.matchedTerms || [],
        uploaded: true,
        url: fileInfo.fileUrl
      }

      setUploadedFiles(prev => [...prev, uploadedFile])
      console.log('✅ Valid medical report uploaded and processed:', report.id)
      console.log('📊 Auto-extracted data:', report.analysis)
    } catch (graphqlError: any) {
      console.error('Error creating health report:', graphqlError)
      throw graphqlError
    }
  }

  const handleFiles = async (files: FileList) => {
    if (!selectedMember) {
      alert('Please select a family member first')
      return
    }

    if (!user || !isSignedIn) {
      alert('Please sign in to upload reports')
      return
    }

    setIsUploading(true)
    setError(null)
    
    try {
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }

      // Derive backend URL from GraphQL endpoint
      const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql'
      const backendUrl = graphqlEndpoint.replace('/graphql', '')
      const accepted: UploadedFile[] = []
      const rejected: UploadedFile[] = []

      for (const [index, file] of Array.from(files).entries()) {
        try {
          // Step 1: Upload file to backend for validation
          const formData = new FormData()
          formData.append('file', file)

          const uploadResponse = await fetch(`${backendUrl}/api/upload/health-report`, {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.statusText}`)
          }

          const uploadData = await uploadResponse.json()
          const fileInfo = uploadData.file
          const validation = uploadData.validation

          // CRITICAL: Only proceed if validation passes - reject invalid reports immediately
          if (!validation.isValid) {
            rejected.push({
              id: `file-${Date.now()}-${index}`,
              name: file.name,
              size: formatFileSize(file.size),
              type: file.type,
              category: 'general',
              uploadDate: new Date().toISOString().split('T')[0],
              familyMemberId: selectedMember,
              familyMemberName: familyMembers.find(m => m.id === selectedMember)?.name || '',
              description: '',
              tags: [],
              medicalScore: validation.accuracyScore,
              matchedTerms: validation.matchedTerms || [],
              uploaded: false,
              rejectionReason: validation.rejectionReason || `Invalid medical report. Accuracy: ${Math.round(validation.accuracyScore * 100)}% (minimum 60% required). Please upload a valid medical report only.`,
              url: ''
            })
            continue // Skip to next file - do NOT save invalid reports
          }

          // Step 2: Extract patient name from report text
          setIsAnalyzing(true)
          const extractedText = fileInfo.extractedText || ''
          const patientName = extractPatientName(extractedText)
          const patientInfo = extractPatientInfo(extractedText)
          
          // Step 3: Check if patient name matches any family member
          let targetMemberId = selectedMember
          let targetMemberName = familyMembers.find(m => m.id === selectedMember)?.name || ''
          
          if (patientName) {
            const matchingMemberId = findMatchingMember(patientName)
            
            if (matchingMemberId) {
              // Patient found in family members, use that member
              targetMemberId = matchingMemberId
              targetMemberName = familyMembers.find(m => m.id === matchingMemberId)?.name || patientName
              console.log(`✅ Found matching family member: ${targetMemberName}`)
            } else {
              // Patient not found - show modal to add them
              console.log(`⚠️ Patient "${patientName}" not found in family members. Showing add member modal.`)
              setPendingFileData({
                file,
                fileInfo,
                validation,
                index,
                extractedPatientName: patientName,
                extractedPatientInfo: patientInfo
              })
              setShowAddMemberModal(true)
              // Wait for user to add member - the modal will call handleAddFamilyMember
              continue // Skip to next file - will be processed after member is added
            }
          }

          // Step 4: Create health report with the determined member ID
          try {
            await processFileUpload(file, fileInfo, validation, index, targetMemberId, targetMemberName)
          } catch (graphqlError: any) {
            console.error('Error creating health report:', graphqlError)
            // If GraphQL fails, the report was already validated but couldn't be saved
            rejected.push({
              id: `file-${Date.now()}-${index}`,
              name: file.name,
              size: formatFileSize(file.size),
              type: file.type,
              category: 'general',
              uploadDate: new Date().toISOString().split('T')[0],
              familyMemberId: targetMemberId,
              familyMemberName: targetMemberName,
              description: '',
              tags: [],
              medicalScore: validation.accuracyScore,
              matchedTerms: validation.matchedTerms || [],
              uploaded: false,
              rejectionReason: `Failed to save report: ${graphqlError.message || 'Unknown error'}`,
              url: ''
            })
          }
        } catch (fileError: any) {
          console.error(`Error processing file ${file.name}:`, fileError)
          rejected.push({
            id: `file-${Date.now()}-${index}`,
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type,
            category: 'general',
            uploadDate: new Date().toISOString().split('T')[0],
            familyMemberId: selectedMember,
            familyMemberName: familyMembers.find(m => m.id === selectedMember)?.name || '',
            description: '',
            tags: [],
            medicalScore: 0,
            matchedTerms: [],
            uploaded: false,
            rejectionReason: `Upload error: ${fileError.message || 'Unknown error'}`,
            url: ''
          })
        }
      }

      if (accepted.length === 0 && rejected.length === 0) return
      setUploadedFiles(prev => [...prev, ...rejected, ...accepted])

      // Show success message if any files were accepted
      if (accepted.length > 0) {
        const extractedCount = accepted.reduce((sum, file) => {
          // Check if report has auto-extracted data
          return sum + (file.uploaded ? 1 : 0)
        }, 0)
        
        if (extractedCount > 0) {
          console.log(`✅ Successfully uploaded ${accepted.length} report(s). Medications, appointments, and reminders have been automatically extracted and saved.`)
        }
      }

    } catch (e: any) {
      console.error('Error uploading files', e)
      setError(e.message || 'Failed to upload files. Please try again.')
    } finally {
      setIsUploading(false)
      setIsAnalyzing(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image
    if (type.includes('pdf')) return File
    if (type.includes('text')) return FileText
    return File
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <button onClick={() => window.history.back()} className="p-2 rounded-xl bg-white shadow-lg hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 rounded-2xl">
                <Upload className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Upload Reports</h1>
                <p className="text-base text-gray-600 mt-2">Upload your health documents for validation</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="w-5 h-5 text-primary-600" />
              <span>Who are these reports for?</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {familyMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedMember(member.id)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedMember === member.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-base font-semibold">{member.name}</div>
                    <div className="text-sm text-gray-500">{member.relationship}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Cloud className="w-5 h-5 text-primary-600" />
              <span>Upload Files</span>
            </h3>
            <div
              className="relative border-2 border-dashed rounded-xl p-8 text-center hover:border-primary-400"
            >
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Drop files here or click to upload</h4>
                  <p className="text-sm text-gray-600 mb-2">Supports PDF, images, and text files up to 10MB each</p>
                  <p className="text-xs text-orange-600 font-semibold">⚠️ Only valid medical reports will be uploaded. Invalid documents will be rejected.</p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span>Choose Files</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.gif,.txt,.doc,.docx"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
              />
            </div>

            {isUploading && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center space-x-3">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-blue-800 font-semibold text-sm">Uploading files...</span>
              </div>
            )}

            {isAnalyzing && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg flex items-center space-x-3">
                <Brain className="w-4 h-4 text-purple-600 animate-pulse" />
                <span className="text-purple-800 font-semibold text-sm">Validating reports and extracting data...</span>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-center space-x-3">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-800 font-semibold text-sm">{error}</span>
              </div>
            )}
          </div>

          {uploadedFiles.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary-600" />
                <span>Uploaded Files ({uploadedFiles.length})</span>
              </h3>
              <div className="space-y-3">
                {uploadedFiles.map((file) => {
                  const Icon = getFileIcon(file.type)
                  return (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-semibold text-gray-900">{file.name}</div>
                          <div className="text-sm text-gray-500">
                            {file.size} • {file.familyMemberName} • Accuracy {Math.round((file.medicalScore || 0) * 100)}%
                          </div>
                          {file.matchedTerms && file.matchedTerms.length > 0 && file.uploaded && (
                            <div className="text-xs text-gray-500 mt-1">
                              Matched terms: {file.matchedTerms.slice(0,6).join(', ')}{file.matchedTerms.length > 6 ? '…' : ''}
                            </div>
                          )}
                          {file.uploaded && (file.medicalScore || 0) >= 0.6 ? (
                            <div className="inline-flex items-center mt-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded px-2 py-0.5">
                              <CheckCircle className="w-3 h-3 mr-1" /> 
                              Valid Medical Report • Uploaded & Saved • Medications, appointments, and reminders extracted automatically
                            </div>
                          ) : (
                            <div className="inline-flex items-center mt-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded px-2 py-0.5">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              <span>Rejected - Not a Valid Medical Report{file.rejectionReason ? ` — ${file.rejectionReason}` : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button onClick={() => removeFile(file.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Family Member Modal */}
      {pendingFileData && (
        <AddFamilyMemberModal
          isOpen={showAddMemberModal}
          onClose={async () => {
            // If user closes without confirming, proceed with the selected member
            if (pendingFileData && selectedMember) {
              try {
                const memberName = familyMembers.find(m => m.id === selectedMember)?.name || 'Selected Member'
                await processFileUpload(
                  pendingFileData.file,
                  pendingFileData.fileInfo,
                  pendingFileData.validation,
                  pendingFileData.index,
                  selectedMember,
                  memberName
                )
                console.log(`✅ Uploaded report using selected member: ${memberName}`)
              } catch (error: any) {
                console.error('Error uploading report with selected member:', error)
                const rejectedFile: UploadedFile = {
                  id: `file-${Date.now()}-${pendingFileData.index}`,
                  name: pendingFileData.file.name,
                  size: formatFileSize(pendingFileData.file.size),
                  type: pendingFileData.file.type,
                  category: 'general',
                  uploadDate: new Date().toISOString().split('T')[0],
                  familyMemberId: selectedMember,
                  familyMemberName: familyMembers.find(m => m.id === selectedMember)?.name || '',
                  description: '',
                  tags: [],
                  medicalScore: pendingFileData.validation.accuracyScore,
                  matchedTerms: pendingFileData.validation.matchedTerms || [],
                  uploaded: false,
                  rejectionReason: `Failed to save report: ${error.message || 'Unknown error'}`,
                  url: ''
                }
                setUploadedFiles(prev => [...prev, rejectedFile])
              }
            }
            setShowAddMemberModal(false)
            setPendingFileData(null)
          }}
          patientName={pendingFileData.extractedPatientName || 'Unknown'}
          patientInfo={pendingFileData.extractedPatientInfo}
          onConfirm={handleAddFamilyMember}
        />
      )}
    </div>
  )
}


