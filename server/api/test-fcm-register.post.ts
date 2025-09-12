export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { fcm_token = 'test-token-123' } = body

  try {
    // Test Firebase initialization
    const { initializeFirebase } = await import('../utils/firebase')
    const firebaseApp = initializeFirebase()
    
    if (!firebaseApp) {
      return {
        success: false,
        message: 'Firebase not initialized - check your .env file',
        fcm_token: fcm_token,
        firebase_initialized: false,
        note: 'Add FIREBASE_SERVICE_ACCOUNT_KEY and FIREBASE_PROJECT_ID to your .env file'
      }
    }

    // Test sending a notification (without actually sending it)
    const { sendPushNotification } = await import('../utils/firebase')
    
    // Just test the function exists and can be called
    if (typeof sendPushNotification === 'function') {
      return {
        success: true,
        message: 'Firebase initialized successfully and ready for notifications',
        fcm_token: fcm_token,
        firebase_initialized: true,
        note: 'FCM is ready! You can now send push notifications.'
      }
    } else {
      return {
        success: false,
        message: 'Firebase initialized but sendPushNotification function not available',
        fcm_token: fcm_token,
        firebase_initialized: true,
        note: 'There might be an issue with the Firebase utility functions'
      }
    }
  } catch (error) {
    console.error('FCM test error:', error)
    return {
      success: false,
      message: `FCM test failed: ${error.message}`,
      fcm_token: fcm_token,
      firebase_initialized: false,
      error: error.message
    }
  }
})
