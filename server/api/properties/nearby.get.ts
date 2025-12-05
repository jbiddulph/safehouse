import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const lat = parseFloat(query.lat as string)
  const lon = parseFloat(query.lon as string)
  const radiusMeters = parseFloat((query.radius as string) || '100') // Default 100 meters

  if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
    return {
      success: false,
      message: 'Latitude and longitude are required',
      properties: []
    }
  }

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

  try {
    // Get all properties with coordinates (UK only)
    const { data: properties, error } = await supabase
      .from('safehouse_properties')
      .select(`
        id,
        property_name,
        address,
        city,
        state,
        postal_code,
        country,
        property_type,
        emergency_access_enabled,
        latitude,
        longitude
      `)
      .eq('country', 'GB')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    if (error) {
      console.error('Error fetching properties:', error)
      return {
        success: false,
        message: 'Failed to fetch properties',
        properties: []
      }
    }

    // Calculate distance using Haversine formula
    const R = 6371000 // Earth's radius in meters
    const nearbyProperties = (properties || [])
      .map((property: any) => {
        if (!property.latitude || !property.longitude) return null

        const propLat = parseFloat(property.latitude)
        const propLon = parseFloat(property.longitude)

        if (isNaN(propLat) || isNaN(propLon)) return null

        // Haversine formula to calculate distance
        const dLat = (propLat - lat) * Math.PI / 180
        const dLon = (propLon - lon) * Math.PI / 180
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat * Math.PI / 180) * Math.cos(propLat * Math.PI / 180) * 
          Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c // Distance in meters

        return {
          ...property,
          distance: Math.round(distance)
        }
      })
      .filter((property: any) => property !== null && property.distance <= radiusMeters)
      .sort((a: any, b: any) => a.distance - b.distance) // Sort by distance, closest first
      .slice(0, 5) // Limit to 5 closest properties

    return {
      success: true,
      properties: nearbyProperties
    }
  } catch (error) {
    console.error('Error finding nearby properties:', error)
    return {
      success: false,
      message: 'Failed to find nearby properties',
      properties: []
    }
  }
})


