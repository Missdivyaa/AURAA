// Notification Service for Background Notifications
export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  vibrate?: number[]
  data?: any
  actions?: NotificationAction[]
}

class NotificationService {
  private registration: ServiceWorkerRegistration | null = null
  private permission: NotificationPermission = 'default'

  async initialize() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported')
      return false
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('Service Worker registered:', this.registration)

      // Check for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker available')
            }
          })
        }
      })

      // Request notification permission
      await this.requestPermission()

      return true
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return false
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported')
      return 'denied'
    }

    if (this.permission === 'granted') {
      return 'granted'
    }

    if (this.permission === 'denied') {
      return 'denied'
    }

    try {
      this.permission = await Notification.requestPermission()
      return this.permission
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return 'denied'
    }
  }

  async showNotification(options: NotificationOptions) {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported')
      return false
    }

    const permission = await this.requestPermission()

    if (permission !== 'granted') {
      console.warn('Notification permission not granted')
      return false
    }

    try {
      if (this.registration && 'showNotification' in this.registration) {
        // Use service worker for background notifications
        await this.registration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/icon-192x192.png',
          badge: options.badge || '/icon-96x96.png',
          tag: options.tag || 'aurea-health',
          requireInteraction: options.requireInteraction || false,
          vibrate: options.vibrate || [200, 100, 200],
          data: options.data || {},
          actions: options.actions || []
        })
        return true
      } else {
        // Fallback to regular notification (only works when app is open)
        new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/icon-192x192.png',
          tag: options.tag || 'aurea-health',
          requireInteraction: options.requireInteraction || false,
          vibrate: options.vibrate || [200, 100, 200],
          data: options.data || {}
        })
        return true
      }
    } catch (error) {
      console.error('Error showing notification:', error)
      return false
    }
  }

  async scheduleNotification(
    options: NotificationOptions,
    scheduledTime: number // Unix timestamp in milliseconds
  ) {
    const now = Date.now()
    const delay = scheduledTime - now

    if (delay <= 0) {
      // If time has passed, show immediately
      return this.showNotification(options)
    }

    // Schedule notification using setTimeout (works when app is open)
    // For true background scheduling, you'd need a backend service
    setTimeout(() => {
      this.showNotification(options)
    }, delay)

    console.log(`Notification scheduled for ${new Date(scheduledTime).toLocaleString()}`)
    return true
  }

  async scheduleAppointmentReminder(
    appointmentId: string,
    appointmentTime: number, // Unix timestamp
    doctorName: string,
    specialty: string,
    memberName: string
  ) {
    const oneHourBefore = appointmentTime - (60 * 60 * 1000) // 1 hour before
    const now = Date.now()

    if (oneHourBefore <= now) {
      // Less than 1 hour away, show immediately
      return this.showNotification({
        title: 'Appointment Soon',
        body: `${memberName} - ${doctorName} (${specialty}) in less than 1 hour`,
        tag: `appointment-${appointmentId}`,
        requireInteraction: true,
        data: {
          type: 'appointment',
          appointmentId,
          url: '/appointments'
        }
      })
    }

    // Schedule for 1 hour before
    return this.scheduleNotification(
      {
        title: 'Appointment Reminder',
        body: `${memberName} - ${doctorName} (${specialty}) in 1 hour`,
        tag: `appointment-${appointmentId}`,
        requireInteraction: true,
        data: {
          type: 'appointment',
          appointmentId,
          url: '/appointments'
        }
      },
      oneHourBefore
    )
  }

  async scheduleReminderNotification(
    reminderId: string,
    reminderTime: number, // Unix timestamp
    title: string,
    description: string,
    memberName: string
  ) {
    const now = Date.now()

    const showReminderAlarm = async () => {
      // Play alarm sound
      this.playAlarmSound()
      
      // Show notification
      await this.showNotification({
        title: '🔔 Reminder Alarm',
        body: `${memberName} - ${title}${description ? `: ${description}` : ''}`,
        tag: `reminder-${reminderId}`,
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
        data: {
          type: 'reminder',
          reminderId,
          url: '/reminders'
        },
        actions: [
          {
            action: 'complete',
            title: 'Mark Complete',
            icon: '/icon-96x96.png'
          },
          {
            action: 'snooze',
            title: 'Snooze 10 min',
            icon: '/icon-96x96.png'
          }
        ]
      })
    }

    if (reminderTime <= now) {
      // Time has passed, show immediately
      return showReminderAlarm()
    }

    // Schedule for reminder time
    return this.scheduleNotification(
      {
        title: '🔔 Reminder Alarm',
        body: `${memberName} - ${title}${description ? `: ${description}` : ''}`,
        tag: `reminder-${reminderId}`,
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
        data: {
          type: 'reminder',
          reminderId,
          url: '/reminders'
        },
        actions: [
          {
            action: 'complete',
            title: 'Mark Complete',
            icon: '/icon-96x96.png'
          },
          {
            action: 'snooze',
            title: 'Snooze 10 min',
            icon: '/icon-96x96.png'
          }
        ]
      },
      reminderTime
    )
  }

  playAlarmSound() {
    try {
      // Create audio context for alarm sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Set alarm tone (800Hz for 0.5 seconds)
      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)

      // Play sound 3 times with intervals
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator()
        const gainNode2 = audioContext.createGain()
        oscillator2.connect(gainNode2)
        gainNode2.connect(audioContext.destination)
        oscillator2.frequency.value = 800
        oscillator2.type = 'sine'
        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        oscillator2.start(audioContext.currentTime)
        oscillator2.stop(audioContext.currentTime + 0.5)
      }, 600)

      setTimeout(() => {
        const oscillator3 = audioContext.createOscillator()
        const gainNode3 = audioContext.createGain()
        oscillator3.connect(gainNode3)
        gainNode3.connect(audioContext.destination)
        oscillator3.frequency.value = 800
        oscillator3.type = 'sine'
        gainNode3.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        oscillator3.start(audioContext.currentTime)
        oscillator3.stop(audioContext.currentTime + 0.5)
      }, 1200)
    } catch (error) {
      console.warn('Could not play alarm sound:', error)
      // Fallback: Use beep via system beep (if available)
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Reminder')
        utterance.volume = 0.5
        speechSynthesis.speak(utterance)
      }
    }
  }

  cancelNotification(tag: string) {
    if (this.registration) {
      this.registration.getNotifications({ tag }).then((notifications) => {
        notifications.forEach((notification) => notification.close())
      })
    }
  }

  getPermission(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied'
    }
    return Notification.permission
  }

  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator
  }
}

// Export singleton instance
export const notificationService = new NotificationService()
