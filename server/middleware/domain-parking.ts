export default defineEventHandler(async (event) => {
  const host = getHeader(event, 'host') || ''
  const url = getRequestURL(event)
  
  // List of parked domains that should redirect to coming-soon
  const parkedDomains = [
    'mysafehouse.co.uk',
    'www.mysafehouse.co.uk'
  ]
  
  // Check if the request is coming from a parked domain
  const isParkedDomain = parkedDomains.some(domain => 
    host.toLowerCase().includes(domain.toLowerCase())
  )
  
  // Don't redirect:
  // - If not a parked domain
  // - If already on coming-soon page
  // - If it's an API route (starts with /api/)
  // - If it's a static asset (starts with /_nuxt/ or /images/ etc.)
  const isApiRoute = url.pathname.startsWith('/api/')
  const isStaticAsset = url.pathname.startsWith('/_nuxt/') || 
                        url.pathname.startsWith('/images/') ||
                        url.pathname.startsWith('/favicon') ||
                        url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i)
  
  if (isParkedDomain && 
      url.pathname !== '/coming-soon' && 
      !isApiRoute && 
      !isStaticAsset) {
    return sendRedirect(event, '/coming-soon', 302)
  }
})

