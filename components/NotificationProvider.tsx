'use client'

import { useEffect, useState } from 'react'
import { notificationService } from '@/lib/notification-service'
import { Bell, X } from 'lucide-react'

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Initialize notification service
    const initNotifications = async () => {
      const supported = notificationService.isSupported()
      setIsSupported(supported)

      if (supported) {
        await notificationService.initialize()
        const currentPermission = notificationService.getPermission()
        setPermission(currentPermission)

        // Show prompt if permission is default
        if (currentPermission === 'default') {
          // Wait a bit before showing prompt
          setTimeout(() => {
            setShowPrompt(true)
          }, 3000)
        }
      }
    }

    initNotifications()
  }, [])

  const handleEnableNotifications = async () => {
    const newPermission = await notificationService.requestPermission()
    setPermission(newPermission)
    setShowPrompt(false)

    if (newPermission === 'granted') {
      // Show a test notification
      await notificationService.showNotification({
        title: 'Notifications Enabled!',
        body: 'You will now receive reminders for appointments and medications.',
        tag: 'notification-enabled'
      })
    }
  }

  const handleDismissPrompt = () => {
    setShowPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('notification-prompt-dismissed', 'true')
  }

  // Don't show prompt if already dismissed in this session
  useEffect(() => {
    if (sessionStorage.getItem('notification-prompt-dismissed')) {
      setShowPrompt(false)
    }
  }, [])

  return (
    <>
      {children}
      
      {/* Notification Permission Prompt */}
      {isSupported && showPrompt && permission === 'default' && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white rounded-xl shadow-2xl border border-gray-200 p-6 animate-slide-up">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Enable Notifications
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Get reminders for appointments and medications even when the app is closed.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleEnableNotifications}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Enable
                </button>
                <button
                  onClick={handleDismissPrompt}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Not Now
                </button>
              </div>
            </div>
            <button
              onClick={handleDismissPrompt}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
