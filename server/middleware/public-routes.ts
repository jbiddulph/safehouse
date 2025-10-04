export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname
  
  // Define public routes that should be accessible without authentication
  const publicRoutes = [
    '/',
    '/property',
    '/access-request',
    '/access-code-verification',
    '/auth/login',
    '/auth/register',
    '/auth/confirm'
  ]
  
  // Check if this is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  if (isPublicRoute) {
    // Set a header to indicate this is a public route
    setHeader(event, 'x-public-route', 'true')
    
    // For public routes, we don't need to do anything else
    // The Supabase module should respect these routes
    return
  }
  
  // For protected routes, let the Supabase module handle authentication
})
