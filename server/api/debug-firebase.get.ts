export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    // Try to parse the service account key
    let serviceAccount
    if (typeof config.firebaseServiceAccountKey === 'string') {
      serviceAccount = JSON.parse(config.firebaseServiceAccountKey)
    } else {
      serviceAccount = config.firebaseServiceAccountKey
    }
    
    return {
      projectId: config.firebaseProjectId,
      serviceAccountType: typeof config.firebaseServiceAccountKey,
      serviceAccountLength: config.firebaseServiceAccountKey ? config.firebaseServiceAccountKey.length : 0,
      serviceAccountParsed: !!serviceAccount,
      serviceAccountProjectId: serviceAccount?.project_id,
      serviceAccountClientEmail: serviceAccount?.client_email,
      error: null
    }
  } catch (error) {
    return {
      projectId: config.firebaseProjectId,
      serviceAccountType: typeof config.firebaseServiceAccountKey,
      serviceAccountLength: config.firebaseServiceAccountKey ? config.firebaseServiceAccountKey.length : 0,
      serviceAccountParsed: false,
      serviceAccountProjectId: null,
      serviceAccountClientEmail: null,
      error: error.message
    }
  }
})
