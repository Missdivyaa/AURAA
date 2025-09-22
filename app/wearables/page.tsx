'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { 
  Watch, 
  Heart, 
  Activity, 
  Battery, 
  Wifi, 
  Bluetooth,
  TrendingUp,
  Calendar,
  Clock,
  Zap,
  Smartphone,
  Tablet,
  Headphones,
  Plus,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface WearableDevice {
  id: string
  name: string
  type: 'smartwatch' | 'fitness-tracker' | 'heart-monitor' | 'blood-pressure' | 'glucose-monitor'
  brand: string
  model: string
  batteryLevel: number
  isConnected: boolean
  lastSync: string
  status: 'active' | 'inactive' | 'error'
  metrics: {
    heartRate?: number
    steps?: number
    calories?: number
    sleep?: number
    bloodPressure?: { systolic: number; diastolic: number }
    glucose?: number
  }
}

interface HealthMetric {
  id: string
  deviceId: string
  deviceName: string
  metric: string
  value: number
  unit: string
  timestamp: string
  trend: 'up' | 'down' | 'stable'
}

export default function Wearables() {
  const [devices, setDevices] = useState<WearableDevice[]>([])
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('devices')

  useEffect(() => {
    loadWearableData()
  }, [])

  const loadWearableData = async () => {
    try {
      setLoading(true)
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock wearable devices data
      const mockDevices: WearableDevice[] = [
        {
          id: '1',
          name: 'Apple Watch Series 9',
          type: 'smartwatch',
          brand: 'Apple',
          model: 'Series 9',
          batteryLevel: 85,
          isConnected: true,
          lastSync: '2024-01-15T10:30:00Z',
          status: 'active',
          metrics: {
            heartRate: 72,
            steps: 8542,
            calories: 420,
            sleep: 7.5
          }
        },
        {
          id: '2',
          name: 'Fitbit Charge 5',
          type: 'fitness-tracker',
          brand: 'Fitbit',
          model: 'Charge 5',
          batteryLevel: 92,
          isConnected: true,
          lastSync: '2024-01-15T10:25:00Z',
          status: 'active',
          metrics: {
            heartRate: 68,
            steps: 12350,
            calories: 580,
            sleep: 8.2
          }
        },
        {
          id: '3',
          name: 'Omron Blood Pressure Monitor',
          type: 'blood-pressure',
          brand: 'Omron',
          model: 'HEM-7156',
          batteryLevel: 100,
          isConnected: false,
          lastSync: '2024-01-14T18:45:00Z',
          status: 'inactive',
          metrics: {
            bloodPressure: { systolic: 125, diastolic: 82 }
          }
        },
        {
          id: '4',
          name: 'FreeStyle Libre 3',
          type: 'glucose-monitor',
          brand: 'Abbott',
          model: 'FreeStyle Libre 3',
          batteryLevel: 78,
          isConnected: true,
          lastSync: '2024-01-15T09:15:00Z',
          status: 'active',
          metrics: {
            glucose: 95
          }
        }
      ]

      const mockMetrics: HealthMetric[] = [
        {
          id: '1',
          deviceId: '1',
          deviceName: 'Apple Watch Series 9',
          metric: 'Heart Rate',
          value: 72,
          unit: 'bpm',
          timestamp: '2024-01-15T10:30:00Z',
          trend: 'stable'
        },
        {
          id: '2',
          deviceId: '1',
          deviceName: 'Apple Watch Series 9',
          metric: 'Steps',
          value: 8542,
          unit: 'steps',
          timestamp: '2024-01-15T10:30:00Z',
          trend: 'up'
        },
        {
          id: '3',
          deviceId: '2',
          deviceName: 'Fitbit Charge 5',
          metric: 'Sleep',
          value: 8.2,
          unit: 'hours',
          timestamp: '2024-01-15T08:00:00Z',
          trend: 'up'
        },
        {
          id: '4',
          deviceId: '3',
          deviceName: 'Omron Blood Pressure Monitor',
          metric: 'Blood Pressure',
          value: 125,
          unit: 'mmHg',
          timestamp: '2024-01-14T18:45:00Z',
          trend: 'down'
        },
        {
          id: '5',
          deviceId: '4',
          deviceName: 'FreeStyle Libre 3',
          metric: 'Glucose',
          value: 95,
          unit: 'mg/dL',
          timestamp: '2024-01-15T09:15:00Z',
          trend: 'stable'
        }
      ]

      setDevices(mockDevices)
      setMetrics(mockMetrics)
      
    } catch (error) {
      console.error('Error loading wearable data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartwatch': return Watch
      case 'fitness-tracker': return Activity
      case 'heart-monitor': return Heart
      case 'blood-pressure': return Activity
      case 'glucose-monitor': return Activity
      default: return Watch
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200'
      case 'inactive': return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp
      case 'down': return TrendingUp
      case 'stable': return Activity
      default: return Activity
    }
  }

  const tabs = [
    { id: 'devices', name: 'My Devices', icon: Watch },
    { id: 'metrics', name: 'Health Metrics', icon: Activity },
    { id: 'sync', name: 'Sync Status', icon: RefreshCw },
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
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Wearable Devices
                </h1>
                <p className="text-lg text-gray-600">
                  Connect and manage your health tracking devices
                </p>
              </div>
              
              <div className="mt-6 lg:mt-0 flex space-x-3">
                <button 
                  onClick={loadWearableData}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors shadow-lg disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Sync All
                </button>
                <button className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Device
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
                <RefreshCw className="w-6 h-6 animate-spin text-primary-600" />
                <p className="text-gray-600">Syncing with wearable devices...</p>
              </div>
            </motion.div>
          )}

          {/* Devices Tab */}
          {!loading && activeTab === 'devices' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map((device, index) => {
                  const DeviceIcon = getDeviceIcon(device.type)
                  
                  return (
                    <motion.div
                      key={device.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={`bg-white rounded-2xl p-6 shadow-lg border-l-4 ${getStatusColor(device.status)}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                            <DeviceIcon className="w-6 h-6 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{device.name}</h3>
                            <p className="text-sm text-gray-500">{device.brand} {device.model}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {device.isConnected ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-gray-400" />
                          )}
                          <button className="p-2 text-gray-400 hover:text-gray-600">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Battery</span>
                          <div className="flex items-center space-x-2">
                            <Battery className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">{device.batteryLevel}%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Last Sync</span>
                          <span className="text-sm text-gray-900">
                            {new Date(device.lastSync).toLocaleDateString()}
                          </span>
                        </div>

                        {device.metrics.heartRate && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Heart Rate</span>
                            <span className="text-sm font-medium text-red-600">
                              {device.metrics.heartRate} bpm
                            </span>
                          </div>
                        )}

                        {device.metrics.steps && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Steps Today</span>
                            <span className="text-sm font-medium text-blue-600">
                              {device.metrics.steps.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {device.metrics.bloodPressure && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Blood Pressure</span>
                            <span className="text-sm font-medium text-purple-600">
                              {device.metrics.bloodPressure.systolic}/{device.metrics.bloodPressure.diastolic}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <button 
                          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                            device.isConnected 
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                              : 'bg-primary-600 text-white hover:bg-primary-700'
                          }`}
                        >
                          {device.isConnected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Metrics Tab */}
          {!loading && activeTab === 'metrics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="grid gap-6">
                {metrics.map((metric, index) => {
                  const TrendIcon = getTrendIcon(metric.trend)
                  
                  return (
                    <motion.div
                      key={metric.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="bg-white rounded-2xl p-6 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <TrendIcon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{metric.metric}</h3>
                            <p className="text-sm text-gray-500">{metric.deviceName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {metric.value} {metric.unit}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(metric.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Sync Status Tab */}
          {!loading && activeTab === 'sync' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Sync Status</h3>
                
                <div className="space-y-4">
                  {devices.map((device, index) => (
                    <div key={device.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          {(() => {
                            const Icon = getDeviceIcon(device.type)
                            return <Icon className="w-5 h-5 text-primary-600" />
                          })()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{device.name}</p>
                          <p className="text-sm text-gray-500">Last sync: {new Date(device.lastSync).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {device.isConnected ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-green-600">Connected</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <span className="text-sm text-red-600">Disconnected</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
