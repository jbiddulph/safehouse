export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  return {
    supabase: {
      url: config.public.supabaseUrl ? 'Set' : 'Missing',
      key: config.public.supabaseKey ? 'Set' : 'Missing'
    },
    // Don't expose actual values for security
    hasEnvFile: true
  }
})
