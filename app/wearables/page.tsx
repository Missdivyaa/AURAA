'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useUser, useAuth } from '@clerk/nextjs'
import Navigation from '@/components/Navigation'
import { graphqlRequest } from '@/lib/graphql-client'
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

// GraphQL Queries and Mutations
const GET_WEARABLE_DATA = `
  query GetWearableData {
    wearableData {
      id
      deviceType
      data
      syncedAt
      status
      memberId
      member {
        id
        name
      }
      createdAt
    }
  }
`

const SYNC_WEARABLE_DATA = `
  mutation SyncWearableData($input: SyncWearableDataInput!) {
    syncWearableData(input: $input) {
      id
      deviceType
      data
      syncedAt
      status
    }
  }
`

export default function Wearables() {
  const { isSignedIn, user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const [devices, setDevices] = useState<WearableDevice[]>([])
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('devices')

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      loadWearableData()
    }
  }, [isLoaded, isSignedIn, user])

  const loadWearableData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }
      
      // Fetch wearable data from GraphQL API
      const data = await graphqlRequest(GET_WEARABLE_DATA, {}, token)
      console.log('⌚ Loaded wearable data from GraphQL:', data)
      
      // Convert backend data to frontend format
      const formattedDevices: WearableDevice[] = (data.wearableData || []).map((wearable: any) => {
        const deviceData = wearable.data || {}
        const deviceInfo = deviceData.device || {}
        const metricsData = deviceData.metrics || {}
        
        return {
          id: wearable.id,
          name: deviceInfo.name || `${wearable.deviceType} Device`,
          type: deviceInfo.type || 'smartwatch' as const,
          brand: deviceInfo.brand || 'Unknown',
          model: deviceInfo.model || '',
          batteryLevel: deviceInfo.batteryLevel || 0,
          isConnected: wearable.status === 'synced' || wearable.status === 'processed',
          lastSync: wearable.syncedAt,
          status: wearable.status === 'processed' ? 'active' as const :
                  wearable.status === 'error' ? 'error' as const :
                  'inactive' as const,
          metrics: {
            heartRate: metricsData.heartRate,
            steps: metricsData.steps,
            calories: metricsData.calories,
            sleep: metricsData.sleep,
            bloodPressure: metricsData.bloodPressure ? {
              systolic: metricsData.bloodPressure.systolic || 0,
              diastolic: metricsData.bloodPressure.diastolic || 0
            } : undefined,
            glucose: metricsData.glucose
          }
        }
      })
      
      // Extract metrics from wearable data
      const formattedMetrics: HealthMetric[] = formattedDevices.flatMap(device => {
        const deviceMetrics: HealthMetric[] = []
        
        if (device.metrics.heartRate) {
          deviceMetrics.push({
            id: `${device.id}-hr`,
            deviceId: device.id,
            deviceName: device.name,
            metric: 'Heart Rate',
            value: device.metrics.heartRate,
            unit: 'bpm',
            timestamp: device.lastSync,
            trend: 'stable'
          })
        }
        
        if (device.metrics.steps) {
          deviceMetrics.push({
            id: `${device.id}-steps`,
            deviceId: device.id,
            deviceName: device.name,
            metric: 'Steps',
            value: device.metrics.steps,
            unit: 'steps',
            timestamp: device.lastSync,
            trend: 'up'
          })
        }
        
        if (device.metrics.sleep) {
          deviceMetrics.push({
            id: `${device.id}-sleep`,
            deviceId: device.id,
            deviceName: device.name,
            metric: 'Sleep',
            value: device.metrics.sleep,
            unit: 'hours',
            timestamp: device.lastSync,
            trend: 'stable'
          })
        }
        
        if (device.metrics.bloodPressure) {
          deviceMetrics.push({
            id: `${device.id}-bp`,
            deviceId: device.id,
            deviceName: device.name,
            metric: 'Blood Pressure',
            value: device.metrics.bloodPressure.systolic,
            unit: 'mmHg',
            timestamp: device.lastSync,
            trend: 'stable'
          })
        }
        
        if (device.metrics.glucose) {
          deviceMetrics.push({
            id: `${device.id}-glucose`,
            deviceId: device.id,
            deviceName: device.name,
            metric: 'Glucose',
            value: device.metrics.glucose,
            unit: 'mg/dL',
            timestamp: device.lastSync,
            trend: 'stable'
          })
        }
        
        return deviceMetrics
      })
      
      setDevices(formattedDevices)
      setMetrics(formattedMetrics)
      
    } catch (error) {
      console.error('Error loading wearable data:', error)
      setDevices([])
      setMetrics([])
    } finally {
      setLoading(false)
    }
  }

  const handleSyncDevice = async (deviceType: string) => {
    if (!user) return
    
    try {
      setLoading(true)
      
      const token = await getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }
      
      // Mock device data for sync
      const syncData = {
        deviceType,
        data: {
          device: {
            name: `${deviceType} Device`,
            type: 'smartwatch',
            brand: 'Unknown',
            model: '',
            batteryLevel: 85
          },
          metrics: {
            heartRate: Math.floor(Math.random() * 40) + 60,
            steps: Math.floor(Math.random() * 5000) + 5000,
            calories: Math.floor(Math.random() * 200) + 300,
            sleep: parseFloat((Math.random() * 2 + 6).toFixed(1))
          }
        },
        memberId: null,
        syncedAt: new Date().toISOString()
      }
      
      await graphqlRequest(SYNC_WEARABLE_DATA, { input: syncData }, token)
      
      // Reload wearable data
      await loadWearableData()
      
      console.log('✅ Wearable data synced:', deviceType)
    } catch (error) {
      console.error('Error syncing wearable data:', error)
      alert('Failed to sync device. Please try again.')
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
                  Refresh
                </button>
                <button 
                  onClick={() => handleSyncDevice('apple_watch')}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg disabled:opacity-50"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Sync Device
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
              {devices.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 shadow-lg flex flex-col items-center text-center">
                  <Watch className="w-10 h-10 text-primary-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No devices connected yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md">
                    Connect a smartwatch or fitness tracker to automatically sync your steps, heart rate,
                    sleep, and other health metrics into your family health dashboard.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => handleSyncDevice('apple_watch')}
                      disabled={loading}
                      className="inline-flex items-center px-5 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-md disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Sync sample device
                    </button>
                    <button
                      disabled
                      className="inline-flex items-center px-5 py-3 bg-gray-100 text-gray-500 rounded-xl font-medium cursor-not-allowed"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Google Fit / Apple Health (coming soon)
                    </button>
                  </div>
                </div>
              ) : (
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
              )}
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
              {metrics.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                  <Activity className="w-10 h-10 text-primary-600 mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No health data yet</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Once you connect a wearable device and start syncing, you will see your steps,
                    heart rate, sleep, and other metrics summarized here.
                  </p>
                </div>
              ) : (
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
              )}
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
                
                {devices.length === 0 ? (
                  <div className="py-6 text-center">
                    <RefreshCw className="w-8 h-8 text-primary-600 mb-3 mx-auto" />
                    <p className="text-gray-700 font-medium mb-1">No sync activity yet</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Use the Sync Device button above to connect a wearable and start syncing data.
                    </p>
                    <button
                      onClick={() => handleSyncDevice('apple_watch')}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Start first sync
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {devices.map((device) => (
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
                            <p className="text-sm text-gray-500">
                              Last sync: {new Date(device.lastSync).toLocaleString()}
                            </p>
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
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
