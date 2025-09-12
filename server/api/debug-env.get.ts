export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  return {
    firebase: {
      projectId: config.firebaseProjectId ? 'Set' : 'Missing',
      serviceAccountKey: config.firebaseServiceAccountKey ? 'Set' : 'Missing',
      serviceAccountKeyLength: config.firebaseServiceAccountKey ? config.firebaseServiceAccountKey.length : 0
    },
    supabase: {
      url: config.public.supabaseUrl ? 'Set' : 'Missing',
      key: config.public.supabaseKey ? 'Set' : 'Missing'
    },
    // Don't expose actual values for security
    hasEnvFile: true
  }
})
