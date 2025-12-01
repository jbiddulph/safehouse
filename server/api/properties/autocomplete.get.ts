import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const searchTerm = (query.q as string)?.trim()

  if (!searchTerm || searchTerm.length < 2) {
    return {
      success: true,
      suggestions: []
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
    // Search for properties matching the search term in UK only
    // Search across address, city, postal_code fields using ilike for case-insensitive search
    const { data, error } = await supabase
      .from('safehouse_properties')
      .select('id, property_name, address, city, state, postal_code, country, latitude, longitude')
      .or(`address.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,postal_code.ilike.%${searchTerm}%`)
      .eq('country', 'GB') // Only UK properties
      .limit(10)
      .order('property_name', { ascending: true })

    if (error) {
      console.error('Error searching properties:', error)
      return {
        success: false,
        message: 'Failed to search properties',
        suggestions: []
      }
    }

    // Format suggestions to match the expected format
    const suggestions = (data || []).map((property: any) => ({
      id: property.id,
      formatted_address: `${property.address}, ${property.city}${property.postal_code ? ` ${property.postal_code}` : ''}`,
      address: property.address,
      city: property.city,
      state: property.state || '',
      postcode: property.postal_code || '',
      country: property.country || 'GB',
      property_name: property.property_name,
      lat: property.latitude ? property.latitude.toString() : null,
      lon: property.longitude ? property.longitude.toString() : null
    }))

    return {
      success: true,
      suggestions
    }
  } catch (error: any) {
    console.error('Error in property autocomplete:', error)
    return {
      success: false,
      message: 'Failed to fetch address suggestions',
      suggestions: []
    }
  }
})

