import { createClient } from '@supabase/supabase-js'
import { detectDevice, getClientIP, AccessLogData } from '../../utils/device-detection'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { 
      propertyId, 
      userEmail, 
      accessType, 
      url, 
      userAgent, 
      phoneNumber,
      sessionId 
    } = body

    if (!accessType || !url) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: accessType and url'
      })
    }

    // Extract property ID from URL if not provided
    let extractedPropertyId = propertyId
    if (!extractedPropertyId && url) {
      // Try to extract property ID from various URL patterns
      const urlPatterns = [
        /\/property\/([a-f0-9-]{36})/,  // /property/{uuid}
        /property=([a-f0-9-]{36})/,     // ?property={uuid}
        /property_id=([a-f0-9-]{36})/   // ?property_id={uuid}
      ]
      
      for (const pattern of urlPatterns) {
        const match = url.match(pattern)
        if (match && match[1]) {
          extractedPropertyId = match[1]
          break
        }
      }
    }

    console.log('Extracted property ID:', extractedPropertyId)
    console.log('Original property ID:', propertyId)
    console.log('URL:', url)

    const config = useRuntimeConfig()
    const supabase = createClient(
      config.public.supabaseUrl,
      config.supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get client IP
    const ipAddress = getClientIP(event)
    console.log('Detected IP address:', ipAddress)
    
    // Detect device information
    const deviceInfo = detectDevice(userAgent || '')
    console.log('Detected device info:', deviceInfo)
    
    // Get location data from IP
    const locationData = await getLocationFromIP(ipAddress)
    console.log('Location data:', locationData)
    
    // Prepare log data
    const logData = {
      property_id: extractedPropertyId || null,
      user_email: userEmail || null,
      access_type: accessType,
      url: url,
      ip_address: ipAddress,
      user_agent: userAgent || null,
      device_type: deviceInfo.deviceType,
      device_make: deviceInfo.deviceMake,
      device_model: deviceInfo.deviceModel,
      os_name: deviceInfo.osName,
      os_version: deviceInfo.osVersion,
      browser_name: deviceInfo.browserName,
      browser_version: deviceInfo.browserVersion,
      is_mobile: deviceInfo.isMobile,
      phone_number: phoneNumber || null,
      carrier: deviceInfo.carrier || null,
      country: locationData.country,
      region: locationData.region,
      city: locationData.city,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      referrer: getHeader(event, 'referer') || null,
      request_method: getMethod(event),
      response_status: 200,
      session_id: sessionId || null
    }

    // Insert log entry
    const { data, error } = await supabase
      .from('safehouse_access_logs')
      .insert([logData])
      .select()

    if (error) {
      console.error('Error inserting access log:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to log access'
      })
    }

    return {
      success: true,
      message: 'Access logged successfully',
      logId: data[0]?.id
    }

  } catch (error) {
    console.error('Error in access log API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to log access: ' + (error.message || 'Unknown error')
    })
  }
})

