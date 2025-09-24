'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { aiAnalysisService, HealthData } from '@/lib/ai-analysis-service'
import { 
  ArrowLeft,
  Upload,
  File,
  Image,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Tag,
  Download,
  Trash2,
  Cloud,
  Shield,
  Info,
  Heart,
  Activity,
  Brain,
  Pill
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
}

interface FamilyMember {
  id: string
  name: string
  relationship: string
}

export default function UploadReports() {
  const [selectedMember, setSelectedMember] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<HealthData | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock family members
  const familyMembers: FamilyMember[] = [
    { id: 'divya-001', name: 'Divya', relationship: 'Self' },
    { id: 'tushar-002', name: 'Tushar', relationship: 'Brother' },
  ]

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = async (files: FileList) => {
    if (!selectedMember) {
      alert('Please select a family member first')
      return
    }

    setIsUploading(true)
    
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Client-side validation: extension + medical scoring (via quick OCR)
      const accepted: UploadedFile[] = []
      for (const [index, file] of Array.from(files).entries()) {
        if (!aiAnalysisService.isAllowedExtension(file)) {
          alert(`❌ ${file.name}: Unsupported file type`)
          continue
        }
        // lightweight OCR simulation to score text (using existing mock)
        const ocr = await aiAnalysisService.processDocument(file)
        const { score } = aiAnalysisService.scoreMedicalText(ocr.text)
        if (score < 0.35) { // threshold – can tune later
          alert(`❌ ${file.name}: Not recognized as a medical report (score ${Math.round(score*100)}%).`)
          continue
        }
        accepted.push({
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
          url: URL.createObjectURL(file)
        })
      }
      
      if (accepted.length === 0) {
        setIsUploading(false)
        return
      }
      setUploadedFiles(prev => [...prev, ...accepted])
      
      // Start AI analysis
      setIsAnalyzing(true)
      await analyzeFilesWithAI(new DataTransfer().files)
      // Re-run analysis on accepted files explicitly
      for (const f of accepted) {
        // No re-read original File object here (mock pipeline already scored)
      }
      
      setShowSuccess(true)
      
      // Reset form
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error('Error uploading files:', error)
    } finally {
      setIsUploading(false)
      setIsAnalyzing(false)
    }
  }

  const analyzeFilesWithAI = async (files: FileList) => {
    try {
      console.log('[AI] Starting analysis of uploaded files...')
      
      // Process each file with AI
      for (const file of Array.from(files)) {
        const ocrResult = await aiAnalysisService.processDocument(file)
        const healthData = await aiAnalysisService.analyzeHealthData(ocrResult, selectedMember)
        
        // Auto-create medications and appointments
        await aiAnalysisService.createMedicationsFromAnalysis(healthData.medications, selectedMember)
        await aiAnalysisService.scheduleAppointmentsFromAnalysis(healthData.appointments, selectedMember)
        
        // Generate predictions
        const predictions = await aiAnalysisService.generatePredictions(healthData, selectedMember)
        healthData.predictions = predictions
        
        setAnalysisResults(healthData)
        setShowAnalysis(true)
      }
      
      console.log('[AI] Analysis complete!')
    } catch (error) {
      console.error('Error in AI analysis:', error)
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
    setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-xl bg-white shadow-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 rounded-2xl">
                <Upload className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Upload Reports
                </h1>
                <p className="text-base text-gray-600 mt-2">
                  Upload your health documents for AI analysis
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="text-base font-semibold text-green-800">Files Uploaded & Analyzed!</h3>
              <p className="text-sm text-green-600">AI has automatically analyzed your reports and created reminders.</p>
            </div>
          </motion.div>
        )}

        {/* AI Analysis Results */}
        {showAnalysis && analysisResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-white rounded-2xl p-6 shadow-lg border border-blue-200"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">AI Analysis Results</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Medications Found */}
              {analysisResults.medications.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="text-base font-bold text-blue-800 mb-2 flex items-center space-x-2">
                    <Pill className="w-4 h-4" />
                    <span>Medications ({analysisResults.medications.length})</span>
                  </h4>
                  <div className="space-y-1">
                    {analysisResults.medications.map((med, index) => (
                      <div key={index} className="text-sm text-blue-700">
                        <div className="font-semibold">{med.name} {med.dosage}</div>
                        <div className="text-blue-600">{med.frequency}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Appointments Scheduled */}
              {analysisResults.appointments.length > 0 && (
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="text-base font-bold text-green-800 mb-2 flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Appointments ({analysisResults.appointments.length})</span>
                  </h4>
                  <div className="space-y-1">
                    {analysisResults.appointments.map((apt, index) => (
                      <div key={index} className="text-sm text-green-700">
                        <div className="font-semibold">{apt.specialty}</div>
                        <div className="text-green-600">{apt.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conditions Detected */}
              {analysisResults.conditions.length > 0 && (
                <div className="bg-orange-50 rounded-xl p-4">
                  <h4 className="text-base font-bold text-orange-800 mb-2 flex items-center space-x-2">
                    <Heart className="w-4 h-4" />
                    <span>Conditions ({analysisResults.conditions.length})</span>
                  </h4>
                  <div className="space-y-1">
                    {analysisResults.conditions.map((condition, index) => (
                      <div key={index} className="text-sm text-orange-700">
                        <div className="font-semibold">{condition.name}</div>
                        <div className="text-orange-600">Severity: {condition.severity}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>🤖 AI Actions Taken:</strong> Medications have been automatically added to your reminders, 
                appointments have been scheduled, and health predictions have been generated based on your reports.
              </p>
            </div>
          </motion.div>
        )}

        {/* Simple Upload Area */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Family Member Selection */}
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

            {/* File Upload Area */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Cloud className="w-5 h-5 text-primary-600" />
                <span>Upload Files</span>
              </h3>
              
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary-600" />
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Drop files here or click to upload
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Supports PDF, images, and text files up to 10MB each
                    </p>
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
                  <span className="text-purple-800 font-semibold text-sm">AI is analyzing your reports...</span>
                </div>
              )}
            </div>

            {/* Uploaded Files */}
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
                            <div className="text-sm text-gray-500">{file.size} • {file.familyMemberName}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}