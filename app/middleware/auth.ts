export default defineNuxtRouteMiddleware(async () => {
  // Avoid redirect loops during SSR where user is not yet resolved
  if (import.meta.server) return
  
  const user = useSupabaseUser()
  const client = useSupabaseClient()
  
  // If no user in reactive state, check session directly
  if (!user.value) {
    try {
      const { data: { session }, error } = await client.auth.getSession()
      
      // If no valid session, redirect to login
      if (error || !session) {
        console.log('No valid session found, redirecting to login')
        return navigateTo('/auth/login')
      }
      
      // If session exists but user is not reactive, wait a bit for hydration
      // This handles the case where session exists but user state hasn't loaded yet
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Check again after brief delay
      if (!user.value) {
        console.log('User state not loaded after session check, redirecting to login')
        return navigateTo('/auth/login')
      }
    } catch (error) {
      console.error('Session check error:', error)
      return navigateTo('/auth/login')
    }
  }
})


