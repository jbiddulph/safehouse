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
  
  // Don't redirect if already on coming-soon page or if not a parked domain
  if (isParkedDomain && url.pathname !== '/coming-soon') {
    return sendRedirect(event, '/coming-soon', 302)
  }
})

