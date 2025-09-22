'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Globe
} from 'lucide-react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    reminders: true,
    healthAlerts: true,
    weeklyReports: false
  })
  const [privacy, setPrivacy] = useState({
    dataSharing: false,
    analytics: true,
    emergencyAccess: true,
    familySharing: true
  })
  const [theme, setTheme] = useState('light')

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'data', name: 'Data', icon: Database },
  ]

  const handleSaveSettings = () => {
    // Save settings logic here
    console.log('Settings saved')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-8">
      <Navigation />
      
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
              <SettingsIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Settings
            </h1>
            <p className="text-lg text-gray-600">
              Manage your account preferences and privacy settings
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
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
                </nav>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-xl p-6 shadow-lg">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          defaultValue="Divya"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          defaultValue="divya@example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          defaultValue="+1 (555) 123-4567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          defaultValue="1990-01-01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
                    
                    <div className="space-y-4">
                      {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {key === 'push' && <Smartphone className="w-5 h-5 text-gray-600" />}
                            {key === 'email' && <Mail className="w-5 h-5 text-gray-600" />}
                            {key === 'sms' && <Smartphone className="w-5 h-5 text-gray-600" />}
                            {key === 'reminders' && <Bell className="w-5 h-5 text-gray-600" />}
                            {key === 'healthAlerts' && <Shield className="w-5 h-5 text-gray-600" />}
                            {key === 'weeklyReports' && <Globe className="w-5 h-5 text-gray-600" />}
                            <span className="font-medium text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </div>
                          <button
                            onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? 'bg-primary-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
                    
                    <div className="space-y-4">
                      {Object.entries(privacy).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Shield className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </div>
                          <button
                            onClick={() => setPrivacy(prev => ({ ...prev, [key]: !value }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? 'bg-primary-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                        <div className="flex space-x-4">
                          {['light', 'dark', 'auto'].map((themeOption) => (
                            <button
                              key={themeOption}
                              onClick={() => setTheme(themeOption)}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                theme === themeOption
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-white text-gray-700 border border-gray-300'
                              }`}
                            >
                              {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data Tab */}
                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Data Management</h2>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Export Data</h3>
                        <p className="text-sm text-gray-600 mb-3">Download all your health data</p>
                        <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export Data
                        </button>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Import Data</h3>
                        <p className="text-sm text-gray-600 mb-3">Import health data from other sources</p>
                        <button className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Import Data
                        </button>
                      </div>
                      
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <h3 className="font-medium text-red-900 mb-2">Delete Account</h3>
                        <p className="text-sm text-red-600 mb-3">Permanently delete your account and all data</p>
                        <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSaveSettings}
                    className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save Settings
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}

