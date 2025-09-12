import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const propertyId = getRouterParam(event, 'id')

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
    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from('safehouse_properties')
      .select(`
        id,
        property_name,
        address,
        emergency_access_enabled,
        qr_code,
        created_at
      `)
      .eq('id', propertyId)
      .single()

    if (propertyError || !property) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Property not found'
      })
    }

    // Check if emergency access is enabled
    if (!property.emergency_access_enabled) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Emergency access is not enabled for this property'
      })
    }

    return {
      success: true,
      property: {
        id: property.id,
        property_name: property.property_name,
        address: property.address,
        emergency_access_enabled: property.emergency_access_enabled,
        qr_code: property.qr_code,
        created_at: property.created_at
      }
    }
  } catch (error) {
    console.error('Property fetch error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch property'
    })
  }
})
