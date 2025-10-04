export default defineNuxtPlugin(() => {
  if (process.client) {
    // Override the navigateTo function to prevent auth redirects on public routes
    const originalNavigateTo = navigateTo
    
    const publicRoutes = [
      '/',
      '/property',
      '/access-request',
      '/access-code-verification',
      '/auth/login',
      '/auth/register',
      '/auth/confirm'
    ]
    
    // Override navigateTo to block redirects to login/auth pages from public routes
    window.navigateTo = (to: any, options: any = {}) => {
      const currentPath = window.location.pathname
      const targetPath = typeof to === 'string' ? to : to?.path || ''
      
      console.log('navigateTo intercepted:', { currentPath, targetPath, to, options })
      
      // If we're on a public route and trying to redirect to login, block it
      const isCurrentRoutePublic = publicRoutes.some(route => 
        currentPath === route || currentPath.startsWith(route + '/')
      )
      
      if (isCurrentRoutePublic && (targetPath.includes('/login') || targetPath.includes('/auth'))) {
        console.log('Blocking redirect from public route to auth:', { currentPath, targetPath })
        return Promise.resolve()
      }
      
      // Allow other navigations
      return originalNavigateTo(to, options)
    }
    
    // Also override window.location redirects
    const originalLocation = window.location
    let isRedirecting = false
    
    // Intercept location changes
    const checkLocation = () => {
      if (isRedirecting) return
      
      const currentPath = window.location.pathname
      const isCurrentRoutePublic = publicRoutes.some(route => 
        currentPath === route || currentPath.startsWith(route + '/')
      )
      
      if (isCurrentRoutePublic) {
        console.log('On public route, preventing auth redirects:', currentPath)
      }
    }
    
    // Check on page load and navigation
    checkLocation()
    window.addEventListener('popstate', checkLocation)
    
    // Override history methods to catch programmatic navigation
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState
    
    history.pushState = function(...args) {
      isRedirecting = true
      const result = originalPushState.apply(this, args)
      setTimeout(() => {
        isRedirecting = false
        checkLocation()
      }, 0)
      return result
    }
    
    history.replaceState = function(...args) {
      isRedirecting = true
      const result = originalReplaceState.apply(this, args)
      setTimeout(() => {
        isRedirecting = false
        checkLocation()
      }, 0)
      return result
    }
  }
})
