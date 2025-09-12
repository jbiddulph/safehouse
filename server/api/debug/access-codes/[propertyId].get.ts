import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const propertyId = getRouterParam(event, 'propertyId')

  if (!propertyId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Property ID is required'
    })
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
    // Get property info
    const { data: property, error: propertyError } = await supabase
      .from('safehouse_properties')
      .select('id, property_name, emergency_access_enabled, created_at')
      .eq('id', propertyId)
      .single()

    if (propertyError || !property) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Property not found'
      })
    }

    // Get all access codes for this property
    const { data: accessCodes, error: codesError } = await supabase
      .from('safehouse_access_codes')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })

    if (codesError) {
      console.error('Access codes fetch error:', codesError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch access codes'
      })
    }

    // Check which codes would be considered "active"
    const now = new Date()
    const activeCodes = accessCodes?.filter(code => {
      const isActive = code.is_active
      const notExpired = new Date(code.expires_at) > now
      return isActive && notExpired
    }) || []

    return {
      success: true,
      property: {
        id: property.id,
        name: property.property_name,
        emergency_access_enabled: property.emergency_access_enabled,
        created_at: property.created_at
      },
      accessCodes: accessCodes || [],
      activeCodes: activeCodes,
      summary: {
        total_codes: accessCodes?.length || 0,
        active_codes: activeCodes.length,
        expired_codes: accessCodes?.filter(code => new Date(code.expires_at) <= now).length || 0,
        inactive_codes: accessCodes?.filter(code => !code.is_active).length || 0
      }
    }
  } catch (error) {
    console.error('Debug access codes error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to debug access codes'
    })
  }
})
