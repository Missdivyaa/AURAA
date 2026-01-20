// Service Worker for Background Notifications
const CACHE_NAME = 'aurea-health-v1'
const NOTIFICATION_TAG = 'aurea-health-notification'

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  return self.clients.claim()
})

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  let notificationData = {
    title: 'AURAA Health Reminder',
    body: 'You have a health reminder',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    tag: NOTIFICATION_TAG,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    }
  }

  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = {
        ...notificationData,
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        tag: data.tag || NOTIFICATION_TAG,
        requireInteraction: data.requireInteraction || false,
        data: data.data || notificationData.data
      }
    } catch (e) {
      console.error('Error parsing push data:', e)
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  const action = event.action
  const data = event.notification.data || {}
  const urlToOpen = data.url || '/'

  // Handle reminder actions
  if (action === 'complete' && data.type === 'reminder' && data.reminderId) {
    // Send message to client to mark reminder as complete
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].postMessage({
            type: 'REMINDER_COMPLETE',
            reminderId: data.reminderId
          })
          return clientList[0].focus()
        } else if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
    )
  } else if (action === 'snooze' && data.type === 'reminder' && data.reminderId) {
    // Send message to client to snooze reminder
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].postMessage({
            type: 'REMINDER_SNOOZE',
            reminderId: data.reminderId
          })
          return clientList[0].focus()
        } else if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
    )
  } else {
    // Default: open the app
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
    )
  }
})

// Handle background sync for scheduled notifications
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag)
  
  if (event.tag === 'check-appointments') {
    event.waitUntil(checkScheduledNotifications())
  }
})

// Function to check and schedule notifications
async function checkScheduledNotifications() {
  try {
    // This will be called periodically to check for upcoming appointments/reminders
    // The actual scheduling is done from the main app
    console.log('Checking scheduled notifications...')
  } catch (error) {
    console.error('Error checking scheduled notifications:', error)
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-health-reminders') {
    event.waitUntil(checkScheduledNotifications())
  }
})
