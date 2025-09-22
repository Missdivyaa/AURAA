'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  User,
  FileImage,
  File,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Heart,
  Activity,
  Thermometer,
  Scale,
  Droplets,
  Brain
} from 'lucide-react'

interface HealthRecord {
  id: string
  title: string
  type: 'lab' | 'imaging' | 'prescription' | 'visit' | 'vaccination' | 'other'
  date: string
  provider: string
  familyMemberId: string
  familyMemberName: string
  description: string
  fileUrl?: string
  fileName?: string
  fileSize?: string
  fileType?: string
  status: 'active' | 'archived' | 'pending'
  tags: string[]
  results?: {
    name: string
    value: string
    unit: string
    normalRange: string
    status: 'normal' | 'high' | 'low' | 'critical'
  }[]
}

interface RecordCategory {
  id: string
  name: string
  icon: any
  count: number
  color: string
}

export default function Records() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    try {
      setLoading(true)
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock health records data
      const mockRecords: HealthRecord[] = [
        {
          id: '1',
          title: 'Blood Work - Complete Metabolic Panel',
          type: 'lab',
          date: '2024-01-15',
          provider: 'City Medical Lab',
          familyMemberId: 'divya-001',
          familyMemberName: 'Divya',
          description: 'Routine blood work including glucose, cholesterol, and kidney function',
          fileName: 'bloodwork_jan2024.pdf',
          fileSize: '2.3 MB',
          fileType: 'pdf',
          status: 'active',
          tags: ['routine', 'blood work', 'metabolic'],
          results: [
            { name: 'Glucose', value: '95', unit: 'mg/dL', normalRange: '70-100', status: 'normal' },
            { name: 'Total Cholesterol', value: '185', unit: 'mg/dL', normalRange: '<200', status: 'normal' },
            { name: 'HDL Cholesterol', value: '45', unit: 'mg/dL', normalRange: '>40', status: 'normal' },
            { name: 'LDL Cholesterol', value: '120', unit: 'mg/dL', normalRange: '<100', status: 'high' }
          ]
        },
        {
          id: '2',
          title: 'Chest X-Ray',
          type: 'imaging',
          date: '2024-01-10',
          provider: 'Radiology Associates',
          familyMemberId: 'divya-001',
          familyMemberName: 'Divya',
          description: 'Chest X-ray to rule out pneumonia',
          fileName: 'chest_xray_jan2024.jpg',
          fileSize: '5.7 MB',
          fileType: 'image',
          status: 'active',
          tags: ['chest', 'x-ray', 'respiratory']
        },
        {
          id: '3',
          title: 'Annual Physical Examination',
          type: 'visit',
          date: '2024-01-08',
          provider: 'Dr. Sarah Johnson',
          familyMemberId: 'divya-001',
          familyMemberName: 'Divya',
          description: 'Annual comprehensive physical examination',
          fileName: 'physical_exam_jan2024.pdf',
          fileSize: '1.8 MB',
          fileType: 'pdf',
          status: 'active',
          tags: ['annual', 'physical', 'preventive']
        },
        {
          id: '4',
          title: 'Flu Vaccination',
          type: 'vaccination',
          date: '2023-12-15',
          provider: 'City Pharmacy',
          familyMemberId: 'tushar-002',
          familyMemberName: 'Tushar',
          description: 'Annual flu vaccination',
          status: 'active',
          tags: ['vaccination', 'flu', 'preventive']
        },
        {
          id: '5',
          title: 'Prescription - Lisinopril',
          type: 'prescription',
          date: '2024-01-01',
          provider: 'Dr. Sarah Johnson',
          familyMemberId: 'divya-001',
          familyMemberName: 'Divya',
          description: 'Prescription for blood pressure medication',
          fileName: 'lisinopril_prescription.pdf',
          fileSize: '0.5 MB',
          fileType: 'pdf',
          status: 'active',
          tags: ['prescription', 'blood pressure', 'medication']
        }
      ]

      setRecords(mockRecords)
      
    } catch (error) {
      console.error('Error loading records:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lab': return Droplets
      case 'imaging': return FileImage
      case 'prescription': return FileText
      case 'visit': return User
      case 'vaccination': return Heart
      case 'other': return File
      default: return File
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lab': return 'text-red-600 bg-red-50 border-red-200'
      case 'imaging': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'prescription': return 'text-green-600 bg-green-50 border-green-200'
      case 'visit': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'vaccination': return 'text-pink-600 bg-pink-50 border-pink-200'
      case 'other': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600'
      case 'high': return 'text-red-600'
      case 'low': return 'text-yellow-600'
      case 'critical': return 'text-red-800'
      default: return 'text-gray-600'
    }
  }

  const categories: RecordCategory[] = [
    { id: 'all', name: 'All Records', icon: FileText, count: records.length, color: 'bg-gray-500' },
    { id: 'lab', name: 'Lab Results', icon: Droplets, count: records.filter(r => r.type === 'lab').length, color: 'bg-red-500' },
    { id: 'imaging', name: 'Imaging', icon: FileImage, count: records.filter(r => r.type === 'imaging').length, color: 'bg-blue-500' },
    { id: 'visit', name: 'Visits', icon: User, count: records.filter(r => r.type === 'visit').length, color: 'bg-purple-500' },
    { id: 'prescription', name: 'Prescriptions', icon: FileText, count: records.filter(r => r.type === 'prescription').length, color: 'bg-green-500' },
    { id: 'vaccination', name: 'Vaccinations', icon: Heart, count: records.filter(r => r.type === 'vaccination').length, color: 'bg-pink-500' }
  ]

  const filteredRecords = records.filter(record => {
    const matchesTab = activeTab === 'all' || record.type === activeTab
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.familyMemberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.provider.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesTab && matchesSearch
  })

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
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">
                  Health Records
                </h1>
                <p className="text-xl lg:text-2xl text-gray-600">
                  Manage and access your family's health records
                </p>
              </div>
              
              <div className="mt-6 lg:mt-0 flex space-x-3">
                <button className="inline-flex items-center px-4 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors shadow-lg">
                  <Filter className="w-5 h-5 mr-2" />
                  Filter
                </button>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Record
                </button>
              </div>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => {
                const Icon = category.icon
                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    onClick={() => setActiveTab(category.id)}
                    className={`p-6 rounded-2xl text-center transition-all ${
                      activeTab === category.id
                        ? 'bg-primary-100 border-2 border-primary-300'
                        : 'bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.count} records</p>
                  </motion.button>
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
                <FileText className="w-6 h-6 animate-pulse text-primary-600" />
                <p className="text-xl text-gray-600">Loading health records...</p>
              </div>
            </motion.div>
          )}

          {/* Records List */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {filteredRecords.length > 0 ? (
                <div className="grid gap-6">
                  {filteredRecords.map((record, index) => {
                    const TypeIcon = getTypeIcon(record.type)
                    
                    return (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className={`bg-white rounded-3xl p-8 shadow-xl border-l-4 ${getTypeColor(record.type)}`}
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                              <TypeIcon className="w-8 h-8 text-primary-600" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">{record.title}</h3>
                              <p className="text-lg text-gray-600 mb-1">{record.provider}</p>
                              <p className="text-lg text-gray-500">{record.familyMemberName}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {record.fileUrl && (
                              <button className="p-3 text-gray-400 hover:text-blue-600 transition-colors">
                                <Eye className="w-5 h-5" />
                              </button>
                            )}
                            <button className="p-3 text-gray-400 hover:text-green-600 transition-colors">
                              <Download className="w-5 h-5" />
                            </button>
                            <button className="p-3 text-gray-400 hover:text-blue-600 transition-colors">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button className="p-3 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                              <p className="text-lg text-gray-600">{record.description}</p>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">Date</h4>
                              <p className="text-lg text-gray-600">{new Date(record.date).toLocaleDateString()}</p>
                            </div>
                            {record.fileName && (
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">File</h4>
                                <div className="flex items-center space-x-2">
                                  <File className="w-5 h-5 text-red-500" />
                                  <span className="text-lg text-gray-600">{record.fileName}</span>
                                  <span className="text-sm text-gray-500">({record.fileSize})</span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">Tags</h4>
                              <div className="flex flex-wrap gap-2">
                                {record.tags.map((tag, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {record.results && (
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Key Results</h4>
                                <div className="space-y-2">
                                  {record.results.slice(0, 3).map((result, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                      <span className="text-lg text-gray-600">{result.name}</span>
                                      <span className={`text-lg font-medium ${getStatusColor(result.status)}`}>
                                        {result.value} {result.unit}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          {record.fileUrl && (
                            <button className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-lg font-medium">
                              View Record
                            </button>
                          )}
                          <button className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors text-lg font-medium">
                            Download
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">No records found</h3>
                  <p className="text-xl text-gray-600 mb-4">Upload health records to get started</p>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-lg font-medium"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Record
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
