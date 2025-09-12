export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { fcm_token = 'test-token-123' } = body

  try {
    // Test Firebase initialization without sending notifications
    const { initializeFirebase } = await import('../utils/firebase')
    const firebaseApp = initializeFirebase()
    
    if (firebaseApp) {
      return {
        success: true,
        message: 'Firebase initialized successfully',
        fcm_token: fcm_token,
        firebase_initialized: true,
        note: 'Firebase is configured and ready for notifications'
      }
    } else {
      return {
        success: false,
        message: 'Firebase initialization failed - check your .env file',
        fcm_token: fcm_token,
        firebase_initialized: false,
        note: 'Add FIREBASE_SERVICE_ACCOUNT_KEY to your .env file'
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
