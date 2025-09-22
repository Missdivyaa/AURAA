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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Heart,
  Activity,
  Thermometer,
  Scale,
  Droplets,
  Brain,
  Filter,
  Search,
  Plus,
  Share,
  Printer,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  Zap
} from 'lucide-react'

interface HealthReport {
  id: string
  title: string
  type: 'summary' | 'trend' | 'comparison' | 'prediction' | 'custom'
  dateRange: {
    start: string
    end: string
  }
  familyMemberId: string
  familyMemberName: string
  generatedAt: string
  status: 'ready' | 'generating' | 'error'
  insights: {
    title: string
    description: string
    type: 'positive' | 'negative' | 'neutral'
    icon: any
  }[]
  metrics: {
    name: string
    value: string
    unit: string
    trend: 'up' | 'down' | 'stable'
    change: string
    status: 'good' | 'warning' | 'critical'
  }[]
  recommendations: string[]
  fileUrl?: string
  fileName?: string
  fileSize?: string
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: any
  category: string
  metrics: string[]
}

export default function Reports() {
  const [reports, setReports] = useState<HealthReport[]>([])
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('reports')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock health reports data
      const mockReports: HealthReport[] = [
        {
          id: '1',
          title: 'Monthly Health Summary - January 2024',
          type: 'summary',
          dateRange: {
            start: '2024-01-01',
            end: '2024-01-31'
          },
          familyMemberId: 'divya-001',
          familyMemberName: 'Divya',
          generatedAt: '2024-01-31T23:59:00Z',
          status: 'ready',
          insights: [
            {
              title: 'Blood Pressure Improvement',
              description: 'Average blood pressure decreased by 8% this month',
              type: 'positive',
              icon: TrendingDown
            },
            {
              title: 'Medication Adherence',
              description: '95% adherence rate for prescribed medications',
              type: 'positive',
              icon: CheckCircle
            },
            {
              title: 'Exercise Consistency',
              description: 'Exercise frequency decreased by 15%',
              type: 'negative',
              icon: TrendingDown
            }
          ],
          metrics: [
            { name: 'Blood Pressure', value: '125/82', unit: 'mmHg', trend: 'down', change: '-8%', status: 'good' },
            { name: 'Weight', value: '65.2', unit: 'kg', trend: 'stable', change: '0%', status: 'good' },
            { name: 'Steps', value: '7,850', unit: 'steps/day', trend: 'down', change: '-12%', status: 'warning' },
            { name: 'Sleep', value: '7.2', unit: 'hours/night', trend: 'up', change: '+5%', status: 'good' }
          ],
          recommendations: [
            'Continue current medication regimen',
            'Increase daily step count to 10,000',
            'Maintain regular sleep schedule',
            'Schedule follow-up appointment'
          ],
          fileName: 'health_summary_jan2024.pdf',
          fileSize: '2.1 MB'
        },
        {
          id: '2',
          title: 'Blood Pressure Trend Analysis',
          type: 'trend',
          dateRange: {
            start: '2023-12-01',
            end: '2024-01-31'
          },
          familyMemberId: 'divya-001',
          familyMemberName: 'Divya',
          generatedAt: '2024-01-31T20:30:00Z',
          status: 'ready',
          insights: [
            {
              title: 'Consistent Improvement',
              description: 'Blood pressure trending downward over 2 months',
              type: 'positive',
              icon: TrendingDown
            },
            {
              title: 'Medication Effectiveness',
              description: 'Lisinopril showing positive results',
              type: 'positive',
              icon: Heart
            }
          ],
          metrics: [
            { name: 'Systolic BP', value: '125', unit: 'mmHg', trend: 'down', change: '-12%', status: 'good' },
            { name: 'Diastolic BP', value: '82', unit: 'mmHg', trend: 'down', change: '-8%', status: 'good' },
            { name: 'Heart Rate', value: '72', unit: 'bpm', trend: 'stable', change: '0%', status: 'good' }
          ],
          recommendations: [
            'Continue current medication dosage',
            'Monitor blood pressure daily',
            'Maintain low-sodium diet'
          ],
          fileName: 'bp_trend_analysis.pdf',
          fileSize: '1.8 MB'
        },
        {
          id: '3',
          title: 'Family Health Comparison',
          type: 'comparison',
          dateRange: {
            start: '2024-01-01',
            end: '2024-01-31'
          },
          familyMemberId: 'all',
          familyMemberName: 'All Family Members',
          generatedAt: '2024-01-31T18:15:00Z',
          status: 'ready',
          insights: [
            {
              title: 'Overall Family Health',
              description: 'Family health scores above average',
              type: 'positive',
              icon: TrendingUp
            },
            {
              title: 'Preventive Care',
              description: 'Good adherence to preventive measures',
              type: 'positive',
              icon: CheckCircle
            }
          ],
          metrics: [
            { name: 'Average Health Score', value: '88', unit: '%', trend: 'up', change: '+3%', status: 'good' },
            { name: 'Medication Adherence', value: '92', unit: '%', trend: 'up', change: '+2%', status: 'good' },
            { name: 'Exercise Frequency', value: '4.2', unit: 'days/week', trend: 'stable', change: '0%', status: 'good' }
          ],
          recommendations: [
            'Maintain current health practices',
            'Schedule family health checkups',
            'Continue preventive care routine'
          ],
          fileName: 'family_comparison_jan2024.pdf',
          fileSize: '3.2 MB'
        }
      ]

      const mockTemplates: ReportTemplate[] = [
        {
          id: '1',
          name: 'Health Summary',
          description: 'Comprehensive monthly health overview',
          icon: FileText,
          category: 'Summary',
          metrics: ['Blood Pressure', 'Weight', 'Steps', 'Sleep', 'Medications']
        },
        {
          id: '2',
          name: 'Trend Analysis',
          description: 'Analyze health trends over time',
          icon: TrendingUp,
          category: 'Analytics',
          metrics: ['Blood Pressure', 'Heart Rate', 'Weight', 'Activity']
        },
        {
          id: '3',
          name: 'Medication Report',
          description: 'Medication adherence and effectiveness',
          icon: Activity,
          category: 'Medications',
          metrics: ['Adherence Rate', 'Side Effects', 'Effectiveness']
        },
        {
          id: '4',
          name: 'Exercise Summary',
          description: 'Physical activity and fitness metrics',
          icon: Activity,
          category: 'Fitness',
          metrics: ['Steps', 'Calories', 'Exercise Duration', 'Heart Rate']
        },
        {
          id: '5',
          name: 'Sleep Analysis',
          description: 'Sleep patterns and quality metrics',
          icon: Clock,
          category: 'Sleep',
          metrics: ['Sleep Duration', 'Sleep Quality', 'Sleep Stages']
        },
        {
          id: '6',
          name: 'Custom Report',
          description: 'Create a personalized health report',
          icon: Target,
          category: 'Custom',
          metrics: ['Select Metrics']
        }
      ]

      setReports(mockReports)
      setTemplates(mockTemplates)
      
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'summary': return FileText
      case 'trend': return TrendingUp
      case 'comparison': return BarChart3
      case 'prediction': return Brain
      case 'custom': return Target
      default: return FileText
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'summary': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'trend': return 'text-green-600 bg-green-50 border-green-200'
      case 'comparison': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'prediction': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'custom': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-100'
      case 'generating': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp
      case 'down': return TrendingDown
      case 'stable': return Activity
      default: return Activity
    }
  }

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesType = filterType === 'all' || report.type === filterType
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.familyMemberName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const tabs = [
    { id: 'reports', name: 'Generated Reports', icon: FileText, count: reports.length },
    { id: 'templates', name: 'Report Templates', icon: Target, count: templates.length },
    { id: 'insights', name: 'AI Insights', icon: Brain },
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
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                  Health Reports
                </h1>
                <p className="text-base text-gray-600">
                  Generate and analyze comprehensive health reports
                </p>
              </div>
              
              <div className="mt-6 lg:mt-0 flex space-x-3">
                <button className="inline-flex items-center px-4 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors shadow-lg">
                  <Filter className="w-5 h-5 mr-2" />
                  Filter
                </button>
                <button 
                  onClick={() => setShowGenerateModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Generate Report
                </button>
              </div>
            </div>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Types</option>
                    <option value="summary">Summary</option>
                    <option value="trend">Trend</option>
                    <option value="comparison">Comparison</option>
                    <option value="prediction">Prediction</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                    {tab.count !== undefined && (
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
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
                <p className="text-xl text-gray-600">Loading health reports...</p>
              </div>
            </motion.div>
          )}

          {/* Generated Reports Tab */}
          {!loading && activeTab === 'reports' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {filteredReports.length > 0 ? (
                <div className="grid gap-6">
                  {filteredReports.map((report, index) => {
                    const TypeIcon = getTypeIcon(report.type)
                    
                    return (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className={`bg-white rounded-3xl p-8 shadow-xl border-l-4 ${getTypeColor(report.type)}`}
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                              <TypeIcon className="w-8 h-8 text-primary-600" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">{report.title}</h3>
                              <p className="text-lg text-gray-600 mb-1">{report.familyMemberName}</p>
                              <p className="text-lg text-gray-500">
                                {new Date(report.dateRange.start).toLocaleDateString()} - {new Date(report.dateRange.end).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                            <button className="p-3 text-gray-400 hover:text-blue-600 transition-colors">
                              <Eye className="w-5 h-5" />
                            </button>
                            <button className="p-3 text-gray-400 hover:text-green-600 transition-colors">
                              <Download className="w-5 h-5" />
                            </button>
                            <button className="p-3 text-gray-400 hover:text-blue-600 transition-colors">
                              <Share className="w-5 h-5" />
                            </button>
                            <button className="p-3 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Key Insights */}
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h4>
                          <div className="grid md:grid-cols-3 gap-4">
                            {report.insights.map((insight, idx) => {
                              const InsightIcon = insight.icon
                              return (
                                <div key={idx} className={`p-4 rounded-xl ${
                                  insight.type === 'positive' ? 'bg-green-50 border border-green-200' :
                                  insight.type === 'negative' ? 'bg-red-50 border border-red-200' :
                                  'bg-gray-50 border border-gray-200'
                                }`}>
                                  <div className="flex items-center space-x-2 mb-2">
                                    <InsightIcon className={`w-5 h-5 ${
                                      insight.type === 'positive' ? 'text-green-600' :
                                      insight.type === 'negative' ? 'text-red-600' :
                                      'text-gray-600'
                                    }`} />
                                    <h5 className="font-semibold text-gray-900">{insight.title}</h5>
                                  </div>
                                  <p className="text-sm text-gray-600">{insight.description}</p>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h4>
                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {report.metrics.map((metric, idx) => {
                              const TrendIcon = getTrendIcon(metric.trend)
                              return (
                                <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium text-gray-900">{metric.name}</h5>
                                    <TrendIcon className={`w-4 h-4 ${
                                      metric.trend === 'up' ? 'text-green-600' :
                                      metric.trend === 'down' ? 'text-red-600' :
                                      'text-gray-600'
                                    }`} />
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xl font-bold text-gray-900">{metric.value}</span>
                                    <span className="text-sm text-gray-500">{metric.unit}</span>
                                  </div>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className={`text-sm font-medium ${getMetricStatusColor(metric.status)}`}>
                                      {metric.change}
                                    </span>
                                    <span className="text-xs text-gray-500">vs last period</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h4>
                          <ul className="space-y-2">
                            {report.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-lg text-gray-600">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex space-x-3">
                          <button className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-lg font-medium">
                            View Full Report
                          </button>
                          <button className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors text-lg font-medium">
                            Download PDF
                          </button>
                          <button className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-lg font-medium">
                            Share Report
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">No reports found</h3>
                  <p className="text-xl text-gray-600 mb-4">Generate your first health report</p>
                  <button 
                    onClick={() => setShowGenerateModal(true)}
                    className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-lg font-medium"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Generate Report
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Report Templates Tab */}
          {!loading && activeTab === 'templates' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template, index) => {
                  const Icon = template.icon
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
                    >
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <Icon className="w-8 h-8 text-primary-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                        <p className="text-lg text-gray-600 mb-3">{template.description}</p>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                          {template.category}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Includes:</h4>
                        <ul className="space-y-1">
                          {template.metrics.slice(0, 3).map((metric, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>{metric}</span>
                            </li>
                          ))}
                          {template.metrics.length > 3 && (
                            <li className="text-sm text-gray-500">
                              +{template.metrics.length - 3} more metrics
                            </li>
                          )}
                        </ul>
                      </div>
                      
                      <button className="w-full py-3 px-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-lg font-medium">
                        Generate Report
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* AI Insights Tab */}
          {!loading && activeTab === 'insights' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <div className="text-center mb-8">
                  <Brain className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Health Insights</h3>
                  <p className="text-xl text-gray-600">
                    Get intelligent analysis and predictions based on your health data
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-blue-50 rounded-2xl">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">Health Predictions</h4>
                    <p className="text-lg text-gray-600 mb-4">
                      AI analyzes your health trends to predict potential health outcomes
                    </p>
                    <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                      Generate Predictions
                    </button>
                  </div>

                  <div className="p-6 bg-green-50 rounded-2xl">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">Risk Assessment</h4>
                    <p className="text-lg text-gray-600 mb-4">
                      Identify potential health risks and get personalized recommendations
                    </p>
                    <button className="w-full py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                      Assess Risks
                    </button>
                  </div>

                  <div className="p-6 bg-purple-50 rounded-2xl">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">Treatment Optimization</h4>
                    <p className="text-lg text-gray-600 mb-4">
                      Optimize your treatment plans based on AI analysis of your data
                    </p>
                    <button className="w-full py-3 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                      Optimize Treatment
                    </button>
                  </div>

                  <div className="p-6 bg-orange-50 rounded-2xl">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">Lifestyle Recommendations</h4>
                    <p className="text-lg text-gray-600 mb-4">
                      Get personalized lifestyle recommendations to improve your health
                    </p>
                    <button className="w-full py-3 px-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors">
                      Get Recommendations
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
