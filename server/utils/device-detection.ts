import { UAParser } from 'ua-parser-js'

export interface DeviceInfo {
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  deviceMake?: string
  deviceModel?: string
  osName?: string
  osVersion?: string
  browserName?: string
  browserVersion?: string
  isMobile: boolean
  carrier?: string
}

export interface AccessLogData {
  propertyId?: string
  userEmail?: string
  accessType: 'property_view' | 'emergency_request' | 'access_granted' | 'access_denied'
  url: string
  ipAddress?: string
  userAgent?: string
  deviceInfo: DeviceInfo
  phoneNumber?: string
  country?: string
  region?: string
  city?: string
  latitude?: number
  longitude?: number
  referrer?: string
  requestMethod?: string
  responseStatus?: number
  sessionId?: string
}

export function detectDevice(userAgent: string): DeviceInfo {
  const parser = new UAParser(userAgent)
  const result = parser.getResult()
  
  // Determine device type
  let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown'
  let isMobile = false
  
  if (result.device.type === 'mobile') {
    deviceType = 'mobile'
    isMobile = true
  } else if (result.device.type === 'tablet') {
    deviceType = 'tablet'
    isMobile = true
  } else if (result.device.type === undefined && result.os.name) {
    // If no device type is detected but we have OS info, assume desktop
    deviceType = 'desktop'
    isMobile = false
  }
  
  // Extract device make and model
  let deviceMake = result.device.vendor
  let deviceModel = result.device.model
  
  // For macOS devices, set proper make and model
  if (result.os.name === 'Mac OS' || result.os.name === 'macOS') {
    deviceMake = 'Apple'
    deviceModel = 'Macintosh'
    deviceType = 'desktop'
    isMobile = false
  }
  
  // For iOS devices, extract more specific info
  if (result.os.name === 'iOS' && result.device.model) {
    deviceMake = 'Apple'
    // Extract model from user agent for more specific info
    const modelMatch = userAgent.match(/iPhone(\d+,\d+)|iPad(\d+,\d+)|iPod(\d+,\d+)/)
    if (modelMatch) {
      deviceModel = modelMatch[0]
    }
  }
  
  // For Android devices, try to extract more specific info
  if (result.os.name === 'Android' && userAgent.includes('Mobile')) {
    const androidModelMatch = userAgent.match(/;\s*([^;)]+)\s*\)/)
    if (androidModelMatch && androidModelMatch[1]) {
      const model = androidModelMatch[1].trim()
      if (model && !model.includes('Linux') && !model.includes('Android')) {
        deviceModel = model
      }
    }
  }
  
  // For Windows devices
  if (result.os.name === 'Windows') {
    deviceType = 'desktop'
    isMobile = false
    if (!deviceMake) {
      deviceMake = 'Microsoft'
      deviceModel = 'PC'
    }
  }
  
  return {
    deviceType,
    deviceMake: deviceMake || undefined,
    deviceModel: deviceModel || undefined,
    osName: result.os.name || undefined,
    osVersion: result.os.version || undefined,
    browserName: result.browser.name || undefined,
    browserVersion: result.browser.version || undefined,
    isMobile
  }
}

export function getClientIP(event: any): string {
  // Try to get real IP from various headers
  const headers = getHeaders(event)
  
  // Check for forwarded headers first (for proxies/load balancers)
  const forwarded = headers['x-forwarded-for'] as string
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  // Check other common headers
  const realIP = headers['x-real-ip'] as string
  if (realIP) {
    return realIP
  }
  
  const cfConnectingIP = headers['cf-connecting-ip'] as string
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Check for client IP in various formats
  const clientIP = headers['x-client-ip'] as string
  if (clientIP) {
    return clientIP
  }
  
  // For development, try to get the actual client IP
  // In production, this would come from your proxy/load balancer
  const remoteAddress = event.node.req.connection?.remoteAddress || 
                       event.node.req.socket?.remoteAddress ||
                       event.node.req.headers['x-forwarded-for'] ||
                       '127.0.0.1'
  
  // Clean up IPv6 localhost
  if (remoteAddress === '::1' || remoteAddress === '::ffff:127.0.0.1') {
    return '127.0.0.1'
  }
  
  return remoteAddress as string
}

export async function getLocationFromIP(ipAddress: string): Promise<{
  country?: string
  region?: string
  city?: string
  latitude?: number
  longitude?: number
}> {
  // Skip geolocation for localhost/private IPs
  if (ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.') || ipAddress.startsWith('172.')) {
    return {
      country: 'Local',
      region: 'Development',
      city: 'Localhost'
    }
  }

  try {
    // Use ip-api.com (free service, 1000 requests per minute)
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,message,country,regionName,city,lat,lon,query`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status === 'success') {
      return {
        country: data.country,
        region: data.regionName,
        city: data.city,
        latitude: data.lat,
        longitude: data.lon
      }
    } else {
      console.warn('IP geolocation failed:', data.message)
      return {}
    }
  } catch (error) {
    console.error('Error getting location from IP:', error)
    return {}
  }
}
