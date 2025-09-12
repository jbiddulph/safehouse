import admin from 'firebase-admin'

// Initialize Firebase Admin SDK
let firebaseApp: admin.app.App | null = null

export function initializeFirebase() {
  if (firebaseApp) {
    return firebaseApp
  }

  const config = useRuntimeConfig()
  
  // Check if we have Firebase credentials
  if (!config.firebaseServiceAccountKey) {
    console.warn('Firebase service account key not found. FCM notifications will be disabled.')
    return null
  }

  try {
    let serviceAccount
    
    // Handle both JSON string and object formats
    if (typeof config.firebaseServiceAccountKey === 'string') {
      serviceAccount = JSON.parse(config.firebaseServiceAccountKey)
    } else {
      serviceAccount = config.firebaseServiceAccountKey
    }
    
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: config.firebaseProjectId || serviceAccount.project_id
    })

    console.log('Firebase Admin SDK initialized successfully')
    return firebaseApp
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error)
    console.error('Error details:', error.message)
    return null
  }
}

export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  const app = initializeFirebase()
  if (!app) {
    console.warn('Firebase not initialized. Cannot send push notification.')
    return false
  }

  try {
    const message = {
      token: fcmToken,
      notification: {
        title,
        body
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      android: {
        notification: {
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        payload: {
          aps: {
            'content-available': 1
          }
        }
      }
    }

    const response = await admin.messaging().send(message)
    console.log('Successfully sent message:', response)
    return true
  } catch (error) {
    console.error('Error sending push notification:', error)
    return false
  }
}

export async function sendMulticastNotification(
  fcmTokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) {
  const app = initializeFirebase()
  if (!app) {
    console.warn('Firebase not initialized. Cannot send push notification.')
    return { successCount: 0, failureCount: fcmTokens.length }
  }

  try {
    const message = {
      tokens: fcmTokens,
      notification: {
        title,
        body
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      android: {
        notification: {
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        payload: {
          aps: {
            'content-available': 1
          }
        }
      }
    }

    const response = await admin.messaging().sendMulticast(message)
    console.log('Successfully sent multicast message:', response)
    return {
      successCount: response.successCount,
      failureCount: response.failureCount
    }
  } catch (error) {
    console.error('Error sending multicast notification:', error)
    return { successCount: 0, failureCount: fcmTokens.length }
  }
}
