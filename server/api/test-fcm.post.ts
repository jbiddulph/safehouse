import { sendPushNotification, sendMulticastNotification } from '../utils/firebase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { test_type = 'single', fcm_token } = body

  try {
    if (test_type === 'single' && fcm_token) {
      // Test single notification
      const success = await sendPushNotification(
        fcm_token,
        '🧪 FCM Test Notification',
        'This is a test notification from MySafeHouse FCM integration',
        {
          type: 'test',
          timestamp: new Date().toISOString()
        }
      )

      return {
        success,
        message: success ? 'Test notification sent successfully' : 'Failed to send test notification',
        test_type: 'single'
      }
    } else if (test_type === 'multicast' && fcm_token) {
      // Test multicast notification
      const result = await sendMulticastNotification(
        [fcm_token],
        '🧪 FCM Multicast Test',
        'This is a multicast test notification from MySafeHouse FCM',
        {
          type: 'test_multicast',
          timestamp: new Date().toISOString()
        }
      )

      return {
        success: result.successCount > 0,
        message: `Multicast test completed: ${result.successCount} successful, ${result.failureCount} failed`,
        test_type: 'multicast',
        results: result
      }
    } else {
      // Test Firebase initialization
      const { initializeFirebase } = await import('../utils/firebase')
      const firebaseApp = initializeFirebase()
      
      return {
        success: firebaseApp !== null,
        message: firebaseApp ? 'Firebase initialized successfully' : 'Firebase initialization failed',
        test_type: 'initialization',
        firebase_initialized: firebaseApp !== null
      }
    }
  } catch (error) {
    console.error('FCM test error:', error)
    return {
      success: false,
      message: `FCM test failed: ${error.message}`,
      error: error.message
    }
  }
})
