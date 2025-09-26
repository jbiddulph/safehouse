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
    const { data: property, error } = await supabase
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
        qr_code,
        nfc_id,
        emergency_access_enabled,
        created_at,
        updated_at
      `)
      .eq('id', propertyId)
      .single()

    if (error) {
      console.error('Error fetching property:', error)
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Property not found'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch property'
      })
    }

    if (!property) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Property not found'
      })
    }

    return {
      success: true,
      property
    }
  } catch (error) {
    console.error('Error in property API:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch property'
    })
  }
})