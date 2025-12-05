import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  
  // Initialize Firebase
  const firebaseConfig = config.public.firebaseConfig
  if (!firebaseConfig.apiKey) {
    console.warn('Firebase configuration not found. Push notifications will be disabled.')
    return
  }

  const app = initializeApp(firebaseConfig)
  const messaging = getMessaging(app)

  // Request permission and get FCM token
  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: config.public.firebaseConfig.vapidKey
      })
      
      if (token) {
        // Register FCM token with our backend
        try {
          await $fetch('/api/fcm/register', {
            method: 'POST',
            body: {
              fcm_token: token,
              user_type: 'owner'
            }
          })
          console.log('FCM token registered successfully')
        } catch (error) {
          console.error('Failed to register FCM token:', error)
        }
      }
    } else {
      console.warn('Notification permission denied')
    }
  } catch (error) {
    console.error('Failed to get FCM token:', error)
  }

  // Handle foreground messages
  onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload)
    
    // Show notification
    if (payload.notification) {
      const notification = new Notification(payload.notification.title || 'MySafeHouse', {
        body: payload.notification.body,
        icon: '/icon-192x192.png', // Add your app icon
        badge: '/badge-72x72.png', // Add your badge icon
        tag: payload.data?.request_id || 'safehouse-notification'
      })

      notification.onclick = () => {
        // Handle notification click - navigate to access requests page
        if (payload.data?.type === 'access_request') {
          window.location.href = '/access-requests'
        }
        notification.close()
      }
    }
  })

  return {
    provide: {
      firebase: app,
      messaging
    }
  }
})
