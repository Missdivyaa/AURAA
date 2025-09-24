'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { aiAnalysisService, HealthData } from '@/lib/ai-analysis-service'
import { getAllMyFamilyMembers } from '@/lib/my-family-data'
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
  Brain
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

export default function UploadReports() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [selectedMember, setSelectedMember] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const res = await fetch('/api/family-members', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          const apiMembers: FamilyMember[] = Array.isArray(data)
            ? data.map((m: any) => ({ id: m.id, name: m.name || '', relationship: m.relationship || 'Family Member' }))
            : []
          // Merge with local demo data ensuring uniqueness by id
          const local = getAllMyFamilyMembers().map(m => ({ id: m.id, name: m.name, relationship: m.relationship }))
          const mergedMap = new Map<string, FamilyMember>()
          ;[...apiMembers, ...local].forEach(m => {
            if (m && m.id) mergedMap.set(m.id, { id: m.id, name: m.name || '(Unnamed)', relationship: m.relationship || 'Family Member' })
          })
          const merged = Array.from(mergedMap.values())
          if (merged.length) {
            setFamilyMembers(merged)
            setSelectedMember(merged[0].id)
            return
          }
        }
      } catch (_) {
        // fall back to local
      }
      const local = getAllMyFamilyMembers().map(m => ({ id: m.id, name: m.name, relationship: m.relationship }))
      setFamilyMembers(local)
      if (local[0]) setSelectedMember(local[0].id)
    }
    loadMembers()
  }, [])

  const handleFiles = async (files: FileList) => {
    if (!selectedMember) {
      alert('Please select a family member first')
      return
    }

    setIsUploading(true)
    try {
      const MEDICAL_THRESHOLD = 0.6 // acceptance threshold (60%)
      const accepted: UploadedFile[] = []
      const rejected: UploadedFile[] = []
      for (const [index, file] of Array.from(files).entries()) {
        const nameLower = file.name.toLowerCase()
        // Hard guard: obvious non-medical academic results should be rejected explicitly
        if ((/\bsem(ester)?\b/.test(nameLower) || nameLower.includes('marksheet')) && nameLower.includes('result')) {
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
            rejectionReason: 'Detected as an academic semester result, not a medical report.',
            url: ''
          })
          continue
        }
        if (!aiAnalysisService.isAllowedExtension(file)) {
          alert(`❌ ${file.name}: Unsupported file type`)
          continue
        }
        const ocr = await aiAnalysisService.processDocument(file)
        const { score, matched } = aiAnalysisService.scoreMedicalText(ocr.text)
        const finalAccuracy = score
        if (finalAccuracy < MEDICAL_THRESHOLD) {
          const reason = matched.length === 0
            ? 'No medical terms detected in the document.'
            : `Detected medical terms are insufficient for a valid report.`
          // Keep rejected files in the list with an unsuccessful status (mock UX)
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
            medicalScore: finalAccuracy,
            matchedTerms: matched,
            uploaded: false,
            rejectionReason: reason,
            url: ''
          })
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
          medicalScore: finalAccuracy,
          matchedTerms: matched,
          uploaded: true,
          url: URL.createObjectURL(file)
        })
      }

      if (accepted.length === 0 && rejected.length === 0) return
      setUploadedFiles(prev => [...prev, ...rejected, ...accepted])

      setIsAnalyzing(true)
      // simulate downstream analysis quickly
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (e) {
      console.error('Error uploading files', e)
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
                  <p className="text-sm text-gray-600 mb-4">Supports PDF, images, and text files up to 10MB each</p>
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
                <span className="text-purple-800 font-semibold text-sm">Validating reports...</span>
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
                          <div className="text-sm text-gray-500">{file.size} • {file.familyMemberName} • Accuracy {Math.round(file.medicalScore * 100)}%</div>
                          {file.matchedTerms && file.matchedTerms.length > 0 && file.uploaded && (
                            <div className="text-xs text-gray-500 mt-1">Matched terms: {file.matchedTerms.slice(0,6).join(', ')}{file.matchedTerms.length > 6 ? '…' : ''}</div>
                          )}
                          {file.uploaded && file.medicalScore >= 0.6 ? (
                            <div className="inline-flex items-center mt-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded px-2 py-0.5">
                              <CheckCircle className="w-3 h-3 mr-1" /> Uploaded successfully
                            </div>
                          ) : (
                            <div className="inline-flex items-center mt-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded px-2 py-0.5">
                              <span>Upload unsuccessful{file.rejectionReason ? ` — ${file.rejectionReason}` : ''}</span>
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
    </div>
  )
}


