export default defineNuxtPlugin(() => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()
  
  // Listen for auth state changes
  client.auth.onAuthStateChange((event, session) => {
    console.log('Auth state change:', event, session ? 'session exists' : 'no session')
    
    if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
      console.log('User signed out or session expired, clearing state')
      
      // Clear any local storage if needed
      if (process.client) {
        // Clear any app-specific local storage
        localStorage.removeItem('profile')
        localStorage.removeItem('avatar')
      }
      
      // Redirect to login if on protected route (exclude homepage and public routes)
      const publicRoutes = ['/', '/property/', '/access-request', '/access-code-verification']
      const isPublicRoute = publicRoutes.some(route => window.location.pathname === route || window.location.pathname.startsWith(route))
      
      if (process.client && !window.location.pathname.startsWith('/auth/') && !isPublicRoute) {
        navigateTo('/auth/login')
      }
    }
    
    if (event === 'SIGNED_IN' && session) {
      console.log('User signed in successfully')
    }
  })
})
